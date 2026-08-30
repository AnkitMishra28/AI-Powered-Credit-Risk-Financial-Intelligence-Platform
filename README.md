# CreditLens

> **AI-Powered Credit Risk & Financial Intelligence Platform**  
> *Transforming banking statements, credit lines, and cashflow data into explainable credit health metrics, machine learning risk signals, and verified AI insights.*

---

## 📌 Project Overview

CreditLens is a production-grade full-stack fintech platform designed to bridge the gap between traditional quantitative credit assessment and modern explainable artificial intelligence.

Unlike generic finance dashboards or simple LLM wrappers, CreditLens enforces strict architectural boundaries:

```
DETERMINISTIC INGESTION PIPELINE ──►  Statement Ingestion (CSV/PDF) ➔ Normalization ➔ 16-Category Taxonomy
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

## 🧠 Phase 5: RAG-Powered Financial Copilot & Knowledge Retrieval

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

## 📂 Phase 4: Financial Statement & Transaction Intelligence Subsystem

- **Multi-Format Ingestion**: Supports `.csv` and text-based `.pdf` statements up to 10 MB.
- **CSV & PDF Parsers** ([`csv_parser.py`](backend/app/ingestion/csv_parser.py), [`pdf_parser.py`](backend/app/ingestion/pdf_parser.py)): Header mapping, date normalization, currency cleaning, and SHA-256 deduplication.
- **Merchant Entity Normalizer** ([`normalizer.py`](backend/app/ingestion/normalizer.py)): Strips gateway prefixes (`UPI-`, `POS `, `IMPS-`, `BILLDESK`) and noise suffixes, mapping to clean merchant identities while preserving `original_description`.
- **16-Category Taxonomy Engine** ([`categorization.py`](backend/app/ingestion/categorization.py)): Classifies transactions with confidence scoring and classification method provenance.
- **Statistical Anomaly Detector** ([`anomaly_detector.py`](backend/app/ingestion/anomaly_detector.py)): Category velocity surges ($> 25\%$) and transaction outliers ($> \mu + 1.8\sigma$).
- **Recurring Payment Detector** ([`recurring_detector.py`](backend/app/ingestion/recurring_detector.py)): Subscriptions and periodic EMIs.

---

## 📊 Phase 3: Machine Learning & Credit Health Engine

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

## 💻 Local Setup & Execution Commands

### 1. Backend Setup & Ingestion Tests
```bash
cd backend

# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Run complete backend, ML, Ingestion & RAG integration test suite
python test_api.py

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
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

- **Copilot Workspace**: [http://localhost:3000/copilot](http://localhost:3000/copilot)
- **Statement Ingestion**: [http://localhost:3000/statements](http://localhost:3000/statements)
- **Spending Intelligence**: [http://localhost:3000/spending](http://localhost:3000/spending)
- **Main Command Center**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🔌 API Endpoints Catalog

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/copilot/query` | RAG financial intelligence inquiry with verified citations & metric grounding |
| `POST` | `/api/v1/statements/upload` | Ingests CSV/PDF statement, normalizes merchants, categorizes transactions |
| `GET` | `/api/v1/statements` | Lists uploaded financial statements with file metadata and totals |
| `GET` | `/api/v1/statements/{id}` | Retrieves specific statement processing status and summary |
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
| `POST` | `/api/v1/users/login` | Session authentication & demo account token issuance |

---

## ⚖️ Responsible AI & Regulatory Disclaimer

CreditLens is developed as an educational, pattern diagnostics, and portfolio engineering project. 
- CreditLens is **NOT a credit reporting agency or bureau (such as CIBIL, Equifax, or Experian)**.
- The **CreditLens Credit Health Score** is an educational mathematical index and does not represent official credit underwriting.
- Outputs from CreditLens machine learning models and copilot insights do not constitute financial, investment, or legal advice.
