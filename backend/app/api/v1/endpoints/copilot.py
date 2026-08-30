"""
CreditLens Financial Copilot Endpoints
Handles natural-language RAG financial inquiries with authoritative regulatory citations,
metric grounding, rate limiting, and user-scoped query history persistence.
"""
from fastapi import APIRouter, Query, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.schemas.common import ApiResponse
from app.services.copilot_service import copilot_service
from app.db.session import get_db
from app.db.repositories.copilot_repo import copilot_repo
from app.core.rate_limiter import rate_limit_dependency
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post(
    "/query",
    response_model=ApiResponse[CopilotQueryResponse],
    summary="Ask CreditLens Copilot (RAG + Gemini)",
    dependencies=[Depends(rate_limit_dependency(max_requests=settings.RATE_LIMIT_COPILOT_PER_MIN, window_seconds=60))]
)
async def query_copilot(
    request: CopilotQueryRequest,
    demo: bool = Query(True, description="Use demo profile data if demo user"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Submits an inquiry to the Ask CreditLens RAG Assistant.
    Retrieves authoritative regulatory frameworks (RBI Master Directions) and personal CreditLens metrics,
    synthesizing grounded, non-hallucinated explanations and persisting query records.
    Rate limited against generative AI quota abuse.
    """
    try:
        response_data = copilot_service.query(
            request,
            user_id=current_user.id,
            demo=demo and current_user.is_demo
        )

        # Persist copilot interaction in DB for authenticated user
        await copilot_repo.save_query(
            session=session,
            user_id=current_user.id,
            conversation_id=response_data.conversation_id,
            query=request.query,
            answer=response_data.response,
            sources=response_data.sources,
            grounding_facts=response_data.grounding_facts,
            key_points=response_data.key_points,
            personalized_insights=response_data.personalized_insights
        )

        return ApiResponse(
            success=True,
            message="Copilot response generated successfully",
            data=response_data,
            is_demo=current_user.is_demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating Copilot response: {str(e)}"
        )

@router.get("/history", response_model=ApiResponse[List[dict]], summary="Get Copilot Conversation History")
async def get_copilot_history(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves previous Copilot inquiries and grounded responses strictly scoped to the authenticated user.
    """
    history_records = await copilot_repo.list_history_for_user(session, current_user.id, limit=limit)
    
    results = [
        {
            "id": r.id,
            "conversation_id": r.conversation_id,
            "query": r.query,
            "answer": r.answer,
            "sources": r.sources,
            "key_points": r.key_points,
            "personalized_insights": r.personalized_insights,
            "created_at": r.created_at
        }
        for r in history_records
    ]
    
    return ApiResponse(
        success=True,
        message="Copilot history retrieved successfully",
        data=results,
        is_demo=current_user.is_demo
    )
