"""
CreditLens Regression Suite — bugs found in the 2026-08-31 production audit.

Each test locks in a fix for a specific defect:

  * Logout returned 401 in the browser console for expired/absent sessions.
  * "Save Changes" on Settings never persisted (no endpoint existed).
  * The deterministic Copilot fallback emitted canonical demo figures
    (775 / 68% / 94% / LOW RISK) to a real user who had analyzed nothing.
  * The Copilot never grounded answers in a real user's OWN persisted data.
  * Per-category month-over-month deltas were fabricated for real users.

Run with an isolated SQLite DB, e.g.:
  DATABASE_URL="sqlite+aiosqlite:///./test_regression.db" pytest test_regression.py -q
"""
import io
import uuid
import asyncio
from datetime import timedelta

from fastapi.testclient import TestClient

from app.main import app
from app.db.session import init_db
from app.core.security import create_access_token

client = TestClient(app)

TEST_PASSWORD = "StrongSecurePassword123!"

SAMPLE_CSV = """Date,Description,Debit,Credit,Balance
2026-03-28,SWIGGY INSTAMART BANGALORE,1450.00,,74350.00
2026-03-27,AMZN MKTPLACE INDIA,4200.00,,75800.00
2026-03-25,NETFLIX.COM PAYMENT,649.00,,80380.00
2026-03-20,ZOMATO RESTAURANT DINING,2850.00,,82228.00
2026-03-10,TATA POWER ELECTRICITY,2800.00,,86328.00
2026-03-01,ACH SALARY CREDIT - TECH CORP,,72000.00,97628.00
"""


def _register(email_prefix: str):
    email = f"{email_prefix}.{uuid.uuid4().hex[:8]}@example.com"
    r = client.post(
        "/api/v1/users/register",
        json={"email": email, "password": TEST_PASSWORD, "full_name": "Reg Test"},
    )
    assert r.status_code == 200, r.text
    body = r.json()["data"]
    return email, body["access_token"], body["user"]["id"]


def test_setup_db():
    asyncio.run(init_db())


# --------------------------------------------------------------------------- #
# 1. Logout is idempotent and never 401s                                      #
# --------------------------------------------------------------------------- #
def test_logout_without_any_token_is_ok():
    r = client.post("/api/v1/users/logout")
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "logged_out"
    assert r.json()["data"]["user_id"] is None


