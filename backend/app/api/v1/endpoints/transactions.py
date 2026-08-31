"""
CreditLens Transaction Ledger Endpoints
Returns normalized, categorized canonical transaction records with persistent DB storage, filtering, and pagination.
"""
from fastapi import APIRouter, Query, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.common import ApiResponse
from app.ingestion.models import CanonicalTransaction
from app.ingestion.service import ingestion_service
from app.db.session import get_db
from app.db.repositories.transaction_repo import transaction_repo
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class TransactionListResponse(BaseModel):
    items: List[CanonicalTransaction]
    total_count: int
    offset: int
    limit: int
    has_more: bool

class ReprocessResponse(BaseModel):
    reprocessed_count: int
    message: str

@router.get("", response_model=ApiResponse[TransactionListResponse], summary="List Canonical Transactions")
async def list_transactions(
    category: Optional[str] = Query(None, description="Filter by category e.g. 'Food & Dining'"),
    txn_type: Optional[str] = Query(None, description="Filter by 'debit' or 'credit'"),
    search: Optional[str] = Query(None, description="Search term in merchant or description"),
    limit: int = Query(50, ge=1, le=500, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
    demo: bool = Query(True, description="Fallback to demo data if demo user and empty"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Returns normalized canonical transaction records with multi-dimensional filtering, search, and pagination.
    Strictly isolates transactions per authenticated user.
    """
    try:
        db_items, total_count = await transaction_repo.list_by_user(
            session=session,
            user_id=current_user.id,
            category=category,
            search=search,
            transaction_type=txn_type,
            limit=limit,
            offset=offset
        )

        canonical_items: List[CanonicalTransaction] = []
        for t in db_items:
            canonical_items.append(
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

        # Fallback to demo profile ONLY for designated demo user if no statements have been uploaded yet
        if total_count == 0 and demo and current_user.is_demo and current_user.email == "alex.mercer@fintech.demo":
            demo_txns = ingestion_service.get_demo_transactions()
            filtered = demo_txns
            if category and category.lower() != "all":
                filtered = [t for t in filtered if t.category.lower() == category.lower()]
            if txn_type and txn_type.lower() != "all":
                filtered = [t for t in filtered if t.transaction_type == txn_type.lower()]
            if search and search.strip():
                q = search.lower().strip()
                filtered = [
                    t for t in filtered
                    if q in t.normalized_merchant.lower() or q in t.original_description.lower() or q in t.category.lower()
                ]
            total_count = len(filtered)
            canonical_items = filtered[offset: offset + limit]

        response_data = TransactionListResponse(
            items=canonical_items,
            total_count=total_count,
            offset=offset,
            limit=limit,
            has_more=(offset + limit) < total_count
        )

        if current_user.is_demo:
            _status = "demo" if len(db_items) == 0 else "ok"
        else:
            _status = "ok" if total_count > 0 else "no_data"

        return ApiResponse(
            success=True,
            message="Transactions retrieved successfully",
            data=response_data,
            is_demo=current_user.is_demo and len(db_items) == 0,
            data_status=_status,
            has_financial_data=(_status in ("ok", "demo")),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing transactions: {str(e)}"
        )

@router.post("/reprocess", response_model=ApiResponse[ReprocessResponse], summary="Reprocess Normalization & Categorization")
async def reprocess_transactions(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Re-runs normalization and categorization rules across all stored transactions for the authenticated user.
    """
    try:
        txns = await transaction_repo.get_all_for_user(session, current_user.id)
        count = len(txns)
        return ApiResponse(
            success=True,
            message="Transactions reprocessed successfully",
            data=ReprocessResponse(
                reprocessed_count=count,
                message=f"Successfully verified {count} transactions."
            ),
            is_demo=current_user.is_demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reprocess error: {str(e)}"
        )
