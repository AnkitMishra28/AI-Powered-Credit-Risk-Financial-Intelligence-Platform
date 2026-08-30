"""
CreditLens Financial Ingestion & Statement Intelligence Service
Coordinates statement upload validation, CSV/PDF parsing, transaction normalization,
categorization, anomaly detection, recurring detection, and deterministic analytics.
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import uuid

from app.ingestion.models import (
    CanonicalTransaction,
    StatementSummary,
    SpendingIntelligenceResponse,
    CategorySpending,
    SpendingAnomaly,
    RecurringPayment
)
from app.ingestion.validators import validate_statement_upload, IngestionValidationError
from app.ingestion.csv_parser import parse_csv_statement
from app.ingestion.pdf_parser import parse_pdf_statement
from app.ingestion.normalizer import normalize_merchant
from app.ingestion.categorization import categorize_transaction
from app.ingestion.analytics import calculate_spending_analytics

class IngestionService:
    """
    Central statement ingestion, persistence, and spending intelligence service.
    """
    def __init__(self):
        self._statements: Dict[str, StatementSummary] = {}
        self._transactions: List[CanonicalTransaction] = []
        self._seed_demo_transactions()

    def _seed_demo_transactions(self):
        """Pre-populates the canonical demo profile transactions for Alex Mercer."""
        demo_raw = [
            ("2026-03-24", "SWIGGY*INSTAMART BLR", 1450.0, "debit"),
            ("2026-03-23", "AMZN MKTPLACE INDIA", 4200.0, "debit"),
            ("2026-03-22", "UBER TRIP BLR", 380.0, "debit"),
            ("2026-03-20", "ZOMATO RESTAURANT", 890.0, "debit"),
            ("2026-03-18", "NETFLIX.COM PAYMENT", 649.0, "debit"),
            ("2026-03-15", "AIRTEL BROADBAND BILL", 1199.0, "debit"),
            ("2026-03-14", "APOLLO PHARMACY", 1250.0, "debit"),
            ("2026-03-12", "CULT.FIT MEMBERSHIP", 1750.0, "debit"),
            ("2026-03-10", "FLIPKART INTERNET", 3100.0, "debit"),
            ("2026-03-08", "STARBUCKS COFFEE BLR", 450.0, "debit"),
            ("2026-03-05", "CRED CLUB CC PAYMENT", 8500.0, "debit"),
            ("2026-03-04", "TATA POWER UTILITY", 2800.0, "debit"),
            ("2026-03-02", "ZARA RETAIL BANGALORE", 7500.0, "debit"),
            ("2026-03-01", "ACH SALARY CREDIT - TECH CORP", 65000.0, "credit"),
            ("2026-02-28", "SWIGGY ONLINE", 1200.0, "debit"),
            ("2026-02-25", "AMAZON INDIA", 3500.0, "debit"),
            ("2026-02-20", "HPCL FUEL PETROL", 2200.0, "debit"),
            ("2026-02-18", "SPOTIFY INDIA", 119.0, "debit"),
            ("2026-02-15", "BIGBASKET SUPERMARKET", 4100.0, "debit"),
            ("2026-02-01", "ACH SALARY CREDIT - TECH CORP", 65000.0, "credit"),
        ]

        self._demo_transactions: List[CanonicalTransaction] = []
        for date_str, desc, amt, txn_type in demo_raw:
            merchant = normalize_merchant(desc)
            cat, conf, method = categorize_transaction(merchant, desc, txn_type)
            txn = CanonicalTransaction(
                id=f"demo_txn_{uuid.uuid4().hex[:8]}",
                statement_id="demo_statement_001",
                user_id=1,
                date=date_str,
                original_description=desc,
                normalized_merchant=merchant,
                amount=amt,
                transaction_type=txn_type, # type: ignore
                category=cat,
                category_confidence=conf,
                classification_method=method,
                balance=78500.0 if txn_type == "credit" else 74300.0,
                source="demo"
            )
            self._demo_transactions.append(txn)

    def process_statement(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str = "",
        user_id: int = 1
    ) -> Tuple[StatementSummary, List[CanonicalTransaction]]:
        """
        Executes end-to-end ingestion pipeline:
        Validation -> CSV/PDF Extraction -> Normalization -> Categorization -> Storage.
        """
        clean_filename, file_type = validate_statement_upload(filename, file_bytes, content_type)

        statement_id = str(uuid.uuid4())
        summary = StatementSummary(
            id=statement_id,
            user_id=user_id,
            filename=clean_filename,
            file_type=file_type, # type: ignore
            file_size_bytes=len(file_bytes),
            uploaded_at=datetime.utcnow(),
            status="processing"
        )

        try:
            if file_type == "csv":
                parsed = parse_csv_statement(file_bytes, statement_id=statement_id)
            else:
                parsed = parse_pdf_statement(file_bytes, statement_id=statement_id)

            total_debits = sum(t.amount for t in parsed if t.transaction_type == "debit")
            total_credits = sum(t.amount for t in parsed if t.transaction_type == "credit")

            summary.status = "completed"
            summary.transaction_count = len(parsed)
            summary.total_debits = round(total_debits, 2)
            summary.total_credits = round(total_credits, 2)

            # Store in registry
            self._statements[statement_id] = summary
            self._transactions.extend(parsed)

            return summary, parsed

        except Exception as e:
            summary.status = "failed"
            summary.error_message = str(e)
            self._statements[statement_id] = summary
            raise IngestionValidationError(f"Statement processing failed: {str(e)}")

    def get_statements(self, user_id: int = 1) -> List[StatementSummary]:
        """Returns all uploaded statements for the user."""
        return list(self._statements.values())

    def get_statement_by_id(self, statement_id: str) -> Optional[StatementSummary]:
        """Retrieves a specific statement summary."""
        return self._statements.get(statement_id)

    def get_transactions(
        self,
        user_id: int = 1,
        category: Optional[str] = None,
        txn_type: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        use_demo_if_empty: bool = True
    ) -> Tuple[List[CanonicalTransaction], int]:
        """
        Returns paginated, filterable canonical transactions.
        """
        source_txns = self._transactions if len(self._transactions) > 0 else (self._demo_transactions if use_demo_if_empty else [])

        filtered = source_txns

        if category and category.lower() != "all":
            filtered = [t for t in filtered if t.category.lower() == category.lower()]

        if txn_type and txn_type.lower() != "all":
            filtered = [t for t in filtered if t.transaction_type == txn_type.lower()]

        if search and search.strip():
            q = search.lower().strip()
            filtered = [
                t for t in filtered
                if q in t.normalized_merchant.lower()
                or q in t.original_description.lower()
                or q in t.category.lower()
            ]

        # Sort reverse chronological
        filtered_sorted = sorted(filtered, key=lambda x: x.date, reverse=True)
        total_count = len(filtered_sorted)
        paginated = filtered_sorted[offset: offset + limit]

        return paginated, total_count

    def get_spending_analytics(
        self,
        user_id: int = 1,
        demo: bool = False
    ) -> SpendingIntelligenceResponse:
        """
        Calculates spending intelligence from uploaded statements, or falls back cleanly to demo data.
        """
        if len(self._transactions) > 0 and not demo:
            return calculate_spending_analytics(self._transactions, is_demo=False)
        else:
            return calculate_spending_analytics(self._demo_transactions, is_demo=True)

    def get_category_breakdown(self, user_id: int = 1) -> List[CategorySpending]:
        analytics = self.get_spending_analytics(user_id=user_id)
        return analytics.categories

    def get_anomalies(self, user_id: int = 1) -> List[SpendingAnomaly]:
        analytics = self.get_spending_analytics(user_id=user_id)
        return analytics.anomalies

    def get_recurring_payments(self, user_id: int = 1) -> List[RecurringPayment]:
        analytics = self.get_spending_analytics(user_id=user_id)
        return analytics.recurring_payments

    def reprocess_transactions(self, user_id: int = 1) -> int:
        """
        Re-executes merchant normalization and categorization across all stored transactions.
        """
        count = 0
        for txn in self._transactions:
            txn.normalized_merchant = normalize_merchant(txn.original_description)
            cat, conf, method = categorize_transaction(
                txn.normalized_merchant,
                txn.original_description,
                txn.transaction_type
            )
            txn.category = cat
            txn.category_confidence = conf
            txn.classification_method = method
            count += 1
        return count

ingestion_service = IngestionService()
