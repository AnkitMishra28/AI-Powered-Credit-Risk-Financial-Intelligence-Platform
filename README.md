# CreditLens — AI-Powered Credit Risk & Financial Intelligence Platform

CreditLens is an end-to-end financial intelligence platform that unifies deterministic credit health diagnostics, machine learning credit default risk prediction, TreeSHAP model explainability, automated banking statement ingestion, 16-category transaction intelligence, and a regulatory RAG assistant grounded in official Reserve Bank of India (RBI) directives and user financial telemetry.

---

## Problem

Modern financial assessment and personal credit management are often fragmented across disparate systems and opaque methodologies:

- **Siloed Data Signals**: Cashflow velocity, revolving credit utilization, debt obligations, and spending patterns are scattered across banks, credit card statements, and loan ledgers.
- **Black-Box Credit Scoring**: Traditional credit bureau scores provide high-level numbers without transparent mathematical factor attribution or actionable recovery paths.
- **Unstructured Statement Processing**: Banking statements (PDF and CSV) require manual ingestion, entity cleaning, and categorization before meaningful analytics can be computed.
- **Opaque Risk Models**: Machine learning risk classifiers are often deployed without explainability, making default predictions difficult for analysts and applicants to interpret.
- **Hallucination in Financial AI**: Generic LLMs hallucinate numbers and cite non-existent regulations when asked complex financial, APR compounding, or credit health questions.

---

## Solution

CreditLens bridges quantitative credit diagnostics, explainable machine learning, and grounded generative AI into a unified full-stack architecture:

- **Deterministic Credit Health Diagnostics**: Calculates an exact 0–1000 behavioral health score across 6 weighted components (payment consistency, revolving utilization, debt-to-income, account seasoning, emergency savings buffer, and monthly cashflow volatility).
- **Machine Learning Risk Prediction**: Evaluates applicant credit risk using an XGBoost gradient-boosted classifier trained on the benchmark South German Credit dataset with calibrated default probabilities.
- **TreeSHAP Explainability**: Deconstructs ML predictions into exact Shapley contribution values, identifying top positive drivers and warning signals.
- **Automated Statement Ingestion**: Ingests CSV and text-based PDF statements up to 10 MB, normalizes noisy merchant strings, performs SHA-256 fingerprint deduplication, and classifies transactions across a 16-category taxonomy.
- **Spending Intelligence & Anomaly Detection**: Tracks monthly cashflow velocity, identifies statistical category surges (>25% over rolling baseline), and detects recurring subscriptions.
- **Grounded Regulatory RAG Copilot**: Embeds official RBI Master Directions and credit standards into a semantic vector store, injecting deterministic user profile metrics into prompt templates for verified, zero-hallucination financial explanations.

---

## Key Features

- **JWT Authentication & Tenant Isolation**: Secure user registration, bcrypt password hashing, and user-scoped database isolation across statements, transactions, and AI inquiries.
- **PostgreSQL Persistence**: 12 relational tables managed with SQLAlchemy async engine (`asyncpg`) and version-controlled **Alembic** migrations.
- **Async FastAPI Architecture**: Modern, high-performance Python backend with Pydantic v2 schema validation and OpenAPI / Swagger documentation.
- **Deterministic 0–1000 Scoring**: Rule-based score engine with factor-by-factor attribution and 6-month historical tracking.
- **XGBoost Risk Classifier & SHAP**: Multi-tier risk categorization (`LOW RISK`, `MEDIUM RISK`, `HIGH RISK`) with local TreeSHAP waterfall values.
- **Multi-Format Ingestion**: Robust CSV/PDF statement parser with header normalization, transaction ledger extraction, and re-processing engine.
- **Statistical Anomaly & Subscription Detector**: Automated detection of category surges, transaction outliers ($\mu + 1.8\sigma$), and periodic payments.
- **Regulatory RAG Assistant**: Multi-document vector retrieval with cosine similarity over RBI regulatory frameworks and credit education standards.
- **Responsible AI Guardrails**: Prompt injection defense, domain boundary enforcement, source citation attribution, and metric preservation.
- **Production Health Probes**: Active `/health`, `/health/live`, and `/health/ready` endpoints verifying database, ML model, and vector store availability.
- **Modern Next.js 16 UI**: Responsive fintech dark-mode interface built with React 19, TypeScript, Tailwind CSS, Recharts, and Lucide icons.