def test_logout_with_expired_token_is_ok_not_401():
    _e, _t, uid = _register("logout.expired")
    expired = create_access_token(subject=uid, expires_delta=timedelta(seconds=-30))
    r = client.post("/api/v1/users/logout", headers={"Authorization": f"Bearer {expired}"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "logged_out"


def test_logout_with_garbage_token_is_ok_not_401():
    r = client.post("/api/v1/users/logout", headers={"Authorization": "Bearer not.a.jwt"})
    assert r.status_code == 200


def test_logout_with_valid_token_reports_user_and_keeps_data():
    _e, tok, _uid = _register("logout.data")
    h = {"Authorization": f"Bearer {tok}"}
    up = client.post(
        "/api/v1/statements/upload",
        files={"file": ("s.csv", io.BytesIO(SAMPLE_CSV.encode()), "text/csv")},
        headers=h,
    )
    assert up.status_code == 200
    out = client.post("/api/v1/users/logout", headers=h)
    assert out.status_code == 200
    assert out.json()["data"]["status"] == "logged_out"
    # Logout must NOT delete the user's financial data.
    tx = client.get("/api/v1/transactions", headers=h).json()
    assert tx["data"]["total_count"] >= 5


# --------------------------------------------------------------------------- #
# 2. Profile persistence via PATCH /users/me                                  #
# --------------------------------------------------------------------------- #
def test_patch_profile_requires_auth():
    r = client.patch("/api/v1/users/me", json={"full_name": "Nope"})
    assert r.status_code == 401


def test_patch_profile_persists_across_reads_and_new_login():
    email, tok, _uid = _register("profile.persist")
    h = {"Authorization": f"Bearer {tok}"}

    patch = client.patch(
        "/api/v1/users/me",
        headers=h,
        json={"full_name": "  Priya Nair  ", "designation": "Lead Data Scientist"},
    )
    assert patch.status_code == 200, patch.text
    d = patch.json()["data"]
    assert d["full_name"] == "Priya Nair"
    assert d["designation"] == "Lead Data Scientist"
    assert d["email"] == email  # unchanged

    # Fresh read on the same session
    me = client.get("/api/v1/users/me", headers=h).json()["data"]
    assert me["full_name"] == "Priya Nair"
    assert me["designation"] == "Lead Data Scientist"

    # Fresh login (simulates logout -> login again)
    login = client.post(
        "/api/v1/users/login", json={"email": email, "password": TEST_PASSWORD}
    )
    assert login.status_code == 200
    lu = login.json()["data"]["user"]
    assert lu["full_name"] == "Priya Nair"
    assert lu["designation"] == "Lead Data Scientist"


def test_patch_profile_cannot_change_email_identity():
    email, tok, _uid = _register("profile.email")
    h = {"Authorization": f"Bearer {tok}"}
    r = client.patch(
        "/api/v1/users/me",
        headers=h,
        json={"full_name": "X", "email": "attacker@evil.com"},
    )
    assert r.status_code == 200
    assert r.json()["data"]["email"] == email  # email field ignored, identity intact


def test_patch_profile_partial_update_only_touches_provided_fields():
    email, tok, _uid = _register("profile.partial")
    h = {"Authorization": f"Bearer {tok}"}
    client.patch("/api/v1/users/me", headers=h, json={"designation": "Analyst II"})
    client.patch("/api/v1/users/me", headers=h, json={"full_name": "Renamed Only"})
    me = client.get("/api/v1/users/me", headers=h).json()["data"]
    assert me["full_name"] == "Renamed Only"
    assert me["designation"] == "Analyst II"  # survived the second, name-only patch


def test_demo_profile_is_read_only():
    login = client.post(
        "/api/v1/users/login",
        json={"email": "alex.mercer@fintech.demo", "password": "password123"},
    )
    assert login.status_code == 200
    dtok = login.json()["data"]["access_token"]
    r = client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {dtok}"},
        json={"full_name": "Hijacked Demo"},
    )
    assert r.status_code == 403


# --------------------------------------------------------------------------- #
# 3. Copilot never fabricates personal figures for a no-data real user       #
# --------------------------------------------------------------------------- #
CANONICAL_LEAKS = ["775", "742", "170000", "1,70,000", "₹1.7l", "68%", "94% on-time", "alex mercer"]


def _assert_no_canonical_leak(text: str):
    low = text.lower()
    for bad in CANONICAL_LEAKS:
        assert bad not in low, f"Copilot leaked canonical demo value: {bad!r}"


def test_copilot_why_is_my_score_no_fabrication_for_fresh_user():
    _e, tok, _uid = _register("copilot.score")
    h = {"Authorization": f"Bearer {tok}"}
    r = client.post(
        "/api/v1/copilot/query",
        headers=h,
        json={"query": "Why is my credit health score what it is?", "include_personal_context": True},
    )
    assert r.status_code == 200
    d = r.json()["data"]
    _assert_no_canonical_leak(d["response"])
    assert d.get("personalized_insights", []) == []
    assert d.get("grounding_summary", {}).get("personal_context_used") is False


def test_copilot_what_is_my_utilization_no_fabrication_for_fresh_user():
    _e, tok, _uid = _register("copilot.util")
    h = {"Authorization": f"Bearer {tok}"}
    r = client.post(
        "/api/v1/copilot/query",
        headers=h,
        json={"query": "What is my utilization right now?", "include_personal_context": True},
    )
    assert r.status_code == 200
    _assert_no_canonical_leak(r.json()["data"]["response"])


def test_copilot_risk_question_no_fabrication_for_fresh_user():
    _e, tok, _uid = _register("copilot.risk")
    h = {"Authorization": f"Bearer {tok}"}
    r = client.post(
        "/api/v1/copilot/query",
        headers=h,
        json={"query": "What is my default risk category?", "include_personal_context": True},
    )
    assert r.status_code == 200
    d = r.json()["data"]
    _assert_no_canonical_leak(d["response"])
    assert "low risk" not in d["response"].lower()


# --------------------------------------------------------------------------- #
# 4. Copilot DOES ground in a real user's OWN persisted data                  #
# --------------------------------------------------------------------------- #
def test_copilot_grounds_in_users_own_calculated_score():
    _e, tok, _uid = _register("copilot.owned")
    h = {"Authorization": f"Bearer {tok}"}
    calc = client.post(
        "/api/v1/credit-health/calculate",
        headers=h,
        json={
            "monthly_income": 90000.0,
            "credit_limit_total": 400000.0,
            "revolving_balance_total": 40000.0,
            "total_monthly_emi": 9000.0,
            "payment_consistency_ratio": 0.97,
            "credit_history_years": 6.0,
        },
    )
    assert calc.status_code == 200
    own_score = calc.json()["data"]["health_score"]

    r = client.post(
        "/api/v1/copilot/query",
        headers=h,
        json={"query": "What is my credit health score and why?", "include_personal_context": True},
    )
    assert r.status_code == 200
    d = r.json()["data"]
    assert str(own_score) in d["response"], "Copilot did not cite the user's own persisted score"
    assert d["grounding_summary"]["personal_context_used"] is True
    # 10% utilization from the inputs above — the user's real number, not 68%.
    assert "68%" not in d["response"]


def test_copilot_does_not_present_model_defaults_as_user_reported():
    """
    Onboarding only collects income/limit/balance/EMI. The Copilot must NOT then
    claim a payment-consistency % or credit-history length the user never gave
    (those are pydantic defaults used only for the score math).
    """
    _e, tok, _uid = _register("copilot.defaults")
    h = {"Authorization": f"Bearer {tok}"}
    calc = client.post(
        "/api/v1/credit-health/calculate",
        headers=h,
        json={
            "monthly_income": 70000.0,
            "credit_limit_total": 200000.0,
            "revolving_balance_total": 30000.0,
            "total_monthly_emi": 6000.0,
        },
    )
    assert calc.status_code == 200
    r = client.post(
        "/api/v1/copilot/query",
        headers=h,
        json={"query": "Explain my credit health score factors", "include_personal_context": True},
    )
    assert r.status_code == 200
    resp = r.json()["data"]["response"].lower()
    assert "90.0% on-time" not in resp and "90% on-time" not in resp
    assert "3.0 years" not in resp  # default credit_history_years must not be surfaced
    # The user's real utilization (15%) SHOULD be available though.
    assert r.json()["data"]["grounding_summary"]["personal_context_used"] is True


def test_copilot_context_is_not_shared_between_users():
    # User A calculates a score.
    _ea, tok_a, _ua = _register("copilot.iso.a")
    ha = {"Authorization": f"Bearer {tok_a}"}
    calc = client.post(
        "/api/v1/credit-health/calculate",
        headers=ha,
        json={
            "monthly_income": 50000.0,
            "credit_limit_total": 100000.0,
            "revolving_balance_total": 82000.0,
            "total_monthly_emi": 15000.0,
            "payment_consistency_ratio": 0.6,
            "credit_history_years": 1.0,
        },
    )
    assert calc.status_code == 200
    a_score = calc.json()["data"]["health_score"]

    # User B (fresh) asks the same question — must not see A's score/context.
    _eb, tok_b, _ub = _register("copilot.iso.b")
    hb = {"Authorization": f"Bearer {tok_b}"}
    r = client.post(
        "/api/v1/copilot/query",
        headers=hb,
        json={"query": "What is my credit health score?", "include_personal_context": True},
    )
    assert r.status_code == 200
    d = r.json()["data"]
    assert str(a_score) not in d["response"]
    assert d["grounding_summary"]["personal_context_used"] is False


# --------------------------------------------------------------------------- #
# 5. Spending analytics do not fabricate a per-category MoM delta             #
# --------------------------------------------------------------------------- #
def test_render_healthcheck_path_returns_200():
    """Render gates every deploy on this exact path; it must be 200 with no auth."""
    r = client.get("/api/v1/health/live")
    assert r.status_code == 200
    assert r.json()["status"] == "alive"


def test_cors_allows_a_vercel_origin_via_regex():
    """Any https://*.vercel.app deploy of the frontend is accepted (preflight)."""
    r = client.options(
        "/api/v1/users/login",
        headers={
            "Origin": "https://creditlens-git-main-someuser.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == "https://creditlens-git-main-someuser.vercel.app"
    assert r.headers.get("access-control-allow-credentials") == "true"


def test_cors_rejects_a_non_allowed_origin():
    r = client.options(
        "/api/v1/users/login",
        headers={
            "Origin": "https://totally-not-allowed.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )
    # Starlette does not echo an allow-origin header for a disallowed origin.
    assert r.headers.get("access-control-allow-origin") not in (
        "https://totally-not-allowed.example.com",
        "*",
    )


def test_cors_headers_are_present_on_a_500_error_response():
    """
    A browser reports a bare 500 (no CORS headers) as an opaque "CORS policy"
    error, masking the real failure. The exception handlers must re-attach CORS
    headers for an allowed Origin so the frontend gets the real status/body.
    """
    from starlette.testclient import TestClient as _RawTC
    from app.main import app

    marker = "/__regression_boom__"

    @app.get(marker)
    def _boom():  # pragma: no cover - trivial
        raise RuntimeError("intentional test failure")

    try:
        raw = _RawTC(app, raise_server_exceptions=False)
        r = raw.get(marker, headers={"Origin": "https://some-preview.vercel.app"})
        assert r.status_code == 500
        assert r.headers.get("access-control-allow-origin") == "https://some-preview.vercel.app"
        assert r.headers.get("access-control-allow-credentials") == "true"
        # A disallowed origin must NOT be echoed even on an error.
        r2 = raw.get(marker, headers={"Origin": "https://evil.example.com"})
        assert r2.status_code == 500
        assert r2.headers.get("access-control-allow-origin") != "https://evil.example.com"
    finally:
        app.router.routes = [
            rt for rt in app.router.routes if getattr(rt, "path", None) != marker
        ]


def test_login_route_does_a_user_table_select_that_matches_the_model():
    """
    Regression for the production 500 on /users/login and /users/register: the
    User model gained `designation` but the deployed DB lacked the column, so
    every `select(User)` raised. Here the schema is migrated to head (conftest +
    lifespan-equivalent), so a login attempt reaches the auth logic and returns a
    clean 401 for bad credentials — never a 500.
    """
    r = client.post(
        "/api/v1/users/login",
        json={"email": "definitely-not-registered@example.com", "password": "whatever12345"},
    )
    assert r.status_code == 401, r.text
    body = r.json()
    assert body["success"] is False
    # And a real registration round-trips the new column.
    email, tok, _uid = _register("designation.column")
    me = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {tok}"}).json()["data"]
    assert "designation" in me and me["designation"] is None


def test_real_user_category_mom_change_is_not_fabricated():
    _e, tok, _uid = _register("spend.mom")
    h = {"Authorization": f"Bearer {tok}"}
    up = client.post(
        "/api/v1/statements/upload",
        files={"file": ("s.csv", io.BytesIO(SAMPLE_CSV.encode()), "text/csv")},
        headers=h,
    )
    assert up.status_code == 200
    ov = client.get("/api/v1/spending/overview", headers=h).json()["data"]
    assert ov["categories"], "expected some categories from the uploaded statement"
    for c in ov["categories"]:
        assert c["month_over_month_change_pct"] == 0.0, (
            f"real user got a fabricated MoM delta for {c['category']}"
        )
