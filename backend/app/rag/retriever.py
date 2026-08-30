"""
CreditLens Semantic Retriever
Normalizes queries, generates query embeddings, queries the vector store, and deduplicates source references.
"""
from typing import List, Optional
from app.rag.models import RetrievalResult
from app.rag.text_cleaner import clean_text
from app.rag.embeddings import embedding_engine
from app.rag.vector_store import vector_store
from app.rag.config import rag_settings

class SemanticRetriever:
    def __init__(self):
        pass

    def retrieve(
        self,
        query: str,
        top_k: int = rag_settings.TOP_K,
        threshold: float = rag_settings.SIMILARITY_THRESHOLD,
        category: Optional[str] = None
    ) -> List[RetrievalResult]:
        """
        Performs semantic retrieval across the knowledge base.
        """
        cleaned_query = clean_text(query)
        if not cleaned_query or len(cleaned_query) < 2:
            return []

        query_emb = embedding_engine.embed_text(cleaned_query)
        raw_results = vector_store.search(
            query_embedding=query_emb,
            top_k=top_k * 2, # Fetch wider candidate pool for deduplication
            threshold=threshold,
            category=category
        )

        # Deduplicate to at most 2 chunks per document for diverse context
        doc_counts = {}
        filtered_results: List[RetrievalResult] = []

        for res in raw_results:
            cnt = doc_counts.get(res.document_id, 0)
            if cnt < 2:
                filtered_results.append(res)
                doc_counts[res.document_id] = cnt + 1

            if len(filtered_results) >= top_k:
                break

        return filtered_results

retriever = SemanticRetriever()
