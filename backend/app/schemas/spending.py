from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CategorySpend(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str
    month_over_month_change_pct: float

class MonthlySpendTrend(BaseModel):
    month: str
    amount: float
    budget: float

class SpendingAnomaly(BaseModel):
    id: str
    category: str
    title: str
    description: str
    percentage_above_average: float
    historical_average: float
    current_amount: float
    severity: str # "info", "warning", "critical"

class TransactionItem(BaseModel):
    id: str
    date: str
    merchant: str
    category: str
    amount: float
    account_type: str
    is_anomaly: bool = False
    anomaly_reason: Optional[str] = None

class SpendingIntelligenceResponse(BaseModel):
    total_spending_current_month: float
    spending_delta_pct: float # e.g. -4.2%
    average_monthly_spend: float
    categories: List[CategorySpend]
    monthly_trend: List[MonthlySpendTrend]
    anomalies: List[SpendingAnomaly]
    recent_transactions: List[TransactionItem]
    is_demo: bool = True
