from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Integer
from app.db.base import Base
from datetime import datetime
from typing import Optional

class Loan(Base):
    __tablename__ = "loans"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    loan_type: Mapped[str] = mapped_column(String(100), nullable=False) # Personal, Home, Auto, Education
    principal_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    outstanding_balance: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    interest_rate: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    monthly_emi: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    remaining_months: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE") # ACTIVE, CLOSED, DEFAULTED

    user: Mapped["User"] = relationship("User", back_populates="loans")
