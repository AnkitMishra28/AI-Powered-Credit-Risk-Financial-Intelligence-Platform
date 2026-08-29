from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, Integer, ForeignKey
from app.db.base import Base
from typing import Optional

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    monthly_income: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.0)
    employment_type: Mapped[str] = mapped_column(String(100), nullable=True) # Salaried, Self-Employed, Freelancer
    credit_limit_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.0)
    revolving_balance_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.0)
    credit_score_cibil_reference: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # Optional reference, never claimed as CreditLens
    onboarding_completed: Mapped[bool] = mapped_column(default=False)

    user: Mapped["User"] = relationship("User", back_populates="financial_profiles")
