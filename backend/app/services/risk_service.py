from datetime import datetime
from app.schemas.risk import RiskAnalysisResponse, ProbabilityDistribution, ShapFeatureContribution

class RiskAnalysisService:
    @staticmethod
    def get_demo_risk_analysis() -> RiskAnalysisResponse:
        """
        Returns structured demo risk classification metrics and SHAP explainability architecture placeholders.
        In Phase 2, this will execute Scikit-Learn/XGBoost feature extraction and SHAP TreeExplainer.
        """
        prob_dist = ProbabilityDistribution(
            low_risk=0.82,
            medium_risk=0.14,
            high_risk=0.04
        )

        top_positive = [
            "Consistent on-time payment track record across all credit lines (94% repayment index)",
            "Stable monthly net income stream (₹65,000 / month)",
            "Moderate debt-to-income ratio (31% well within prudent limits)",
            "No active collections, delinquency remarks, or credit write-offs"
        ]

        risk_factors = [
            "Revolving credit utilization is at 68%, exceeding the recommended <30% threshold",
            "Recent spike in discretionary dining expenditure (+31% vs 3-month rolling mean)",
            "Concentration of balance across a single primary credit card"
        ]

        shap_contributions = [
            ShapFeatureContribution(
                feature_name="payment_consistency_ratio",
                display_name="Payment Consistency (11mo)",
                impact_value=0.42,
                feature_value="0.94",
                is_positive=True
            ),
            ShapFeatureContribution(
                feature_name="debt_to_income_ratio",
                display_name="Debt to Income Ratio",
                impact_value=0.28,
                feature_value="31.2%",
                is_positive=True
            ),
            ShapFeatureContribution(
                feature_name="income_stability_index",
                display_name="Income Stability",
                impact_value=0.19,
                feature_value="₹65,000/mo",
                is_positive=True
            ),
            ShapFeatureContribution(
                feature_name="revolving_utilization_pct",
                display_name="Revolving Credit Utilization",
                impact_value=-0.35,
                feature_value="68.0%",
                is_positive=False
            ),
            ShapFeatureContribution(
                feature_name="discretionary_spend_spike",
                display_name="Discretionary Spend Volatility",
                impact_value=-0.14,
                feature_value="+31.0%",
                is_positive=False
            )
        ]

        return RiskAnalysisResponse(
            risk_category="LOW RISK",
            confidence_percentage=87.0,
            probability_distribution=prob_dist,
            top_positive_factors=top_positive,
            risk_factors=risk_factors,
            model_explainability=shap_contributions,
            model_version="creditlens-risk-xgb-v1",
            evaluated_at=datetime.utcnow(),
            is_demo=True
        )

risk_service = RiskAnalysisService()
