from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Generic, TypeVar, List

T = TypeVar("T")

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class HealthCheckResponse(BaseModel):
    status: str = "ok"
    service: str = "CreditLens API"
    version: str = "1.0.0"
    timestamp: datetime
    database: str = "ready"
    environment: str = "development"
    features: dict = {
        "credit_health_engine": "phase1_foundation",
        "risk_prediction_engine": "phase1_scaffolding",
        "spending_intelligence": "phase1_foundation",
        "rag_copilot": "phase1_scaffolding"
    }

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
    is_demo: bool = False
    # Explicit data-state semantics so the frontend can distinguish:
    #   "ok"               - real, user-owned, computed data is present in `data`
    #   "demo"             - `data` is the intentional demo/canonical dataset (demo session only)
    #   "no_data"          - authenticated real user has uploaded nothing yet (`data` is null/empty)
    #   "insufficient_data"- real user has some data but not enough to compute this metric (`data` is null)
    data_status: Optional[str] = None
    # Convenience boolean mirroring data_status for simple frontend checks.
    has_financial_data: Optional[bool] = None
