"""
CreditLens Ingestion & Transaction Intelligence Models
Defines canonical data structures for statements, transactions, analytics, and anomalies.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, date
from decimal import Decimal
import uuid

CategoryType = Literal[
    "Food & Dining",
    "Shopping",
    "Transport",
    "Entertainment",
    "Healthcare",
    "Utilities",
    "Rent & Housing",
    "Education",
    "Travel",
    "Insurance",
    "Groceries",
    "Salary / Income",
    "Transfer",
    "EMI / Loan",
    "Cash Withdrawal",
    "Other"
]

ClassificationMethod = Literal[
    "merchant_rule",
    "keyword_pattern",
    "merchant_dictionary",
    "embedding_similarity",
    "fallback_default"
]

TransactionType = Literal["debit", "credit"]

class CanonicalTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    statement_id: Optional[str] = None
    user_id: Optional[int] = 1
    date: str = Field(..., description="Transaction date in ISO format YYYY-MM-DD")
    original_description: str = Field(..., description="Raw bank transaction narration")
    normalized_merchant: str = Field(..., description="Cleaned canonical merchant identity")
    amount: float = Field(..., ge=0.0, description="Positive monetary transaction value")
    transaction_type: TransactionType = Field("debit", description="debit or credit")
    category: str = Field("Other", description="Financial category taxonomy")
    category_confidence: float = Field(0.90, ge=0.0, le=1.0, description="Classification confidence")
    classification_method: ClassificationMethod = Field("merchant_rule", description="Method used for classification")
    balance: Optional[float] = Field(None, description="Running ledger balance if present")
    source: str = Field("csv", description="csv, pdf, manual, or demo")
    is_anomaly: bool = Field(False, description="Flagged by statistical anomaly detector")
    anomaly_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StatementSummary(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: int = 1
    filename: str
    file_type: Literal["csv", "pdf"]
    file_size_bytes: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    status: Literal["pending", "processing", "completed", "failed"] = "completed"
    transaction_count: int = 0
    total_debits: float = 0.0
    total_credits: float = 0.0
    error_message: Optional[str] = None

class CategorySpending(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int
    budget_limit: Optional[float] = None
    status: str = "normal" # "normal", "elevated", "critical"

class MerchantSpending(BaseModel):
    merchant: str
    category: str
    amount: float
    percentage: float
    transaction_count: int

class MonthlySpendingTrend(BaseModel):
    month: str # e.g. "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
    spending: float
    income: float
    net_cashflow: float

class SpendingAnomaly(BaseModel):
    anomaly_id: str = Field(default_factory=lambda: f"anom_{uuid.uuid4().hex[:8]}")
    title: str
    description: str
    category: str
    amount: float
    baseline_amount: float
    deviation_percentage: float # e.g. +31.0
    severity: Literal["low", "medium", "high", "critical"] = "medium"
    detected_at: datetime = Field(default_factory=datetime.utcnow)

class RecurringPayment(BaseModel):
    id: str = Field(default_factory=lambda: f"rec_{uuid.uuid4().hex[:8]}")
    merchant: str
    category: str
    estimated_amount: float
    frequency: Literal["Weekly", "Monthly", "Quarterly", "Annual"] = "Monthly"
    last_payment_date: str
    next_expected_date: Optional[str] = None
    confidence: float = 0.95
    status: Literal["active", "paused", "cancelled"] = "active"

class SpendingIntelligenceResponse(BaseModel):
    total_spending_current_month: float
    total_income_current_month: float
    net_cashflow: float
    spending_average_6mo: float
    mom_change_percentage: float # e.g. +17.56
    average_transaction_amount: float
    largest_transaction: Optional[CanonicalTransaction] = None
    essential_spending: float
    discretionary_spending: float
    discretionary_ratio: float
    categories: List[CategorySpending]
    top_merchants: List[MerchantSpending]
    monthly_trend: List[MonthlySpendingTrend]
    anomalies: List[SpendingAnomaly]
    recurring_payments: List[RecurringPayment]
    recent_transactions: List[CanonicalTransaction]
    total_transactions_count: int
    is_demo: bool = False
    generated_at: datetime = Field(default_factory=datetime.utcnow)
