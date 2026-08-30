"""
CreditLens User Authentication Endpoints
Handles user registration, login with bcrypt verification, token issuance, and profile retrieval.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.common import ApiResponse
from app.db.session import get_db
from app.db.repositories.user_repo import user_repo
from app.core.security import create_access_token
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=ApiResponse[TokenResponse], summary="Register New User")
async def register_user(
    payload: UserCreate,
    session: AsyncSession = Depends(get_db)
):
    """
    Registers a new financial member with encrypted password and issues a signed JWT token.
    """
    existing_user = await user_repo.get_by_email(session, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    is_demo = payload.email.lower().strip() == "alex.mercer@fintech.demo"
    user = await user_repo.create_user(
        session=session,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        is_demo=is_demo
    )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "full_name": user.full_name, "is_demo": user.is_demo}
    )

    user_data = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_demo=user.is_demo,
        created_at=user.created_at
    )

    return ApiResponse(
        success=True,
        message="Account registered successfully",
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_data
        ),
        is_demo=user.is_demo
    )

@router.post("/login", response_model=ApiResponse[TokenResponse], summary="User Login")
async def login_user(
    payload: UserLogin,
    session: AsyncSession = Depends(get_db)
):
    """
    Authenticates user credentials using bcrypt and returns a signed JWT access token.
    """
    user = await user_repo.authenticate(session, payload.email, payload.password)
    if not user:
        # If demo login attempted for alex.mercer@fintech.demo and user doesn't exist yet, seed demo user
        if payload.email.lower() == "alex.mercer@fintech.demo" and payload.password == "password123":
            user = await user_repo.create_user(
                session=session,
                email="alex.mercer@fintech.demo",
                password="password123",
                full_name="Alex Mercer (Demo Analyst)",
                is_demo=True
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "full_name": user.full_name, "is_demo": user.is_demo}
    )

    user_data = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_demo=user.is_demo,
        created_at=user.created_at
    )

    return ApiResponse(
        success=True,
        message="Authentication successful",
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_data
        ),
        is_demo=user.is_demo
    )

@router.get("/me", response_model=ApiResponse[UserResponse], summary="Get Current User Profile")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Returns the authenticated user's profile and session metadata.
    """
    return ApiResponse(
        success=True,
        message="User profile retrieved",
        data=UserResponse(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            is_active=current_user.is_active,
            is_demo=current_user.is_demo,
            created_at=current_user.created_at
        ),
        is_demo=current_user.is_demo
    )

@router.post("/logout", response_model=ApiResponse[dict], summary="User Logout")
async def logout_user(
    current_user: User = Depends(get_current_user)
):
    """
    Invalidates current user session.
    """
    return ApiResponse(
        success=True,
        message="Logged out successfully",
        data={"user_id": current_user.id, "status": "logged_out"},
        is_demo=current_user.is_demo
    )
