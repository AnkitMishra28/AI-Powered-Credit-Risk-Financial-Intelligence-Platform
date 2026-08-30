"""
CreditLens Copilot Schemas
Pydantic contracts for RAG inquiry requests and grounded responses.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CitationSource(BaseModel):
    id: str = Field(..., alias="document_id")
    document_id: Optional[str] = None
    chunk_id: Optional[str] = None
    title: str
    publisher: str = Field(..., alias="source_name") # e.g. "Reserve Bank of India (RBI)"
    source_name: Optional[str] = None
    doc_type: str = "Regulatory Guideline"
    excerpt: str
    url: Optional[str] = Field(None, alias="source_url")
    source_url: Optional[str] = None
    relevance_score: float = 0.95

    class Config:
        populate_by_name = True

class GroundingFact(BaseModel):
    label: str
    value: str

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    conversation_id: Optional[str] = None
    include_personal_context: bool = True
    include_sources: bool = True

class CopilotQueryResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime
    sources: List[Dict[str, Any]]
    grounding_facts: List[Dict[str, str]]
    suggested_followups: List[str]
    key_points: List[str] = Field(default_factory=list)
    personalized_insights: List[str] = Field(default_factory=list)
    grounding_summary: Dict[str, Any] = Field(default_factory=dict)
    disclaimer: str = (
        "Educational information only. CreditLens is not a credit bureau or financial advisor, "
        "and does not make credit decisions."
    )
    is_demo: bool = True
