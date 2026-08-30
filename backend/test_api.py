"""
CreditLens Comprehensive Backend & ML Intelligence Verification Suite
Tests all REST endpoints, statement ingestion (CSV/PDF), normalization, categorization,
anomaly detection, deterministic scoring, XGBoost inference, and TreeSHAP explainability.
"""
import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_CSV_STATEMENT = """Date,Description,Debit,Credit,Balance
2026-03-28,SWIGGY*INSTAMART BANGALORE,1450.00,,74350.00
2026-03-27,AMZN MKTPLACE INDIA PVT LTD,4200.00,,75800.00
2026-03-26,UBER TRIP BLR/129384,380.00,,80000.00
2026-03-25,NETFLIX.COM PAYMENT,649.00,,80380.00
2026-03-24,AIRTEL BROADBAND BILL,1199.00,,81029.00
2026-03-20,ZOMATO RESTAURANT DINING,2850.00,,82228.00
2026-03-15,APOLLO PHARMACY BANGALORE,1250.00,,85078.00
2026-03-10,TATA POWER ELECTRICITY,2800.00,,86328.00
2026-03-05,CRED CLUB CC PAYMENT,8500.00,,89128.00
2026-03-01,ACH SALARY CREDIT - TECH CORP,,65000.00,97628.00
"""

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["version"] == "1.0.0"
    print("[PASS] GET / passed")

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "CreditLens API"
    assert "credit_health_engine" in data["features"]
    print("[PASS] GET /api/v1/health passed")

def test_credit_health_summary():
    response = client.get("/api/v1/credit-health/summary?demo=true")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert 0 <= data["health_score"] <= 1000
    assert 700 <= data["health_score"] <= 800
    assert data["score_tier"] == "Healthy"
    assert len(data["factors"]) == 5
    assert len(data["history"]) == 6
    print("[PASS] GET /api/v1/credit-health/summary passed")

def test_credit_health_calculate():
    response = client.post(
        "/api/v1/credit-health/calculate",
        json={
            "monthly_income": 80000.0,
            "credit_limit_total": 300000.0,
            "revolving_balance_total": 45000.0,
            "total_monthly_emi": 12000.0,
            "payment_consistency_ratio": 0.98,
            "credit_history_years": 5.5,
            "monthly_spending_total": 35000.0,
            "spending_average_6mo": 38000.0
        }
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert 0 <= data["health_score"] <= 1000
    assert data["health_score"] >= 800
    assert data["score_tier"] == "Excellent"
    print(f"[PASS] POST /api/v1/credit-health/calculate passed (Score: {data['health_score']})")

def test_risk_analysis():
    response = client.get("/api/v1/risk/analysis?demo=true")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["risk_category"] in ["LOW RISK", "MEDIUM RISK", "HIGH RISK"]
    assert 0.0 <= data["confidence_percentage"] <= 100.0
    
    prob = data["probability_distribution"]
    prob_sum = round(prob["low_risk"] + prob["medium_risk"] + prob["high_risk"], 2)
    assert prob_sum == 1.00

    assert len(data["top_positive_factors"]) >= 2
    assert len(data["risk_factors"]) >= 2
    assert len(data["model_explainability"]) >= 4

    first_shap = data["model_explainability"][0]
    assert "feature_name" in first_shap
    assert "display_name" in first_shap
    assert "impact_value" in first_shap
    assert "is_positive" in first_shap
    print(f"[PASS] GET /api/v1/risk/analysis passed (Category: {data['risk_category']}, Confidence: {data['confidence_percentage']}%)")

def test_risk_predict():
    response = client.post(
        "/api/v1/risk/predict",
        json={
            "checking_status": "<0",
            "duration": 48,
            "credit_history": "critical/other existing credit",
            "purpose": "radio/tv",
            "credit_amount": 8000.0,
            "savings_status": "<100",
            "employment": "<1",
            "installment_commitment": 4,
            "personal_status": "male single",
            "other_parties": "none",
            "residence_since": 1,
            "property_magnitude": "no known property",
            "age": 23,
            "other_payment_plans": "bank",
            "housing": "rent",
            "existing_credits": 1,
            "job": "unskilled resident",
            "num_dependents": 1,
            "own_telephone": "none",
            "foreign_worker": "yes"
        }
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["risk_category"] in ["MEDIUM RISK", "HIGH RISK"]
    prob = data["probability_distribution"]
    assert round(prob["low_risk"] + prob["medium_risk"] + prob["high_risk"], 2) == 1.00
    print(f"[PASS] POST /api/v1/risk/predict passed (High-risk applicant predicted as: {data['risk_category']})")

def test_model_info():
    response = client.get("/api/v1/risk/model-info")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["status"] == "operational"
    assert data["model_version"] == "creditlens-risk-xgb-v1.2"
    assert "primary_xgb_metrics" in data
    assert data["primary_xgb_metrics"]["roc_auc"] >= 0.70
    assert data["feature_count"] > 20
    print(f"[PASS] GET /api/v1/risk/model-info passed (XGBoost ROC-AUC: {data['primary_xgb_metrics']['roc_auc']})")

def test_statement_upload_csv():
    file_content = SAMPLE_CSV_STATEMENT.encode("utf-8")
    files = {"file": ("hdfc_statement_mar2026.csv", io.BytesIO(file_content), "text/csv")}
    response = client.post("/api/v1/statements/upload", files=files)
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["parsed_transactions_count"] >= 9
    assert data["total_credits"] == 65000.0
    assert data["total_debits"] > 0
    print(f"[PASS] POST /api/v1/statements/upload (CSV) passed ({data['parsed_transactions_count']} transactions)")

def test_statement_upload_validation_error():
    # Empty file
    files = {"file": ("empty.csv", io.BytesIO(b""), "text/csv")}
    response = client.post("/api/v1/statements/upload", files=files)
    assert response.status_code == 400
    print("[PASS] POST /api/v1/statements/upload (Empty Validation) passed")

def test_list_statements():
    response = client.get("/api/v1/statements")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]) >= 1
    print(f"[PASS] GET /api/v1/statements passed ({len(payload['data'])} statements)")

