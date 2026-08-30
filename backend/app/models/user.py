"""
CreditLens User Model
Represents authenticated financial users with encrypted passwords and scoped relationships.
"""
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, func
from typing import List, Optional
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Scoped Relationships
    statements: Mapped[List["Statement"]] = relationship("Statement", back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    credit_health_snapshots: Mapped[List["CreditHealthSnapshot"]] = relationship("CreditHealthSnapshot", back_populates="user", cascade="all, delete-orphan")
    risk_predictions: Mapped[List["RiskPredictionRecord"]] = relationship("RiskPredictionRecord", back_populates="user", cascade="all, delete-orphan")
    copilot_queries: Mapped[List["CopilotQueryRecord"]] = relationship("CopilotQueryRecord", back_populates="user", cascade="all, delete-orphan")
    financial_profiles: Mapped[List["FinancialProfile"]] = relationship("FinancialProfile", back_populates="user", cascade="all, delete-orphan")
    loans: Mapped[List["Loan"]] = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    insights: Mapped[List["Insight"]] = relationship("Insight", back_populates="user", cascade="all, delete-orphan")
