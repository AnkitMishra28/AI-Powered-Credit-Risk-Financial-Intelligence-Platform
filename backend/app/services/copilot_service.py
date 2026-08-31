"""
CreditLens Copilot Service Layer
Connects FastAPI copilot endpoints to the RAG & Gemini intelligence subsystem.
"""
from app.schemas.copilot import (
    CopilotQueryRequest,
    CopilotQueryResponse
)
from app.rag.models import (
    CopilotQueryRequest as RagQueryRequest,
    StructuredUserFinancialContext,
)
from app.rag.service import rag_copilot_service

class CopilotService:
    @staticmethod
    def query(
        request: CopilotQueryRequest,
        user_id: int = 1,
        demo: bool = True,
        real_user: bool = False,
        real_user_context: "StructuredUserFinancialContext | None" = None,
    ) -> CopilotQueryResponse:
        """
        Executes grounded retrieval and synthesis via RAGCopilotService.

        `real_user` / `real_user_context` enforce the demo/real boundary: a real
        authenticated user is only ever grounded in their own persisted data
        (or nothing), never the canonical demo profile.
        """
        rag_req = RagQueryRequest(
            query=request.query,
            conversation_id=request.conversation_id,
            include_personal_context=request.include_personal_context,
            include_sources=request.include_sources
        )

        res = rag_copilot_service.query(
            rag_req,
            user_id=user_id,
            demo=demo,
            real_user=real_user,
            real_user_context=real_user_context,
        )

        # Format sources into clean dictionary representation for API response
        sources_payload = [
            {
                "id": s.document_id,
                "document_id": s.document_id,
                "chunk_id": s.chunk_id,
                "title": s.title,
                "publisher": s.source_name,
                "source_name": s.source_name,
                "doc_type": s.doc_type,
                "excerpt": s.excerpt,
                "url": s.source_url,
                "source_url": s.source_url,
                "relevance_score": s.relevance_score
            }
            for s in res.sources
        ]

        return CopilotQueryResponse(
            response=res.response,
            conversation_id=res.conversation_id,
            timestamp=res.timestamp,
            sources=sources_payload,
            grounding_facts=res.grounding_facts,
            suggested_followups=res.suggested_followups,
            key_points=res.key_points,
            personalized_insights=res.personalized_insights,
            grounding_summary=res.grounding_summary,
            disclaimer=res.disclaimer,
            is_demo=res.is_demo
        )

copilot_service = CopilotService()
