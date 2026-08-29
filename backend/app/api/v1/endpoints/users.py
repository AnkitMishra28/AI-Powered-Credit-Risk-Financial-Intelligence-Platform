from fastapi import APIRouter, HTTPException, status
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.financial_profile import OnboardingStepSubmission, FinancialProfileResponse
from app.schemas.common import ApiResponse
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=ApiResponse[TokenResponse], summary="Register User")
async def register_user(payload: UserCreate):
    """
    User registration placeholder for Phase 1.
    """
    user_data = UserResponse(
        id=1,
        email=payload.email,
        full_name=payload.full_name,
        is_active=True,
        is_demo=False,
        created_at=datetime.utcnow()
    )
    return ApiResponse(
        success=True,
        message="Account created successfully",
        data=TokenResponse(
            access_token="creditlens_phase1_token_placeholder",
            token_type="bearer",
            user=user_data
        )
    )

@router.post("/login", response_model=ApiResponse[TokenResponse], summary="User Login")
async def login_user(payload: UserLogin):
    """
    User login placeholder for Phase 1.
    """
    is_demo = "demo" in payload.email.lower()
    user_data = UserResponse(
        id=1 if is_demo else 2,
        email=payload.email,
        full_name="Alex Mercer (Demo Analyst)" if is_demo else "CreditLens User",
        is_active=True,
        is_demo=is_demo,
        created_at=datetime.utcnow()
    )
    return ApiResponse(
        success=True,
        message="Authentication successful",
        data=TokenResponse(
            access_token="creditlens_phase1_token_placeholder",
            token_type="bearer",
            user=user_data
        ),
        is_demo=is_demo
    )

@router.post("/onboarding/step", response_model=ApiResponse[dict], summary="Submit Onboarding Step")
async def submit_onboarding_step(step_data: OnboardingStepSubmission):
    """
    Receives multi-step onboarding data.
    """
    return ApiResponse(
        success=True,
        message=f"Onboarding step {step_data.step} recorded successfully",
        data={"step": step_data.step, "status": "completed"}
    )