def test_list_transactions():
    response = client.get("/api/v1/transactions?limit=10")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["total_count"] >= 9
    assert len(data["items"]) <= 10
    first = data["items"][0]
    assert "normalized_merchant" in first
    assert "category" in first
    assert "classification_method" in first
    assert "amount" in first
    print(f"[PASS] GET /api/v1/transactions passed ({data['total_count']} transactions stored)")

def test_transactions_filter_category():
    response = client.get("/api/v1/transactions?category=Food%20%26%20Dining")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    for item in payload["data"]["items"]:
        assert item["category"] == "Food & Dining"
    print("[PASS] GET /api/v1/transactions (Category Filter) passed")

def test_spending_overview():
    response = client.get("/api/v1/spending/overview?demo=false")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["total_spending_current_month"] > 0
    assert len(data["categories"]) >= 3
    assert len(data["anomalies"]) >= 1
    assert len(data["recent_transactions"]) >= 5
    print(f"[PASS] GET /api/v1/spending/overview passed (Total: INR {data['total_spending_current_month']:,.2f})")

def test_spending_categories():
    response = client.get("/api/v1/spending/categories")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]) >= 3
    print(f"[PASS] GET /api/v1/spending/categories passed ({len(payload['data'])} categories)")

def test_spending_anomalies():
    response = client.get("/api/v1/spending/anomalies")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]) >= 1
    first_anom = payload["data"][0]
    assert "title" in first_anom
    assert "percentage_above_average" in first_anom
    assert "historical_average" in first_anom
    print(f"[PASS] GET /api/v1/spending/anomalies passed ({len(payload['data'])} anomalies detected)")

def test_spending_recurring():
    response = client.get("/api/v1/spending/recurring")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]) >= 1
    print(f"[PASS] GET /api/v1/spending/recurring passed ({len(payload['data'])} recurring payments detected)")

def test_copilot_query():
    response = client.post(
        "/api/v1/copilot/query",
        json={"query": "What happens if I only pay the minimum amount on my credit card?"}
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert "minimum" in data["response"].lower() or "interest" in data["response"].lower()
    assert len(data["sources"]) >= 2
    assert len(data["grounding_facts"]) >= 3
    print("[PASS] POST /api/v1/copilot/query passed")

def test_user_login():
    response = client.post(
        "/api/v1/users/login",
        json={"email": "alex.mercer@fintech.demo", "password": "password123"}
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert "access_token" in data
    assert data["user"]["is_demo"] is True
    print("[PASS] POST /api/v1/users/login passed")

if __name__ == "__main__":
    print("Starting CreditLens Comprehensive API, ML & Ingestion Verification Suite...\n")
    test_root()
    test_health()
    test_credit_health_summary()
    test_credit_health_calculate()
    test_risk_analysis()
    test_risk_predict()
    test_model_info()
    test_statement_upload_csv()
    test_statement_upload_validation_error()
    test_list_statements()
    test_list_transactions()
    test_transactions_filter_category()
    test_spending_overview()
    test_spending_categories()
    test_spending_anomalies()
    test_spending_recurring()
    test_copilot_query()
    test_user_login()
    print("\n=======================================================")
    print("All 18 API, ML & Ingestion integration tests passed successfully!")
    print("=======================================================")
