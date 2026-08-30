"""
CreditLens Ingestion Validators
Validates uploaded financial statements for size, format, extension, magic bytes, and integrity.
"""
import re
import os
from typing import Tuple
from app.core.config import settings

class IngestionValidationError(Exception):
    """Raised when an uploaded statement fails security or format validation."""
    pass

# Executable magic bytes signatures to strictly reject
EXECUTABLE_SIGNATURES = [
    b"MZ",           # Windows PE EXE / DLL
    b"\x7fELF",      # Linux ELF binary
    b"\xca\xfe\xba\xbe", # Mach-O binary
    b"\xfe\xed\xfa\xce", # Mach-O 32-bit
    b"\xfe\xed\xfa\xcf", # Mach-O 64-bit
]

def validate_statement_upload(
    filename: str,
    file_bytes: bytes,
    content_type: str = ""
) -> Tuple[str, str]:
    """
    Validates uploaded financial statement file.
    Returns:
        Tuple[str, str]: (sanitized_filename, validated_file_type: 'csv' | 'pdf')
    Raises:
        IngestionValidationError: If validation fails.
    """
    if not filename or len(filename.strip()) == 0:
        raise IngestionValidationError("Uploaded filename cannot be empty.")

    # 1. Reject null bytes and directory traversal attempts
    if "\x00" in filename or ".." in filename:
        raise IngestionValidationError("Invalid filename: Directory traversal or null byte detected.")

    # Extract base filename and sanitize characters
    base_name = os.path.basename(filename.replace("\\", "/")).strip()
    name_part, ext_part = os.path.splitext(base_name)
    sanitized_name_part = re.sub(r"[^a-zA-Z0-9_.-]", "_", name_part)
    clean_name = f"{sanitized_name_part}{ext_part.lower()}"

    if not clean_name or clean_name.startswith("."):
        raise IngestionValidationError("Invalid sanitized filename.")

    # 2. Check file size against configured limit
    max_size = getattr(settings, "MAX_UPLOAD_SIZE_BYTES", 10 * 1024 * 1024)
    if len(file_bytes) == 0:
        raise IngestionValidationError("Uploaded file is empty (0 bytes).")

    if len(file_bytes) > max_size:
        raise IngestionValidationError(
            f"File size ({len(file_bytes) / (1024 * 1024):.1f} MB) exceeds maximum allowed limit of {max_size / (1024 * 1024):.0f} MB."
        )

    # 3. Reject executable content masquerading as statements
    for sig in EXECUTABLE_SIGNATURES:
        if file_bytes.startswith(sig):
            raise IngestionValidationError("Executable binary content detected. Upload rejected.")

    # 4. Determine and validate extension
    lower_ext = ext_part.lower()
    if lower_ext == ".csv":
        file_type = "csv"
        # Validate CSV contains text characters and recognized delimiters
        try:
            sample = file_bytes[:1024].decode("utf-8", errors="strict")
            if not any(delimiter in sample for delimiter in [",", ";", "\t", "|"]):
                raise IngestionValidationError("CSV file does not contain recognized tabular column delimiters.")
        except UnicodeDecodeError:
            raise IngestionValidationError("CSV file contains invalid or binary text encoding.")
        except Exception as e:
            raise IngestionValidationError(f"Malformed CSV: {str(e)}")

    elif lower_ext == ".pdf":
        file_type = "pdf"
        # Validate PDF magic bytes header (%PDF-)
        if not file_bytes.startswith(b"%PDF-"):
            raise IngestionValidationError("File has .pdf extension but lacks valid PDF header signature (%PDF-).")

    else:
        raise IngestionValidationError(
            f"Unsupported file extension '{ext_part}'. Supported statement formats are .csv and .pdf."
        )

    return clean_name, file_type
