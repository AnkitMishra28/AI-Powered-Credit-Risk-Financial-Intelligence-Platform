from fastapi import APIRouter, Query, HTTPException, status
from typing import Dict, Any
from app.schemas.risk import RiskAnalysisResponse, RiskPredictionRequest, ModelInfoResponse
from app.schemas.common import ApiResponse
from app.services.risk_service import risk_service

router = APIRouter()

@router.get("/analysis", response_model=ApiResponse[RiskAnalysisResponse], summary="Get Credit Risk Analysis")
async def get_risk_analysis(
    demo: bool = Query(True, description="Retrieve demo account risk prediction")
):
    """
    Retrieves the real machine learning risk classification, probability distribution, and SHAP explainability insights.
    """
    try:
        data = risk_service.get_demo_risk_analysis()
        return ApiResponse(
            success=True,
            message="Risk assessment calculated successfully via XGBoost",
            data=data,
            is_demo=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing risk intelligence engine: {str(e)}"
        )

@router.post("/predict", response_model=ApiResponse[RiskAnalysisResponse], summary="Predict Credit Risk for Applicant")
async def predict_applicant_risk(request: RiskPredictionRequest):
    """
    Executes the trained XGBoost model and TreeSHAP explainability pipeline on custom applicant profile inputs.
    """
    try:
        data = risk_service.predict_risk(request.model_dump())
        return ApiResponse(
            success=True,
            message="Applicant credit risk predicted successfully",
            data=data,
            is_demo=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inference error: {str(e)}"
        )

@router.get("/model-info", response_model=ApiResponse[ModelInfoResponse], summary="Get Risk Model Metadata & Metrics")
async def get_model_metadata():
    """
    Returns the XGBoost classifier metadata, version, baseline vs primary evaluation metrics, and feature catalog.
    """
    try:
        info = risk_service.get_model_info()
        return ApiResponse(
            success=True,
            message="Model metadata retrieved successfully",
            data=info,
            is_demo=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving model info: {str(e)}"
        )
