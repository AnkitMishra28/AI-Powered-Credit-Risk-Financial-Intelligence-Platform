# CreditLens Database Architecture & Schema Specification

CreditLens uses **PostgreSQL 16** as its primary persistent relational data store, accessed asynchronously through **SQLAlchemy 2.0** and **asyncpg**, with schema evolution managed via **Alembic**.

---

## 1. Relational Entity Diagram

```
                                  ┌───────────────────────┐
                                  │         users         │
                                  │───────────────────────│
                                  │ id (PK)               │
                                  │ email (Unique)        │
                                  │ hashed_password       │
                                  │ full_name             │
                                  │ is_active / is_demo   │
                                  └──────────┬────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      │ 1:1              │ 1:N               │ 1:N               │ 1:N              │ 1:N
      ▼                  ▼                   ▼                   ▼                  ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  financial_   │ │     loans     │ │  statements   │ │  credit_health_  │ │  risk_           │
│   profiles    │ │               │ │               │ │   snapshots      │ │   predictions    │
│───────────────│ │───────────────│ │───────────────│ │──────────────────│ │──────────────────│
│ id (PK)       │ │ id (PK)       │ │ id (PK)       │ │ id (PK)          │ │ id (PK)          │
│ user_id (FK)  │ │ user_id (FK)  │ │ user_id (FK)  │ │ user_id (FK)     │ │ user_id (FK)     │
│ monthly_income│ │ lender_name   │ │ filename      │ │ score (0-1000)   │ │ risk_category    │
│ total_credit  │ │ principal     │ │ total_debits  │ │ score_tier       │ │ default_prob     │
│ emi_total     │ │ interest_rate │ │ total_credits │ │ created_at       │ │ shap_values (JSON│
└───────────────┘ └───────────────┘ └───────┬───────┘ └────────┬─────────┘ └──────────────────┘
                                            │ 1:N              │ 1:N
                                            ▼                  ▼
                                    ┌───────────────┐ ┌──────────────────┐
                                    │ transactions  │ │  credit_health_  │
                                    │               │ │   factors        │
                                    │───────────────│ │──────────────────│
                                    │ id (PK)       │ │ id (PK)          │
                                    │ statement_id  │ │ snapshot_id (FK) │
                                    │ user_id (FK)  │ │ factor_name      │
                                    │ amount        │ │ score / weight   │
                                    │ merchant      │ │ impact_type      │
                                    │ category      │ └──────────────────┘
                                    │ txn_hash (UQ) │
                                    │ is_anomaly    │
                                    └───────────────┘

Knowledge Base & Inquiries:
┌───────────────────────┐          ┌───────────────────────┐          ┌───────────────────────┐
│       documents       │ 1:N      │    document_chunks    │          │    copilot_queries    │
│───────────────────────│─────────►│───────────────────────│          │───────────────────────│
│ id (PK)               │          │ id (PK)               │          │ id (PK)               │
│ title / source_ref    │          │ document_id (FK)      │          │ user_id (FK)          │
│ doc_type / published  │          │ chunk_text / page_num │          │ question / answer     │
└───────────────────────┘          │ embedding (vector)    │          │ citations (JSON)      │
                                   └───────────────────────┘          └───────────────────────┘
```

---

## 2. Table Catalog

| Table Name | Description | Key Indexes / Constraints |
| :--- | :--- | :--- |
| `users` | User identity, credentials, demo flags | `email` (Unique, Indexed) |
| `financial_profiles` | Aggregated user cashflow, limits, and debt commitments | `user_id` (FK -> users.id, Unique) |
| `loans` | Individual loan obligations and interest rates | `user_id` (FK -> users.id) |
| `statements` | Uploaded CSV/PDF bank statement metadata | `user_id` (FK -> users.id) |
| `transactions` | Canonical parsed transaction ledger with SHA-256 deduplication | `user_id`, `statement_id`, `txn_hash` (Unique) |
| `credit_health_snapshots` | Historical 0–1000 credit health score records | `user_id` (FK -> users.id), `created_at` |
| `credit_health_factors` | 6-factor mathematical score attribution per snapshot | `snapshot_id` (FK -> credit_health_snapshots.id) |
| `credit_health_history` | Monthly trajectory data points (score, utilization, DTI) | `user_id` (FK -> users.id), `month_label` |
| `risk_predictions` | Persisted XGBoost inference output and TreeSHAP attribution deltas | `user_id` (FK -> users.id) |
| `copilot_queries` | Conversational RAG history with verified citations | `user_id` (FK -> users.id), `conversation_id` |
| `documents` | Regulatory knowledge base documents (RBI directives) | `source_ref` (Unique) |
| `document_chunks` | Chunked regulatory text with dense semantic embeddings | `document_id` (FK -> documents.id) |

---

## 3. Multi-Tenant Isolation & Deduplication

1. **Foreign Key Scoping**: Every user-owned table enforces `user_id` foreign keys with `ondelete="CASCADE"`. Application queries always derive `user_id` directly from the authenticated JWT claims.
2. **Transaction Fingerprint Hash**: To prevent duplicate records upon statement re-upload, each transaction computes a SHA-256 fingerprint:
   $$\text{Hash} = \text{SHA256}(\text{ISO Date} + \text{Normalized Merchant} + \text{Amount} + \text{Type})$$
   Duplicate transactions within a user's statement are automatically skipped during ingestion.

---

## 4. Migration Workflow

Migrations are managed via **Alembic**:

```bash
# Apply all pending migrations to head
alembic upgrade head

# Inspect current database revision
alembic current

# Create new migration auto-generating from SQLAlchemy models
alembic revision --autogenerate -m "describe_schema_change"
```

Migration scripts are versioned in `backend/alembic/versions/`.

---

## 5. Recruiter Demo Queries

These read-only SQL queries can be executed to verify database state during technical demonstrations:

```sql
-- 1. Verify user profile and financial telemetry
SELECT u.id, u.email, u.full_name, fp.monthly_net_income, fp.total_credit_limit
FROM users u
LEFT JOIN financial_profiles fp ON fp.user_id = u.id;

-- 2. Inspect uploaded statements and extracted transaction counts
SELECT s.id, s.filename, s.status, s.parsed_transactions_count, s.total_debits, s.total_credits
FROM statements s
ORDER BY s.created_at DESC;

-- 3. Query categorized transactions with anomaly flags
SELECT t.transaction_date, t.merchant, t.category, t.amount, t.is_anomaly
FROM transactions t
WHERE t.user_id = 1
ORDER BY t.transaction_date DESC
LIMIT 10;

-- 4. View latest Credit Health score snapshot and factor weights
SELECT chs.score, chs.score_tier, chf.factor_name, chf.factor_score, chf.weight
FROM credit_health_snapshots chs
JOIN credit_health_factors chf ON chf.snapshot_id = chs.id
WHERE chs.user_id = 1
ORDER BY chs.created_at DESC;

-- 5. Inspect TreeSHAP machine learning prediction record
SELECT rp.risk_category, rp.default_probability, rp.confidence_score, rp.created_at
FROM risk_predictions rp
WHERE rp.user_id = 1
ORDER BY rp.created_at DESC
LIMIT 1;
```
