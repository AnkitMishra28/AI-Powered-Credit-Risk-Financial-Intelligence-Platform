from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey, JSON, Boolean
from app.db.base import Base
from typing import Optional, Dict, Any

class Insight(Base):
    """
    Stores AI-generated explanations based strictly on structured financial facts.
    LLMs do NOT calculate numbers; they generate natural language explanations of structured inputs.
    """
    __tablename__ = "insights"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    insight_type: Mapped[str] = mapped_column(String(50), nullable=False) # SPENDING_ANOMALY, RISK_FACTOR, UTILIZATION_ALERT, POSITIVE_REINFORCEMENT
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[Text] = mapped_column(Text, nullable=False)
    
    # Grounding structured facts (e.g. {"dining_increase_pct": 31, "current_spending": 49230})
    structured_facts: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    
    actionable_recommendation: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_educational: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship("User", back_populates="insights")
