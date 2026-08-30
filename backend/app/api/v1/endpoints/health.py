"""
CreditLens Production Health & Readiness Endpoints
Provides Kubernetes/Docker compatible liveness and readiness probes.
"""
from fastapi import APIRouter, Depends, status, Response
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import os

from app.schemas.common import ApiResponse
from app.core.config import settings
from app.db.session import get_db
from app.ml.inference.service import ARTIFACTS_DIR, ml_service
from app.rag.vector_store import vector_store

router = APIRouter()

@router.get("", summary="API Health Status")
async def health_check():
    """
    Lightweight health check indicating the API service is running.
    """
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/live", summary="Kubernetes/Docker Liveness Probe")
async def liveness_probe():
    """
    Returns 200 OK if the process is alive and able to accept HTTP connections.
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/ready", summary="Kubernetes/Docker Readiness Probe")
async def readiness_probe(response: Response, session: AsyncSession = Depends(get_db)):
    """
    Comprehensive readiness check verifying database connectivity, ML model availability,
    and RAG vector knowledge base status.
    Returns 200 if fully ready, or 503 Service Unavailable if any critical subsystem is unavailable.
    """
    checks: Dict[str, Any] = {}
    is_ready = True

    # 1. Database Connection Check
    try:
        result = await session.execute(text("SELECT 1"))
        val = result.scalar()
        if val == 1:
            checks["database"] = {"status": "healthy", "driver": session.bind.dialect.name if session.bind else "unknown"}
        else:
            checks["database"] = {"status": "unhealthy", "error": "Unexpected query result"}
            is_ready = False
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "error": "Database unreachable"}
        is_ready = False

    # 2. ML Artifacts Check
    model_file = os.path.join(ARTIFACTS_DIR, "model.joblib")
    preproc_file = os.path.join(ARTIFACTS_DIR, "preprocessor.joblib")
    meta_file = os.path.join(ARTIFACTS_DIR, "metadata.json")

    ml_ready = os.path.exists(model_file) and os.path.exists(preproc_file) and (ml_service.model is not None)
    if ml_ready:
        checks["ml_engine"] = {
            "status": "healthy",
            "model_version": ml_service.metadata.get("model_version", "creditlens-risk-xgb-v1.2")
        }
    else:
        checks["ml_engine"] = {"status": "unhealthy", "error": "ML model artifacts not loaded"}
        is_ready = False

    # 3. RAG Knowledge Base Check
    rag_ready = vector_store.count() > 0 or os.path.exists(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rag", "data", "rbi_master_direction_cards_2022.json"))
    checks["rag_knowledge_base"] = {
        "status": "healthy" if rag_ready else "degraded",
        "chunks_indexed": vector_store.count()
    }

    # 4. Configuration Check
    checks["configuration"] = {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "rate_limiting": settings.RATE_LIMIT_ENABLED
    }

    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if is_ready else "unready",
        "timestamp": datetime.utcnow().isoformat(),
        "components": checks
    }
