from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Boolean
from app.db.base import Base
from datetime import datetime
from typing import Optional

class Transaction(Base):
    __tablename__ = "transactions"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    merchant: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # Food, Shopping, Transport, Utilities, etc.
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    account_type: Mapped[str] = mapped_column(String(50), nullable=False, default="Credit Card") # Credit Card, Bank Account
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="transactions")
