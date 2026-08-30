"""
CreditLens Credit Health Service
Calculates deterministic 0–1000 Credit Health scores and factor attributions.
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app.schemas.credit_health import CreditHealthResponse, FactorScore, CreditHealthHistoryPoint
from app.ml.scoring.credit_health_engine import credit_health_engine

class CreditHealthService:
    """
    Service layer executing the deterministic Credit Health Scoring engine.
    """
    @staticmethod
    def get_demo_credit_health() -> CreditHealthResponse:
        """
        Runs the deterministic Credit Health calculation engine on the canonical Alex Mercer profile.
        """
        raw = credit_health_engine.calculate_score(
            monthly_income=65000.0,
            credit_limit_total=250000.0,
            revolving_balance_total=170000.0,
            total_monthly_emi=8500.0,
            payment_consistency_ratio=0.94,
            credit_history_years=4.2,
            monthly_spending_total=49230.0,
            spending_average_6mo=50055.0
        )

        factors = [
            FactorScore(
                factor_id=f["factor_id"],
                name=f["name"],
                score=f["score"],
                weight=f["weight"],
                status=f["status"],
                description=f["description"],
                impact_detail=f["impact_detail"]
            )
            for f in raw["factors"]
        ]

        history = [
            CreditHealthHistoryPoint(
                month=h["month"],
                score=h["score"],
                utilization=h["utilization"]
            )
            for h in raw["history"]
        ]

        return CreditHealthResponse(
            health_score=raw["health_score"],
            score_tier=raw["score_tier"],
            score_delta=raw["score_delta"],
            calculation_timestamp=datetime.utcnow(),
            factors=factors,
            history=history,
            disclaimer=raw["disclaimer"],
            is_demo=True
        )

    @staticmethod
    def calculate_custom_score(
        monthly_income: float,
        credit_limit_total: float,
        revolving_balance_total: float,
        total_monthly_emi: float,
        payment_consistency_ratio: float = 0.90,
        credit_history_years: float = 3.0,
        monthly_spending_total: float = 40000.0,
        spending_average_6mo: float = 40000.0
    ) -> CreditHealthResponse:
        """
        Calculates a Credit Health Score for custom user financial inputs.
        """
        raw = credit_health_engine.calculate_score(
            monthly_income=monthly_income,
            credit_limit_total=credit_limit_total,
            revolving_balance_total=revolving_balance_total,
            total_monthly_emi=total_monthly_emi,
            payment_consistency_ratio=payment_consistency_ratio,
            credit_history_years=credit_history_years,
            monthly_spending_total=monthly_spending_total,
            spending_average_6mo=spending_average_6mo
        )

        factors = [
            FactorScore(
                factor_id=f["factor_id"],
                name=f["name"],
                score=f["score"],
                weight=f["weight"],
                status=f["status"],
                description=f["description"],
                impact_detail=f["impact_detail"]
            )
            for f in raw["factors"]
        ]

        history = [
            CreditHealthHistoryPoint(
                month=h["month"],
                score=h["score"],
                utilization=h["utilization"]
            )
            for h in raw["history"]
        ]

        return CreditHealthResponse(
            health_score=raw["health_score"],
            score_tier=raw["score_tier"],
            score_delta=raw["score_delta"],
            calculation_timestamp=datetime.utcnow(),
            factors=factors,
            history=history,
            disclaimer=raw["disclaimer"],
            is_demo=False
        )

credit_health_service = CreditHealthService()
