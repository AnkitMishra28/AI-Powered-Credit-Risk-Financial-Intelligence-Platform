# CreditLens — Production Deployment & Release Engineering Guide

This guide provides end-to-end instructions for deploying the **CreditLens** AI-Powered Credit Risk & Financial Intelligence Platform across cloud platforms (Vercel + Render + Neon), containerized environments (Docker Compose), and local development setups.

---

## 🏗️ Production Architecture

```
                                  [ Internet / Client Browser ]
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │  HTTPS / CDN / Ingress │
                                   │ (Vercel Edge / Cloud)  │
                                   └────────────┬───────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │ :443 (HTTPS)                                        │ :443 (HTTPS)
                     ▼                                                     ▼
        ┌─────────────────────────┐                           ┌─────────────────────────┐
        │   Next.js 16 Frontend   │                           │   FastAPI Backend API   │
        │   (Vercel / Node 20)    │                           │  (Render / Uvicorn 3.11)│
        └─────────────────────────┘                           └────────────┬────────────┘
                                                                           │
                                                ┌──────────────────────────┴──────────┐
                                                │                                     │
                                                ▼                                     ▼
                                   ┌─────────────────────────┐           ┌─────────────────────────┐
                                   │  PostgreSQL Database    │           │   Google Gemini API     │
                                   │  (Neon / RDS / pgvector)│           │  (Optional AI Studio)   │
                                   └─────────────────────────┘           └─────────────────────────┘
```

---

## 🌐 Public Cloud Deployment (Recommended: Vercel + Render + Neon)

The standard production deployment topology for CreditLens decouples the frontend static/SSR application from the Python API backend and managed PostgreSQL database.

### 1. Database Provisioning (Neon PostgreSQL)

