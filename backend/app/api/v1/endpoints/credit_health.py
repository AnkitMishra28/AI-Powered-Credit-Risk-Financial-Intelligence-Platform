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
from app.db.repositories.transaction_repo import transaction_repo
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User

router = APIRouter()

@router.get("/summary", response_model=ApiResponse[CreditHealthResponse], summary="Get Credit Health Summary")
async def get_credit_health_summary(
    demo: bool = Query(True, description="(Ignored for real users) Only the seeded demo account receives demo data"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Returns the CreditLens Credit Health Score for the authenticated identity.

    Data ownership rules (enforced server-side from the trusted JWT identity, never
    from the `demo` query parameter):
      * Seeded demo account            -> intentional demo/canonical profile (data_status="demo")
      * Real user WITH a saved score   -> that user's own persisted snapshot   (data_status="ok")
      * Real user WITHOUT a saved score-> no score is returned                 (data_status="no_data"
                                          / "insufficient_data", data=None)

    The Credit Health Score requires structured credit-profile inputs (credit limits,
    revolving balances, EMIs, payment-consistency, history) submitted via
    POST /credit-health/calculate. A bank statement alone does not contain them, so a
    real user who has only uploaded statements is reported as "insufficient_data"
    rather than being shown a canonical score.
    """
    # 1. Seeded demo account -> intentional demo profile
    if current_user.is_demo:
        data = credit_health_service.get_demo_credit_health()
        return ApiResponse(
            success=True,
            message="Demo credit health profile (synthetic data).",
            data=data,
            is_demo=True,
            data_status="demo",
            has_financial_data=True,
        )

    # 2. Real user with a previously computed score -> their own snapshot
    latest = await credit_health_repo.get_latest_for_user(session, current_user.id)
    if latest is not None:
        history = await credit_health_repo.list_history_for_user(session, current_user.id, limit=6)
        data = credit_health_service.build_response_from_snapshot(latest, history)
        return ApiResponse(
            success=True,
            message="Credit health score retrieved from your latest calculation.",
            data=data,
            is_demo=False,
            data_status="ok",
            has_financial_data=True,
        )

    # 3. Real user with no computed score yet -> explicit no-data / insufficient-data
    txns = await transaction_repo.get_all_for_user(session, current_user.id)
    if txns:
        return ApiResponse(
            success=True,
            message=(
                "Your CreditLens Health Score has not been calculated yet. It needs your "
                "credit profile (aggregate credit limit, revolving balance, monthly EMIs, "
                "payment-consistency and credit-history length). Submit it via the credit "
                "health calculator to generate your personalized score."
            ),
            data=None,
            is_demo=False,
            data_status="insufficient_data",
            has_financial_data=False,
        )
    return ApiResponse(
        success=True,
        message=(
            "No financial data yet. Upload a bank statement and complete your credit "
            "profile to calculate your CreditLens Health Score."
        ),
        data=None,
        is_demo=False,
        data_status="no_data",
        has_financial_data=False,
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
            _limit = request.credit_limit_total or 0.0
            _balance = request.revolving_balance_total or 0.0
            _income = request.monthly_income or 0.0
            _emi = request.total_monthly_emi or 0.0
            # Track which fields the client actually supplied vs. which are pydantic
            # defaults, so the Copilot never presents a model default (e.g. the
            # 0.90 payment-consistency assumption) as if the user reported it.
            _provided = sorted(request.model_dump(exclude_unset=True).keys())
            profile_inputs = {
                "monthly_income": _income,
                "credit_limit_total": _limit,
                "revolving_balance_total": _balance,
                "total_monthly_emi": _emi,
                "payment_consistency_ratio": request.payment_consistency_ratio,
                "credit_history_years": request.credit_history_years,
                "monthly_spending_total": request.monthly_spending_total,
                "spending_average_6mo": request.spending_average_6mo,
                # Derived, stored for convenience (never a placeholder — computed from the inputs above)
                "credit_utilization_pct": round((_balance / _limit) * 100, 1) if _limit > 0 else None,
                "debt_to_income_pct": round((_emi / _income) * 100, 1) if _income > 0 else None,
                "_provided_fields": _provided,
            }
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
                disclaimer=data.disclaimer,
                profile_inputs=profile_inputs,
            )

        return ApiResponse(
            success=True,
            message="Custom credit health score calculated successfully",
            data=data,
            is_demo=False,
            data_status="ok",
            has_financial_data=True,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error calculating score: {str(e)}"
        )
