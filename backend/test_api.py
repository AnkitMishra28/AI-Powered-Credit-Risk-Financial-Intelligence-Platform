"""
CreditLens Phase 1 Backend Verification Suite
Tests all REST endpoints and schemas synchronously using FastAPI TestClient.
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
    response = client.get("/api/v1/credit-health/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["health_score"] == 742
    assert data["score_tier"] == "Healthy"
    assert len(data["factors"]) == 6
    print("[PASS] GET /api/v1/credit-health/summary passed")

def test_risk_analysis():
    response = client.get("/api/v1/risk/analysis")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["risk_category"] == "LOW RISK"
    assert data["confidence_percentage"] == 87.0
    assert len(data["top_positive_factors"]) >= 3
    assert len(data["risk_factors"]) >= 2
    assert len(data["model_explainability"]) >= 4
    print("[PASS] GET /api/v1/risk/analysis passed")

def test_spending_overview():
    response = client.get("/api/v1/spending/overview")
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
    print("Starting CreditLens API test suite...")
    test_root()
    test_health()
    test_credit_health_summary()
    test_risk_analysis()
    test_spending_overview()
    test_copilot_query()
    test_user_login()
    print("\nAll 7 backend endpoint integration tests passed successfully!")