1. Create a free PostgreSQL instance at [Neon](https://neon.tech).
2. Retrieve your connection string from the Neon dashboard:
   ```
   postgresql://<user>:<password>@<ep-identifier>.us-east-2.aws.neon.tech/creditlens?sslmode=require
   ```
3. CreditLens automatically transforms `postgres://` or `postgresql://` connection strings into `postgresql+asyncpg://` at runtime.
4. Schema tables and the initial demo analyst user (`alex.mercer@fintech.demo`) are automatically initialized on application startup via `init_db()` or via explicit Alembic migration (`alembic upgrade head`).

---

### 2. Backend Deployment (Render Web Service)

1. Sign in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `creditlens-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/v1/health/live`
4. Add the following **Environment Variables** in the Render dashboard:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | **Yes** | Enables production security mode and fail-fast checks | `production` |
| `DATABASE_URL` | **Yes** | Neon/PostgreSQL asyncpg connection URI | `postgresql+asyncpg://user:pass@ep-xyz.neon.tech/creditlens` |
| `JWT_SECRET_KEY` | **Yes** | 32+ character cryptographically secure random string | `e8f4c92b71...` (generate via `openssl rand -hex 32`) |
| `BACKEND_CORS_ORIGINS` | **Yes** | Comma-separated list of allowed frontend origins | `https://creditlens.vercel.app` |
| `LOG_LEVEL` | No | Logging verbosity (INFO, DEBUG, WARNING) | `INFO` |
| `GEMINI_API_KEY` | No | Google AI Studio API key for live LLM synthesis | `AIzaSy...` (falls back to deterministic RAG if omitted) |
| `RATE_LIMIT_ENABLED` | No | Enables sliding-window rate limiting on auth & copilot | `true` |

---

### 3. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Configure the **Environment Variables**:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | Full URL to the deployed Render backend API | `https://creditlens-api.onrender.com/api/v1` |

5. Deploy the project. Update the Render backend `BACKEND_CORS_ORIGINS` setting to include your finalized Vercel deployment domain.

---

## 🐳 Containerized Deployment (Docker Compose)

For unified local production testing or on-premise container hosting:

### 1. Prerequisites
- [Docker Engine](https://docs.docker.com/get-docker/) (v24.0+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.20+)

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the repository root:
```bash
cp .env.example .env
```

Set appropriate values in `.env`:
```env
ENVIRONMENT=production
LOG_LEVEL=INFO
JWT_SECRET_KEY=generate_a_64_char_cryptographically_secure_random_hex_string
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
GEMINI_API_KEY=your_gemini_api_key_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_postgres_password
POSTGRES_DB=creditlens
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Next.js Standalone Build Support
The frontend Dockerfile leverages Next.js standalone output (`output: "standalone"` configured in `frontend/next.config.ts`), creating a minimal Node 20 runner container without requiring root privileges or external `node_modules`.

### 4. Build & Launch Containers
```bash
docker compose build
docker compose up -d
```

### 5. Verify Running Services
```bash
docker compose ps
```

Expected output:
```
NAME                  IMAGE                                                        COMMAND                  SERVICE    STATUS
creditlens_backend    ai-poweredcreditriskfinancialintelligenceplatform-backend    "uvicorn app.main:ap…"   backend    running (healthy)
creditlens_db         pgvector/pgvector:pg16                                       "docker-entrypoint.s…"   db         running (healthy)
creditlens_frontend   ai-poweredcreditriskfinancialintelligenceplatform-frontend   "docker-entrypoint.s…"   frontend   running (healthy)
```

---

## 💻 Local Bare-Metal Development

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
API will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/api/v1/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm ci
npm run dev
```
Application will be available at `http://localhost:3000`.

---

## 🔍 Health & Readiness Probes

CreditLens exposes standardized health endpoints for load balancers and orchestrators:

| Probe Route | Purpose | Expected Status |
| :--- | :--- | :--- |
| `GET /api/v1/health` | Lightweight service ping | `200 OK` |
| `GET /api/v1/health/live` | Process liveness probe | `200 OK` |
| `GET /api/v1/health/ready` | Deep readiness probe (Database, ML model, RAG corpus) | `200 OK` (or `503 Service Unavailable` if unready) |

### Example Probe Verifications:

#### Liveness Probe (`GET /api/v1/health/live`):
```bash
curl -i http://localhost:8000/api/v1/health/live
```
```json
{
  "status": "alive",
  "timestamp": "2026-08-30T17:18:35.000000"
}
```

#### Deep Readiness Probe (`GET /api/v1/health/ready`):
```bash
curl -i http://localhost:8000/api/v1/health/ready
```
```json
{
  "status": "ready",
  "timestamp": "2026-08-30T17:18:35.661165",
  "components": {
    "database": {
      "status": "healthy",
      "driver": "postgresql"
    },
    "ml_engine": {
      "status": "healthy",
      "model_version": "creditlens-risk-xgb-v1.2"
    },
    "rag_knowledge_base": {
      "status": "healthy",
      "chunks_indexed": 20
    },
    "configuration": {
      "status": "healthy",
      "environment": "production",
      "rate_limiting": true
    }
  }
}
```
*(Note: When running locally without PostgreSQL, `"driver"` will report `"sqlite"`).*

---

## 🛡️ Security, Validation & Statement Ingestion Scope

1. **Strict Token-Derived Identity**: Endpoints derive identity directly from cryptographically validated JWT claims (`current_user.id`). User isolation is strictly enforced across statements, transactions, risk models, and copilot history.
2. **Security Headers**: OWASP security headers automatically applied:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
3. **In-Memory Rate Limiter**: Protects auth (`/users/login`, `/users/register`), file uploads (`/statements/upload`), and generative copilot queries (`/copilot/query`).
4. **Statement Ingestion Capabilities & Limits**:
   - **Supported Formats**: CSV files (`.csv`) with recognized delimiters (`,`, `;`, `\t`, `|`) and text-based PDF statements (`.pdf` containing valid `%PDF-` headers and extractable text streams via `pypdf`).
   - **File Size Ceiling**: 10 MB maximum upload size (`MAX_UPLOAD_SIZE_BYTES`).
   - **Security Protections**: Null-byte and directory traversal sanitization (`../`), and executable binary header rejection (`MZ`, `\x7fELF`, Mach-O).
   - **Current Limitation**: Scanned image PDFs requiring Optical Character Recognition (OCR) are **not supported** in this release.
5. **Prompt Injection & Safety Guardrails**: LLM queries pass through adversarial prompt checks (`ignore previous`, `developer mode`, `system prompt`) and out-of-scope domain filters before dispatching. When Gemini API is unconfigured or unavailable, the system transparently utilizes a deterministic grounded RAG synthesis engine.

---

## ⚠️ Platform Disclaimer

CreditLens is an educational and analytical portfolio demonstration platform for credit risk modeling, transaction intelligence, and financial AI reasoning. It is **not** an official credit information company (such as CIBIL, Equifax, or Experian), does not perform licensed banking underwriting, and does not provide formal financial or legal advice.
