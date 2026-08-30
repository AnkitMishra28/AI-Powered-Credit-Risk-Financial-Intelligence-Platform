# CreditLens

> **AI-Powered Credit Risk & Financial Intelligence Platform**  
> *Transforming banking statements, credit lines, and cashflow data into explainable credit health metrics, machine learning risk signals, and verified AI insights.*

---

## Project Overview

CreditLens is a production-grade full-stack fintech platform designed to bridge the gap between traditional quantitative credit assessment and modern explainable artificial intelligence.

Unlike generic finance dashboards or simple LLM wrappers, CreditLens enforces strict architectural boundaries and user isolation:

```
DETERMINISTIC INGESTION PIPELINE ──►  Statement Ingestion (CSV/PDF) ➔ Normalization ➔ 16-Category Taxonomy
           │
           ▼
PERSISTENT PRODUCTION DATA LAYER ──►  PostgreSQL / AsyncPG + Alembic Migrations (Strict User Scoping & Deduplication)
           │
           ▼
DETERMINISTIC FINANCIAL LOGIC    ──►  Exact 0–1000 Credit Health Score & Statistical Anomalies (Rule-Based)
           │
           ▼
MACHINE LEARNING (XGBoost)       ──►  Calibrated Default Risk Probabilities (Binary Good/Bad mapped to Tiers)
           │
           ▼
EXPLAINABILITY (TreeSHAP)        ──►  Deterministic Feature Attribution Deltas & Positive/Watch Signals
           │
           ▼
RAG KNOWLEDGE RETRIEVAL          ──►  pgvector Semantic Vector Search over Regulatory Directives (RBI)
           │
           ▼
LLM SYNTHESIS & INSIGHTS         ──►  Natural Language Grounded Explanations (Zero Hallucinated Numbers)
```

---

## System Architecture

```
                       ┌────────────────────────────────────────┐
                       │           Next.js 16 Web App           │
                       │     React 19 / TypeScript / Tailwind   │
                       └───────────────────┬────────────────────┘
                                           │
                                  REST APIs / JSON / JWT Bearer
                                           │
                       ┌───────────────────▼────────────────────┐
                       │          FastAPI Backend API           │
                       │      Pydantic v2 / AsyncPG / bcrypt    │
                       └───────────┬───────────────┬────────────┘
                                   │               │
            ┌──────────────────────┴───────────────┴──────────────────────┐
            ▼                                                             ▼
┌───────────────────────────────┐                             ┌───────────────────────────────┐
│     RAG Copilot & Knowledge   │                             │     ML Risk & Explainability  │
│   (pgvector + Gemini 1.5)     │                             │   (Scikit-learn / XGBoost)    │
├───────────────────────────────┤                             ├───────────────────────────────┤
│ • RBI Master Directions       │                             │ • Feature Engineering Engine  │
│ • Semantic Vector Search      │                             │ • ColumnTransformer Pipeline  │
│ • User Metric Grounding       │                             │ • XGBoost Classifier          │
│ • Prompt Injection Defense    │                             │ • TreeSHAP Explainability     │
│ • Structured JSON Output      │                             │ • 0–1000 Credit Health Score  │
└───────────────┬───────────────┘                             └───────────────┬───────────────┘
                │                                                             │
                └──────────────────────────────┬──────────────────────────────┘
                                               ▼
                               ┌───────────────────────────────┐
                               │     PostgreSQL + pgvector     │
                               │  Users, Statements, Metrics,  │
                               │  Transactions, Chunks, Embeds │
                               └───────────────────────────────┘
```

---

## Phase 6: Production Data Layer, Real Authentication & User-Scoped Intelligence

