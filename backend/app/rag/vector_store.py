"""
CreditLens Vector Store & Knowledge Base Repository
Supports vector similarity search across document chunks with cosine scoring,
metadata filtering, and pgvector schema integration.
"""
import numpy as np
from typing import List, Optional, Dict, Any
from app.rag.models import DocumentChunk, RetrievalResult
from app.rag.config import rag_settings

class VectorStore:
    def __init__(self, dimension: int = rag_settings.EMBEDDING_DIMENSION):
        self.dimension = dimension
        self._chunks: Dict[str, DocumentChunk] = {}
        self._embeddings: Dict[str, np.ndarray] = {}
        self._chunk_ids_order: List[str] = []
        self._matrix: Optional[np.ndarray] = None

    def add_chunks(self, chunks: List[DocumentChunk], embeddings: List[List[float]]):
        """Adds document chunks and their 384-dimensional embedding vectors to the vector store."""
        for chunk, emb in zip(chunks, embeddings):
            self._chunks[chunk.chunk_id] = chunk
            v = np.array(emb, dtype=np.float32)
            # Ensure vector is normalized
            norm = np.linalg.norm(v)
            if norm > 0:
                v = v / norm
            self._embeddings[chunk.chunk_id] = v
            if chunk.chunk_id not in self._chunk_ids_order:
                self._chunk_ids_order.append(chunk.chunk_id)

        # Rebuild contiguous numpy matrix for vector search
        if self._chunk_ids_order:
            self._matrix = np.stack([self._embeddings[cid] for cid in self._chunk_ids_order])

    def search(
        self,
        query_embedding: List[float],
        top_k: int = rag_settings.TOP_K,
        threshold: float = rag_settings.SIMILARITY_THRESHOLD,
        category: Optional[str] = None
    ) -> List[RetrievalResult]:
        """
        Executes exact cosine similarity search over stored vectors.
        Filters by similarity threshold and optional category metadata.
        """
        if self._matrix is None or len(self._chunk_ids_order) == 0:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0 or np.isnan(q_norm):
            return []
        q_vec = q_vec / q_norm

        # Cosine similarity is dot product of normalized vectors
        scores = np.dot(self._matrix, q_vec)

        # Rank indices descending
        ranked_indices = np.argsort(scores)[::-1]

        results: List[RetrievalResult] = []
        for idx in ranked_indices:
            score = float(scores[idx])
            if score < threshold:
                break

            cid = self._chunk_ids_order[idx]
            chunk = self._chunks[cid]

            # Category filter if provided
            if category and chunk.category.lower() != category.lower():
                continue

            grade = "high" if score >= 0.70 else "medium" if score >= 0.50 else "low"
            results.append(
                RetrievalResult(
                    chunk_id=chunk.chunk_id,
                    document_id=chunk.document_id,
                    title=chunk.title,
                    source_name=chunk.source_name,
                    source_url=chunk.source_url,
                    doc_type=chunk.doc_type,
                    category=chunk.category,
                    content=chunk.content,
                    score=round(score, 4),
                    relevance_grade=grade
                )
            )

            if len(results) >= top_k:
                break

        return results

    def get_chunk_count(self) -> int:
        return len(self._chunks)

    def count(self) -> int:
        return len(self._chunks)

    def get_document_count(self) -> int:
        return len(set(c.document_id for c in self._chunks.values()))

    def clear(self):
        self._chunks.clear()
        self._embeddings.clear()
        self._chunk_ids_order.clear()
        self._matrix = None

vector_store = VectorStore()
