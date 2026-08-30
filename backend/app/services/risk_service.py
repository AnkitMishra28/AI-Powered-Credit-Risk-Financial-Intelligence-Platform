"""
CreditLens Risk Service
Orchestrates machine learning risk classification and TreeSHAP explainability workflows.
"""
from typing import Dict, Any, Optional
from app.schemas.risk import RiskAnalysisResponse
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
