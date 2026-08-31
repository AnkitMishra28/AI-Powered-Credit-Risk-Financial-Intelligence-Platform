"""
CreditLens RAG Data Models
Defines structured entities for documents, chunks, retrieval results, grounding contexts, and LLM schemas.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Document(BaseModel):
    document_id: str
    title: str
    source_name: str # e.g. "Reserve Bank of India (RBI)", "Consumer Credit Standards"
    source_url: Optional[str] = None
    publication_date: Optional[str] = None
    document_type: str # "Regulatory Guideline", "Consumer Advisory", "Financial Educational Standard"
    jurisdiction: str = "IN" # "IN" / "Global Financial Standard"
    category: str # "credit_cards", "repayment", "interest", "credit_utilization", "credit_history", "consumer_protection", "financial_literacy"
    content: str
    content_hash: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    ingested_at: datetime = Field(default_factory=datetime.utcnow)

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    title: str
    source_name: str
    source_url: Optional[str] = None
    doc_type: str
    category: str
    content: str
    content_hash: str
    chunk_index: int
    total_chunks: int
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RetrievalResult(BaseModel):
    chunk_id: str
    document_id: str
    title: str
    source_name: str
    source_url: Optional[str] = None
    doc_type: str
    category: str
    content: str
    score: float # Cosine similarity (0.0 to 1.0)
    relevance_grade: str = "high" # "high", "medium", "low"

class StructuredUserFinancialContext(BaseModel):
    """
    Grounding context for the Copilot. For the demo session every field is
    populated from the canonical demo profile. For a REAL user it is built
    strictly from that user's own persisted data, so any field CreditLens has
    not actually computed/persisted for them stays None and must not be invented
    downstream.
    """
    # Credit Health & Deterministic Metrics
    health_score: Optional[int] = None
    score_tier: Optional[str] = None
    payment_consistency_pct: Optional[float] = None
    credit_utilization_pct: Optional[float] = None
    revolving_balance: Optional[float] = None
    credit_limit_total: Optional[float] = None
    debt_to_income_pct: Optional[float] = None
    credit_history_years: Optional[float] = None
    spending_stability_pct: Optional[float] = None

    # ML Risk Assessment
    risk_category: Optional[str] = None
    risk_probability_pct: Optional[float] = None
    top_positive_factors: List[str] = Field(default_factory=list)
    risk_watch_factors: List[str] = Field(default_factory=list)

    # Cashflow & Spending
    monthly_income: Optional[float] = None
    monthly_spending: Optional[float] = None
    net_cashflow: Optional[float] = None
    discretionary_spending: Optional[float] = None
    essential_spending: Optional[float] = None
    top_spending_categories: List[str] = Field(default_factory=list)
    recent_anomalies: List[str] = Field(default_factory=list)
    active_subscriptions: List[str] = Field(default_factory=list)

    @property
    def has_credit_health(self) -> bool:
        return self.health_score is not None

    @property
    def has_utilization(self) -> bool:
        return (
            self.credit_utilization_pct is not None
            and self.revolving_balance is not None
            and self.credit_limit_total is not None
        )

    @property
    def has_risk(self) -> bool:
        return self.risk_category is not None

    @property
    def has_cashflow(self) -> bool:
        return self.monthly_spending is not None or self.monthly_income is not None

class GroundedContext(BaseModel):
    query: str
    retrieved_chunks: List[RetrievalResult]
    user_context: Optional[StructuredUserFinancialContext] = None
    retrieval_used: bool = True
    context_tokens_approx: int = 0

class SourceReferenceItem(BaseModel):
    document_id: str
    chunk_id: str
    title: str
    source_name: str
    source_url: Optional[str] = None
    doc_type: str
    excerpt: str
    relevance_score: float

class StructuredGeminiResponse(BaseModel):
    answer: str
    key_points: List[str] = Field(default_factory=list)
    personalized_insights: List[str] = Field(default_factory=list)
    sources: List[SourceReferenceItem] = Field(default_factory=list)
    grounding_facts: List[Dict[str, str]] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    disclaimer: str = (
        "Educational information only. CreditLens is not a credit bureau or financial advisor, "
        "and does not make credit decisions."
    )
    is_grounded: bool = True
    out_of_scope: bool = False

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    conversation_id: Optional[str] = None
    include_personal_context: bool = True
    include_sources: bool = True

class CopilotResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime
    sources: List[SourceReferenceItem]
    grounding_facts: List[Dict[str, str]]
    suggested_followups: List[str]
    key_points: List[str] = Field(default_factory=list)
    personalized_insights: List[str] = Field(default_factory=list)
    grounding_summary: Dict[str, Any] = Field(default_factory=dict)
    disclaimer: str
    is_demo: bool = True
