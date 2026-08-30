"""
CreditLens PDF Statement Parser
Deterministically extracts structured transaction ledgers from bank and credit card PDF statements.
"""
import io
import re
import hashlib
from typing import List, Optional
from pypdf import PdfReader

from app.ingestion.models import CanonicalTransaction
from app.ingestion.normalizer import normalize_merchant
from app.ingestion.categorization import categorize_transaction
from app.ingestion.validators import IngestionValidationError
from app.ingestion.csv_parser import parse_date_str, parse_amount_str

# Regex to match leading dates: e.g. "01/10/2025", "15-Nov-2025", "2025-11-20"
DATE_PATTERN = re.compile(
    r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{4}-\d{2}-\d{2})\b"
)

# Regex to match currency amounts: e.g. "1,250.00", "450.50", "12000"
AMOUNT_PATTERN = re.compile(r"(\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?\b)")

def parse_pdf_statement(
    file_bytes: bytes,
    statement_id: Optional[str] = None
) -> List[CanonicalTransaction]:
    """
    Extracts transaction tables from PDF bytes deterministically.
    """
    try:
        pdf_stream = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_stream)
        if reader.is_encrypted:
            raise IngestionValidationError("Uploaded PDF is password-protected. Please upload an unprotected PDF.")
        
        num_pages = len(reader.pages)
        if num_pages == 0:
            raise IngestionValidationError("Uploaded PDF contains no pages.")
    except IngestionValidationError:
        raise
    except Exception as e:
        raise IngestionValidationError(f"Could not open PDF file: {str(e)}")

    extracted_lines: List[str] = []
    for page_idx in range(num_pages):
        try:
            page = reader.pages[page_idx]
            text = page.extract_text()
            if text:
                extracted_lines.extend(text.splitlines())
        except Exception:
            continue

    if len(extracted_lines) == 0:
        raise IngestionValidationError("Could not extract readable text from PDF statement (scanned image or empty).")

    parsed_txns: List[CanonicalTransaction] = []
    seen_fingerprints = set()

    for line in extracted_lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        # Check if line begins with or contains a transaction date
        date_match = DATE_PATTERN.search(line_clean)
        if not date_match:
            continue

        raw_date = date_match.group(1)
        iso_date = parse_date_str(raw_date)
        if not iso_date:
            continue

        # Find all monetary amount tokens in line
        # Strip date portion from line before finding amounts
        after_date = line_clean[date_match.end():].strip()
        amt_matches = AMOUNT_PATTERN.findall(after_date)

        # A valid transaction line usually has at least 1 amount (or 2: amount + balance)
        if not amt_matches:
            continue

        # Filter numbers that might be phone numbers or dates
        valid_amounts = []
        for amt_str in amt_matches:
            val = parse_amount_str(amt_str)
            if val is not None and 0.0 < val < 100000000.0:
                valid_amounts.append(val)

        if len(valid_amounts) == 0:
            continue

        # Primary transaction amount is usually the first or second monetary match
        # Narration is the text preceding the amounts
        primary_amount = valid_amounts[0]
        balance: Optional[float] = valid_amounts[1] if len(valid_amounts) > 1 else None

        # Extract narration by removing amounts from string
        first_amt_pos = after_date.find(amt_matches[0])
        narration = after_date[:first_amt_pos].strip() if first_amt_pos > 0 else after_date

        if not narration or len(narration) < 2:
            narration = "Banking Transaction"

        # Determine if transaction is credit or debit
        line_upper = line_clean.upper()
        if " CR" in line_upper or "CREDIT" in line_upper or "DEPOSIT" in line_upper or "SALARY" in line_upper:
            txn_type = "credit"
        else:
            txn_type = "debit"

        norm_merchant = normalize_merchant(narration)
        category, confidence, method = categorize_transaction(norm_merchant, narration, txn_type)

        fp = f"{iso_date}_{norm_merchant}_{primary_amount}_{txn_type}"
        if fp in seen_fingerprints:
            continue
        seen_fingerprints.add(fp)
        t_hash = hashlib.sha256(fp.encode("utf-8")).hexdigest()

        txn = CanonicalTransaction(
            statement_id=statement_id,
            date=iso_date,
            original_description=narration,
            normalized_merchant=norm_merchant,
            amount=round(primary_amount, 2),
            transaction_type=txn_type,
            category=category,
            category_confidence=confidence,
            classification_method=method,
            balance=balance,
            transaction_hash=t_hash,
            source="pdf"
        )
        parsed_txns.append(txn)

    if len(parsed_txns) == 0:
        raise IngestionValidationError(
            "No structured transaction records could be parsed from the PDF statement. "
            "Please ensure the PDF is a text-based bank statement."
        )

    return parsed_txns
