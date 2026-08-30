"""
CreditLens SHAP Explainability Engine
Computes TreeSHAP feature attributions on the trained XGBoost risk model.
"""
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from app.ml.features.feature_dictionary import FEATURE_DICTIONARY

class CreditLensShapExplainer:
    """
    Computes deterministic Shapley feature attributions for risk predictions using TreeSHAP.
    """
    def __init__(self, model: Any, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names

    def explain_instance(
        self,
        X_transformed: np.ndarray,
        raw_row: Dict[str, Any],
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Computes SHAP values for a single transformed feature vector.
        Returns:
            Dict containing:
                - shap_contributions: List of ShapFeatureContribution dicts
                - top_positive_factors: Human-readable positive driver strings
                - risk_factors: Human-readable watch signal strings
                - base_value: Expected log-odds margin value
        """
        import xgboost as xgb

        # Compute exact TreeSHAP values natively via XGBoost Booster
        booster = self.model.get_booster() if hasattr(self.model, "get_booster") else self.model
        dmat = xgb.DMatrix(X_transformed, feature_names=self.feature_names)
        shap_matrix = booster.predict(dmat, pred_contribs=True)

        # shap_matrix shape is (1, num_features + 1), last element is the expected base value
        row_shap = shap_matrix[0][:-1]
        base_value = float(shap_matrix[0][-1])

        contributions = []
        for feat_name, shap_val in zip(self.feature_names, row_shap):
            # Resolve raw feature name & display metadata
            base_col = feat_name.split("__")[-1] if "__" in feat_name else feat_name
            # If one-hot encoded like 'cat__checking_status_<0'
            clean_col = base_col.split("_")[0] if "_" in base_col else base_col
            
            # Look up in feature dictionary
            meta = FEATURE_DICTIONARY.get(base_col) or FEATURE_DICTIONARY.get(clean_col)
            display_name = meta["display_name"] if meta else base_col.replace("_", " ").title()
            
            raw_val_str = str(raw_row.get(base_col, raw_row.get(clean_col, "Active")))
            
            # In credit risk modeling:
            # Negative SHAP value reduces default log-odds (increases credit safety / positive driver)
            # Positive SHAP value increases default log-odds (increases default risk / watch factor)
            # Note: For our UI presentation, impact_value > 0 represents safety-enhancing (+ pts)
            is_positive = (shap_val <= 0)
            ui_impact = round(float(-shap_val), 3)

            contributions.append({
                "feature_name": feat_name,
                "display_name": display_name,
                "impact_value": ui_impact,
                "feature_value": raw_val_str,
                "is_positive": is_positive,
                "abs_impact": abs(float(shap_val))
            })

        # Sort by absolute impact magnitude
        contributions.sort(key=lambda c: c["abs_impact"], reverse=True)

        top_positive_factors = []
        risk_factors = []

        for item in contributions:
            if item["is_positive"] and len(top_positive_factors) < top_k:
                top_positive_factors.append(
                    f"{item['display_name']}: {item['feature_value']} positively anchors credit safety (+{abs(item['impact_value']):.2f} delta)"
                )
            elif (not item["is_positive"]) and len(risk_factors) < top_k:
                risk_factors.append(
                    f"{item['display_name']}: {item['feature_value']} flagged as elevated risk driver ({item['impact_value']:.2f} delta)"
                )

        return {
            "model_explainability": contributions[:top_k * 2],
            "top_positive_factors": top_positive_factors,
            "risk_factors": risk_factors,
            "base_value": base_value
        }