### 1. Multi-Tenant User Isolation & Security Guarantees
- **Authentication Lifecycle**: Built on native `bcrypt` cryptographic password hashing and signed JSON Web Tokens (`HS256`) with expiration.
- **Strict User Scoping**: Statements, transactions, snapshots, XGBoost risk predictions, and Copilot conversational histories are tied to indexed `user_id` foreign keys (`ondelete="CASCADE"`). User A can never read or query User B's financial artifacts.
- **Transaction Fingerprint Deduplication**: Prevents duplicate entries on re-uploading identical statements via SHA-256 fingerprint matching (`{iso_date}_{merchant}_{amount}_{type}`).
- **Async Database Architecture**: Uses SQLAlchemy 2.0 async engine (`asyncpg` for PostgreSQL in Docker/Cloud, automatic `sqlite+aiosqlite` standalone local fallback).
- **Database Migrations**: Version-controlled migration schemas managed through **Alembic** (`backend/alembic/versions/4a3e1f91a362_001_phase6_initial_schema.py`).

---

## Phase 5: RAG-Powered Financial Copilot & Knowledge Retrieval

### 1. Authoritative Knowledge Base
- **Legitimate Regulatory & Educational Sources**:
  - `doc-rbi-cards-2022`: *RBI Master Direction – Credit Card and Debit Card – Issuance and Conduct Directions, 2022* (Minimum Amount Due disclosure mandates, compounding finance charges, billing cycles, unsolicited card bans).
  - `doc-rbi-apr-finance`: *RBI Guidance on APR Compounding & Minimum Payment Traps* (Daily periodic rate computation, loss of the 20–50 day interest-free grace period upon revolving balances).
  - `doc-credit-utilization-guide`: *Credit Utilization Ratio & Revolving Debt Management Framework* (Optimal $<30\%$ threshold, mid-cycle payments before statement generation dates).
  - `doc-credit-health-mechanics`: *Credit Scoring Mechanics & Delinquency Impact Standards* (5 weighted pillars, seasoning, hard inquiries vs soft checks).
  - `doc-rbi-ombudsman-grievance`: *Reserve Bank - Integrated Ombudsman Scheme, 2021* (30-day escalation windows, unauthorized digital transaction zero/limited liability).
  - `doc-debt-cashflow-optimization`: *Personal Cashflow Velocity & Debt Repayment Strategies* (Debt Avalanche vs Snowball, 50/30/20 budget allocations).

### 2. Retrieval & Grounding Pipeline
```
User Question
    ↓
Text Sanitization & Tokenization
    ↓
384-Dim Semantic Vector Embedding
    ↓
Vector Similarity Search (Exact Cosine / pgvector)
    ↓
Top-K Chunks + Similarity Threshold (>0.40)
    ↓
Structured User Metrics Injection (Score, Tier, Utilization, DTI, Anomalies, Cashflow)
    ↓
Grounded System Prompt with Anti-Hallucination & Anti-Injection Guardrails
    ↓
Gemini 1.5 Pro / Flash Structured Synthesis
    ↓
Response Validation + Traceable Source Citations + Key Takeaways
```

### 3. Safety, Responsible AI & Prompt Injection Guardrails
- **Prompt Injection Defense**: Input questions attempting system prompt override or key exfiltration (e.g. `"Ignore previous instructions"`) are intercepted and rejected, preserving security boundaries.
- **Out-of-Scope Detection**: Queries outside verified financial domains return explicit capability boundaries without hallucinating facts.
- **Strict Metric Preservation**: The LLM is never permitted to recalculate or fabricate financial numbers; deterministic backend calculations remain authoritative.

---

##  Phase 4: Financial Statement & Transaction Intelligence Subsystem

