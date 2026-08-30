"""
CreditLens Production Middleware Layer
Provides Request Correlation ID tracking, Latency Observability, and Security Headers.
"""
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger, set_request_id
from app.core.config import settings

class RequestObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Assigns a unique correlation ID to every incoming request, logs request timing,
    and attaches observability headers to the response.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Check for existing correlation ID from upstream reverse proxy (e.g. Nginx, Cloudflare)
        request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:12]}"
        set_request_id(request_id)

        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"

        # Log request entry
        logger.info(
            f"--> {request.method} {request.url.path} (client: {client_ip}) [id: {request_id}]"
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"<-- {request.method} {request.url.path} ERROR: {exc} ({duration_ms}ms) [id: {request_id}]",
                exc_info=True
            )
            raise exc

        duration_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{duration_ms}ms"

        # Log request completion
        logger.info(
            f"<-- {request.method} {request.url.path} {response.status_code} ({duration_ms}ms) [id: {request_id}]"
        )

        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Applies standard OWASP security response headers across all HTTP endpoints.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"

        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
