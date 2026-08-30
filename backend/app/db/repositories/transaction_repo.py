"""
CreditLens Transaction Repository
Data access layer for normalized transactions with user-scoped isolation, search, and deduplication.
"""
from typing import List, Optional, Set, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from app.models.transaction import Transaction

class TransactionRepository:
    @staticmethod
    async def add_transactions(session: AsyncSession, transactions: List[Transaction]) -> List[Transaction]:
        if not transactions:
            return []
        session.add_all(transactions)
        await session.commit()
        return transactions

    @staticmethod
    async def get_existing_hashes(session: AsyncSession, user_id: int, hashes: List[str]) -> Set[str]:
        """Returns set of hashes that already exist in the user's ledger to prevent duplicates."""
        if not hashes:
            return set()
        result = await session.execute(
            select(Transaction.transaction_hash)
            .where(Transaction.user_id == user_id, Transaction.transaction_hash.in_(hashes))
        )
        return set(result.scalars().all())

    @staticmethod
    async def list_by_user(
        session: AsyncSession,
        user_id: int,
        category: Optional[str] = None,
        search: Optional[str] = None,
        transaction_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Transaction], int]:
        """
        Queries transactions strictly filtered by user_id with optional search and category filters.
        """
        query = select(Transaction).where(Transaction.user_id == user_id)
        count_query = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)

        if category and category != "All Categories":
            query = query.where(Transaction.category.ilike(f"%{category}%"))
            count_query = count_query.where(Transaction.category.ilike(f"%{category}%"))

        if transaction_type:
            query = query.where(Transaction.transaction_type == transaction_type)
            count_query = count_query.where(Transaction.transaction_type == transaction_type)

        if search:
            search_pattern = f"%{search.strip()}%"
            filter_clause = or_(
                Transaction.normalized_merchant.ilike(search_pattern),
                Transaction.original_narration.ilike(search_pattern),
                Transaction.category.ilike(search_pattern)
            )
            query = query.where(filter_clause)
            count_query = count_query.where(filter_clause)

        # Count total matches
        count_res = await session.execute(count_query)
        total_count = count_res.scalar() or 0

        # Retrieve paginated items sorted by transaction_date descending
        query = query.order_by(desc(Transaction.transaction_date), desc(Transaction.created_at)).offset(offset).limit(limit)
        res = await session.execute(query)
        items = list(res.scalars().all())

        return items, total_count

    @staticmethod
    async def get_all_for_user(session: AsyncSession, user_id: int) -> List[Transaction]:
        """Fetches all transactions for analytics calculation."""
        result = await session.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.transaction_date))
        )
        return list(result.scalars().all())

transaction_repo = TransactionRepository()
