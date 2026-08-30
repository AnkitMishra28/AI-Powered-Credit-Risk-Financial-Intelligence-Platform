"""
CreditLens Statement Upload & Management Endpoints
Handles CSV and PDF statement file uploads, validation, and persistent user-scoped metadata queries.
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.common import ApiResponse
from app.ingestion.models import StatementSummary
from app.ingestion.validators import IngestionValidationError
from app.ingestion.service import ingestion_service
from app.db.session import get_db
from app.db.repositories.statement_repo import statement_repo
from app.api.deps import get_optional_current_user
from app.models.user import User

router = APIRouter()

class StatementUploadResponse(BaseModel):
    statement: StatementSummary
    parsed_transactions_count: int
    total_debits: float
    total_credits: float

@router.post("/upload", response_model=ApiResponse[StatementUploadResponse], summary="Upload Bank/Card Statement (CSV/PDF)")
async def upload_statement(
    file: UploadFile = File(..., description="CSV or PDF statement file"),
    user_id: Optional[int] = Form(None, description="Optional explicit user identifier"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Ingests, validates, parses, normalizes, categorizes, and persists a statement file.
    Supports CSV and text-based PDF statements up to 10 MB with SHA-256 deduplication.
    """
    effective_user_id = current_user.id if current_user else (user_id or 1)
    
    try:
        file_bytes = await file.read()
        summary, transactions = await ingestion_service.process_statement_async(
            session=session,
            file_bytes=file_bytes,
            filename=file.filename or "statement.csv",
            content_type=file.content_type or "",
            user_id=effective_user_id
        )

        upload_data = StatementUploadResponse(
            statement=summary,
            parsed_transactions_count=len(transactions),
            total_debits=summary.total_debits,
            total_credits=summary.total_credits
        )

        return ApiResponse(
            success=True,
            message=f"Successfully ingested statement '{summary.filename}' ({len(transactions)} new transactions stored)",
            data=upload_data,
            is_demo=False
        )

    except IngestionValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Statement ingestion failed: {str(e)}"
        )

@router.get("", response_model=ApiResponse[List[StatementSummary]], summary="List Uploaded Statements")
async def list_statements(
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Returns the list of all financial statements uploaded by the authenticated user.
    """
    effective_user_id = current_user.id if current_user else (user_id or 1)
    db_statements = await statement_repo.list_by_user(session, effective_user_id)

    summaries: List[StatementSummary] = []
    for s in db_statements:
        summaries.append(
            StatementSummary(
                id=s.id,
                user_id=s.user_id,
                filename=s.filename,
                file_type=s.file_type, # type: ignore
                file_size_bytes=s.file_size_bytes,
                uploaded_at=s.uploaded_at,
                status=s.processing_status, # type: ignore
                transaction_count=s.transaction_count,
                total_debits=s.total_outflows,
                total_credits=s.total_inflows,
                error_message=s.error_message
            )
        )

    return ApiResponse(
        success=True,
        message="Statements retrieved successfully",
        data=summaries,
        is_demo=len(summaries) == 0
    )

@router.get("/{statement_id}", response_model=ApiResponse[StatementSummary], summary="Get Statement Detail")
async def get_statement_detail(
    statement_id: str,
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieves metadata and processing status for a specific statement, strictly scoped to the user.
    """
    effective_user_id = current_user.id if current_user else (user_id or 1)
    s = await statement_repo.get_by_id(session, statement_id, effective_user_id)
    if not s:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Statement with ID '{statement_id}' not found."
        )

    summary = StatementSummary(
        id=s.id,
        user_id=s.user_id,
        filename=s.filename,
        file_type=s.file_type, # type: ignore
        file_size_bytes=s.file_size_bytes,
        uploaded_at=s.uploaded_at,
        status=s.processing_status, # type: ignore
        transaction_count=s.transaction_count,
        total_debits=s.total_outflows,
        total_credits=s.total_inflows,
        error_message=s.error_message
    )

    return ApiResponse(
        success=True,
        message="Statement details retrieved",
        data=summary,
        is_demo=False
    )
