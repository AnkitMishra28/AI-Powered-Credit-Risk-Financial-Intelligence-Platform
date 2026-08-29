from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CitationSource(BaseModel):
    id: str
    title: str
    publisher: str # e.g. "Reserve Bank of India (RBI)", "Consumer Credit Standards"
    doc_type: str # "Regulatory Guideline", "Credit Terms", "Financial Literacy Guide"
    excerpt: str
    url: Optional[str] = None
    relevance_score: float = 0.95

class GroundingFact(BaseModel):
    label: str
    value: str

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    conversation_id: Optional[str] = None
    include_sources: bool = True

class CopilotQueryResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime
    sources: List[CitationSource]
    grounding_facts: List[GroundingFact]
    suggested_followups: List[str]
    disclaimer: str = "CreditLens Copilot provides educational information grounded in your metrics and citations. It is not financial advice."
    is_demo: bool = True
