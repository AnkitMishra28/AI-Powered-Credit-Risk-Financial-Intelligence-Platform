"""
CreditLens Enterprise FastAPI Application Entry Point
Configures Lifespan, CORS, Security Headers, Observability Middleware,
Centralized Error Handling, and API Routes.
"""
import asyncio
import re

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging, logger, get_request_id
from app.core.middleware import RequestObservabilityMiddleware, SecurityHeadersMiddleware
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging(
        log_level=settings.LOG_LEVEL,
        json_format=(settings.ENVIRONMENT == "production")
    )
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")

    # 1. Bring the database schema to head IN-PROCESS. This guarantees additive,
    #    idempotent migrations (e.g. users.designation) are applied even when the
    #    platform's start command is just `uvicorn ...` and does not run
    #    `alembic upgrade head` itself. Run in a thread: alembic's env.py opens
    #    its own event loop. Never destructive — see backend/alembic/versions/*.
    try:
        from app.db.session import apply_migrations_sync
        await asyncio.to_thread(apply_migrations_sync)
        logger.info("Alembic migrations applied — database schema at head.")
    except Exception as e:
        logger.error(f"Alembic migration step failed at startup: {e}", exc_info=True)

    try:
        from app.db.session import init_db
        await init_db()
        logger.info("Database schema verified and ready.")
    except Exception as e:
        logger.warning(f"Database initialization deferred or offline: {e}")
    try:
        from app.rag.service import rag_copilot_service
        rag_copilot_service.initialize_knowledge_base()
        logger.info("RAG Knowledge Base initialized and ready.")
    except Exception as e:
        logger.warning(f"RAG Knowledge Base initialization deferred: {e}")
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.PROJECT_NAME}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CreditLens AI-Powered Credit Risk & Financial Intelligence Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# 1. Observability & Correlation Middleware
app.add_middleware(RequestObservabilityMiddleware)

# 2. Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 3. CORS Middleware
#    - Explicit allow-list (localhost + the known production Vercel origin) from
#      BACKEND_CORS_ORIGINS / CORS_ORIGINS.
#    - PLUS an origin regex (default: any https://*.vercel.app) so every Vercel
#      deployment URL of this project is accepted without enumeration. Never "*".
_cors_origins = settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else []
_cors_origin_regex = settings.BACKEND_CORS_ORIGIN_REGEX.strip() or None
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=_cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time"],
)

# Centralized Exception Handling
#
# Starlette runs `@app.exception_handler(Exception)` inside ServerErrorMiddleware,
# which sits ABOVE the CORS middleware — so an unhandled 500's response never
# gets CORS headers and the browser reports it as an opaque "CORS policy" error,
# masking the real failure. We therefore re-attach the CORS headers here for any
# allowed Origin so the frontend receives the actual status/body.
def _cors_headers_for(request: Request) -> dict:
    origin = request.headers.get("origin")
    if not origin:
        return {}
    allowed = origin in _cors_origins
    if not allowed and _cors_origin_regex:
        try:
            allowed = re.fullmatch(_cors_origin_regex, origin) is not None
        except re.error:
            allowed = False
    if not allowed:
        return {}
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
    }


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    req_id = get_request_id()
    headers = {**(getattr(exc, "headers", None) or {}), **_cors_headers_for(request)}
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error_code": f"HTTP_{exc.status_code}",
            "request_id": req_id
        },
        headers=headers or None
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = get_request_id()
    errors = exc.errors()
    # Format a safe message without leaking internal schemas
    formatted_msg = "; ".join(f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in errors[:3])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": f"Request validation failed: {formatted_msg}",
            "error_code": "VALIDATION_ERROR",
            "request_id": req_id
        },
        headers=_cors_headers_for(request) or None
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    req_id = get_request_id()
    logger.error(f"Unhandled Exception [id: {req_id}]: {str(exc)}", exc_info=True)

    detail = "An internal server error occurred. Please contact support with your Request ID."
    if settings.ENVIRONMENT != "production":
        detail = f"Internal error: {str(exc)}"

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": detail,
            "error_code": "INTERNAL_SERVER_ERROR",
            "request_id": req_id
        },
        headers=_cors_headers_for(request) or None
    )

# Include Versioned API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to CreditLens API",
        "docs": f"{settings.API_V1_STR}/docs" if settings.ENVIRONMENT != "production" else "Disabled in production",
        "health": f"{settings.API_V1_STR}/health",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "operational"
    }
