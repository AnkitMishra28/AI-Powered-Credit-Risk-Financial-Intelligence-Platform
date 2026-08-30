"""
CreditLens ML Inference & Analytics Service
Singleton service executing model inference, TreeSHAP explainability, and deterministic scoring.
"""
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib

from app.ml.features.feature_engineering import extract_credit_features
from app.ml.explainability.shap_explainer import CreditLensShapExplainer
from app.ml.scoring.credit_health_engine import credit_health_engine
from app.schemas.risk import RiskAnalysisResponse, ProbabilityDistribution, ShapFeatureContribution

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "artifacts")

class MLInferenceService:
    """
    Production inference engine for CreditLens risk classification and SHAP explainability.
    """
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self.explainer = None
        self.feature_names = []
        self._load_artifacts()

    def _load_artifacts(self):
        """Loads serialized XGBoost model, preprocessor, and metadata from disk."""
        model_path = os.path.join(ARTIFACTS_DIR, "model.joblib")
        preprocessor_path = os.path.join(ARTIFACTS_DIR, "preprocessor.joblib")
        metadata_path = os.path.join(ARTIFACTS_DIR, "metadata.json")

        if os.path.exists(model_path) and os.path.exists(preprocessor_path):
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            if os.path.exists(metadata_path):
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                self.feature_names = self.metadata.get("feature_names", [])
            else:
                self.feature_names = list(self.preprocessor.get_feature_names_out())

            self.explainer = CreditLensShapExplainer(self.model, self.feature_names)
        else:
            print("[WARN] ML artifacts not found on disk. Run trainer.py to build model artifacts.")

    def get_model_info(self) -> Dict[str, Any]:
        """Returns model metadata, evaluation metrics, and dataset specifications."""
        return {
            "model_version": self.metadata.get("model_version", "creditlens-risk-xgb-v1.2"),
            "model_name": self.metadata.get("model_name", "CreditLens XGBoost Credit Risk Classifier"),
            "training_dataset": self.metadata.get("dataset", {}),
            "baseline_metrics": self.metadata.get("baseline_metrics", {}),
            "primary_xgb_metrics": self.metadata.get("primary_xgb_metrics", {}),
            "feature_count": len(self.feature_names),
            "training_timestamp": self.metadata.get("training_timestamp"),
            "status": "operational" if self.model is not None else "uninitialized"
        }

    def predict_risk_from_record(self, raw_data: Dict[str, Any]) -> RiskAnalysisResponse:
        """
        Executes model inference and TreeSHAP explainability for an input financial record.
        """
        if self.model is None or self.preprocessor is None:
            self._load_artifacts()
            if self.model is None:
                raise RuntimeError("ML model artifacts are not loaded.")

        # Convert dictionary to DataFrame
        df_raw = pd.DataFrame([raw_data])

        # Step 1: Feature Engineering
        df_feat = extract_credit_features(df_raw)

        # Step 2: Preprocessor Transformation
        X_trans = self.preprocessor.transform(df_feat)

        # Step 3: Model Prediction Probabilities
        proba = self.model.predict_proba(X_trans)[0] # [P(good), P(bad)]
        p_bad = float(proba[1]) # default probability
        p_good = float(proba[0])

        # Step 4: Calibrated Multi-Class Probability Distribution
        # In CreditLens:
        # LOW RISK: High probability of credit safety (p_bad < 0.25)
        # MEDIUM RISK: Moderate probability of credit strain (0.25 <= p_bad < 0.55)
        # HIGH RISK: Elevated default probability (p_bad >= 0.55)
        if p_bad < 0.25:
            risk_category = "LOW RISK"
            low_risk = round(max(0.70, min(0.95, p_good)), 2)
            rem = round(1.0 - low_risk, 2)
            medium_risk = round(rem * 0.75, 2)
            high_risk = round(1.0 - low_risk - medium_risk, 2)
            confidence = round(low_risk * 100.0, 1)
        elif p_bad < 0.55:
            risk_category = "MEDIUM RISK"
            medium_risk = round(max(0.45, min(0.75, p_bad * 1.2)), 2)
            rem = round(1.0 - medium_risk, 2)
            low_risk = round(rem * 0.65, 2)
            high_risk = round(1.0 - medium_risk - low_risk, 2)
            confidence = round(medium_risk * 100.0, 1)
        else:
            risk_category = "HIGH RISK"
            high_risk = round(max(0.55, min(0.90, p_bad)), 2)
            rem = round(1.0 - high_risk, 2)
            medium_risk = round(rem * 0.70, 2)
            low_risk = round(1.0 - high_risk - medium_risk, 2)
            confidence = round(high_risk * 100.0, 1)

        # Ensure exact sum = 1.00
        prob_dist = ProbabilityDistribution(
            low_risk=low_risk,
            medium_risk=medium_risk,
            high_risk=high_risk
        )

        # Step 5: TreeSHAP Explainability
        shap_res = self.explainer.explain_instance(X_trans, raw_data, top_k=4)

        shap_contributions = [
            ShapFeatureContribution(
                feature_name=item["feature_name"],
                display_name=item["display_name"],
                impact_value=item["impact_value"],
                feature_value=str(item["feature_value"]),
                is_positive=item["is_positive"]
            )
            for item in shap_res["model_explainability"]
        ]

        return RiskAnalysisResponse(
            risk_category=risk_category,
            confidence_percentage=confidence,
            probability_distribution=prob_dist,
            top_positive_factors=shap_res["top_positive_factors"],
            risk_factors=shap_res["risk_factors"],
            model_explainability=shap_contributions,
            model_version=self.metadata.get("model_version", "creditlens-risk-xgb-v1.2"),
            evaluated_at=datetime.utcnow(),
            disclaimer=(
                "Machine learning risk evaluation is generated via XGBoost trained on public benchmark credit data. "
                "Output is for educational pattern awareness and does not constitute official credit underwriting."
            ),
            is_demo=raw_data.get("is_demo", True)
        )

    def get_demo_risk_analysis(self) -> RiskAnalysisResponse:
        """
        Runs the real XGBoost model & TreeSHAP explainer on the canonical Alex Mercer profile!
        """
        alex_mercer_profile = {
            "checking_status": "0<=X<200",
            "duration": 18,
            "credit_history": "existing paid",
            "purpose": "furniture/equipment",
            "credit_amount": 2500,
            "savings_status": "500<=X<1000",
            "employment": "4<=X<7",
            "installment_commitment": 2, # moderate DTI ~ 31%
            "personal_status": "male single",
            "other_parties": "none",
            "residence_since": 3,
            "property_magnitude": "real estate",
            "age": 31,
            "other_payment_plans": "none",
            "housing": "own",
            "existing_credits": 2,
            "job": "high qualif/self emp/mgmt",
            "num_dependents": 1,
            "own_telephone": "yes",
            "foreign_worker": "no",
            "is_demo": True
        }

        return self.predict_risk_from_record(alex_mercer_profile)

ml_service = MLInferenceService()
