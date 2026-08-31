"""
CreditLens Core Configuration System
Provides Pydantic Settings with environment separation, CORS parsing, secret validation,
and fail-fast production security guarantees.
"""
from typing import List, Optional, Union
from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

def normalize_database_url(url: Optional[str]) -> Optional[str]:
    """
    Normalizes database connection URIs for SQLAlchemy and asyncpg compatibility.
    - Upgrades postgresql:// and postgres:// to postgresql+asyncpg://
    - Upgrades sqlite:// to sqlite+aiosqlite://
    - Translates libpq 'sslmode' to asyncpg 'ssl'
    - Removes libpq-only parameters incompatible with asyncpg (channel_binding, gssencmode, target_session_attrs)
    - Preserves valid connection parameters (application_name, statement_cache_size, etc.)
    """
    if not url:
        return None
    url = url.strip()
    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    elif url.startswith("sqlite://") and not url.startswith("sqlite+aiosqlite://"):
        url = "sqlite+aiosqlite://" + url[len("sqlite://"):]

    if url.startswith("postgresql+asyncpg://"):
        parsed = urlparse(url)
        if parsed.query:
            query_params = parse_qs(parsed.query, keep_blank_values=True)
            # Translate libpq 'sslmode' to asyncpg 'ssl'
            if "sslmode" in query_params:
                ssl_val = query_params.pop("sslmode")
                if "ssl" not in query_params:
                    query_params["ssl"] = ssl_val

            # Remove libpq-only parameters that cause asyncpg TypeError
            unsupported_params = ["channel_binding", "gssencmode", "target_session_attrs"]
            for p in unsupported_params:
                query_params.pop(p, None)

            new_query = urlencode(query_params, doseq=True)
            url = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                new_query,
                parsed.fragment
            ))
    return url


class Settings(BaseSettings):
    # Application Metadata
    PROJECT_NAME: str = "CreditLens API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Security & Authentication
    SECRET_KEY: str = Field(
        default="creditlens-phase1-dev-secret-key-change-in-production-1234567890",
        validation_alias="JWT_SECRET_KEY"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS Allowed Origins
    # Accepts either env var name: BACKEND_CORS_ORIGINS (canonical) or CORS_ORIGINS (alias).
    # Value may be a comma-separated string ("https://a.com,https://b.com") or a JSON array.
    BACKEND_CORS_ORIGINS: Union[List[str], str] = Field(
        default=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        validation_alias=AliasChoices("BACKEND_CORS_ORIGINS", "CORS_ORIGINS"),
    )

    # Database Configuration (PostgreSQL / SQLite fallback)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "creditlens"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    # AI / LLM & RAG Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-pro"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_DIMENSION: int = 384

    # Rate Limiting & Abuse Protection
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_AUTH_PER_MIN: int = 15
    RATE_LIMIT_COPILOT_PER_MIN: int = 30
    RATE_LIMIT_UPLOAD_PER_MIN: int = 10

    # Ingestion Constraints
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(origin).strip() for origin in v]
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        valid_envs = {"development", "testing", "staging", "production"}
        normalized = v.lower().strip()
        if normalized not in valid_envs:
            return "development"
        return normalized

    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        """
        Enforces strict fail-fast validation when operating in production mode.
        """
        if self.ENVIRONMENT == "production":
            insecure_markers = ["dev-secret", "change-in-production", "12345", "secret", "default"]
            if any(marker in self.SECRET_KEY.lower() for marker in insecure_markers) or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: In production mode, "
                    "JWT_SECRET_KEY / SECRET_KEY must be a cryptographically secure random string "
                    "of at least 32 characters and cannot use default/development placeholder values."
                )
            if "*" in self.BACKEND_CORS_ORIGINS:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: In production mode, "
                    "BACKEND_CORS_ORIGINS cannot contain wildcard '*' when credentials/tokens are used."
                )
        return self

    @property
    def async_database_url(self) -> str:
        """Constructs an asyncpg-compatible PostgreSQL database URL or SQLite fallback."""
        if self.DATABASE_URL:
            normalized = normalize_database_url(self.DATABASE_URL)
            if normalized:
                return normalized
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
