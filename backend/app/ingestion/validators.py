"""
CreditLens Ingestion Validators
Validates uploaded financial statements for size, format, extension, and integrity.
"""
from typing import Tuple

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class IngestionValidationError(Exception):
    """Raised when an uploaded statement fails security or format validation."""
    pass

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

    # Sanitize filename (strip directory traversal patterns)
    clean_name = filename.replace("\\", "/").split("/")[-1].strip()
    if not clean_name:
        raise IngestionValidationError("Invalid filename.")

    # Check file size
    if len(file_bytes) == 0:
        raise IngestionValidationError("Uploaded file is empty (0 bytes).")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise IngestionValidationError(
            f"File size ({len(file_bytes) / (1024 * 1024):.1f} MB) exceeds maximum allowed limit of 10 MB."
        )

    # Determine extension
    lower_name = clean_name.lower()
    if lower_name.endswith(".csv"):
        file_type = "csv"
        # Validate CSV contains text characters
        try:
            sample = file_bytes[:1024].decode("utf-8", errors="replace")
            if not any(delimiter in sample for delimiter in [",", ";", "\t", "|"]):
                raise IngestionValidationError("CSV file does not contain recognized tabular column delimiters.")
        except Exception as e:
            raise IngestionValidationError(f"Malformed CSV text encoding: {str(e)}")

    elif lower_name.endswith(".pdf"):
        file_type = "pdf"
        # Validate PDF magic bytes header (%PDF-)
        if not file_bytes.startswith(b"%PDF-"):
            raise IngestionValidationError("File has .pdf extension but lacks valid PDF header signature.")

    else:
        raise IngestionValidationError(
            f"Unsupported file format '{clean_name.split('.')[-1]}'. Supported statement formats are CSV and PDF."
        )

    return clean_name, file_type
