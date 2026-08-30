"""
CreditLens Statement Model
Persists uploaded bank & credit card statement files and metadata.
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, func
from typing import List, Optional
from datetime import datetime
from app.db.base import Base

class Statement(Base):
    __tablename__ = "statements"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False) # csv or pdf
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processing_status: Mapped[str] = mapped_column(String(50), nullable=False, default="completed")
    transaction_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    
    date_range_start: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    date_range_end: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    total_inflows: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_outflows: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    net_cashflow: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    error_message: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="statements")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="statement", cascade="all, delete-orphan")
