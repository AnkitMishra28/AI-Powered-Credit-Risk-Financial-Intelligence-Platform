from fastapi import APIRouter
from datetime import datetime
from app.schemas.common import HealthCheckResponse
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthCheckResponse, summary="API Health Check")
async def health_check():
    """
    Returns the operational status of the CreditLens API service.
    """
    return HealthCheckResponse(
        status="ok",
        service="CreditLens API",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        database="ready",
        environment=settings.ENVIRONMENT,
        features={
            "credit_health_engine": "phase1_foundation",
            "risk_prediction_engine": "phase1_scaffolding",
            "spending_intelligence": "phase1_foundation",
            "rag_copilot": "phase1_scaffolding"
        }
    )
