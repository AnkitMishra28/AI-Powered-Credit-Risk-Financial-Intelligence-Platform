"""
CreditLens Transaction Ledger Endpoints
Returns normalized, categorized canonical transaction records with filtering and pagination.
"""
from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

from app.schemas.common import ApiResponse
from app.ingestion.models import CanonicalTransaction
from app.ingestion.service import ingestion_service

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
    user_id: int = Query(1, description="User identifier")
):
    """
    Returns normalized canonical transaction records with multi-dimensional filtering, search, and pagination.
    """
    try:
        items, total_count = ingestion_service.get_transactions(
            user_id=user_id,
            category=category,
            txn_type=txn_type,
            search=search,
            limit=limit,
            offset=offset
        )

        response_data = TransactionListResponse(
            items=items,
            total_count=total_count,
            offset=offset,
            limit=limit,
            has_more=(offset + limit) < total_count
        )

        return ApiResponse(
            success=True,
            message="Transactions retrieved successfully",
            data=response_data,
            is_demo=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing transactions: {str(e)}"
        )

@router.post("/reprocess", response_model=ApiResponse[ReprocessResponse], summary="Reprocess Normalization & Categorization")
async def reprocess_transactions(user_id: int = Query(1, description="User identifier")):
    """
    Re-runs normalization and categorization rules across all stored transactions.
    """
    try:
        count = ingestion_service.reprocess_transactions(user_id=user_id)
        return ApiResponse(
            success=True,
            message="Transactions reprocessed successfully",
            data=ReprocessResponse(
                reprocessed_count=count,
                message=f"Successfully re-categorized {count} transactions."
            ),
            is_demo=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reprocess error: {str(e)}"
        )
