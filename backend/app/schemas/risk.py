from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
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
    model_version: str = "creditlens-risk-xgb-v1.2"
    evaluated_at: datetime
    disclaimer: str = (
        "Machine learning risk evaluation is for educational and risk-awareness purposes only. "
        "It does not constitute official credit bureau underwriting."
    )
    is_demo: bool = True

class RiskPredictionRequest(BaseModel):
    checking_status: str = Field("0<=X<200", description="<0, 0<=X<200, >=200, no checking")
    duration: int = Field(18, ge=1, le=120, description="Tenure in months")
    credit_history: str = Field("existing paid", description="credit history descriptor")
    purpose: str = Field("furniture/equipment", description="facility purpose")
    credit_amount: float = Field(2500.0, ge=100.0, description="Credit balance / amount")
    savings_status: str = Field("500<=X<1000", description="<100, 100<=X<500, 500<=X<1000, >=1000, no known savings")
    employment: str = Field("4<=X<7", description="<1, 1<=X<4, 4<=X<7, >=7, unemployed")
    installment_commitment: int = Field(2, ge=1, le=4, description="Installment rate tier 1-4")
    personal_status: str = Field("male single", description="personal status")
    other_parties: str = Field("none", description="none, guarantor, co applicant")
    residence_since: int = Field(3, ge=1, le=4, description="Years in residence tier")
    property_magnitude: str = Field("real estate", description="property magnitude")
    age: int = Field(31, ge=18, le=100, description="Borrower age in years")
    other_payment_plans: str = Field("none", description="none, bank, stores")
    housing: str = Field("own", description="own, for free, rent")
    existing_credits: int = Field(2, ge=1, le=4, description="Existing credits count")
    job: str = Field("high qualif/self emp/mgmt", description="job type")
    num_dependents: int = Field(1, ge=1, le=2, description="Dependents count")
    own_telephone: str = Field("yes", description="yes, none")
    foreign_worker: str = Field("no", description="yes, no")

class ModelInfoResponse(BaseModel):
    model_version: str
    model_name: str
    training_dataset: Dict[str, Any]
    baseline_metrics: Dict[str, Any]
    primary_xgb_metrics: Dict[str, Any]
    feature_count: int
    training_timestamp: Optional[str] = None
    status: str = "operational"