- **Multi-Format Ingestion**: Supports `.csv` and text-based `.pdf` statements up to 10 MB.
- **CSV & PDF Parsers** ([`csv_parser.py`](backend/app/ingestion/csv_parser.py), [`pdf_parser.py`](backend/app/ingestion/pdf_parser.py)): Header mapping, date normalization, currency cleaning, and SHA-256 deduplication.
- **Merchant Entity Normalizer** ([`normalizer.py`](backend/app/ingestion/normalizer.py)): Strips gateway prefixes (`UPI-`, `POS `, `IMPS-`, `BILLDESK`) and noise suffixes, mapping to clean merchant identities while preserving `original_description`.
- **16-Category Taxonomy Engine** ([`categorization.py`](backend/app/ingestion/categorization.py)): Classifies transactions with confidence scoring and classification method provenance.
- **Statistical Anomaly Detector** ([`anomaly_detector.py`](backend/app/ingestion/anomaly_detector.py)): Category velocity surges ($> 25\%$) and transaction outliers ($> \mu + 1.8\sigma$).
- **Recurring Payment Detector** ([`recurring_detector.py`](backend/app/ingestion/recurring_detector.py)): Subscriptions and periodic EMIs.

---

## Phase 3: Machine Learning & Credit Health Engine

### 1. Public Benchmark Dataset & Classification Framing
- **Dataset**: South German Credit (*Groemping, 2020 / UCI Machine Learning Repository / OpenML `credit-g`*).
- **Binary Target**: `0` = Good Credit / Non-Default ($700$ records), `1` = Bad Credit / Default ($300$ records).
- **Framing**: The XGBoost model predicts the underlying binary default probability $P(\text{Default} \mid X)$. CreditLens maps this calibrated probability into presentation tiers (`LOW RISK`, `MEDIUM RISK`, `HIGH RISK`) as a business presentation layer.

### 2. Evaluation Metrics (200 Stratified Test Samples)

| Metric | Logistic Regression (Baseline) | XGBoost Classifier (Primary) |
| :--- | :---: | :---: |
| **Accuracy** | 75.00% | **75.50%** |
| **Precision (Minority / Default)** | 55.68% | **57.75%** |
| **Recall (Minority / Default)** | **81.67%** | 68.33% |
| **F1-Score** | 66.22% | **62.60%** |
| **ROC-AUC** | 80.80% | **79.87%** |
| **PR-AUC** | 64.39% | **65.96%** |
| **Brier Score (Calibration)** | 0.1814 | **0.1715** |

---

## Local Setup & Execution Commands

### 1. Backend Setup & Ingestion Tests
```bash
cd backend

# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Run complete 24-test backend, DB, Auth, ML, Ingestion & RAG test suite
python test_api.py

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **User Registration**: `POST http://localhost:8000/api/v1/users/register`
- **User Login**: `POST http://localhost:8000/api/v1/users/login`
- **Current Profile**: `GET http://localhost:8000/api/v1/users/me`
- **Copilot RAG Query**: `POST http://localhost:8000/api/v1/copilot/query`
- **Statement Upload**: `POST http://localhost:8000/api/v1/statements/upload`
- **Transactions Ledger**: `GET http://localhost:8000/api/v1/transactions`
- **Spending Analytics**: `GET http://localhost:8000/api/v1/spending/overview`

### 2. Frontend Execution
```bash
cd frontend

# Install dependencies
npm install

# Run TypeScript & Next.js production build
npm run build

# Run ESLint check
npm run lint

# Start development server on port 3000
npm run dev
```

