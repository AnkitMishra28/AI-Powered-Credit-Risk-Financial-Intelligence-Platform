"""
CreditLens Risk Analysis Endpoints
Executes calibrated XGBoost machine learning inference and TreeSHAP explainability with persistent prediction logs.
"""
from fastapi import APIRouter, Query, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.risk import RiskAnalysisResponse, RiskPredictionRequest, ModelInfoResponse
from app.schemas.common import ApiResponse
from app.services.risk_service import risk_service
from app.db.session import get_db
from app.db.repositories.risk_prediction_repo import risk_prediction_repo
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User

router = APIRouter()

@router.get("/analysis", response_model=ApiResponse[RiskAnalysisResponse], summary="Get Credit Risk Analysis")
async def get_risk_analysis(
    demo: bool = Query(True, description="(Ignored for real users) Only the seeded demo account receives demo data"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Returns the XGBoost risk classification + TreeSHAP explainability for the authenticated identity.

    Data ownership rules (enforced server-side from the trusted JWT identity, never
    from the `demo` query parameter):
      * Seeded demo account               -> demo/canonical applicant result (data_status="demo")
      * Real user WITH a saved prediction -> that user's own persisted record (data_status="ok")
      * Real user WITHOUT one             -> no result is returned            (data_status="insufficient_data",
                                             data=None)

    The risk model is trained on the public (South) German Credit benchmark and scores a
    20-field applicant credit profile — which a bank statement does not provide. A real
    user must submit that profile via POST /risk/predict; until then this endpoint
    reports "insufficient_data" instead of returning the canonical demo applicant.
    """
    # 1. Seeded demo account -> intentional demo result
    if current_user.is_demo:
        data = risk_service.get_demo_risk_analysis()
        return ApiResponse(
            success=True,
            message="Demo risk assessment (synthetic applicant profile).",
            data=data,
            is_demo=True,
            data_status="demo",
            has_financial_data=True,
        )

    # 2. Real user with a previously generated prediction -> their own record
    latest = await risk_prediction_repo.get_latest_for_user(session, current_user.id)
    if latest is not None:
        data = risk_service.build_response_from_record(latest)
        return ApiResponse(
            success=True,
            message="Risk assessment retrieved from your latest submitted profile.",
            data=data,
            is_demo=False,
            data_status="ok",
            has_financial_data=True,
        )

    # 3. Real user with no prediction yet -> explicit insufficient-data
    return ApiResponse(
        success=True,
        message=(
            "Risk analysis requires additional credit-profile information. Submit your "
            "applicant profile to generate a personalized, explainable risk assessment."
        ),
        data=None,
        is_demo=False,
        data_status="insufficient_data",
        has_financial_data=False,
    )

@router.post("/predict", response_model=ApiResponse[RiskAnalysisResponse], summary="Predict Credit Risk for Applicant")
async def predict_applicant_risk(
    request: RiskPredictionRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Executes the trained XGBoost model and TreeSHAP explainability pipeline on custom applicant profile inputs.
    """
    try:
        data = risk_service.predict_risk(request.model_dump())

        if current_user:
            shap_dicts = [
                {
                    "feature_name": s.feature_name,
                    "display_name": s.display_name,
                    "impact_value": s.impact_value,
                    "feature_value": s.feature_value,
                    "is_positive": s.is_positive
                }
                for s in data.model_explainability
            ]
            await risk_prediction_repo.save_prediction(
                session=session,
                user_id=current_user.id,
                risk_category=data.risk_category,
                confidence_percentage=data.confidence_percentage,
                low_risk_probability=data.probability_distribution.low_risk,
                medium_risk_probability=data.probability_distribution.medium_risk,
                high_risk_probability=data.probability_distribution.high_risk,
                top_positive_factors=data.top_positive_factors,
                risk_factors=data.risk_factors,
                shap_explanations=shap_dicts,
                model_version=data.model_version
            )

        return ApiResponse(
            success=True,
            message="Applicant credit risk predicted successfully",
            data=data,
            is_demo=False,
            data_status="ok",
            has_financial_data=True,
        )
    except HTTPException:
        raise
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
