"""
CreditLens Transaction Model
Persists canonical, normalized, and categorized financial transactions with anomaly scoring.
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Float, DateTime, ForeignKey, Boolean, func
from datetime import datetime
from typing import Optional
from app.db.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    statement_id: Mapped[str] = mapped_column(ForeignKey("statements.id", ondelete="CASCADE"), nullable=False, index=True)
    
    transaction_date: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    original_narration: Mapped[str] = mapped_column(String(500), nullable=False)
    normalized_merchant: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    classification_method: Mapped[str] = mapped_column(String(50), nullable=False, default="merchant_rule")
    classification_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.90)
    
    debit: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    credit: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False, default="debit")
    balance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    transaction_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    anomaly_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    anomaly_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    statement: Mapped["Statement"] = relationship("Statement", back_populates="transactions")
