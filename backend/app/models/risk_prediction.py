"""
CreditLens Risk Prediction Model
Persists calibrated XGBoost credit risk predictions and TreeSHAP explainability outputs.
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON, func
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.db.base import Base

class RiskPredictionRecord(Base):
    __tablename__ = "risk_predictions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    risk_category: Mapped[str] = mapped_column(String(50), nullable=False) # LOW RISK, MEDIUM RISK, HIGH RISK
    confidence_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    low_risk_probability: Mapped[float] = mapped_column(Float, nullable=False)
    medium_risk_probability: Mapped[float] = mapped_column(Float, nullable=False)
    high_risk_probability: Mapped[float] = mapped_column(Float, nullable=False)
    
    top_positive_factors: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    risk_factors: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    shap_explanations: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    
    model_version: Mapped[str] = mapped_column(String(100), nullable=False, default="creditlens-risk-xgb-v1.2")
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="risk_predictions")
