from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    credit_health,
    risk,
    spending,
    copilot,
    users,
    statements,
    transactions
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Onboarding"])
api_router.include_router(credit_health.router, prefix="/credit-health", tags=["Credit Health"])
api_router.include_router(risk.router, prefix="/risk", tags=["Risk Analysis"])
api_router.include_router(spending.router, prefix="/spending", tags=["Spending Intelligence"])
api_router.include_router(statements.router, prefix="/statements", tags=["Statement Ingestion"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transaction Ledger"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["Ask CreditLens Copilot"])
