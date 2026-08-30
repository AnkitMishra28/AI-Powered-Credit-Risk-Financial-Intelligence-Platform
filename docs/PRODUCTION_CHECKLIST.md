# CreditLens — Production Release Checklist

Use this checklist prior to promoting CreditLens builds to cloud production environments.

---

## 🔒 1. Security & Authentication
- [x] **Secrets Externalization**: All secrets (`JWT_SECRET_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`) externalized to environment variables.
- [x] **Production Secret Validator**: `app/core/config.py` enforces fail-fast error if `ENVIRONMENT=production` and `JWT_SECRET_KEY` uses a development placeholder or is $<32$ characters.
- [x] **CORS Origins**: Restricted to explicit domain whitelist; wildcard `*` disallowed in production.
- [x] **Security Response Headers**: `nosniff`, `DENY` frame options, XSS protection, and `Strict-Transport-Security` headers active.
- [x] **Multi-Tenant Isolation**: Tenant identity derived strictly from verified JWT `sub` claim; query/body `user_id` tampering prevented.
- [x] **Rate Limiting**: Sliding window rate limits active on login, registration, uploads, and copilot queries.
- [x] **Log Redaction**: Passwords, tokens, file bytes, and secret keys automatically redacted from logs.

---

## 🗄️ 2. Database & Data Layer
- [x] **PostgreSQL + pgvector**: Database container and production URL configured.
- [x] **Alembic Migrations**: Migration `4a3e1f91a362_001_phase6_initial_schema.py` verified against clean database.
- [x] **Cascading Deletes**: User foreign keys configured with `ondelete="CASCADE"`.
- [x] **Transaction Deduplication**: SHA-256 transaction hash deduplication prevents duplicate records on repeated statement uploads.
- [x] **Persistent Volume**: Named Docker volume `postgres_data` preserves data across container restarts.

---

## 🚀 3. Backend & API Services
- [x] **Health & Readiness**: `/api/v1/health`, `/api/v1/health/live`, and `/api/v1/health/ready` verified.
- [x] **Centralized Error Handling**: Unhandled exceptions return sanitized JSON responses without exposing Python stack traces.
- [x] **Request Observability**: Correlation IDs (`X-Request-ID`) and latency (`X-Process-Time`) returned in headers and logged.
- [x] **Bytecode Compilation**: `python -m compileall app` passes with zero errors.
- [x] **Automated Tests**: 27/27 Pytest integration tests passing.

---

## 💻 4. Frontend & User Interface
- [x] **Standalone Next.js Build**: `output: "standalone"` enabled and verified with Turbopack.
- [x] **Environment-Driven API URL**: `NEXT_PUBLIC_API_URL` dynamically configured.
- [x] **Authentication Flow**: Session restoration, token storage, and 401 token expiry handling verified.
- [x] **Zero Hydration Mismatches**: Clean SSR vs Client rendering across all 11 application routes.
- [x] **Zero ESLint Warnings**: `npm run lint` passes cleanly.

---

## 🧠 5. Machine Learning & RAG Subsystems
- [x] **Deterministic Scoring**: Credit Health Score 0–1000 computed purely through transparent mathematical rules.
- [x] **XGBoost Risk Classifier**: Artifacts loaded deterministically; default probabilities calibrated and normalized ($\sum = 1.00$).
- [x] **TreeSHAP Attributions**: Feature impact attributions verified and linked to risk categories.
- [x] **RAG Retrieval**: Vector search over authoritative regulatory corpus (RBI Master Directions 2022).
- [x] **Prompt Injection Defense**: Context isolation boundaries and guardrails defend against instruction override attempts.

---

## 📦 6. Containerization & CI/CD
- [x] **Multi-Stage Backend Dockerfile**: Python 3.11-slim, non-root user `creditlens`, curl healthcheck.
- [x] **Multi-Stage Frontend Dockerfile**: Node 20-alpine, standalone server, non-root user `nextjs`, wget healthcheck.
- [x] **Docker Compose Stack**: Full-stack orchestration for `db`, `backend`, and `frontend` with network isolation.
- [x] **GitHub Actions Workflow**: `.github/workflows/ci.yml` validates backend tests, migrations, frontend lint, and production build on every push.
