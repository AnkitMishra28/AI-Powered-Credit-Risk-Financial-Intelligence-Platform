"""
CreditLens Risk Service
Orchestrates machine learning risk classification and TreeSHAP explainability workflows.
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app.schemas.risk import (
    RiskAnalysisResponse,
    ProbabilityDistribution,
    ShapFeatureContribution,
)
from app.ml.inference.service import ml_service

class RiskAnalysisService:
    """
    Service layer providing XGBoost risk inference, probability calibration, and SHAP explainability.
    """
    @staticmethod
    def get_demo_risk_analysis() -> RiskAnalysisResponse:
        """
        Runs the real trained XGBoost classifier and TreeSHAP explainer on the canonical profile.
        """
        return ml_service.get_demo_risk_analysis()

    @staticmethod
    def build_response_from_record(record) -> RiskAnalysisResponse:
        """
        Rebuilds a RiskAnalysisResponse from a persisted per-user RiskPredictionRecord.
        Used by GET /risk/analysis so an authenticated real user only ever sees a
        prediction that was actually generated from THEIR submitted profile inputs
        (never the demo/canonical applicant).
        """
        shap = []
        for s in (record.shap_explanations or []):
            try:
                shap.append(ShapFeatureContribution(**s))
            except Exception:
                continue

        return RiskAnalysisResponse(
            risk_category=record.risk_category,
            confidence_percentage=float(record.confidence_percentage),
            probability_distribution=ProbabilityDistribution(
                low_risk=float(record.low_risk_probability),
                medium_risk=float(record.medium_risk_probability),
                high_risk=float(record.high_risk_probability),
            ),
            top_positive_factors=record.top_positive_factors or [],
            risk_factors=record.risk_factors or [],
            model_explainability=shap,
            model_version=record.model_version,
            evaluated_at=getattr(record, "evaluated_at", None) or datetime.utcnow(),
            is_demo=False,
        )

    @staticmethod
    def predict_risk(record: Dict[str, Any]) -> RiskAnalysisResponse:
        """
        Predicts credit risk probabilities and SHAP explanations for any custom applicant profile.
        """
        return ml_service.predict_risk_from_record(record)

    @staticmethod
    def get_model_info() -> Dict[str, Any]:
        """
        Returns model architecture, training metrics, dataset summary, and features.
        """
        return ml_service.get_model_info()

risk_service = RiskAnalysisService()
