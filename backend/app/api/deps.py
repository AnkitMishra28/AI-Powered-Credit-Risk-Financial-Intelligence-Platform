"""
CreditLens FastAPI Dependencies
Provides authentication, token validation, user context, and database session injection.
"""
from typing import Optional, AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.repositories.user_repo import user_repo
from app.core.security import decode_access_token
from app.models.user import User

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    session: AsyncSession = Depends(get_db)
) -> User:
    """
    Authenticates the incoming request via JWT Bearer token.
    Enforces strict user verification and rejects unauthorized calls.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please authenticate.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials:
        raise credentials_exception

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    sub = payload.get("sub")
    if not sub:
        raise credentials_exception

    # Try numeric user ID first, then email
    user = None
    if sub.isdigit():
        user = await user_repo.get_by_id(session, int(sub))
    if not user:
        user = await user_repo.get_by_email(session, str(sub))

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    return user

async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    session: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Optional authentication dependency for endpoints that support both authenticated users and public demo view.
    """
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, session)
    except HTTPException:
        return None
