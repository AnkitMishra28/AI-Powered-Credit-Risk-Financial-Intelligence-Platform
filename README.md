# CreditLens

> **AI-Powered Credit Risk & Financial Intelligence Platform**  
> *Transforming complex banking statements, credit lines, and cashflow data into explainable credit health metrics, machine learning risk signals, and verified AI insights.*

---

## 📌 Project Overview

CreditLens is a full-stack fintech platform designed to bridge the gap between traditional quantitative credit assessment and modern explainable artificial intelligence.

Unlike generic finance dashboards or simple chatbot wrappers, CreditLens enforces strict separation between **deterministic numerical pipelines** and **generative language models**:
1. **Mathematical Financial Metrics** (e.g. 68% credit utilization, 31.2% DTI, 94% on-time payment ratio) are calculated by deterministic Python and statistical engines.
2. **Predictive Credit Risk** is estimated via Scikit-Learn/XGBoost multi-class classifiers with probability distributions (Low, Medium, High Risk) and TreeSHAP explainability attributions.
3. **Generative Natural-Language Explanations** are synthesized strictly on top of structured facts and verified regulatory documents retrieved via PostgreSQL + pgvector vector search.
4. **Transparent Governance**: CreditLens explicitly disclaims that it is **NOT CIBIL / Experian** and is designed strictly for financial intelligence, education, and behavioral diagnostics — not regulated credit underwriting or investment advice.

---

## 🏛️ System Architecture

```
                       ┌────────────────────────────────────────┐
                       │           Next.js 16 Web App           │
                       │     React 19 / TypeScript / Tailwind   │
                       └───────────────────┬────────────────────┘
                                           │
                                  REST APIs / JSON
                                           │
                       ┌───────────────────▼────────────────────┐
                       │          FastAPI Backend API           │
                       │        Pydantic v2 / AsyncPG           │
                       └───────────┬───────────────┬────────────┘
                                   │               │
            ┌──────────────────────┘               └──────────────────────┐
            ▼                                                             ▼
┌───────────────────────────────┐                             ┌───────────────────────────────┐
│     ML Risk & Anomaly         │                             │         RAG Pipeline          │
│   (Scikit-learn / XGBoost)    │                             │    (pgvector + Gemini 1.5)    │
├───────────────────────────────┤                             ├───────────────────────────────┤
│ • Feature Engineering Engine  │                             │ • Regulatory Embeddings       │
│ • Multi-Class Risk Model      │                             │ • Semantic Vector Search      │
│ • TreeSHAP Explainability     │                             │ • Grounded Fact Prompting     │
└───────────────┬───────────────┘                             └───────────────┬───────────────┘
                │                                                             │
                └──────────────────────────────┬──────────────────────────────┘
                                               ▼
                               ┌───────────────────────────────┐
                               │     PostgreSQL + pgvector     │
                               │  Users, Statements, Metrics,  │
                               │  Predictions, Knowledge Base  │
                               └───────────────────────────────┘
```

---

## 🚀 Current Implementation Status (Phase 1 Complete)

| Component | Status | Description |
| :--- | :--- | :--- |
| **Design System & Tokens** | ✅ Completed | Deep slate / obsidian fintech design system with emerald/sapphire accents, responsive layouts, accessible typography, and custom UI suite |
| **Frontend Routes** | ✅ Completed | All 9 primary views: `/`, `/login`, `/onboarding`, `/dashboard`, `/credit-health`, `/risk-analysis`, `/spending`, `/copilot`, `/settings` |
| **Component Architecture** | ✅ Completed | Reusable cards, score gauges, factor breakdown meters, risk probability distribution, transaction ledger, and source citation panels |
| **Demo Mode Profile** | ✅ Completed | 1-click Recruiter / Interviewer Demo Mode preloaded with synthetic portfolio metrics (Alex Mercer, ₹65k income, ₹49k spend, 68% util, 742 health score) |
| **Backend REST Foundation** | ✅ Completed | FastAPI v0.115+ application with `/health`, `/credit-health`, `/risk`, `/spending`, `/copilot`, `/users` endpoints |
| **Database Architecture** | ✅ Completed | SQLAlchemy 2.0 async models for Users, Profiles, Transactions, Loans, Metrics, Predictions, Documents, Chunks, and Insights |
| **ML / SHAP Scaffolding** | 🔄 Architecture Ready | Feature extractor, model pipeline interfaces, and explainability containers created (Phase 2 connection) |
| **RAG / pgvector Scaffolding**| 🔄 Architecture Ready | Embedding generators, pgvector retriever contracts, and prompt grounding schemas created (Phase 2 connection) |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Custom Fintech Tokens
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

### Backend
- **Framework**: FastAPI + Uvicorn (ASGI)
- **Validation**: Pydantic v2 + Pydantic-Settings
- **ORM & Database**: SQLAlchemy 2.0 (AsyncIO) + Alembic
- **Driver**: asyncpg / psycopg2 (PostgreSQL + pgvector ready)
- **HTTP Client**: HTTPX

