from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean
from typing import List, Optional
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    financial_profiles: Mapped[List["FinancialProfile"]] = relationship("FinancialProfile", back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    loans: Mapped[List["Loan"]] = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    credit_metrics: Mapped[List["CreditMetric"]] = relationship("CreditMetric", back_populates="user", cascade="all, delete-orphan")
    risk_predictions: Mapped[List["RiskPrediction"]] = relationship("RiskPrediction", back_populates="user", cascade="all, delete-orphan")
    insights: Mapped[List["Insight"]] = relationship("Insight", back_populates="user", cascade="all, delete-orphan")
