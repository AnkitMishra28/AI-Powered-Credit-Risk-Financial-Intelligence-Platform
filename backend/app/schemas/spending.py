from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class CategorySpend(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str = "#10B981"
    month_over_month_change_pct: float = 0.0

class MonthlySpendTrend(BaseModel):
    month: str
    amount: float
    budget: float = 50000.0

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
    account_type: str = "Credit Card"
    is_anomaly: bool = False
    anomaly_reason: Optional[str] = None
    transaction_type: str = "debit"
    confidence: float = 0.95
    classification_method: str = "merchant_rule"

class RecurringPaymentItem(BaseModel):
    id: str
    merchant: str
    category: str
    estimated_amount: float
    frequency: str = "Monthly"
    last_payment_date: str
    next_expected_date: Optional[str] = None
    confidence: float = 0.95
    status: str = "active"

class SpendingIntelligenceResponse(BaseModel):
    total_spending_current_month: float
    spending_delta_pct: float # e.g. -4.2%
    average_monthly_spend: float
    total_income_current_month: Optional[float] = 65000.0
    net_cashflow: Optional[float] = 15770.0
    discretionary_spending: Optional[float] = 20230.0
    essential_spending: Optional[float] = 29000.0
    categories: List[CategorySpend]
    monthly_trend: List[MonthlySpendTrend]
    anomalies: List[SpendingAnomaly]
    recurring_payments: Optional[List[RecurringPaymentItem]] = None
    recent_transactions: List[TransactionItem]
    total_transactions_count: Optional[int] = 20
    is_demo: bool = True
