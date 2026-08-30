"""
CreditLens Text Cleaner
Normalizes and sanitizes text for consistent embedding and chunking.
"""
import re

def clean_text(text: str) -> str:
    """Normalizes whitespace, unicode quotes, hyphens, and removes control characters."""
    if not text:
        return ""
    
    # Normalize unicode quotation marks & hyphens
    t = text.replace("“", "\"").replace("”", "\"").replace("‘", "'").replace("’", "'")
    t = t.replace("–", "-").replace("—", "-")
    
    # Remove control characters except newlines and tabs
    t = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", t)
    
    # Consolidate multiple spaces and carriage returns
    t = re.sub(r"\r\n|\r", "\n", t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n\s*\n\s*\n+", "\n\n", t)
    
    return t.strip()
