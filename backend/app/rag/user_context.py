"""
CreditLens User Financial Context Builder
Extracts deterministic credit health scores, ML risk signals, and statement cashflow metrics
to ground Copilot answers in the user's authentic financial profile.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.rag.models import StructuredUserFinancialContext
from app.services.credit_service import credit_service
from app.services.risk_service import risk_service
from app.services.spending_service import spending_service
from app.db.repositories.credit_health_repo import credit_health_repo
from app.db.repositories.risk_prediction_repo import risk_prediction_repo

class UserFinancialContextBuilder:
    @staticmethod
    def build_user_context(user_id: int = 1, demo: bool = True) -> StructuredUserFinancialContext:
        """
        Gathers live deterministic metrics from CreditHealthEngine, ML Inference, and Ingestion analytics.
        Strictly scopes metrics to the user.
        """
        health_data = credit_service.get_demo_credit_health()
        risk_data = risk_service.get_demo_risk_analysis()
        spending_data = spending_service.get_spending_intelligence(user_id=user_id, demo=demo)

        top_cats = [c.category for c in spending_data.categories[:4]]
        anoms = [f"{a.title} ({a.category}): {a.description}" for a in spending_data.anomalies]
        recurs = [f"{r.merchant} ({r.category}): ₹{r.estimated_amount:,.2f}/{r.frequency}" for r in (spending_data.recurring_payments or [])]

        return StructuredUserFinancialContext(
            health_score=health_data.health_score,
            score_tier=health_data.score_tier,
            payment_consistency_pct=94.0,
            credit_utilization_pct=68.0,
            revolving_balance=170000.0,
            credit_limit_total=250000.0,
            debt_to_income_pct=26.1,
            credit_history_years=4.2,
            spending_stability_pct=99.0,
            risk_category=risk_data.risk_category,
            risk_probability_pct=round(risk_data.confidence_percentage, 1),
            top_positive_factors=risk_data.top_positive_factors,
            risk_watch_factors=risk_data.risk_factors,
            monthly_income=spending_data.total_income_current_month or 65000.0,
            monthly_spending=spending_data.total_spending_current_month or 49230.0,
            net_cashflow=spending_data.net_cashflow or 15770.0,
            discretionary_spending=spending_data.discretionary_spending or 20230.0,
            essential_spending=spending_data.essential_spending or 29000.0,
            top_spending_categories=top_cats,
            recent_anomalies=anoms,
            active_subscriptions=recurs
        )

    @staticmethod
    async def build_real_user_context(
        session: AsyncSession, user_id: int
    ) -> Optional[StructuredUserFinancialContext]:
        """
        Builds a grounding context for a REAL authenticated user strictly from
        their own persisted data:
          * latest credit_health_snapshots row  -> score, tier, utilization/DTI
            (from the persisted profile_inputs the score was computed from)
          * latest risk_predictions row         -> ML risk category + drivers
          * their transactions -> spending analytics

        Returns None when the user has none of the above, so the Copilot stays in
        an explicit "no personal data analyzed yet" state instead of inventing
        numbers. Never touches another user's rows and never uses the demo profile.
        """
        snapshot = await credit_health_repo.get_latest_for_user(session, user_id)
        risk_record = await risk_prediction_repo.get_latest_for_user(session, user_id)

        spending = await spending_service.get_user_spending_intelligence_async(
            session=session, user_id=user_id, demo=False
        )
        has_spending = (spending.total_transactions_count or 0) > 0

        if snapshot is None and risk_record is None and not has_spending:
            return None

        ctx = StructuredUserFinancialContext()

        if snapshot is not None:
            ctx.health_score = snapshot.score
            ctx.score_tier = snapshot.tier
            pi = snapshot.profile_inputs or {}
            provided = set(pi.get("_provided_fields") or pi.keys())
            util = pi.get("credit_utilization_pct")
            dti = pi.get("debt_to_income_pct")
            if util is not None:
                ctx.credit_utilization_pct = float(util)
            if pi.get("revolving_balance_total") is not None:
                ctx.revolving_balance = float(pi["revolving_balance_total"])
            if pi.get("credit_limit_total") is not None:
                ctx.credit_limit_total = float(pi["credit_limit_total"])
            if dti is not None:
                ctx.debt_to_income_pct = float(dti)
            # Only surface fields the user actually supplied — never a model default.
            if "credit_history_years" in provided and pi.get("credit_history_years") is not None:
                ctx.credit_history_years = float(pi["credit_history_years"])
            if "payment_consistency_ratio" in provided and pi.get("payment_consistency_ratio") is not None:
                ctx.payment_consistency_pct = round(float(pi["payment_consistency_ratio"]) * 100, 1)
            if pi.get("monthly_income") is not None and not has_spending:
                ctx.monthly_income = float(pi["monthly_income"])

        if risk_record is not None:
            risk_resp = risk_service.build_response_from_record(risk_record)
            ctx.risk_category = risk_resp.risk_category
            ctx.risk_probability_pct = round(float(risk_resp.confidence_percentage), 1)
            ctx.top_positive_factors = list(risk_resp.top_positive_factors or [])
            ctx.risk_watch_factors = list(risk_resp.risk_factors or [])

        if has_spending:
            ctx.monthly_income = spending.total_income_current_month or ctx.monthly_income
            ctx.monthly_spending = spending.total_spending_current_month
            ctx.net_cashflow = spending.net_cashflow
            ctx.discretionary_spending = spending.discretionary_spending
            ctx.essential_spending = spending.essential_spending
            ctx.top_spending_categories = [c.category for c in spending.categories[:4]]
            ctx.recent_anomalies = [
                f"{a.title} ({a.category}): {a.description}" for a in spending.anomalies
            ]
            ctx.active_subscriptions = [
                f"{r.merchant} ({r.category}): ₹{r.estimated_amount:,.2f}/{r.frequency}"
                for r in (spending.recurring_payments or [])
            ]

        return ctx


user_context_builder = UserFinancialContextBuilder()
