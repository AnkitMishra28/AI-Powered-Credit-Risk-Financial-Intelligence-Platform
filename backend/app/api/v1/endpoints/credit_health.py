from fastapi import APIRouter, Query
from app.schemas.credit_health import CreditHealthResponse
from app.schemas.common import ApiResponse
from app.services.credit_service import credit_health_service

router = APIRouter()

@router.get("/summary", response_model=ApiResponse[CreditHealthResponse], summary="Get Credit Health Summary")
async def get_credit_health_summary(
    demo: bool = Query(True, description="Retrieve demo account metrics")
):
    """
    Retrieves the proprietary CreditLens Credit Health Score and individual factor breakdown metrics.
    """
    data = credit_health_service.get_demo_credit_health()
    return ApiResponse(
        success=True,
        message="Credit health calculated successfully",
        data=data,
        is_demo=True
    )
