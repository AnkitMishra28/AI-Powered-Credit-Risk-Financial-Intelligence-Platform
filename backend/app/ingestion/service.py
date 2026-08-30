"""
CreditLens Financial Ingestion & Statement Intelligence Service
Coordinates statement upload validation, CSV/PDF parsing, transaction normalization,
categorization, anomaly detection, recurring detection, and persistent database storage.
"""
from typing import List, Dict, Any, Optional, Tuple, Set
from datetime import datetime
import uuid
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession

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
from app.db.repositories.statement_repo import statement_repo
from app.db.repositories.transaction_repo import transaction_repo
from app.db.repositories.spending_repo import spending_repo
from app.models.transaction import Transaction as TransactionORM

class IngestionService:
    """
    Central statement ingestion, persistence, and spending intelligence service.
    """
    def __init__(self):
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
            h = hashlib.sha256(f"{date_str}:{amt}:{desc}".encode("utf-8")).hexdigest()
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
                transaction_hash=h,
                source="demo"
            )
            self._demo_transactions.append(txn)

    async def process_statement_async(
        self,
        session: AsyncSession,
        file_bytes: bytes,
        filename: str,
        content_type: str = "",
        user_id: int = 1
    ) -> Tuple[StatementSummary, List[CanonicalTransaction]]:
        """
        Executes end-to-end ingestion pipeline with persistent database storage:
        Validation -> CSV/PDF Extraction -> Normalization -> Categorization -> Deduplication -> DB Storage.
        """
        clean_filename, file_type = validate_statement_upload(filename, file_bytes, content_type)
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        statement_id = str(uuid.uuid4())

        # 1. Create DB statement record
        db_statement = await statement_repo.create_statement(
            session=session,
            statement_id=statement_id,
            user_id=user_id,
            filename=clean_filename,
            file_type=file_type,
            file_size_bytes=len(file_bytes),
            file_hash=file_hash
        )

        try:
            # 2. Parse file deterministically
            if file_type == "csv":
                parsed = parse_csv_statement(file_bytes, statement_id=statement_id)
            else:
                parsed = parse_pdf_statement(file_bytes, statement_id=statement_id)

            # Assign user_id
            for p in parsed:
                p.user_id = user_id

            # 3. Deduplicate transactions for this user
            all_hashes = [t.transaction_hash for t in parsed if t.transaction_hash]
            existing_hashes = await transaction_repo.get_existing_hashes(session, user_id, all_hashes)

            unique_parsed = [t for t in parsed if t.transaction_hash not in existing_hashes]

            # 4. Persist new transactions into DB
            orm_txns: List[TransactionORM] = []
            for t in unique_parsed:
                orm_txns.append(
                    TransactionORM(
                        id=t.id,
                        user_id=user_id,
                        statement_id=statement_id,
                        transaction_date=t.date,
                        original_narration=t.original_description,
                        normalized_merchant=t.normalized_merchant,
                        category=t.category,
                        classification_method=t.classification_method,
                        classification_confidence=t.category_confidence,
                        debit=t.amount if t.transaction_type == "debit" else 0.0,
                        credit=t.amount if t.transaction_type == "credit" else 0.0,
                        amount=t.amount,
                        transaction_type=t.transaction_type,
                        balance=t.balance,
                        transaction_hash=t.transaction_hash or t.id,
                        is_anomaly=t.is_anomaly,
                        anomaly_score=t.anomaly_score,
                        anomaly_reason=t.anomaly_reason
                    )
                )

            if orm_txns:
                await transaction_repo.add_transactions(session, orm_txns)

            # 5. Compute statement totals
            total_debits = sum(t.amount for t in parsed if t.transaction_type == "debit")
            total_credits = sum(t.amount for t in parsed if t.transaction_type == "credit")
            net_cf = total_credits - total_debits

            dates = [t.date for t in parsed if t.date]
            d_start = min(dates) if dates else None
            d_end = max(dates) if dates else None

            # 6. Update statement record in DB
            await statement_repo.update_statement_metrics(
                session=session,
                statement_id=statement_id,
                user_id=user_id,
                transaction_count=len(unique_parsed),
                total_inflows=total_credits,
                total_outflows=total_debits,
                net_cashflow=net_cf,
                date_range_start=d_start,
                date_range_end=d_end,
                status="completed"
            )

            summary = StatementSummary(
                id=statement_id,
                user_id=user_id,
                filename=clean_filename,
                file_type=file_type, # type: ignore
                file_size_bytes=len(file_bytes),
                uploaded_at=db_statement.uploaded_at,
                status="completed",
                transaction_count=len(unique_parsed),
                total_debits=round(total_debits, 2),
                total_credits=round(total_credits, 2)
            )

            return summary, unique_parsed

        except Exception as e:
            await statement_repo.update_statement_metrics(
                session=session,
                statement_id=statement_id,
                user_id=user_id,
                transaction_count=0,
                total_inflows=0.0,
                total_outflows=0.0,
                net_cashflow=0.0,
                date_range_start=None,
                date_range_end=None,
                status="failed",
                error_message=str(e)
            )
            raise IngestionValidationError(f"Statement processing failed: {str(e)}")

    def get_demo_transactions(self) -> List[CanonicalTransaction]:
        return self._demo_transactions

ingestion_service = IngestionService()
