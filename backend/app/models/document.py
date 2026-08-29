from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, ForeignKey, JSON
from app.db.base import Base
from typing import List, Optional, Dict, Any

class Document(Base):
    """
    Knowledge base documents (e.g., RBI guidelines, Credit Bureau methodologies, Terms).
    """
    __tablename__ = "documents"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(100), nullable=False) # Regulatory, Education, Policy, Product
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    publisher: Mapped[str] = mapped_column(String(255), default="CreditLens Research")
    version: Mapped[str] = mapped_column(String(50), default="1.0")

    chunks: Mapped[List["DocumentChunk"]] = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    """
    Vector-indexed chunks for RAG retrieval with pgvector.
    """
    __tablename__ = "document_chunks"

    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Metadata for filtering citations
    meta_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    
    # Note: In PostgreSQL + pgvector, this will map to: Vector(384)
    # Stored as JSON/Array stub until pgvector extension migration is applied
    embedding_placeholder: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
