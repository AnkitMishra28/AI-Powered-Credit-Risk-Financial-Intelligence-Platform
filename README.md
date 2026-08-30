# CreditLens

> **AI-Powered Credit Risk & Financial Intelligence Platform**  
> *Transforming banking statements, credit lines, and cashflow data into explainable credit health metrics, machine learning risk signals, and verified AI insights.*

---

## 📌 Project Overview

CreditLens is a production-grade full-stack fintech platform designed to bridge the gap between traditional quantitative credit assessment and modern explainable artificial intelligence.

Unlike generic finance dashboards or simple LLM wrappers, CreditLens enforces strict architectural boundaries:

```
DETERMINISTIC FINANCIAL LOGIC  ──►  Exact 0–1000 Credit Health Score (Rule-Based & Transparent)
           │
           ▼
MACHINE LEARNING (XGBoost)     ──►  Calibrated Multi-Class Default Risk Probabilities (Low/Med/High)
           │
           ▼
EXPLAINABILITY (TreeSHAP)      ──►  Deterministic Feature Attribution Deltas & Positive/Watch Signals
           │
           ▼
RAG KNOWLEDGE RETRIEVAL        ──►  pgvector Semantic Vector Search over Regulatory Directives (RBI)
           │
           ▼
LLM SYNTHESIS & INSIGHTS       ──►  Natural Language Grounded Explanations (Zero Hallucinated Numbers)
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
            ┌──────────────────────┘               └──────────────────────┐
            ▼                                                             ▼
┌───────────────────────────────┐                             ┌───────────────────────────────┐
│     ML Risk & Explainability  │                             │         RAG Pipeline          │
│   (Scikit-learn / XGBoost)    │                             │    (pgvector + Gemini API)    │
├───────────────────────────────┤                             ├───────────────────────────────┤
│ • Feature Engineering Engine  │                             │ • Regulatory Embeddings       │
│ • ColumnTransformer Pipeline  │                             │ • Semantic Vector Search      │
│ • XGBoost Classifier          │                             │ • Grounded Fact Prompting     │
│ • TreeSHAP Explainability     │                             │ • Verified Document Sources   │
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

## 📊 Phase 3: Real Credit Intelligence Engine

### 1. Public Benchmark Dataset
- **Dataset**: South German Credit (*Groemping, 2020 / UCI Machine Learning Repository / OpenML `credit-g`*).
- **Instances**: 1,000 credit records with 20 input attributes.
- **Target**: `class` (0 = Good Credit / Non-Default: 700 instances, 1 = Bad Credit / Default: 300 instances).
- **Class Imbalance**: 2.33:1 ratio (accounted for via stratified splitting and `scale_pos_weight=2.33`).
- **Dataset Limitations**: Historical European banking dataset with D-Mark currency denominations. While it demonstrates authentic credit underwriting dynamics (debt burden, installment rates, stability, past delinquency remarks), it does not directly represent modern Indian consumer UPI/CIBIL credit lines.

### 2. Feature Engineering & Preprocessing
- **Leakage Prevention**: All scaling (`StandardScaler`), median imputations, and one-hot encodings (`OneHotEncoder`) are encapsulated inside a scikit-learn `ColumnTransformer` fitted strictly on training data.
- **Engineered Financial Features**:
  - `monthly_installment_burden`: Estimated monthly repayment load ($\text{credit\_amount} / \text{duration}$).
  - `credit_to_age_ratio`: Debt leverage relative to borrower lifecycle stage.
  - `stability_index`: Combined residential and credit history tenure.
  - `has_delinquency_history`: Binary indicator derived from past delayed or critical remarks.
  - `savings_buffer_score`: Ordinal emergency buffer indicator (0–4).
  - `checking_liquidity_score`: Ordinal liquid checking account score (0–3).

### 3. Model Evaluation Results

| Metric | Logistic Regression (Baseline) | XGBoost Classifier (Primary) |
| :--- | :---: | :---: |
| **Accuracy** | 75.00% | **75.50%** |
| **Precision (Default Class)** | 55.68% | **57.75%** |
| **Recall (Default Class)** | **81.67%** | 68.33% |
| **F1-Score** | 66.22% | 62.60% |
| **ROC-AUC** | 80.80% | **79.87%** |
| **PR-AUC** | 64.39% | **65.96%** |
| **Brier Calibration Score** | 0.1814 | **0.1715** |

- **Confusion Matrix (XGBoost on 200 Test Records)**:
  - True Negatives (Good predicted Good): **110**
  - False Positives (Good predicted Bad): **30**
  - False Negatives (Bad predicted Good): **19**
  - True Positives (Bad predicted Bad): **41**

### 4. TreeSHAP Model Explainability
- Evaluates exact Shapley values directly across the XGBoost tree ensemble via C++ TreeSHAP.
- Generates structured attributions indicating both direction and magnitude:
  - **Risk-Reducing / Positive Drivers**: High payment consistency, low DTI, high savings cushion.
  - **Risk-Increasing / Watch Signals**: Elevated revolving utilization, short employment tenure, past delays.

### 5. CreditLens Deterministic Credit Health Score (0–1000)
A fully explainable, transparent financial diagnostic score calculated across 5 weighted dimensions:

$$\text{Score} = \text{PaymentReliability} + \text{UtilizationScore} + \text{DTIScore} + \text{TenureScore} + \text{SpendingStability}$$

1. **Payment Reliability & Consistency** (350 pts / 35%): $350 \times (\text{PaymentRatio})^{1.8}$
2. **Revolving Credit Utilization** (250 pts / 25%): Non-linear penalty above optimal 30% threshold.
3. **Debt-to-Income (DTI) Leverage** (200 pts / 20%): Evaluates total monthly EMI + 5% revolving minimum debt drain vs net income.
4. **Credit History Tenure & Seasoning** (100 pts / 10%): Seasoning of active credit lines (0–5+ years).
5. **Spending Velocity & Cashflow Stability** (100 pts / 10%): Current monthly spend vs 6-month historical baseline.

**Score Tiers**:
- `800 – 1000`: **Excellent** (Prime credit health)
- `700 – 799`: **Healthy** (Strong standing, e.g. Alex Mercer demo score = 775 / 1000)
- `600 – 699`: **Fair** (Elevated utilization or high DTI)
- `0 – 599`: **Needs Attention** (Elevated default risk or severe payment delays)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (Turbopack, App Router)
- **UI Library**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 + Obsidian/Emerald Fintech Tokens
- **Icons**: Lucide React
- **Wire Contract Mappers**: Type-safe DTO adapters (`frontend/src/services/mappers.ts`)

### Backend & Machine Learning
- **API Framework**: FastAPI + Uvicorn (ASGI)
- **Validation**: Pydantic v2 + Pydantic-Settings
- **Gradient Boosting**: XGBoost v3.2
- **Scikit-Learn**: v1.9 (Pipeline, ColumnTransformer, StandardScaler, OneHotEncoder)
- **Explainability**: SHAP v0.51 + Native XGBoost TreeSHAP
- **Serialization**: Joblib v1.5
- **Data Engine**: Pandas v2.2 + NumPy v2.4 + SciPy v1.17

---

## 💻 Local Setup & Execution Commands

### Prerequisites
- Node.js v18+ (tested on v24)
- Python 3.11+
- Git

### 1. Backend Setup & Model Training
```bash
cd backend

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Run reproducible ML model training pipeline
python -m app.ml.training.trainer