---

## Why This Project Is Industry-Oriented

CreditLens was built to reflect real-world software engineering and fintech architectural best practices:

- **Layered Architecture & Separation of Concerns**: Clear separation between API routing, authentication dependencies, service logic, database repositories, ML pipelines, and vector retrieval.
- **Strict User Scoping & Tenant Isolation**: All financial records, statement uploads, risk scores, and copilot histories are strictly derived from verified JWT `current_user.id` claims.
- **Deterministic vs. Generative Boundary**: The LLM is never permitted to calculate, fabricate, or hallucinate financial numbers. All math is executed deterministically by the Python backend and injected into the LLM context as immutable facts.
- **Explainable Machine Learning**: Rather than treating default risk as an opaque probability, TreeSHAP values are extracted at inference time to explain feature impact.
- **Data Ingestion Hygiene**: Statement processing includes merchant normalization (stripping payment gateway noise), date format parsing, and SHA-256 transaction fingerprint deduplication.
- **Production Database Tooling**: Uses PostgreSQL with connection pooling, Alembic schema migrations, and async I/O.
- **Observability & Security Controls**: Request correlation IDs (`X-Request-ID`), latency tracking (`X-Process-Time`), OWASP security headers, sliding-window rate limiting, and structured logging.
- **Comprehensive Automated Testing**: 27 pytest integration tests covering authentication, tenant isolation, mathematical boundaries, ML inference, and RAG injection defense.

---

## Architecture

```
                               ┌────────────────────────────────────────┐
                               │           Next.js 16 Web App           │
                               │    (React 19 / TypeScript / Tailwind)  │
                               └───────────────────┬────────────────────┘
                                                   │
                                          REST APIs / JSON / JWT Bearer
                                                   │
                               ┌───────────────────▼────────────────────┐
                               │          FastAPI Backend API           │
                               │      (Pydantic v2 / AsyncPG / bcrypt)  │
                               └───────────┬───────────────┬────────────┘
                                           │               │
                    ┌──────────────────────┴───────────────┴──────────────────────┐
                    ▼                                                             ▼
        ┌───────────────────────────────┐                             ┌───────────────────────────────┐
        │     RAG Copilot & Knowledge   │                             │     ML Risk & Explainability  │
        │   (pgvector + Gemini 1.5)     │                             │   (Scikit-Learn / XGBoost)    │
        ├───────────────────────────────┤                             ├───────────────────────────────┤
        │ • RBI Master Directions       │                             │ • ColumnTransformer Pipeline  │
        │ • Semantic Vector Search      │                             │ • XGBoost Risk Classifier     │
        │ • Profile Metric Grounding    │                             │ • TreeSHAP Waterfall Attrib   │
        │ • Prompt Injection Defense    │                             │ • 0–1000 Credit Health Score  │
        │ • Source Citations & Insights │                             │ • Multi-Class Probabilities   │
        └───────────────┬───────────────┘                             └───────────────┬───────────────┘
                        │                                                             │
                        └──────────────────────────────┬──────────────────────────────┘
                                                       ▼
                                       ┌───────────────────────────────┐
                                       │     PostgreSQL (Port 5433)    │
                                       │  Users, Profiles, Statements, │
                                       │  Transactions, Chunks, Embeds │
                                       └───────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js `16.3.3` (App Router) | High-performance React framework with Turbopack |
| **Frontend UI** | React `19.2.8`, Tailwind CSS `v4` | Interactive components, responsive dark-mode fintech UI |
| **Visualizations** | Recharts `3.10.1`, Lucide React | Financial trend charts, allocation donuts, radial gauges |
| **Backend API** | FastAPI `0.115.x`, Uvicorn | Async ASGI framework with OpenAPI/Swagger documentation |
| **Validation & Security**| Pydantic v2, Python-JOSE, Passlib (bcrypt) | Strong typing, JWT token signing, password hashing |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.0, Asyncpg | Relational persistence, connection pooling, async I/O |
| **Database Migrations**| Alembic | Version-controlled schema migrations |
| **Machine Learning** | Scikit-Learn, XGBoost, SHAP, Joblib | Default risk classification, TreeSHAP explainability |
| **RAG & NLP** | Custom In-Memory / pgvector, Gemini API | Semantic vector search, prompt grounding, regulatory RAG |
| **Testing** | Pytest, AnyIO, TestClient | Automated backend unit and integration test suite |
| **Containerization** | Docker, Docker Compose | Multi-container local and deployment environment |

---

## Backend API

The FastAPI backend exposes versioned endpoints under `/api/v1`:

### Health & Observability
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status ping |
| `GET` | `/api/v1/health/live` | Process liveness probe |
| `GET` | `/api/v1/health/ready` | Deep readiness probe (Database, ML model, RAG vector store) |
| `GET` | `/api/v1/docs` | Interactive Swagger UI documentation |
| `GET` | `/api/v1/openapi.json` | OpenAPI 3.1.0 schema specification |

### Authentication & Users
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/users/register` | Registers new user, hashes password (bcrypt), returns JWT token |
| `POST` | `/api/v1/users/login` | Authenticates credentials, issues signed JWT access token |
| `GET` | `/api/v1/users/me` | Returns current user profile with token verification |
| `POST` | `/api/v1/users/logout` | Session invalidation |

