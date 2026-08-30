"""
CreditLens RAG Configuration
Centralized configuration parameters for document chunking, retrieval thresholds, and models.
"""
import os
from pydantic import BaseModel

class RAGSettings(BaseModel):
    # Retrieval Configuration
    TOP_K: int = int(os.getenv("RAG_TOP_K", "4"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.40"))
    
    # Chunking Parameters
    CHUNK_SIZE_CHARS: int = int(os.getenv("RAG_CHUNK_SIZE_CHARS", "600"))
    CHUNK_OVERLAP_CHARS: int = int(os.getenv("RAG_CHUNK_OVERLAP_CHARS", "120"))
    
    # Embeddings & Dimensions
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    EMBEDDING_DIMENSION: int = int(os.getenv("VECTOR_DIMENSION", "384"))
    
    # LLM Parameters
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TEMPERATURE: float = 0.2
    MAX_OUTPUT_TOKENS: int = 1500

rag_settings = RAGSettings()
