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
