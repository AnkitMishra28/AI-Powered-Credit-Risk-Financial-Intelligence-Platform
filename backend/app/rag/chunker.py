"""
CreditLens Document Chunker
Splits documents into semantically coherent, bounded text chunks (300-600 chars)
while preserving document metadata and preventing duplicates.
"""
import hashlib
import re
from typing import List
from app.rag.models import Document, DocumentChunk
from app.rag.config import rag_settings

def chunk_document(
    doc: Document,
    chunk_size: int = rag_settings.CHUNK_SIZE_CHARS,
    overlap: int = rag_settings.CHUNK_OVERLAP_CHARS
) -> List[DocumentChunk]:
    """
    Chunks a document by semantic clauses, paragraphs, or sentence boundaries.
    """
    # Split on double newlines, numbered lists (1. 2.), or lettered clauses ((a), (b))
    raw_sections = re.split(r"(?:\n\n+|\n(?=[0-9]+\.\s|\([a-z]\)\s))", doc.content)
    sections = [s.strip() for s in raw_sections if s.strip()]
    
    raw_chunks: List[str] = []
    current_buf = ""

    for sec in sections:
        if not current_buf:
            current_buf = sec
        elif len(current_buf) + len(sec) + 1 <= chunk_size:
            current_buf += "\n" + sec
        else:
            raw_chunks.append(current_buf)
            # If section itself is longer than chunk_size, split by sentences
            if len(sec) > chunk_size:
                sentences = re.split(r"(?<=[.!?])\s+", sec)
                sent_buf = ""
                for sent in sentences:
                    if len(sent_buf) + len(sent) + 1 <= chunk_size:
                        sent_buf += (" " if sent_buf else "") + sent
                    else:
                        if sent_buf:
                            raw_chunks.append(sent_buf)
                        sent_buf = sent
                if sent_buf:
                    current_buf = sent_buf
                else:
                    current_buf = ""
            else:
                current_buf = sec

    if current_buf:
        raw_chunks.append(current_buf)

    total_chunks = len(raw_chunks)
    chunks: List[DocumentChunk] = []
    seen_hashes = set()

    for idx, text in enumerate(raw_chunks, start=1):
        clean_chunk = text.strip()
        if len(clean_chunk) < 30: # Skip noise chunks
            continue
        c_hash = hashlib.sha256(clean_chunk.encode("utf-8")).hexdigest()
        if c_hash in seen_hashes:
            continue
        seen_hashes.add(c_hash)

        chunk_id = f"{doc.document_id}-chk-{idx:02d}"
        chunk = DocumentChunk(
            chunk_id=chunk_id,
            document_id=doc.document_id,
            title=doc.title,
            source_name=doc.source_name,
            source_url=doc.source_url,
            doc_type=doc.document_type,
            category=doc.category,
            content=clean_chunk,
            content_hash=c_hash,
            chunk_index=idx,
            total_chunks=total_chunks,
            metadata=doc.metadata
        )
        chunks.append(chunk)

    return chunks

def chunk_all_documents(documents: List[Document]) -> List[DocumentChunk]:
    """Chunks all documents in the knowledge base."""
    all_chunks = []
    for d in documents:
        all_chunks.extend(chunk_document(d))
    return all_chunks
