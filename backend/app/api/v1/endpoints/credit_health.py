from fastapi import APIRouter, Query, HTTPException, status
from app.schemas.credit_health import CreditHealthResponse, CreditHealthCalculationRequest
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
    try:
        data = credit_health_service.get_demo_credit_health()
        return ApiResponse(
            success=True,
            message="Credit health calculated successfully via deterministic scoring engine",
            data=data,
            is_demo=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating credit health: {str(e)}"
        )

@router.post("/calculate", response_model=ApiResponse[CreditHealthResponse], summary="Calculate Custom Credit Health Score")
async def calculate_custom_credit_health(request: CreditHealthCalculationRequest):
    """
    Calculates a transparent, deterministic 0–1000 Credit Health Score for custom applicant inputs.
    """
    try:
        data = credit_health_service.calculate_custom_score(
            monthly_income=request.monthly_income,
            credit_limit_total=request.credit_limit_total,
            revolving_balance_total=request.revolving_balance_total,
            total_monthly_emi=request.total_monthly_emi,
            payment_consistency_ratio=request.payment_consistency_ratio,
            credit_history_years=request.credit_history_years,
            monthly_spending_total=request.monthly_spending_total,
            spending_average_6mo=request.spending_average_6mo
        )
        return ApiResponse(
            success=True,
            message="Custom credit health score calculated successfully",
            data=data,
            is_demo=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error calculating score: {str(e)}"
        )
