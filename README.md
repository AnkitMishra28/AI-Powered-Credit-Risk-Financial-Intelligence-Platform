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
│  Statement Ingestion & Rules  │                             │     ML Risk & Explainability  │
│      (CSV & PDF Parsers)      │                             │   (Scikit-learn / XGBoost)    │
├───────────────────────────────┤                             ├───────────────────────────────┤
│ • Canonical Column Resolution │                             │ • Feature Engineering Engine  │
│ • Merchant Entity Normalizer  │                             │ • ColumnTransformer Pipeline  │
│ • 16-Category Taxonomy Engine │                             │ • XGBoost Classifier          │
│ • Statistical Anomaly (z-score│                             │ • TreeSHAP Explainability     │
│ • Recurring Payment Detector  │                             │ • 0–1000 Credit Health Score  │
└───────────────┬───────────────┘                             └───────────────┬───────────────┘
                │                                                             │
                └──────────────────────────────┬──────────────────────────────┘
                                               ▼
                               ┌───────────────────────────────┐
                               │     PostgreSQL + pgvector     │
                               │  Users, Statements, Metrics,  │
                               │  Transactions, Predictions    │
                               └───────────────────────────────┘
```

---

## 📂 Phase 4: Financial Statement & Transaction Intelligence Subsystem

### 1. Ingestion Pipeline & Parsers
- **Multi-Format Ingestion**: Supports `.csv` and text-based `.pdf` statements up to 10 MB.
- **CSV Statement Parser** ([`csv_parser.py`](backend/app/ingestion/csv_parser.py)): Resolves varying bank headers (Date, Description, Debit, Credit, Amount, Balance), cleans ISO/UK/Indian date formats, handles currency symbols and negative signs, and deduplicates identical records.
- **PDF Statement Parser** ([`pdf_parser.py`](backend/app/ingestion/pdf_parser.py)): Deterministically parses tabular text stream layouts via `pypdf` without relying on external OCR services or non-deterministic LLMs.
- **Merchant Entity Normalizer** ([`normalizer.py`](backend/app/ingestion/normalizer.py)): Strips gateway prefixes (`UPI-`, `POS `, `IMPS-`, `NEFT-`, `BILLDESK`) and corporate suffixes (`*ONLINE`, `PVT LTD`, `.COM`), mapping raw narrations (e.g. `SWIGGY*INSTAMART BLR`) to clean merchant identities (`SWIGGY`) while preserving `original_description` for auditability.
- **16-Category Taxonomy Engine** ([`categorization.py`](backend/app/ingestion/categorization.py)): Classifies transactions into standard financial categories (`Food & Dining`, `Shopping`, `Transport`, `Entertainment`, `Healthcare`, `Utilities`, `Rent & Housing`, `Education`, `Travel`, `Insurance`, `Groceries`, `Salary / Income`, `Transfer`, `EMI / Loan`, `Cash Withdrawal`, `Other`) with confidence scoring and classification method provenance (`merchant_rule`, `keyword_pattern`, `fallback_default`).

### 2. Statistical Anomaly & Recurring Detection
- **Statistical Anomaly Detector** ([`anomaly_detector.py`](backend/app/ingestion/anomaly_detector.py)): Evaluates category spending surges ($> 25\%$ vs 3-month baseline) and single large transaction outliers ($> \mu + 1.8\sigma$) with explicit mathematical baseline transparency.
- **Recurring Payment Detection** ([`recurring_detector.py`](backend/app/ingestion/recurring_detector.py)): Detects streaming subscriptions, regular utility bills, and loan EMIs with estimated amount, interval frequency, and confidence matching.

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

### 3. TreeSHAP Feature Explainability
- Native tree ensemble Shapley value computation via TreeSHAP.
- Generates positive safety drivers and watch signals with exact impact deltas.

### 4. Deterministic Credit Health Score (0–1000)
- **Payment Consistency & Reliability** ($350$ pts / $35\%$)
- **Revolving Credit Utilization** ($250$ pts / $25\%$)
- **Debt-to-Income / Debt Servicing Burden** ($200$ pts / $20\%$)
- **Credit History Length & Seasoning** ($100$ pts / $10\%$)
- **Spending Velocity & Cashflow Stability** ($100$ pts / $10\%$)

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

# Run reproducible ML model training pipeline
python -m app.ml.training.trainer

# Run complete backend & ML & Ingestion integration test suite
python test_api.py

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
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

- **Statement Ingestion Console**: [http://localhost:3000/statements](http://localhost:3000/statements)
- **Spending Intelligence**: [http://localhost:3000/spending](http://localhost:3000/spending)
- **Dashboard Command Center**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🔌 API Endpoints Catalog

| Method | Endpoint | Description |
| :--- | :--- | :--- |
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
| `POST` | `/api/v1/copilot/query` | Grounded financial intelligence inquiry with verified citations |
| `POST` | `/api/v1/users/login` | Session authentication & demo account token issuance |

---

## ⚖️ Responsible AI & Regulatory Disclaimer

CreditLens is developed as an educational, pattern diagnostics, and portfolio engineering project. 
- CreditLens is **NOT a credit reporting agency or bureau (such as CIBIL, Equifax, or Experian)**.
- The **CreditLens Credit Health Score** is an educational mathematical index and does not represent official credit underwriting.
- Outputs from CreditLens machine learning models and copilot insights do not constitute financial, investment, or legal advice.
