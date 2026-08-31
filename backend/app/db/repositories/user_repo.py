"""
CreditLens User Repository
Data access layer for user accounts, credentials, and profile retrieval.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import get_password_hash, verify_password

class UserRepository:
    @staticmethod
    async def get_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
        result = await session.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    @staticmethod
    async def get_by_email(session: AsyncSession, email: str) -> Optional[User]:
        result = await session.execute(select(User).where(User.email == email.lower().strip()))
        return result.scalars().first()

    @staticmethod
    async def create_user(
        session: AsyncSession,
        email: str,
        password: str,
        full_name: str,
        is_demo: bool = False
    ) -> User:
        clean_email = email.lower().strip()
        hashed = get_password_hash(password)
        user = User(
            email=clean_email,
            hashed_password=hashed,
            full_name=full_name.strip(),
            is_active=True,
            is_superuser=False,
            is_demo=is_demo
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def update_profile(
        session: AsyncSession,
        user: User,
        full_name: Optional[str] = None,
        designation: Optional[str] = None,
    ) -> User:
        """
        Persists mutable profile fields for an already-authenticated user.
        Only non-None values are applied. Email is never changed here.
        """
        if full_name is not None:
            cleaned = full_name.strip()
            if cleaned:
                user.full_name = cleaned
        if designation is not None:
            # Empty string clears the designation; otherwise trim and store.
            user.designation = designation.strip() or None
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def authenticate(
        session: AsyncSession,
        email: str,
        password: str
    ) -> Optional[User]:
        user = await UserRepository.get_by_email(session, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

user_repo = UserRepository()
