from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class ProbabilityDistribution(BaseModel):
    low_risk: float = Field(..., ge=0.0, le=1.0)
    medium_risk: float = Field(..., ge=0.0, le=1.0)
    high_risk: float = Field(..., ge=0.0, le=1.0)

class ShapFeatureContribution(BaseModel):
    feature_name: str
    display_name: str
    impact_value: float # positive increases credit safety, negative increases risk
    feature_value: str
    is_positive: bool

class RiskAnalysisResponse(BaseModel):
    risk_category: str = Field(..., description="LOW RISK | MEDIUM RISK | HIGH RISK")
    confidence_percentage: float = Field(..., ge=0.0, le=100.0, description="Model prediction confidence e.g. 87.0")
    probability_distribution: ProbabilityDistribution
    top_positive_factors: List[str]
    risk_factors: List[str]
    model_explainability: List[ShapFeatureContribution]
    model_version: str = "creditlens-risk-xgb-v1"
    evaluated_at: datetime
    disclaimer: str = "Machine learning risk evaluation is for educational and risk-awareness purposes only."
    is_demo: bool = True