### Credit Health & Risk Intelligence
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/credit-health/summary` | Computes user-scoped 0–1000 score, factor weights, and history |
| `POST` | `/api/v1/credit-health/calculate` | Calculates dynamic 0–1000 score for custom applicant parameters |
| `GET` | `/api/v1/risk/analysis` | User default risk category, calibrated probabilities, TreeSHAP values |
| `POST` | `/api/v1/risk/predict` | Predicts risk probabilities for custom 20-feature applicant profile |
| `GET` | `/api/v1/risk/model-info` | Model metadata, evaluation metrics, and feature importance |

### Statement Ingestion & Transactions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/statements/upload` | Multipart CSV/PDF statement ingestion, deduplication, and parsing |
| `GET` | `/api/v1/statements` | Lists uploaded financial statements with metadata |
| `GET` | `/api/v1/statements/{id}` | Retrieves specific statement processing summary |
| `GET` | `/api/v1/transactions` | Paginated, filterable canonical transaction ledger |
| `POST` | `/api/v1/transactions/reprocess` | Re-executes merchant normalization and taxonomy classification |

### Spending Intelligence & Copilot
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/spending/overview` | Monthly spending, net cashflow, anomalies, and recurring payments |
| `GET` | `/api/v1/spending/categories` | Category-level expenditure totals and percentages |
| `GET` | `/api/v1/spending/anomalies` | Statistical category surges and transaction outliers |
| `GET` | `/api/v1/spending/recurring` | Detected recurring charges, subscriptions, and EMIs |
| `POST` | `/api/v1/copilot/query` | Grounded RAG inquiry with citations and user profile telemetry |
| `GET` | `/api/v1/copilot/history` | User-scoped previous inquiry history |

---

## Frontend

The frontend is structured into modular Next.js 16 App Router pages and clean UI components:

- **Dashboard** (`/dashboard`): Primary command center rendering credit health gauge, risk distribution, spending breakdown, flagged anomalies, and recent transactions.
- **Credit Health** (`/credit-health`): Deep-dive into 0–1000 score trajectory, 6-factor weight breakdown, and transparent scoring methodology.
- **Risk Analysis** (`/risk-analysis`): Risk probability distributions, positive drivers, watch signals, and interactive TreeSHAP waterfall visualizations.
- **Spending Intelligence** (`/spending`): Monthly cashflow velocity, income vs. expense tracking, 16-category allocation donut, monthly trend chart, and recurring payments ledger.
- **Statement Ingestion** (`/statements`): Drag-and-drop CSV/PDF statement uploader with 7-stage processing stepper, statement history list, and extracted transaction table.
- **AI Copilot Workspace** (`/copilot`): 3-column financial research studio with live grounding matrix, conversation canvas, source citation drawer, and curated prompt chips.
- **Auth & Onboarding** (`/login`, `/onboarding`): User registration, credential login, 1-click recruiter demo access, and 4-step financial profile setup wizard.

---

## Machine Learning & Explainability

### Model Architecture
- **Dataset**: South German Credit Benchmark (*Groemping, 2020 / UCI Machine Learning Repository*).
- **Target Variable**: Binary credit default classification (`0`: Good Credit / Non-Default, `1`: Bad Credit / Default).
- **Preprocessing Pipeline**: `ColumnTransformer` with `StandardScaler` for continuous numerical features and `OneHotEncoder` for categorical attributes.
- **Classifier**: `XGBoostClassifier` calibrated to output default probability $P(\text{Default} \mid X)$.

### Test Evaluation Metrics (200 Stratified Test Samples)

| Metric | Logistic Regression (Baseline) | XGBoost Classifier (Primary) |
| :--- | :---: | :---: |
| **Accuracy** | 75.00% | **75.50%** |
| **Precision (Default Class)** | 55.68% | **57.75%** |
| **Recall (Default Class)** | **81.67%** | 68.33% |
| **F1-Score** | 66.22% | **62.60%** |
| **ROC-AUC** | 80.80% | **79.87%** |
| **PR-AUC** | 64.39% | **65.96%** |
| **Brier Score (Calibration)** | 0.1814 | **0.1715** |

*Artifacts saved under `backend/app/ml/artifacts/`: `model.joblib`, `preprocessor.joblib`, `baseline.joblib`, `metadata.json`.*

### Explainability with TreeSHAP
Using TreeSHAP (`shap.TreeExplainer`), CreditLens computes local feature attribution for individual applicants. Features such as checking account liquidity, installment burden, credit history status, and duration produce exact positive and negative Shapley deltas that explain why a specific risk tier was assigned.

---

## RAG & AI Copilot

The CreditLens Copilot uses Retrieval-Augmented Generation (RAG) to provide regulatory and educational guidance:

1. **Authoritative Knowledge Base**: Ingests official regulatory documents, including:
   - *RBI Master Direction – Credit Card and Debit Card Issuance and Conduct Directions, 2022* (Minimum Amount Due rules, compounding finance charge disclosures, billing cycles).
   - *RBI Guidance on APR Compounding & Revolving Debt* (Grace period revocation on unpaid balances).
   - *Credit Utilization & Revolving Debt Optimization Framework* (<30% utilization threshold mechanics).
   - *Credit Scoring Mechanics & Delinquency Impact Standards*.
   - *Reserve Bank – Integrated Ombudsman Scheme, 2021*.
2. **Semantic Vector Search**: Chunks documents with overlap, generates vector embeddings, and performs cosine similarity search (pgvector / in-memory index) to retrieve top-k relevant regulatory passages.
3. **Deterministic Profile Grounding**: Injects verified user telemetry (e.g. utilization ratio, payment consistency, monthly outflow, anomaly signals) into structured prompt templates.
4. **Synthesis with Gemini / Fallback Engine**: Generates structured responses with verified source citations, key takeaways, and recommended follow-up questions.
5. **Safety Guardrails**: Intercepts prompt injection attacks and out-of-domain queries, preventing hallucination.

---

## Data Model

CreditLens uses 12 PostgreSQL relational entities:

- `users`: Account identity, email, hashed password, and demo status.
- `financial_profiles`: Monthly net income, aggregate credit limits, revolving balances, and loan EMIs.
- `loans`: Individual debt obligations, interest rates, and tenures.
- `statements`: Uploaded statement metadata, status, parsed transaction counts, and debit/credit totals.
- `transactions`: Normalized canonical ledger entries with merchant names, categories, amounts, hashes, and anomaly flags.
- `documents`: Regulatory knowledge base documents.
- `document_chunks`: Chunked text with vector embeddings and source metadata.
- `credit_health_snapshots`: Historical credit health score records and tiers.
- `credit_health_factors`: Factor-level scores and weights for snapshots.
- `credit_health_history`: Monthly score and utilization trajectory points.
- `risk_predictions`: Persisted ML predictions, probabilities, and SHAP contributions.
- `copilot_queries`: Persisted user queries, assistant responses, citations, and conversation IDs.

---

## Security & Reliability

- **Cryptographic Password Hashing**: Passwords are never stored in plaintext; hashed using `bcrypt` with unique salts.
- **Signed JWT Session Tokens**: Stateless authentication using signed `HS256` tokens with configurable expiration.
- **Data Isolation**: Strict query-level filtering by authenticated user ID.
- **Input Validation**: Strict Pydantic schemas validating all incoming request payloads and file sizes.
- **Security Headers**: Standard OWASP protection headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Strict-Transport-Security`).
- **CORS Protection**: Explicitly configured allowed origins (`http://localhost:3000`).
- **Rate Limiting**: Sliding-window rate limiters protecting authentication, upload, and AI query routes against brute-force attacks.
- **Zero Secrets in Git**: All sensitive keys and configuration parameters are loaded exclusively through environment variables.