# Run complete backend & ML integration test suite
python test_api.py

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **Health Endpoint**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **Model Info**: [http://localhost:8000/api/v1/risk/model-info](http://localhost:8000/api/v1/risk/model-info)

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

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to explore the live intelligence command center.

---

## 🔌 API Endpoints Catalog

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status and feature flags |
| `GET` | `/api/v1/risk/analysis?demo=true` | Real XGBoost default risk probabilities and TreeSHAP feature attributions |
| `POST` | `/api/v1/risk/predict` | Predicts risk category and probabilities for custom applicant profile inputs |
| `GET` | `/api/v1/risk/model-info` | Model specifications, baseline vs XGBoost evaluation metrics, and feature list |
| `GET` | `/api/v1/credit-health/summary?demo=true` | Computes deterministic 0–1000 Credit Health Score and 5-factor breakdown |
| `POST` | `/api/v1/credit-health/calculate` | Calculates dynamic 0–1000 score for custom income, limit, utilization, and DTI inputs |
| `GET` | `/api/v1/spending/overview?demo=true` | Spending velocity, classified transaction ledger, and pattern anomaly alerts |
| `POST` | `/api/v1/copilot/query` | Grounded financial intelligence inquiry with verified source citations |
| `POST` | `/api/v1/users/login` | Session authentication & demo account token issuance |

---

## ⚖️ Responsible AI & Regulatory Disclaimer

CreditLens is developed as an educational, pattern diagnostics, and portfolio engineering project. 
- CreditLens is **NOT a credit reporting agency or bureau (such as CIBIL, Equifax, or Experian)**.
- The **CreditLens Credit Health Score** is an educational mathematical index and does not represent official credit underwriting.
- Outputs from CreditLens machine learning models and copilot insights do not constitute financial, investment, or legal advice.
