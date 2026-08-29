from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, DateTime, ForeignKey, JSON
from app.db.base import Base
from datetime import datetime
from typing import Dict, Any, List, Optional

class RiskPrediction(Base):
    """
    Stores structured outputs from Scikit-Learn/XGBoost/LightGBM risk classifiers & SHAP explainers.
    """
    __tablename__ = "risk_predictions"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Classification category
    risk_category: Mapped[str] = mapped_column(String(50), nullable=False) # LOW_RISK, MEDIUM_RISK, HIGH_RISK
    model_confidence: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 87.00%
    
    # Probability distribution
    prob_low_risk: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False) # e.g. 0.82
    prob_medium_risk: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False) # e.g. 0.14
    prob_high_risk: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False) # e.g. 0.04
    
    # Positive drivers & Risk flags (structured extracted features)
    top_positive_factors: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    risk_factors: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    
    # SHAP feature contributions (feature_name -> shap_value)
    shap_values: Mapped[Optional[Dict[str, float]]] = mapped_column(JSON, nullable=True)
    model_version: Mapped[str] = mapped_column(String(50), default="creditlens-risk-xgb-v1")

    user: Mapped["User"] = relationship("User", back_populates="risk_predictions")
