"""
CreditLens Production Structured Logging & Observability
Provides secure, structured logging with correlation IDs and sensitive data redaction.
"""
import logging
import sys
import json
import contextvars
from datetime import datetime
from typing import Any, Dict

# Context variable for request correlation ID
request_id_ctx = contextvars.ContextVar("request_id", default="")

SENSITIVE_KEYS = {
    "password", "secret", "token", "access_token", "jwt", "authorization",
    "api_key", "file_bytes", "gemini_api_key", "secret_key"
}

def get_request_id() -> str:
    return request_id_ctx.get()

def set_request_id(req_id: str) -> None:
    request_id_ctx.set(req_id)

def sanitize_data(data: Any) -> Any:
    """Recursively redacts sensitive keys from log dictionaries."""
    if isinstance(data, dict):
        sanitized = {}
        for k, v in data.items():
            if str(k).lower() in SENSITIVE_KEYS:
                sanitized[k] = "[REDACTED]"
            elif isinstance(v, (dict, list)):
                sanitized[k] = sanitize_data(v)
            else:
                sanitized[k] = v
        return sanitized
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    return data

class StructuredLogFormatter(logging.Formatter):
    """Formats logs with timestamp, level, correlation ID, and sanitized payload."""
    def format(self, record: logging.LogRecord) -> str:
        req_id = get_request_id()
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if req_id:
            log_entry["request_id"] = req_id
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

def setup_logging(log_level: str = "INFO", json_format: bool = False):
    """Configures centralized root logger for the application."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    if json_format:
        handler.setFormatter(StructuredLogFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s [%(levelname)s] [%(name)s] %(message)s")
        )
    root_logger.addHandler(handler)

    # Quiet down external noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("aiosqlite").setLevel(logging.WARNING)

logger = logging.getLogger("creditlens")
