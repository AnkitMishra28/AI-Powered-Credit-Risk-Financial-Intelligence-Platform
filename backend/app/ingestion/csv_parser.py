"""
CreditLens CSV Statement Parser
Parses multi-format banking and credit card CSV statements into canonical transaction records.
"""
import io
import csv
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

from app.ingestion.models import CanonicalTransaction
from app.ingestion.normalizer import normalize_merchant
from app.ingestion.categorization import categorize_transaction
from app.ingestion.validators import IngestionValidationError

# Header alias mappings to canonical field names
HEADER_MAP = {
    "date": [
        "date", "transaction date", "txn date", "value date", "post date",
        "trans date", "booking date", "posting date", "transaction_date"
    ],
    "description": [
        "description", "narration", "particulars", "remarks", "merchant",
        "details", "transaction details", "payee", "memo", "name"
    ],
    "debit": [
        "debit", "withdrawal", "dr", "debit amount", "withdrawal amount", "withdrawals", "expense"
    ],
    "credit": [
        "credit", "deposit", "cr", "credit amount", "deposit amount", "deposits", "income"
    ],
    "amount": [
        "amount", "txn amount", "transaction amount", "trans amount", "net amount"
    ],
    "type": [
        "type", "transaction type", "txn type", "cr/dr", "dr/cr"
    ],
    "balance": [
        "balance", "closing balance", "available balance", "account balance", "running balance"
    ]
}

