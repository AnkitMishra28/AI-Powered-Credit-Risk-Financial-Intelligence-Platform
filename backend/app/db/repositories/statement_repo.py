"""
CreditLens Statement Repository
Data access layer for bank & credit statement uploads with strict user scoping.
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.statement import Statement

class StatementRepository:
    @staticmethod
    async def create_statement(
        session: AsyncSession,
        statement_id: str,
        user_id: int,
        filename: str,
        file_type: str,
        file_size_bytes: int,
        file_hash: Optional[str] = None
    ) -> Statement:
        statement = Statement(
            id=statement_id,
            user_id=user_id,
            filename=filename,
            file_type=file_type,
            file_size_bytes=file_size_bytes,
            processing_status="processing",
            transaction_count=0,
            file_hash=file_hash,
            total_inflows=0.0,
            total_outflows=0.0,
            net_cashflow=0.0
        )
        session.add(statement)
        await session.commit()
        await session.refresh(statement)
        return statement

    @staticmethod
    async def get_by_id(session: AsyncSession, statement_id: str, user_id: int) -> Optional[Statement]:
        """Fetches statement ensuring it strictly belongs to the requested user."""
        result = await session.execute(
            select(Statement).where(Statement.id == statement_id, Statement.user_id == user_id)
        )
        return result.scalars().first()

    @staticmethod
    async def list_by_user(session: AsyncSession, user_id: int) -> List[Statement]:
        """Lists all statements for the authenticated user ordered by upload date descending."""
        result = await session.execute(
            select(Statement)
            .where(Statement.user_id == user_id)
            .order_by(desc(Statement.uploaded_at))
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_statement_metrics(
        session: AsyncSession,
        statement_id: str,
        user_id: int,
        transaction_count: int,
        total_inflows: float,
        total_outflows: float,
        net_cashflow: float,
        date_range_start: Optional[str],
        date_range_end: Optional[str],
        status: str = "completed",
        error_message: Optional[str] = None
    ) -> Optional[Statement]:
        statement = await StatementRepository.get_by_id(session, statement_id, user_id)
        if not statement:
            return None

        statement.transaction_count = transaction_count
        statement.total_inflows = total_inflows
        statement.total_outflows = total_outflows
        statement.net_cashflow = net_cashflow
        statement.date_range_start = date_range_start
        statement.date_range_end = date_range_end
        statement.processing_status = status
        statement.error_message = error_message

        await session.commit()
        await session.refresh(statement)
        return statement

statement_repo = StatementRepository()