---

## Testing & Verification

The platform is continuously validated through automated testing and strict compilation checks:

- **Backend Pytest Suite**: 27 passed tests in 5.43s covering authentication, tenant isolation, statement deduplication, credit scoring, ML risk prediction, TreeSHAP explainability, RAG retrieval, prompt injection defense, and rate limiting.
- **Frontend TypeScript Check**: 0 type errors across all application routes and service layers.
- **Frontend ESLint Check**: 0 errors, 0 warnings.
- **Next.js Production Build**: Successfully compiled and prerendered all 10 App Router routes.
- **Live Health Probes**: Verified `/api/v1/health`, `/api/v1/health/live`, `/api/v1/health/ready`, `/api/v1/docs`, and `/api/v1/openapi.json`.

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- Docker Desktop (for PostgreSQL)

### 1. Database Setup (Docker)
```bash
# Start PostgreSQL on host port 5433
docker compose up -d db
```

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\activate

# Create & activate virtual environment (Linux/macOS)
# python3 -m venv .venv
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Run automated test suite
pytest -q

# Start FastAPI backend server on port 8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/api/v1/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run linting and production build
npm run lint
npm run build

# Start Next.js development server on port 3000
npm run dev
```
Frontend web application will be live at `http://localhost:3000`.

---

## Environment Variables