def parse_date_str(val: str) -> Optional[str]:
    """Parses various date format strings into ISO YYYY-MM-DD."""
    if not val or not val.strip():
        return None

    clean = val.strip().split(" ")[0].replace("/", "-").replace(".", "-")

    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d-%m-%y",
        "%m-%d-%Y",
        "%m-%d-%y",
        "%d-%b-%Y",
        "%d-%B-%Y",
        "%d-%b-%y",
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(clean, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None

def parse_amount_str(val: Any) -> Optional[float]:
    """Cleans currency strings, symbols, commas and returns float."""
    if val is None:
        return None
    s = str(val).strip().replace("₹", "").replace("$", "").replace("€", "").replace("INR", "").replace(",", "")
    if not s or s == "-" or s.lower() == "nan":
        return None
    # Handle parenthesized negative: (100.50) -> -100.50
    if s.startswith("(") and s.endswith(")"):
        s = "-" + s[1:-1]
    # Handle trailing CR/DR
    s = s.replace("CR", "").replace("cr", "").replace("DR", "").replace("dr", "").strip()
    try:
        return float(s)
    except ValueError:
        return None

def parse_csv_statement(
    file_bytes: bytes,
    statement_id: Optional[str] = None
) -> List[CanonicalTransaction]:
    """
    Parses raw CSV bytes into a list of CanonicalTransaction objects.
    """
    try:
        content = file_bytes.decode("utf-8-sig", errors="replace")
    except Exception as e:
        raise IngestionValidationError(f"Could not decode CSV text: {str(e)}")

    reader = csv.reader(io.StringIO(content))
    rows = [row for row in reader if any(cell.strip() for cell in row)]

    if len(rows) < 2:
        raise IngestionValidationError("CSV statement contains no transaction rows or only headers.")

    # Detect header row
    header_idx = -1
    col_mapping: Dict[str, int] = {}

    for idx, row in enumerate(rows[:10]):
        row_lower = [c.lower().strip() for c in row]
        matches: Dict[str, int] = {}
        used_cols = set()

        # Pass 1: Exact matches
        for canonical_field, aliases in HEADER_MAP.items():
            for col_i, col_name in enumerate(row_lower):
                if col_i in used_cols:
                    continue
                if any(alias == col_name for alias in aliases):
                    matches[canonical_field] = col_i
                    used_cols.add(col_i)
                    break

        # Pass 2: Substring matches for remaining unmapped fields (requiring alias length > 2)
        for canonical_field, aliases in HEADER_MAP.items():
            if canonical_field in matches:
                continue
            for col_i, col_name in enumerate(row_lower):
                if col_i in used_cols:
                    continue
                if any((len(alias) > 2 and alias in col_name) for alias in aliases):
                    matches[canonical_field] = col_i
                    used_cols.add(col_i)
                    break

        # A valid statement header needs at least Date and (Amount or Debit/Credit or Description)
        if "date" in matches and ("amount" in matches or "debit" in matches or "description" in matches):
            header_idx = idx
            col_mapping = matches
            break

    if header_idx == -1:
        raise IngestionValidationError(
            "Could not detect valid bank statement headers (e.g. Date, Description, Amount/Debit/Credit)."
        )

    parsed_txns: List[CanonicalTransaction] = []
    seen_fingerprints = set()

    for row_idx, row in enumerate(rows[header_idx + 1:], start=header_idx + 2):
        if not any(cell.strip() for cell in row):
            continue

        try:
            # Extract date
            date_col = col_mapping.get("date")
            raw_date = row[date_col] if date_col is not None and date_col < len(row) else ""
            iso_date = parse_date_str(raw_date)
            if not iso_date:
                continue # skip footer rows or non-transaction summary lines

            # Extract description / narration
            desc_col = col_mapping.get("description")
            raw_desc = row[desc_col].strip() if desc_col is not None and desc_col < len(row) else "Bank Transaction"

            # Extract amount and transaction type (Debit / Credit)
            amount: float = 0.0
            txn_type: str = "debit"

            debit_col = col_mapping.get("debit")
            credit_col = col_mapping.get("credit")
            amt_col = col_mapping.get("amount")
            type_col = col_mapping.get("type")

            debit_val = parse_amount_str(row[debit_col]) if debit_col is not None and debit_col < len(row) else None
            credit_val = parse_amount_str(row[credit_col]) if credit_col is not None and credit_col < len(row) else None
            amt_val = parse_amount_str(row[amt_col]) if amt_col is not None and amt_col < len(row) else None

            if debit_val is not None and debit_val > 0:
                amount = round(debit_val, 2)
                txn_type = "debit"
            elif credit_val is not None and credit_val > 0:
                amount = round(credit_val, 2)
                txn_type = "credit"
            elif amt_val is not None:
                if amt_val < 0:
                    amount = round(abs(amt_val), 2)
                    txn_type = "debit"
                else:
                    amount = round(amt_val, 2)
                    # Check type column if present
                    if type_col is not None and type_col < len(row):
                        type_str = row[type_col].lower().strip()
                        if "cr" in type_str or "credit" in type_str or "deposit" in type_str:
                            txn_type = "credit"
                        else:
                            txn_type = "debit"
                    else:
                        txn_type = "debit"
            else:
                continue

            if amount == 0.0:
                continue

            # Extract balance if present
            bal_col = col_mapping.get("balance")
            balance = parse_amount_str(row[bal_col]) if bal_col is not None and bal_col < len(row) else None

            # Normalization & Categorization
            norm_merchant = normalize_merchant(raw_desc)
            category, confidence, method = categorize_transaction(norm_merchant, raw_desc, txn_type)

            # Deduplication fingerprint
            fp = f"{iso_date}_{norm_merchant}_{amount}_{txn_type}"
            if fp in seen_fingerprints:
                continue
            seen_fingerprints.add(fp)

            txn = CanonicalTransaction(
                statement_id=statement_id,
                date=iso_date,
                original_description=raw_desc,
                normalized_merchant=norm_merchant,
                amount=amount,
                transaction_type=txn_type,
                category=category,
                category_confidence=confidence,
                classification_method=method,
                balance=balance,
                source="csv"
            )
            parsed_txns.append(txn)

        except Exception:
            # Skip corrupted individual row without crashing entire statement
            continue

    if len(parsed_txns) == 0:
        raise IngestionValidationError("No valid transactions could be parsed from the CSV file.")

    return parsed_txns
