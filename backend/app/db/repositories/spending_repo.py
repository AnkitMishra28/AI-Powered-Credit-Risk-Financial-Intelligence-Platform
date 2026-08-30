"""
CreditLens Spending Intelligence Repository
Computes real deterministic cashflow, taxonomy breakdowns, and anomalies from persisted user transactions.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.transaction_repo import transaction_repo
from app.ingestion.models import (
    CanonicalTransaction,
    SpendingIntelligenceResponse,
    CategorySpending,
    MonthlySpendingTrend,
    SpendingAnomaly,
    RecurringPayment
)
from app.ingestion.analytics import calculate_spending_analytics

class SpendingRepository:
    @staticmethod
    async def get_user_spending_intelligence(
        session: AsyncSession,
        user_id: int
    ) -> SpendingIntelligenceResponse:
        """
        Retrieves all persisted transactions for user_id and executes deterministic analytics engine.
        """
        db_txns = await transaction_repo.get_all_for_user(session, user_id)
        
        # Convert ORM transactions to CanonicalTransaction DTOs
        canonical_list: List[CanonicalTransaction] = []
        for t in db_txns:
            canonical_list.append(
                CanonicalTransaction(
                    id=t.id,
                    statement_id=t.statement_id,
                    user_id=t.user_id,
                    date=t.transaction_date,
                    original_description=t.original_narration,
                    normalized_merchant=t.normalized_merchant,
                    amount=t.amount,
                    transaction_type=t.transaction_type, # type: ignore
                    category=t.category,
                    category_confidence=t.classification_confidence,
                    classification_method=t.classification_method,
                    debit=t.debit,
                    credit=t.credit,
                    balance=t.balance,
                    transaction_hash=t.transaction_hash,
                    is_anomaly=t.is_anomaly,
                    anomaly_score=t.anomaly_score,
                    anomaly_reason=t.anomaly_reason
                )
            )

        if not canonical_list:
            # Return clean empty intelligence object with all required fields initialized to zero
            return SpendingIntelligenceResponse(
                total_spending_current_month=0.0,
                total_income_current_month=0.0,
                net_cashflow=0.0,
                spending_average_6mo=0.0,
                mom_change_percentage=0.0,
                average_transaction_amount=0.0,
                essential_spending=0.0,
                discretionary_spending=0.0,
                discretionary_ratio=0.0,
                categories=[],
                top_merchants=[],
                monthly_trend=[],
                anomalies=[],
                recurring_payments=[],
                recent_transactions=[],
                total_transactions_count=0,
                is_demo=False
            )

        analytics = calculate_spending_analytics(canonical_list)
        return analytics

spending_repo = SpendingRepository()
