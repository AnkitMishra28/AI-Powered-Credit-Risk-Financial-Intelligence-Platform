"""
CreditLens Master RAG Copilot Service
Orchestrates knowledge base ingestion, semantic vector retrieval, structured user-context injection,
Gemini grounded synthesis, and observability metrics.
"""
import uuid
import time
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.rag.models import (
    Document,
    DocumentChunk,
    RetrievalResult,
    StructuredUserFinancialContext,
    CopilotQueryRequest,
    CopilotResponse,
    SourceReferenceItem
)
from app.rag.document_loader import load_knowledge_documents
from app.rag.chunker import chunk_all_documents
from app.rag.embeddings import embedding_engine
from app.rag.vector_store import vector_store
from app.rag.retriever import retriever
from app.rag.user_context import user_context_builder
from app.rag.gemini_service import gemini_service
from app.rag.config import rag_settings

logger = logging.getLogger("creditlens.rag")

class RAGCopilotService:
    def __init__(self):
        self._is_initialized = False
        self.documents: List[Document] = []
        self.chunks: List[DocumentChunk] = []

    def initialize_knowledge_base(self):
        """Loads documents, chunks, computes embeddings, and indexes them into the vector store."""
        if self._is_initialized and vector_store.get_chunk_count() > 0:
            return

        t0 = time.time()
        # 1. Load authoritative documents
        self.documents = load_knowledge_documents()
        
        # 2. Chunk documents
        self.chunks = chunk_all_documents(self.documents)
        
        # 3. Fit embedding engine on corpus vocabulary
        corpus_texts = [c.content for c in self.chunks]
        embedding_engine.initialize_with_corpus(corpus_texts)
        
        # 4. Generate embeddings for all chunks
        chunk_embeddings = embedding_engine.embed_batch(corpus_texts)
        
        # 5. Populate vector store
        vector_store.clear()
        vector_store.add_chunks(self.chunks, chunk_embeddings)
        self._is_initialized = True
        
        elapsed = round((time.time() - t0) * 1000, 2)
        logger.info(f"RAG Knowledge Base initialized: {len(self.documents)} documents, {len(self.chunks)} chunks in {elapsed}ms")

    def query(
        self,
        request: CopilotQueryRequest,
        user_id: int = 1,
        demo: bool = True
    ) -> CopilotResponse:
        """
        Executes end-to-end grounded RAG Copilot pipeline for a user inquiry.
        """
        start_time = time.time()
        conv_id = request.conversation_id or f"conv-{uuid.uuid4().hex[:12]}"
        
        # Ensure knowledge base is populated
        self.initialize_knowledge_base()

        # 1. Semantic Retrieval
        t_retrieval_start = time.time()
        retrieved_chunks: List[RetrievalResult] = []
        if request.include_sources:
            retrieved_chunks = retriever.retrieve(
                query=request.query,
                top_k=rag_settings.TOP_K,
                threshold=rag_settings.SIMILARITY_THRESHOLD
            )
        retrieval_latency_ms = round((time.time() - t_retrieval_start) * 1000, 2)

        # 2. Build Structured User Financial Context
        user_context: Optional[StructuredUserFinancialContext] = None
        if request.include_personal_context:
            user_context = user_context_builder.build_user_context(user_id=user_id, demo=demo)

        # 3. Gemini / Grounded Synthesis
        t_gen_start = time.time()
        synthesis = gemini_service.generate_grounded_response(
            query=request.query,
            retrieved_chunks=retrieved_chunks,
            user_context=user_context
        )
        gen_latency_ms = round((time.time() - t_gen_start) * 1000, 2)
        total_latency_ms = round((time.time() - start_time) * 1000, 2)

        logger.info(
            f"Copilot query processed | Retrieved: {len(retrieved_chunks)} | "
            f"Retrieval latency: {retrieval_latency_ms}ms | Synthesis latency: {gen_latency_ms}ms | Total: {total_latency_ms}ms"
        )

        return CopilotResponse(
            response=synthesis.answer,
            conversation_id=conv_id,
            timestamp=datetime.utcnow(),
            sources=synthesis.sources,
            grounding_facts=synthesis.grounding_facts,
            suggested_followups=synthesis.suggested_followups,
            key_points=synthesis.key_points,
            personalized_insights=synthesis.personalized_insights,
            grounding_summary={
                "retrieved_chunks_count": len(retrieved_chunks),
                "retrieval_used": len(retrieved_chunks) > 0,
                "personal_context_used": request.include_personal_context,
                "retrieval_latency_ms": retrieval_latency_ms,
                "total_latency_ms": total_latency_ms,
            },
            disclaimer=synthesis.disclaimer,
            is_demo=demo
        )

rag_copilot_service = RAGCopilotService()
