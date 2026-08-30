from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class FactorScore(BaseModel):
    factor_id: str
    name: str
    score: float # 0 - 100 percentage or normalized score
    weight: float # weight in calculation e.g. 0.35
    status: str # "optimal", "good", "warning", "critical"
    description: str
    impact_detail: str

class CreditHealthHistoryPoint(BaseModel):
    month: str # e.g. "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
    score: int
    utilization: float

class CreditHealthResponse(BaseModel):
    health_score: int = Field(..., ge=0, le=1000, description="Proprietary CreditLens Credit Health Score (0-1000)")
    score_tier: str = Field(..., description="e.g. Healthy, Prime, Needs Work")
    score_delta: int = Field(..., description="Change from previous calculation period (e.g. +18)")
    calculation_timestamp: datetime
    factors: List[FactorScore]
    history: List[CreditHealthHistoryPoint]
    disclaimer: str = (
        "Educational & Financial Intelligence score calculated by CreditLens proprietary indicators. "
        "This is NOT a CIBIL or official credit bureau score and does NOT constitute official credit advice."
    )
    is_demo: bool = True

class CreditHealthCalculationRequest(BaseModel):
    monthly_income: float = Field(..., ge=1000.0, description="Net monthly income in INR")
    credit_limit_total: float = Field(..., ge=1000.0, description="Aggregate credit limit across cards")
    revolving_balance_total: float = Field(0.0, ge=0.0, description="Total outstanding balance on cards")
    total_monthly_emi: float = Field(0.0, ge=0.0, description="Total monthly loan EMI commitments")
    payment_consistency_ratio: float = Field(0.90, ge=0.0, le=1.0, description="Historical on-time payment ratio (0.0 - 1.0)")
    credit_history_years: float = Field(3.0, ge=0.0, le=50.0, description="Age of oldest active credit line")
    monthly_spending_total: float = Field(40000.0, ge=0.0, description="Current monthly spending")
    spending_average_6mo: float = Field(40000.0, ge=0.0, description="6-month average monthly spending")
