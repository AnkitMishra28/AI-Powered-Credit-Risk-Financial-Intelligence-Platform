"""
CreditLens Financial Copilot Endpoints
Handles natural-language RAG financial inquiries with authoritative regulatory citations and metric grounding.
"""
from fastapi import APIRouter, Query, HTTPException, status
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.schemas.common import ApiResponse
from app.services.copilot_service import copilot_service

router = APIRouter()

@router.post("/query", response_model=ApiResponse[CopilotQueryResponse], summary="Ask CreditLens Copilot (RAG + Gemini)")
async def query_copilot(
    request: CopilotQueryRequest,
    user_id: int = Query(1, description="User identifier"),
    demo: bool = Query(True, description="Use demo profile data")
):
    """
    Submits an inquiry to the Ask CreditLens RAG Assistant.
    Retrieves authoritative regulatory frameworks (RBI Master Directions) and personal CreditLens metrics,
    synthesizing grounded, non-hallucinated explanations.
    """
    try:
        response_data = copilot_service.query(request, user_id=user_id, demo=demo)
        return ApiResponse(
            success=True,
            message="Copilot response generated successfully",
            data=response_data,
            is_demo=demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating Copilot response: {str(e)}"
        )
