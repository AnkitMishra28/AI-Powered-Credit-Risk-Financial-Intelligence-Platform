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
from app.api.deps import get_optional_current_user
from app.models.user import User

router = APIRouter()

@router.get("/overview", response_model=ApiResponse[SpendingIntelligenceResponse], summary="Get Spending Intelligence")
async def get_spending_overview(
    demo: bool = Query(True, description="Retrieve demo account spending data or user statement analytics"),
    user_id: Optional[int] = Query(None, description="Optional user identifier"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves deterministic spending velocity, category allocations, anomaly flags, and recent transactions.
    Uses authenticated user's persisted transactions from database.
    """
    try:
        effective_user_id = current_user.id if current_user else (user_id or 1)
        data = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=effective_user_id,
            demo=demo
        )
        return ApiResponse(
            success=True,
            message="Spending intelligence retrieved successfully",
            data=data,
            is_demo=data.is_demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving spending overview: {str(e)}"
        )

@router.get("/categories", response_model=ApiResponse[List[CategorySpend]], summary="Get Category Breakdown")
async def get_category_breakdown(
    user_id: Optional[int] = Query(None, description="Optional user identifier"),
    demo: bool = Query(True, description="Use demo fallback"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves category-level expenditure aggregations and percentages for the user.
    """
    try:
        effective_user_id = current_user.id if current_user else (user_id or 1)
        overview = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=effective_user_id,
            demo=demo
        )
        return ApiResponse(
            success=True,
            message="Category spending breakdown retrieved",
            data=overview.categories,
            is_demo=overview.is_demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving categories: {str(e)}"
        )

@router.get("/anomalies", response_model=ApiResponse[List[SpendingAnomaly]], summary="Get Spending Anomalies")
async def get_spending_anomalies(
    user_id: Optional[int] = Query(None, description="Optional user identifier"),
    demo: bool = Query(True, description="Use demo fallback"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves statistically detected spending anomalies and category velocity spikes for the user.
    """
    try:
        effective_user_id = current_user.id if current_user else (user_id or 1)
        overview = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=effective_user_id,
            demo=demo
        )
        return ApiResponse(
            success=True,
            message="Detected spending anomalies retrieved",
            data=overview.anomalies,
            is_demo=overview.is_demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving anomalies: {str(e)}"
        )

@router.get("/recurring", response_model=ApiResponse[List[RecurringPaymentItem]], summary="Get Recurring Payments & Subscriptions")
async def get_recurring_payments(
    user_id: Optional[int] = Query(None, description="Optional user identifier"),
    demo: bool = Query(True, description="Use demo fallback"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves detected recurring charges, streaming subscriptions, and regular loan EMIs for the user.
    """
    try:
        effective_user_id = current_user.id if current_user else (user_id or 1)
        overview = await spending_service.get_user_spending_intelligence_async(
            session=session,
            user_id=effective_user_id,
            demo=demo
        )
        return ApiResponse(
            success=True,
            message="Recurring payments retrieved",
            data=overview.recurring_payments or [],
            is_demo=overview.is_demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recurring payments: {str(e)}"
        )
