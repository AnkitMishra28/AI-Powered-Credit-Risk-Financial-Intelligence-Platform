from fastapi import APIRouter, Query
from app.schemas.risk import RiskAnalysisResponse
from app.schemas.common import ApiResponse
from app.services.risk_service import risk_service

router = APIRouter()

@router.get("/analysis", response_model=ApiResponse[RiskAnalysisResponse], summary="Get Credit Risk Analysis")
async def get_risk_analysis(
    demo: bool = Query(True, description="Retrieve demo account risk prediction")
):
    """
    Retrieves the machine learning risk classification, probability distribution, and SHAP explainability insights.
    """
    data = risk_service.get_demo_risk_analysis()
    return ApiResponse(
        success=True,
        message="Risk assessment calculated successfully",
        data=data,
        is_demo=True
    )