- **Sign In / Registration**: [http://localhost:3000/login](http://localhost:3000/login)
- **Copilot Workspace**: [http://localhost:3000/copilot](http://localhost:3000/copilot)
- **Statement Ingestion**: [http://localhost:3000/statements](http://localhost:3000/statements)
- **Spending Intelligence**: [http://localhost:3000/spending](http://localhost:3000/spending)
- **Main Command Center**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## API Endpoints Catalog

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/users/register` | Registers new user, hashes password (bcrypt), returns JWT Bearer token |
| `POST` | `/api/v1/users/login` | Authenticates credentials, issues signed JWT token with claims |
| `GET` | `/api/v1/users/me` | Returns current user profile with token session verification |
| `POST` | `/api/v1/users/logout` | Session invalidation |
| `POST` | `/api/v1/copilot/query` | RAG financial intelligence inquiry with verified citations & metric grounding |
| `GET` | `/api/v1/copilot/history` | Retrieves user-scoped previous inquiries and grounded responses |
| `POST` | `/api/v1/statements/upload` | Ingests CSV/PDF statement, normalizes merchants, categorizes transactions, deduplicates |
| `GET` | `/api/v1/statements` | Lists uploaded financial statements with file metadata and totals |
| `GET` | `/api/v1/statements/{id}` | Retrieves specific statement processing status and summary |
| `GET` | `/api/v1/health` | Lightweight service health ping |
| `GET` | `/api/v1/health/live` | Kubernetes/Docker process liveness probe |
| `GET` | `/api/v1/health/ready` | Deep readiness probe (Database, ML model, RAG vector store) |
| `GET` | `/api/v1/transactions` | Paginated, filterable canonical transaction ledger (search, category, type) |
| `POST` | `/api/v1/transactions/reprocess` | Re-executes entity normalization and category taxonomy across transactions |
| `GET` | `/api/v1/spending/overview` | Deterministic cashflow metrics, category breakdowns, anomalies, and recurring items |
| `GET` | `/api/v1/spending/categories` | Category-level expenditure totals and percentages |
| `GET` | `/api/v1/spending/anomalies` | Statistically detected category surges and transaction outliers |
| `GET` | `/api/v1/spending/recurring` | Detected recurring charges, streaming subscriptions, and loan EMIs |
| `GET` | `/api/v1/risk/analysis` | Real XGBoost default risk probabilities and TreeSHAP feature attributions |
| `POST` | `/api/v1/risk/predict` | Predicts default risk probabilities for custom applicant profiles |
| `GET` | `/api/v1/risk/model-info` | Model metadata, evaluation metrics, and feature catalog |
| `GET` | `/api/v1/credit-health/summary` | Computes deterministic 0–1000 Credit Health Score and 5-factor breakdown |
| `POST` | `/api/v1/credit-health/calculate` | Calculates dynamic 0–1000 score for custom applicant inputs |

---

## 🚢 Phase 8: Production Deployment, CI/CD, Observability & Release Engineering

### Production Stack Highlights
1. **Containerized Production Topology**: Full-stack multi-stage Dockerfiles for Next.js (Node 20 standalone) and FastAPI (Python 3.11-slim with non-root security), orchestrated via `docker-compose.yml` with PostgreSQL `pgvector:pg16`.
2. **Kubernetes & Cloud Probes**: Active `/health/live` and `/health/ready` endpoints verifying database connectivity, ML model availability, and RAG vector store status.
3. **Observability & Request Correlation**: `X-Request-ID` correlation tracking, latency tracking (`X-Process-Time`), and sensitive data log sanitization.
4. **Security & Abuse Protection**: OWASP security headers (`nosniff`, `DENY` frame options, XSS protection, HSTS) and sliding-window rate limiting on login, registration, uploads, and AI queries.
5. **Continuous Integration**: `.github/workflows/ci.yml` running automated Python bytecode verification, Alembic migrations, 27 Pytest integration tests, Next.js ESLint, and production build checks.
6. **Documentation & Release Checklist**: Complete [`DEPLOYMENT.md`](./DEPLOYMENT.md) and [`docs/PRODUCTION_CHECKLIST.md`](./docs/PRODUCTION_CHECKLIST.md).

---

## ⚖️ Responsible AI & Regulatory Disclaimer

CreditLens is developed as an educational, pattern diagnostics, and portfolio engineering project. 
- CreditLens is **NOT a credit reporting agency or bureau (such as CIBIL, Equifax, or Experian)**.
- The **CreditLens Credit Health Score** is an educational mathematical index and does not represent official credit underwriting.
- Outputs from CreditLens machine learning models and copilot insights do not constitute financial, investment, or legal advice.
