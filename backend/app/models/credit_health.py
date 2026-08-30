"""
CreditLens Credit Health Snapshot Model
Persists deterministic 0–1000 Credit Health scores and factor breakdowns per user.
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, JSON, func
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.db.base import Base

class CreditHealthSnapshot(Base):
    __tablename__ = "credit_health_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score: Mapped[int] = mapped_column(Integer, nullable=False) # 0 - 1000
    tier: Mapped[str] = mapped_column(String(50), nullable=False) # Excellent, Healthy, Fair, Needs Attention
    score_delta: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    payment_reliability_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    utilization_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    debt_burden_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    tenure_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    spending_stability_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    
    factors: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    disclaimer: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="Educational credit health diagnostic. CreditLens is not a credit bureau."
    )
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="credit_health_snapshots")
