"""
CreditLens Credit Health Repository
Data access layer for Credit Health score snapshots and historical trends.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.credit_health import CreditHealthSnapshot

class CreditHealthRepository:
    @staticmethod
    async def save_snapshot(
        session: AsyncSession,
        user_id: int,
        score: int,
        tier: str,
        score_delta: int,
        payment_reliability_score: float,
        utilization_score: float,
        debt_burden_score: float,
        tenure_score: float,
        spending_stability_score: float,
        factors: Optional[List[Dict[str, Any]]] = None,
        disclaimer: str = "Educational credit health diagnostic. CreditLens is not a credit bureau."
    ) -> CreditHealthSnapshot:
        snapshot = CreditHealthSnapshot(
            user_id=user_id,
            score=score,
            tier=tier,
            score_delta=score_delta,
            payment_reliability_score=payment_reliability_score,
            utilization_score=utilization_score,
            debt_burden_score=debt_burden_score,
            tenure_score=tenure_score,
            spending_stability_score=spending_stability_score,
            factors=factors,
            disclaimer=disclaimer
        )
        session.add(snapshot)
        await session.commit()
        await session.refresh(snapshot)
        return snapshot

    @staticmethod
    async def get_latest_for_user(session: AsyncSession, user_id: int) -> Optional[CreditHealthSnapshot]:
        result = await session.execute(
            select(CreditHealthSnapshot)
            .where(CreditHealthSnapshot.user_id == user_id)
            .order_by(desc(CreditHealthSnapshot.calculated_at))
        )
        return result.scalars().first()

    @staticmethod
    async def list_history_for_user(session: AsyncSession, user_id: int, limit: int = 6) -> List[CreditHealthSnapshot]:
        result = await session.execute(
            select(CreditHealthSnapshot)
            .where(CreditHealthSnapshot.user_id == user_id)
            .order_by(desc(CreditHealthSnapshot.calculated_at))
            .limit(limit)
        )
        return list(result.scalars().all())

credit_health_repo = CreditHealthRepository()
