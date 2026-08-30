"""
CreditLens Risk Prediction Repository
Data access layer for XGBoost default predictions and TreeSHAP explainability records.
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.risk_prediction import RiskPredictionRecord

class RiskPredictionRepository:
    @staticmethod
    async def save_prediction(
        session: AsyncSession,
        user_id: int,
        risk_category: str,
        confidence_percentage: float,
        low_risk_probability: float,
        medium_risk_probability: float,
        high_risk_probability: float,
        top_positive_factors: Optional[List[str]] = None,
        risk_factors: Optional[List[str]] = None,
        shap_explanations: Optional[List[Dict[str, Any]]] = None,
        model_version: str = "creditlens-risk-xgb-v1.2"
    ) -> RiskPredictionRecord:
        record = RiskPredictionRecord(
            user_id=user_id,
            risk_category=risk_category,
            confidence_percentage=confidence_percentage,
            low_risk_probability=low_risk_probability,
            medium_risk_probability=medium_risk_probability,
            high_risk_probability=high_risk_probability,
            top_positive_factors=top_positive_factors,
            risk_factors=risk_factors,
            shap_explanations=shap_explanations,
            model_version=model_version
        )
        session.add(record)
        await session.commit()
        await session.refresh(record)
        return record

    @staticmethod
    async def get_latest_for_user(session: AsyncSession, user_id: int) -> Optional[RiskPredictionRecord]:
        result = await session.execute(
            select(RiskPredictionRecord)
            .where(RiskPredictionRecord.user_id == user_id)
            .order_by(desc(RiskPredictionRecord.evaluated_at))
        )
        return result.scalars().first()

risk_prediction_repo = RiskPredictionRepository()
