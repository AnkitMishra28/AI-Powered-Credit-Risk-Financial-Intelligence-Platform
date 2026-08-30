# CreditLens — Production Deployment & Release Engineering Guide

This guide provides end-to-end instructions for deploying the **CreditLens** AI-Powered Credit Risk & Financial Intelligence Platform to local, containerized, and cloud production environments.

---

## 🏗️ Deployment Architecture

```
                                  [ Internet / Client Browser ]
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │  Reverse Proxy / HTTPS │
                                   │ (Nginx / Cloudflare /  │
                                   │   AWS ALB / Ingress)   │
                                   └────────────┬───────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │ :3000                                               │ :8000
                     ▼                                                     ▼
        ┌─────────────────────────┐                           ┌─────────────────────────┐
        │   Next.js 16 Frontend   │                           │   FastAPI Backend API   │
        │   (Standalone Node 20)  │                           │   (Python 3.11 / Gunicorn) │
        └─────────────────────────┘                           └────────────┬────────────┘
                                                                           │
                                                ┌──────────────────────────┴──────────┐
                                                │                                     │
                                                ▼                                     ▼
                                   ┌─────────────────────────┐           ┌─────────────────────────┐
                                   │  PostgreSQL + pgvector  │           │   Google Gemini API     │
                                   │  (RDS / Neon / Compose) │           │   (AI Studio / Cloud)   │
                                   └─────────────────────────┘           └─────────────────────────┘
```

---

## 🚀 Quickstart: Local Production Stack (Docker Compose)

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (v24.0+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.20+)

### 2. Configure Environment Variables
Copy the root `.env.example` template:

```bash
cp .env.example .env
```

Edit `.env` and configure production parameters:
```env
ENVIRONMENT=production
LOG_LEVEL=INFO
JWT_SECRET_KEY=generate_a_64_char_cryptographically_secure_random_hex_string
BACKEND_CORS_ORIGINS=http://localhost:3000,https://creditlens.yourdomain.com
GEMINI_API_KEY=your_gemini_api_key_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_postgres_password
POSTGRES_DB=creditlens
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Build & Launch Container Services
```bash
docker compose build
docker compose up -d
```

### 4. Verify Running Containers
```bash
docker compose ps
```

Expected output:
```
NAME                  IMAGE                COMMAND                  SERVICE    STATUS
creditlens_backend    creditlens-backend   "uvicorn app.main:ap…"   backend    running (healthy)
creditlens_db         pgvector/pgvector    "docker-entrypoint.s…"   db         running (healthy)
creditlens_frontend   creditlens-frontend  "node server.js"         frontend   running (healthy)
```

---

## 🔍 Health & Readiness Probes

CreditLens exposes standardized health and readiness endpoints for container orchestrators (Kubernetes, AWS ECS, Google Cloud Run):

| Probe Route | Purpose | Expected Status |
| :--- | :--- | :--- |
| `GET /api/v1/health` | Lightweight service ping | `200 OK` |
| `GET /api/v1/health/live` | Process liveness probe | `200 OK` |
| `GET /api/v1/health/ready` | Deep readiness probe (Database, ML model, RAG corpus) | `200 OK` (or `503 Service Unavailable` if unready) |

Example Readiness Verification:
```bash
curl -i http://localhost:8000/api/v1/health/ready
```

Response:
```json
{
  "status": "ready",
  "timestamp": "2026-08-30T14:30:00.000000",
  "components": {
    "database": { "status": "healthy", "driver": "sqlite" },
    "ml_engine": { "status": "healthy", "model_version": "creditlens-risk-xgb-v1.2" },
    "rag_knowledge_base": { "status": "healthy", "chunks_indexed": 14 },
    "configuration": { "status": "healthy", "environment": "production", "rate_limiting": true }
  }
}
```

---

## 🗄️ Database Management & Migrations

### Running Migrations via Alembic
To apply database schema migrations against a running PostgreSQL database:

```bash
cd backend
# With virtual environment activated:
alembic upgrade head
```

### Automatic Database Initialization
On startup, FastAPI automatically runs `init_db()`, verifying database tables and seeding the designated demo user if missing.

---

## 🛡️ Security & Hardening Features

1. **Strict Token-Derived Identity**: All protected endpoints derive authenticated ownership strictly from cryptographically verified JWT claims (`current_user.id`).
2. **Security Headers**: Standard OWASP security headers applied automatically:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (in production)
3. **In-Memory Rate Limiting**: Built-in sliding window rate limiter protects sensitive endpoints (`/users/login`, `/users/register`, `/statements/upload`, `/copilot/query`) against brute force and resource exhaustion.
4. **Statement Upload Hardening**:
   - 10 MB strict file size ceiling.
   - Filename sanitization against path traversal (`../`).
   - Magic byte header checks (`%PDF-` for PDFs, textual delimiters for CSVs).
   - Executable payload rejection (`MZ`, `ELF`).
5. **Prompt Injection & Safety Guardrails**: Context-isolation boundaries prevent instruction overrides, model hallucination, and system prompt leakage.

---

## 🔄 Continuous Integration & Delivery (CI/CD)

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that validates every commit:
- **Backend Job**: Python 3.11 bytecode compilation, Pytest suite (27 tests), integration test runner (`test_api.py`), and clean Alembic migration check.
- **Frontend Job**: Node.js 20 clean install (`npm ci`), ESLint verification, and Next.js standalone production build.
