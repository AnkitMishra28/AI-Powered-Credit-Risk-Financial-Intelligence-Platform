"""
CreditLens Phase 3 Backend & ML Intelligence Verification Suite
Tests all REST endpoints, deterministic scoring, XGBoost inference, and TreeSHAP explainability.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

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
    # With 15% utilization and 98% payment consistency, score should be in Excellent range
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
    
    # Check probability distribution normalization
    prob = data["probability_distribution"]
    prob_sum = round(prob["low_risk"] + prob["medium_risk"] + prob["high_risk"], 2)
    assert prob_sum == 1.00

    assert len(data["top_positive_factors"]) >= 2
    assert len(data["risk_factors"]) >= 2
    assert len(data["model_explainability"]) >= 4

    # Verify SHAP items have required fields
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

def test_spending_overview():
    response = client.get("/api/v1/spending/overview?demo=true")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["total_spending_current_month"] == 49230.0
    assert len(data["categories"]) == 7
    assert len(data["anomalies"]) >= 1
    assert len(data["recent_transactions"]) >= 5
    print("[PASS] GET /api/v1/spending/overview passed")

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
    print("Starting CreditLens Comprehensive API & ML Verification Suite...\n")
    test_root()
    test_health()
    test_credit_health_summary()
    test_credit_health_calculate()
    test_risk_analysis()
    test_risk_predict()
    test_model_info()
    test_spending_overview()
    test_copilot_query()
    test_user_login()
    print("\nAll 10 API & ML Engine integration tests passed successfully!")
