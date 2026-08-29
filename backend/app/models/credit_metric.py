from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, Integer, DateTime, ForeignKey, JSON
from app.db.base import Base
from datetime import datetime
from typing import Dict, Any, Optional

class CreditMetric(Base):
    """
    Stores calculated credit health scores and quantitative factor metrics.
    Note: LLMs do NOT calculate these numbers. Deterministic/ML pipelines compute them.
    """
    __tablename__ = "credit_metrics"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    calculation_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Proprietary CreditLens Health Score (0 - 1000)
    health_score: Mapped[int] = mapped_column(Integer, nullable=False)
    score_delta_month: Mapped[int] = mapped_column(Integer, default=0) # e.g. +18
    status_label: Mapped[str] = mapped_column(String(50), default="Healthy") # Excellent, Healthy, Fair, Needs Attention
    
    # Core Deterministic Factor Metrics (0 - 100 percentages or normalized ratios)
    payment_history_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 92.00
    credit_utilization_ratio: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 68.00%
    debt_to_income_ratio: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 31.00%
    repayment_consistency_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 94.00%
    credit_history_depth_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 71.00%
    recent_spending_velocity_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 76.00%

    # Structured metadata factors for explanation
    factor_breakdown_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="credit_metrics")
