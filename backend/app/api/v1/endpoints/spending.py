"""
CreditLens Spending Intelligence Endpoints
Provides cashflow analytics, category breakdowns, statistical anomalies, and recurring subscriptions
with persistent database queries and strict user scoping.
"""
from fastapi import APIRouter, Query, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.spending import (
    SpendingIntelligenceResponse,
    CategorySpend,
    SpendingAnomaly,
    RecurringPaymentItem
)
from app.schemas.common import ApiResponse
from app.services.spending_service import spending_service
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


def _spending_state(current_user: User, data) -> tuple[str, bool]:
    """
    Derives explicit (data_status, has_financial_data) from the authenticated identity
    and the user's real transaction count. `demo` is decided ONLY by the trusted
    is_demo flag on the account, never by a request parameter.
    """
    if current_user.is_demo:
        return "demo", True
    if (getattr(data, "total_transactions_count", 0) or 0) > 0:
        return "ok", True
    return "no_data", False


@router.get("/overview", response_model=ApiResponse[SpendingIntelligenceResponse], summary="Get Spending Intelligence")
async def get_spending_overview(
    demo: bool = Query(True, description="(Ignored for real users) Only the seeded demo account receives demo data"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves deterministic spending velocity, category allocations, anomaly flags, and recent transactions
    strictly from the authenticated user's own persisted transactions. A brand-new real user with zero
    transactions receives a zeroed payload with data_status="no_data" (never demo/Alex Mercer data).
    """
    try:
        data = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=current_user.id,
            demo=current_user.is_demo
        )
        data_status, has_data = _spending_state(current_user, data)
        return ApiResponse(
            success=True,
            message=(
                "Spending intelligence retrieved successfully" if has_data
                else "No transaction data yet. Upload a bank statement to see spending analytics."
            ),
            data=data,
            is_demo=data.is_demo,
            data_status=data_status,
            has_financial_data=has_data,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving spending overview: {str(e)}"
        )

@router.get("/categories", response_model=ApiResponse[List[CategorySpend]], summary="Get Category Breakdown")
async def get_category_breakdown(
    demo: bool = Query(True, description="Use demo fallback if demo user"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves category-level expenditure aggregations and percentages for the authenticated user.
    """
    try:
        overview = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=current_user.id,
            demo=current_user.is_demo
        )
        _status, _has_data = _spending_state(current_user, overview)
        return ApiResponse(
            success=True,
            message="Category spending breakdown retrieved",
            data=overview.categories,
            is_demo=overview.is_demo,
            data_status=_status,
            has_financial_data=_has_data,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving categories: {str(e)}"
        )

@router.get("/anomalies", response_model=ApiResponse[List[SpendingAnomaly]], summary="Get Spending Anomalies")
async def get_spending_anomalies(
    demo: bool = Query(True, description="Use demo fallback if demo user"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves statistically detected spending anomalies and category velocity spikes for the authenticated user.
    """
    try:
        overview = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=current_user.id,
            demo=current_user.is_demo
        )
        _status, _has_data = _spending_state(current_user, overview)
        return ApiResponse(
            success=True,
            message="Detected spending anomalies retrieved",
            data=overview.anomalies,
            is_demo=overview.is_demo,
            data_status=_status,
            has_financial_data=_has_data,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving anomalies: {str(e)}"
        )

@router.get("/recurring", response_model=ApiResponse[List[RecurringPaymentItem]], summary="Get Recurring Payments & Subscriptions")
async def get_recurring_payments(
    demo: bool = Query(True, description="Use demo fallback if demo user"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves detected recurring charges, streaming subscriptions, and regular loan EMIs for the authenticated user.
    """
    try:
        overview = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=current_user.id,
            demo=current_user.is_demo
        )
        _status, _has_data = _spending_state(current_user, overview)
        return ApiResponse(
            success=True,
            message="Recurring payments retrieved",
            data=overview.recurring_payments or [],
            is_demo=overview.is_demo,
            data_status=_status,
            has_financial_data=_has_data,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recurring payments: {str(e)}"
        )
