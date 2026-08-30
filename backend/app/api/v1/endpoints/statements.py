"""
CreditLens Statement Upload & Management Endpoints
Handles CSV and PDF statement file uploads, validation, and metadata queries.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

from app.schemas.common import ApiResponse
from app.ingestion.models import StatementSummary, CanonicalTransaction
from app.ingestion.validators import IngestionValidationError
from app.ingestion.service import ingestion_service

router = APIRouter()

class StatementUploadResponse(BaseModel):
    statement: StatementSummary
    parsed_transactions_count: int
    total_debits: float
    total_credits: float

@router.post("/upload", response_model=ApiResponse[StatementUploadResponse], summary="Upload Bank/Card Statement (CSV/PDF)")
async def upload_statement(
    file: UploadFile = File(..., description="CSV or PDF statement file"),
    user_id: int = Form(1, description="User identifier")
):
    """
    Ingests, validates, parses, normalizes, and categorizes a bank or credit card statement file.
    Supports CSV and text-based PDF statements up to 10 MB.
    """
    try:
        file_bytes = await file.read()
        summary, transactions = ingestion_service.process_statement(
            file_bytes=file_bytes,
            filename=file.filename or "statement.csv",
            content_type=file.content_type or "",
            user_id=user_id
        )

        upload_data = StatementUploadResponse(
            statement=summary,
            parsed_transactions_count=len(transactions),
            total_debits=summary.total_debits,
            total_credits=summary.total_credits
        )

        return ApiResponse(
            success=True,
            message=f"Successfully ingested statement '{summary.filename}' ({len(transactions)} transactions parsed)",
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
async def list_statements(user_id: int = 1):
    """
    Returns the list of all financial statements uploaded by the user.
    """
    statements = ingestion_service.get_statements(user_id=user_id)
    return ApiResponse(
        success=True,
        message="Statements retrieved successfully",
        data=statements,
        is_demo=len(statements) == 0
    )

@router.get("/{statement_id}", response_model=ApiResponse[StatementSummary], summary="Get Statement Detail")
async def get_statement_detail(statement_id: str):
    """
    Retrieves metadata and processing status for a specific statement.
    """
    summary = ingestion_service.get_statement_by_id(statement_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Statement with ID '{statement_id}' not found."
        )
    return ApiResponse(
        success=True,
        message="Statement details retrieved",
        data=summary,
        is_demo=False
    )
