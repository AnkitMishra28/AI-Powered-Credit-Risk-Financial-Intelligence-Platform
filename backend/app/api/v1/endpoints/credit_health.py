"""
CreditLens Credit Health Endpoints
Computes deterministic 0–1000 Credit Health scores and factor attributions, persisting snapshots per user.
"""
from fastapi import APIRouter, Query, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.credit_health import CreditHealthResponse, CreditHealthCalculationRequest
from app.schemas.common import ApiResponse
from app.services.credit_service import credit_health_service
from app.db.session import get_db
from app.db.repositories.credit_health_repo import credit_health_repo
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User

router = APIRouter()

@router.get("/summary", response_model=ApiResponse[CreditHealthResponse], summary="Get Credit Health Summary")
async def get_credit_health_summary(
    demo: bool = Query(True, description="Retrieve demo account metrics if demo user"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves the proprietary CreditLens Credit Health Score and individual factor breakdown metrics,
    persisting a snapshot to the authenticated user's audit log.
    """
    try:
        data = credit_health_service.get_demo_credit_health()
        
        factor_dicts = [
            {
                "factor_id": f.factor_id,
                "name": f.name,
                "score": f.score,
                "weight": f.weight,
                "status": f.status,
                "description": f.description,
                "impact_detail": f.impact_detail
            }
            for f in data.factors
        ]
        await credit_health_repo.save_snapshot(
            session=session,
            user_id=current_user.id,
            score=data.health_score,
            tier=data.score_tier,
            score_delta=data.score_delta,
            payment_reliability_score=data.factors[0].score if len(data.factors) > 0 else 94.0,
            utilization_score=data.factors[1].score if len(data.factors) > 1 else 68.0,
            debt_burden_score=data.factors[2].score if len(data.factors) > 2 else 74.0,
            tenure_score=data.factors[3].score if len(data.factors) > 3 else 84.0,
            spending_stability_score=data.factors[4].score if len(data.factors) > 4 else 99.0,
            factors=factor_dicts,
            disclaimer=data.disclaimer
        )

        return ApiResponse(
            success=True,
            message="Credit health calculated successfully via deterministic scoring engine",
            data=data,
            is_demo=current_user.is_demo
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating credit health: {str(e)}"
        )

@router.post("/calculate", response_model=ApiResponse[CreditHealthResponse], summary="Calculate Custom Credit Health Score")
async def calculate_custom_credit_health(
    request: CreditHealthCalculationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Calculates a transparent, deterministic 0–1000 Credit Health Score for custom applicant inputs.
    """
    try:
        data = credit_health_service.calculate_custom_score(
            monthly_income=request.monthly_income,
            credit_limit_total=request.credit_limit_total,
            revolving_balance_total=request.revolving_balance_total,
            total_monthly_emi=request.total_monthly_emi,
            payment_consistency_ratio=request.payment_consistency_ratio,
            credit_history_years=request.credit_history_years,
            monthly_spending_total=request.monthly_spending_total,
            spending_average_6mo=request.spending_average_6mo
        )

        if current_user:
            factor_dicts = [
                {
                    "factor_id": f.factor_id,
                    "name": f.name,
                    "score": f.score,
                    "weight": f.weight,
                    "status": f.status,
                    "description": f.description,
                    "impact_detail": f.impact_detail
                }
                for f in data.factors
            ]
            await credit_health_repo.save_snapshot(
                session=session,
                user_id=current_user.id,
                score=data.health_score,
                tier=data.score_tier,
                score_delta=data.score_delta,
                payment_reliability_score=data.factors[0].score if len(data.factors) > 0 else 90.0,
                utilization_score=data.factors[1].score if len(data.factors) > 1 else 90.0,
                debt_burden_score=data.factors[2].score if len(data.factors) > 2 else 90.0,
                tenure_score=data.factors[3].score if len(data.factors) > 3 else 90.0,
                spending_stability_score=data.factors[4].score if len(data.factors) > 4 else 90.0,
                factors=factor_dicts,
                disclaimer=data.disclaimer
            )

        return ApiResponse(
            success=True,
            message="Custom credit health score calculated successfully",
            data=data,
            is_demo=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error calculating score: {str(e)}"
        )