### Infrastructure & Deployment Ready
- **Containerization**: Docker & `docker-compose.yml` (pgvector/pgvector:pg16 + FastAPI)
- **Database Compatibility**: Neon PostgreSQL / Supabase / AWS RDS
- **Hosting Targets**: Vercel (Frontend), Render / Railway / AWS (Backend)

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js v18+ (tested on Node v24)
- Python 3.10+ (tested on Python 3.14)
- npm or pnpm

### 1. Clone & Environment Setup
```bash
git clone <repo-url>
cd "AI-Powered Credit Risk & Financial Intelligence Platform"

# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Root: [http://localhost:8000](http://localhost:8000)
- Interactive Swagger Docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 4. Run Backend Integration Tests
```bash
cd backend
python test_api.py
```

### 5. Run Frontend Production Build & Lint Checks
```bash
cd frontend
npm run lint
npm run build
```

---

## 🗺️ Project Structure

```
├── .env.example                  # Root environment template
├── .gitignore                    # Git ignore rules
├── docker-compose.yml            # Docker stack (pgvector + backend)
├── package.json                  # Root monorepo helper scripts
├── README.md                     # Master documentation
│
├── frontend/                     # Next.js 16 Application
│   ├── src/
│   │   ├── app/                  # App Router Pages
│   │   │   ├── page.tsx          # SaaS Landing Page
│   │   │   ├── login/page.tsx    # Authentication Portal
│   │   │   ├── onboarding/page.tsx # 4-Step Setup Wizard
│   │   │   ├── dashboard/page.tsx # Main Financial Intelligence Command Center
│   │   │   ├── credit-health/page.tsx # Credit Health Diagnostics (0-1000)
│   │   │   ├── risk-analysis/page.tsx # ML Risk Assessment & Explainability
│   │   │   ├── spending/page.tsx # Spending Velocity & Anomaly Detection
│   │   │   ├── copilot/page.tsx  # Ask CreditLens 3-Column Studio
│   │   │   ├── settings/page.tsx # Data Governance & Privacy
│   │   │   └── globals.css       # Design System Tokens
│   │   ├── components/
│   │   │   ├── ui/               # Button, Badge, Card, Input, ProgressBar, Modal, RadialGauge
│   │   │   ├── layout/           # AppLayout, Sidebar, Header, MobileNav, DemoBanner, PageHeader
│   │   │   └── fintech/          # MetricCard, ScoreCard, FactorBreakdown, RiskDistribution,
│   │   │                         # AnomalyCard, TransactionTable, CopilotChat, SourceCitationPanel
│   │   ├── context/              # AuthContext, CreditLensContext
│   │   ├── lib/                  # demo-data, constants, utils
│   │   ├── services/             # API client, credit, risk, spending, copilot, auth services
│   │   └── types/                # TypeScript domain definitions
│   ├── package.json
│   └── tsconfig.json
│
└── backend/                      # FastAPI Python Application
    ├── app/
    │   ├── api/v1/               # Versioned REST endpoints (health, risk, credit, spending, copilot)
    │   ├── core/                 # Config (pydantic-settings), logging
    │   ├── db/                   # Async session & Base models
    │   ├── models/               # SQLAlchemy models (User, Profile, Transaction, Risk, etc.)
    │   ├── schemas/              # Pydantic data contracts
    │   ├── services/             # Business logic service abstractions
    │   ├── ml/                   # Feature extraction & XGBoost/SHAP scaffolding
    │   ├── rag/                  # pgvector & Gemini retriever scaffolding
    │   └── main.py               # FastAPI application entrypoint
    ├── Dockerfile
    ├── requirements.txt
    └── test_api.py               # Synchronous integration test suite
```

---

## 🔮 Phase 2 Roadmap & Next Steps

1. **Transaction Ingestion & Rule-Based Feature Engine**:
   - PDF statement parsing (bank/card statements) and transaction categorization.
   - Deterministic feature matrix calculation for revolving utilization, debt ratios, and spending velocity.

2. **Scikit-Learn / XGBoost Risk Model**:
   - Train multi-class default risk prediction model on synthetic/anonymized lending credit datasets.
   - Connect TreeSHAP explainer to generate true mathematical feature attributions.

3. **RAG Vector Search & Gemini 1.5 Grounding**:
   - Apply PostgreSQL `pgvector` migration.
   - Ingest RBI Master Directions 2022 and credit regulation circulars into 384-dimensional chunk embeddings.
   - Wire Gemini 1.5 Pro to generate natural language answers strictly referencing retrieved regulatory chunks and structured pipeline inputs.

---

## ⚖️ License & Disclaimer

CreditLens is developed as an educational, portfolio-grade open-source project. CreditLens is **not a credit bureau (CIBIL/Experian)** and does not provide formal credit ratings or financial advice.
