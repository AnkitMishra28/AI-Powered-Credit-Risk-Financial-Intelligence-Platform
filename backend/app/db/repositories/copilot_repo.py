"""
CreditLens Copilot History Repository
Data access layer for conversation persistence and retrieval with strict user isolation.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.copilot import CopilotQueryRecord

class CopilotRepository:
    @staticmethod
    async def save_query(
        session: AsyncSession,
        user_id: int,
        conversation_id: str,
        query: str,
        answer: str,
        sources: Optional[List[Dict[str, Any]]] = None,
        grounding_facts: Optional[List[Dict[str, str]]] = None,
        key_points: Optional[List[str]] = None,
        personalized_insights: Optional[List[str]] = None
    ) -> CopilotQueryRecord:
        record = CopilotQueryRecord(
            user_id=user_id,
            conversation_id=conversation_id,
            query=query,
            answer=answer,
            sources=sources,
            grounding_facts=grounding_facts,
            key_points=key_points,
            personalized_insights=personalized_insights
        )
        session.add(record)
        await session.commit()
        await session.refresh(record)
        return record

    @staticmethod
    async def list_history_for_user(
        session: AsyncSession,
        user_id: int,
        limit: int = 20
    ) -> List[CopilotQueryRecord]:
        result = await session.execute(
            select(CopilotQueryRecord)
            .where(CopilotQueryRecord.user_id == user_id)
            .order_by(desc(CopilotQueryRecord.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

copilot_repo = CopilotRepository()
