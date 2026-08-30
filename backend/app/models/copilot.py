"""
CreditLens Copilot Query History Model
Persists user queries, answers, verified citations, and metric grounding records.
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, JSON, func
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.db.base import Base

class CopilotQueryRecord(Base):
    __tablename__ = "copilot_queries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversation_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    
    query: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    sources: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    grounding_facts: Mapped[Optional[List[Dict[str, str]]]] = mapped_column(JSON, nullable=True)
    key_points: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    personalized_insights: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="copilot_queries")
