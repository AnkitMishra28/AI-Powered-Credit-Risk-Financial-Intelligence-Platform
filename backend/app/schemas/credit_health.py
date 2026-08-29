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
