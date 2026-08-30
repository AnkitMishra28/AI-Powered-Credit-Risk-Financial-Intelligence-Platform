"""
CreditLens Database Session Management
Configures asynchronous SQLAlchemy engine with PostgreSQL/pgvector support and
automatic SQLite fallback for robust local and test suite operation.
"""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from sqlalchemy import select
from typing import AsyncGenerator
import logging
from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger("creditlens.db")

# Determine active database URL
db_url = settings.async_database_url

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    poolclass=NullPool,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def init_db():
    """Initializes database schema and seeds initial demo analyst user if not present."""
    from app.models import User
    from app.core.security import get_password_hash
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "alex.mercer@fintech.demo"))
        demo_user = result.scalars().first()
        if not demo_user:
            demo_user = User(
                email="alex.mercer@fintech.demo",
                hashed_password=get_password_hash("password123"),
                full_name="Alex Mercer (Demo Analyst)",
                is_active=True,
                is_superuser=False,
                is_demo=True
            )
            session.add(demo_user)
            await session.commit()
            logger.info("Initialized demo analyst user: alex.mercer@fintech.demo")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency providing transactional async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
