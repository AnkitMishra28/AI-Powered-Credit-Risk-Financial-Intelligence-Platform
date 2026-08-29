from fastapi import APIRouter
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.schemas.common import ApiResponse
from app.services.copilot_service import copilot_service

router = APIRouter()

@router.post("/query", response_model=ApiResponse[CopilotQueryResponse], summary="Ask CreditLens Copilot")
async def query_copilot(request: CopilotQueryRequest):
    """
    Submits a query to the Ask CreditLens assistant.
    Returns educational guidance, structured grounding facts, and verified citations.
    """
    response_data = copilot_service.query(request)
    return ApiResponse(
        success=True,
        message="Copilot response generated successfully",
        data=response_data,
        is_demo=True
    )