Environment variables are managed through `.env` files (templates provided in `.env.example`):

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Application environment | `development` / `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://postgres:postgrespassword@localhost:5433/creditlens` |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens | `64-character hex string` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `10080` (7 days) |
| `BACKEND_CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `GEMINI_API_KEY` | Optional Google Gemini API key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini model variant | `gemini-1.5-pro` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## Project Structure

```
.
├── backend/
│   ├── alembic/                 # Alembic migration scripts and environment
│   ├── app/
│   │   ├── api/v1/              # Versioned API routes (auth, risk, spending, copilot)
│   │   ├── core/                # Config, security, JWT, rate limiting, logging
│   │   ├── db/                  # Session management, base models, repositories
│   │   ├── ingestion/           # Statement parsing (CSV/PDF), normalizer, taxonomy
│   │   ├── ml/                  # XGBoost model, preprocessor, SHAP explainer
│   │   │   └── artifacts/       # Saved joblib models and metadata.json
│   │   ├── models/              # SQLAlchemy ORM table definitions
│   │   ├── rag/                 # Vector store, chunker, Gemini client, prompt builder
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── services/            # Business logic (credit health, risk, spending)
│   ├── tests/                   # Pytest test cases
│   ├── Dockerfile               # Production multi-stage Dockerfile
│   ├── requirements.txt         # Python dependencies
│   └── test_api.py              # Integration test suite
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js 16 App Router pages
│   │   │   ├── (auth)/          # Login & Onboarding routes
│   │   │   ├── copilot/         # AI Copilot workspace
│   │   │   ├── credit-health/   # Credit Health diagnostics
│   │   │   ├── dashboard/       # Main overview dashboard
│   │   │   ├── risk-analysis/   # ML Risk & SHAP view
│   │   │   ├── spending/        # Cashflow & anomaly intelligence
│   │   │   └── statements/      # Statement upload & ledger
│   │   ├── components/          # Reusable fintech & layout components
│   │   ├── context/             # React Auth and CreditLens context providers
│   │   ├── services/            # Centralized API clients and data mappers
│   │   └── types/               # TypeScript interfaces and API DTO models
│   ├── Dockerfile               # Production multi-stage Next.js Dockerfile
│   └── package.json             # Node dependencies and build scripts
├── .github/
│   └── workflows/ci.yml         # GitHub Actions CI/CD pipeline
├── docker-compose.yml           # Full-stack container orchestration
├── .env.example                 # Root environment template
└── README.md                    # Project documentation
```

---

## Engineering Highlights

- **Full-Stack Type Safety**: End-to-end type safety from Python Pydantic DTOs through central frontend service mappers into TypeScript interfaces.
- **Zero-Hallucination Guardrails**: Strict architectural barrier ensuring the LLM synthesizes only verified database telemetry and official regulatory documents.
- **Robust Parsing & Normalization**: Custom entity cleaning pipeline converting messy payment gateway descriptions into structured merchant entries.
- **Explainable AI Integration**: Native integration of TreeSHAP delivering transparent feature impact alongside gradient-boosted probability scores.
- **Strict Tenant Isolation**: JWT-scoped database operations preventing cross-tenant data leakage.

---

## Limitations & Production Considerations

CreditLens is a functional engineering platform and portfolio demonstration. Deploying this platform for live banking customers or consequential credit decisions in production would require several additional operational and compliance controls:

- **Model Governance & Fairness Audits**: The XGBoost classifier is trained on the South German Credit benchmark dataset. Commercial credit underwriting requires training on compliant, large-scale credit bureau datasets with strict fair-lending, demographic parity, and disparate impact audits (e.g. ECOA, FCRA).
- **Production Key Management**: Integration with cloud secrets managers (AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault) rather than environment files.
- **Managed Vector Infrastructure**: Migration from local in-memory vector indexing to managed vector databases (Pinecone, Qdrant, or Cloud pgvector) with dynamic document re-indexing pipelines.
- **Enterprise Identity & MFA**: Integration with OAuth2 / OIDC identity providers, multi-factor authentication (MFA), and automated refresh token rotation.
- **Disaster Recovery & High Availability**: Managed multi-AZ PostgreSQL deployments with automated automated point-in-time recovery (PITR) backups and read replicas.
- **Compliance & Privacy Frameworks**: Formal compliance with financial data security standards (SOC 2 Type II, ISO 27001, PCI-DSS for card data, and GDPR/DPDP for PII privacy).
- **Model Monitoring & Drift Detection**: Continuous inference telemetry to monitor covariate data drift, concept drift, and performance degradation over time.

---

## Roadmap

- [x] Phase 1–2: Next.js 16 Fintech Interface & Initial Layouts
- [x] Phase 3: XGBoost ML Risk Engine, TreeSHAP Explainability & Credit Health Scoring
- [x] Phase 4: Financial Statement Ingestion (CSV/PDF), Normalizer & Anomaly Detector
- [x] Phase 5: RAG Regulatory Copilot with RBI Master Directions & Grounded Prompts
- [x] Phase 6: PostgreSQL Database Layer, JWT Authentication & Strict Tenant Isolation
- [x] Phase 7: Production-Readiness Audit, Safety Hardening & E2E Validation
- [x] Phase 8: Containerized Topology, CI/CD Pipeline & GitHub Release Finalization
- [ ] Phase 9: Managed Cloud Infrastructure Deployment & Secret Manager Integration
- [ ] Phase 10: Production Model Governance, Continuous Drift Telemetry & Real-Time Open Banking API Connectors

---

## Responsible AI & Regulatory Disclaimer

CreditLens is developed as an educational, pattern diagnostics, and portfolio engineering project.
- CreditLens is **NOT a credit reporting agency or credit bureau (such as CIBIL, Equifax, or Experian)**.
- The **CreditLens Credit Health Score** is an educational mathematical index and does not represent official credit underwriting.
- Outputs from CreditLens machine learning models and copilot insights do not constitute financial, investment, or legal advice.
