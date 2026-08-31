"""
CreditLens User Authentication Endpoints
Handles user registration, login with bcrypt verification, token issuance, rate limiting, and profile retrieval.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from typing import Optional

from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, UserProfileUpdate
from app.schemas.common import ApiResponse
from app.db.session import get_db
from app.db.repositories.user_repo import user_repo
from app.core.security import create_access_token
from app.core.rate_limiter import rate_limit_dependency
from app.core.config import settings
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        designation=user.designation,
        is_active=user.is_active,
        is_demo=user.is_demo,
        created_at=user.created_at,
    )

router = APIRouter()

@router.post(
    "/register",
    response_model=ApiResponse[TokenResponse],
    summary="Register New User",
    dependencies=[Depends(rate_limit_dependency(max_requests=settings.RATE_LIMIT_AUTH_PER_MIN, window_seconds=60))]
)
async def register_user(
    payload: UserCreate,
    session: AsyncSession = Depends(get_db)
):
    """
    Registers a new financial member with encrypted password and issues a signed JWT token.
    Rate limited to prevent automated registration spam.
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

    user_data = _user_response(user)

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

@router.post(
    "/login",
    response_model=ApiResponse[TokenResponse],
    summary="User Login",
    dependencies=[Depends(rate_limit_dependency(max_requests=settings.RATE_LIMIT_AUTH_PER_MIN, window_seconds=60))]
)
async def login_user(
    payload: UserLogin,
    session: AsyncSession = Depends(get_db)
):
    """
    Authenticates user credentials using bcrypt and returns a signed JWT access token.
    Rate limited against brute-force password guessing.
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

    user_data = _user_response(user)

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
        data=_user_response(current_user),
        is_demo=current_user.is_demo
    )

@router.patch("/me", response_model=ApiResponse[UserResponse], summary="Update Current User Profile")
async def update_current_user_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Persists mutable profile fields (full name, designation) for the authenticated
    member. The email address is the authentication identity and is immutable here,
    so it is not accepted in the request body. The demo analyst account is read-only.
    """
    if current_user.is_demo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The demo analyst profile is read-only.",
        )

    updated = await user_repo.update_profile(
        session=session,
        user=current_user,
        full_name=payload.full_name,
        designation=payload.designation,
    )
    return ApiResponse(
        success=True,
        message="Profile updated successfully",
        data=_user_response(updated),
        is_demo=updated.is_demo,
    )

@router.post("/logout", response_model=ApiResponse[dict], summary="User Logout")
async def logout_user(
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Ends the current session.

    JWTs are stateless, so there is no server-side session to revoke; logout is
    idempotent and always succeeds. It deliberately does NOT require a valid token
    so an already-expired/invalid session can still be cleared cleanly by the
    client without surfacing a 401 in the browser console. No user data is deleted.
    """
    return ApiResponse(
        success=True,
        message="Logged out successfully",
        data={
            "user_id": current_user.id if current_user else None,
            "status": "logged_out",
        },
        is_demo=bool(current_user.is_demo) if current_user else False,
    )
