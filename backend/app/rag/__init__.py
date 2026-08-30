"""
CreditLens RAG (Retrieval-Augmented Generation) & Financial Intelligence Engine
Provides authoritative financial knowledge retrieval, structured user-metric grounding,
anti-hallucination guardrails, and Gemini natural language synthesis.
"""
from app.rag.models import (
    Document,
    DocumentChunk,
    RetrievalResult,
    GroundedContext,
    StructuredGeminiResponse,
    CopilotResponse
)
from app.rag.service import rag_copilot_service

__all__ = [
    "Document",
    "DocumentChunk",
    "RetrievalResult",
    "GroundedContext",
    "StructuredGeminiResponse",
    "CopilotResponse",
    "rag_copilot_service"
]
