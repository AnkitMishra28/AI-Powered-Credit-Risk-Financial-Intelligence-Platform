from datetime import datetime
from typing import Optional
from app.schemas.credit_health import CreditHealthResponse, FactorScore, CreditHealthHistoryPoint

class CreditHealthService:
    @staticmethod
    def get_demo_credit_health() -> CreditHealthResponse:
        """
        Returns structured demo credit health metrics.
        In Phase 2, this will calculate dynamic scores via deterministic domain rules & financial pipelines.
        """
        factors = [
            FactorScore(
                factor_id="payment_history",
                name="Payment History",
                score=92.0,
                weight=0.35,
                status="optimal",
                description="Consistently paying minimum and full balances on or before due dates.",
                impact_detail="High positive influence (+140 pts to score baseline)"
            ),
            FactorScore(
                factor_id="credit_utilization",
                name="Credit Utilization",
                score=68.0,
                weight=0.30,
                status="warning",
                description="Currently using 68% of available ₹2,50,000 aggregate credit limit.",
                impact_detail="Revolving ratio above recommended 30% threshold (-35 pts impact)"
            ),
            FactorScore(
                factor_id="debt_to_income",
                name="Debt-to-Income",
                score=31.0,
                weight=0.15,
                status="good",
                description="Monthly debt obligations consume ~31% of ₹65,000 declared monthly income.",
                impact_detail="Within safe borrowing bounds (< 36% standard target)"
            ),
            FactorScore(
                factor_id="repayment_pattern",
                name="Repayment Pattern",
                score=94.0,
                weight=0.10,
                status="optimal",
                description="11 consecutive months of zero missed payments across all registered lines.",
                impact_detail="Demonstrates high reliability for underwriting models"
            ),
            FactorScore(
                factor_id="credit_history",
                name="Credit History Length",
                score=71.0,
                weight=0.05,
                status="good",
                description="Oldest active credit line is 4.2 years old with steady tenure.",
                impact_detail="Adequate seasoning of revolving credit accounts"
            ),
            FactorScore(
                factor_id="recent_spending",
                name="Recent Spending Velocity",
                score=76.0,
                weight=0.05,
                status="good",
                description="Monthly spending rate remained within 1.1x of 6-month historical baseline.",
                impact_detail="Stable cashflow velocity with low volatility"
            ),
        ]

        history = [
            CreditHealthHistoryPoint(month="Oct", score=710, utilization=74.0),
            CreditHealthHistoryPoint(month="Nov", score=718, utilization=72.5),
            CreditHealthHistoryPoint(month="Dec", score=725, utilization=71.0),
            CreditHealthHistoryPoint(month="Jan", score=730, utilization=70.0),
            CreditHealthHistoryPoint(month="Feb", score=724, utilization=75.0),
            CreditHealthHistoryPoint(month="Mar", score=742, utilization=68.0),
        ]

        return CreditHealthResponse(
            health_score=742,
            score_tier="Healthy",
            score_delta=18,
            calculation_timestamp=datetime.utcnow(),
            factors=factors,
            history=history,
            is_demo=True
        )

credit_health_service = CreditHealthService()
