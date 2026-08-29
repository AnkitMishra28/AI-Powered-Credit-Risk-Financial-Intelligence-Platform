from fastapi import APIRouter, Query
from app.schemas.spending import SpendingIntelligenceResponse
from app.schemas.common import ApiResponse
from app.services.spending_service import spending_service

router = APIRouter()

@router.get("/overview", response_model=ApiResponse[SpendingIntelligenceResponse], summary="Get Spending Intelligence")
async def get_spending_overview(
    demo: bool = Query(True, description="Retrieve demo account spending data")
):
    """
    Retrieves spending velocity, category allocations, anomaly detection flags, and recent transactions.
    """
    data = spending_service.get_demo_spending_intelligence()
    return ApiResponse(
        success=True,
        message="Spending intelligence retrieved successfully",
        data=data,
        is_demo=True
    )
