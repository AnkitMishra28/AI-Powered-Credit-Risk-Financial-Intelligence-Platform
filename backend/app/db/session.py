from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from app.core.config import settings
from app.core.logging import logger

# Conditional engine creation based on whether DATABASE_URL is configured
engine = None
AsyncSessionLocal = None

try:
    if settings.DATABASE_URL or settings.POSTGRES_SERVER:
        engine = create_async_engine(
            settings.async_database_url,
            echo=(settings.ENVIRONMENT == "development"),
            future=True,
            pool_pre_ping=True
        )
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )
except Exception as e:
    logger.warning(f"Database engine initialization deferred or offline: {e}")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if AsyncSessionLocal is None:
        logger.warning("Database session requested but AsyncSessionLocal is not initialized. Using mockup/stateless mode.")
        yield None
        return
        
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
