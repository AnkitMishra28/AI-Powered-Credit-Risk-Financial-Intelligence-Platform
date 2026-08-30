from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class FinancialProfileBase(BaseModel):
    monthly_income: float = Field(..., ge=0, description="Monthly net take-home income in INR")
    employment_type: str = Field(default="Salaried", description="Employment category")
    credit_limit_total: float = Field(..., ge=0, description="Total credit limit across all credit cards")
    revolving_balance_total: float = Field(..., ge=0, description="Current total outstanding balance on credit cards")
    credit_score_cibil_reference: Optional[int] = Field(None, ge=300, le=900, description="Optional external bureau score reference")
    onboarding_completed: bool = False

class FinancialProfileCreate(FinancialProfileBase):
    pass

class FinancialProfileResponse(FinancialProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OnboardingStepSubmission(BaseModel):
    step: int
    monthly_income: Optional[float] = None
    employment_type: Optional[str] = None
    credit_limit_total: Optional[float] = None
    revolving_balance_total: Optional[float] = None
    has_existing_loans: Optional[bool] = False
    is_demo: bool = False
