"""
CreditLens Deterministic Credit Health Score Engine
Computes transparent, explainable 0–1000 financial diagnostic health scores.
Completely independent of LLMs.
"""
from typing import Dict, Any, List
import math

class CreditHealthEngine:
    """
    Deterministic scoring engine calculating CreditLens Credit Health Scores (0-1000).
    """
    @staticmethod
    def calculate_score(
        monthly_income: float = 65000.0,
        credit_limit_total: float = 250000.0,
        revolving_balance_total: float = 170000.0,
        total_monthly_emi: float = 8500.0,
        payment_consistency_ratio: float = 0.94,
        credit_history_years: float = 4.2,
        monthly_spending_total: float = 49230.0,
        spending_average_6mo: float = 50055.0
    ) -> Dict[str, Any]:
        """
        Calculates the 5 deterministic score components and sums to aggregate [0, 1000] index.
        """
        # 1. Payment Consistency & Reliability (Max: 350 pts)
        payment_norm = max(0.0, min(1.0, payment_consistency_ratio))
        payment_points = round(350.0 * (payment_norm ** 1.8), 1)
        payment_score_pct = round(payment_norm * 100.0, 1)

        # 2. Revolving Credit Utilization (Max: 250 pts)
        utilization_pct = (revolving_balance_total / credit_limit_total * 100.0) if credit_limit_total > 0 else 0.0
        # Optimal: <30%.
        if utilization_pct <= 10.0:
            util_points = 250.0
        elif utilization_pct <= 30.0:
            util_points = 250.0 - ((utilization_pct - 10.0) / 20.0 * 40.0) # 250 -> 210
        elif utilization_pct <= 50.0:
            util_points = 210.0 - ((utilization_pct - 30.0) / 20.0 * 50.0) # 210 -> 160
        elif utilization_pct <= 70.0:
            util_points = 160.0 - ((utilization_pct - 50.0) / 20.0 * 50.0) # 160 -> 110 (68% -> ~115)
        else:
            util_points = max(20.0, 110.0 - ((utilization_pct - 70.0) / 30.0 * 90.0))
        util_points = round(util_points, 1)
        util_score_pct = round(util_points / 2.5, 1)

        # 3. Debt-to-Income / Total Debt Servicing Burden (Max: 200 pts)
        # Factor in total loan EMI + 5% revolving credit minimum payment burden
        revolving_min_due = revolving_balance_total * 0.05
        total_monthly_debt_drain = total_monthly_emi + revolving_min_due
        effective_dti_pct = (total_monthly_debt_drain / monthly_income * 100.0) if monthly_income > 0 else 0.0
        
        if effective_dti_pct <= 15.0:
            dti_points = 200.0
        elif effective_dti_pct <= 30.0:
            dti_points = 200.0 - ((effective_dti_pct - 15.0) / 15.0 * 50.0) # 200 -> 150 (26.1% -> ~153)
        elif effective_dti_pct <= 50.0:
            dti_points = 150.0 - ((effective_dti_pct - 30.0) / 20.0 * 60.0) # 150 -> 90
        else:
            dti_points = max(20.0, 90.0 - ((effective_dti_pct - 50.0) / 25.0 * 70.0))
        dti_points = round(dti_points, 1)
        dti_score_pct = round(dti_points / 2.0, 1)

        # 4. Credit History Tenure & Seasoning (Max: 100 pts)
        if credit_history_years >= 5.0:
            tenure_points = 100.0
        elif credit_history_years >= 3.0:
            tenure_points = 75.0 + ((credit_history_years - 3.0) / 2.0 * 15.0) # 4.2yr -> ~84
        elif credit_history_years >= 1.0:
            tenure_points = 50.0 + ((credit_history_years - 1.0) / 2.0 * 25.0)
        else:
            tenure_points = max(20.0, credit_history_years * 50.0)
        tenure_points = round(tenure_points, 1)
        tenure_score_pct = round(tenure_points, 1)

        # 5. Cashflow Volatility & Spending Stability (Max: 100 pts)
        spending_ratio = (monthly_spending_total / spending_average_6mo) if spending_average_6mo > 0 else 1.0
        if spending_ratio <= 1.0:
            spend_points = 100.0 - (abs(1.0 - spending_ratio) * 15.0) # 0.98x -> ~99.7
        elif spending_ratio <= 1.15:
            spend_points = 100.0 - ((spending_ratio - 1.0) / 0.15 * 20.0)
        else:
            spend_points = max(30.0, 80.0 - ((spending_ratio - 1.15) / 0.35 * 50.0))
        spend_points = round(spend_points, 1)
        spend_score_pct = round(spend_points, 1)

        # Sum total score and strictly clamp between 0 and 1000
        raw_total = payment_points + util_points + dti_points + tenure_points + spend_points
        final_score = int(max(0, min(1000, round(raw_total))))

        # Determine Tier
        if final_score >= 800:
            tier = "Excellent"
        elif final_score >= 700:
            tier = "Healthy"
        elif final_score >= 600:
            tier = "Fair"
        else:
            tier = "Needs Attention"

        # Determine factor statuses & impact descriptions
        factors = [
            {
                "factor_id": "payment_history",
                "name": "Payment Reliability & Consistency",
                "score": payment_score_pct,
                "weight": 0.35,
                "status": "optimal" if payment_score_pct >= 90 else "good" if payment_score_pct >= 75 else "warning",
                "description": f"{payment_score_pct:.0f}% on-time payment track record across all credit lines.",
                "impact_detail": f"+{int(payment_points)} pts contributed to score baseline"
            },
            {
                "factor_id": "credit_utilization",
                "name": "Revolving Credit Utilization",
                "score": round(100.0 - utilization_pct, 1),
                "weight": 0.25,
                "status": "optimal" if utilization_pct <= 30 else "warning" if utilization_pct <= 70 else "critical",
                "description": f"Currently utilizing {utilization_pct:.1f}% of total ₹{credit_limit_total:,.0f} limit.",
                "impact_detail": f"{int(util_points)} / 250 pts (Target < 30% for +60 pts boost)"
            },
            {
                "factor_id": "debt_to_income",
                "name": "Debt-to-Income (DTI) Leverage",
                "score": round(max(0.0, 100.0 - effective_dti_pct), 1),
                "weight": 0.20,
                "status": "optimal" if effective_dti_pct <= 25 else "good" if effective_dti_pct <= 36 else "warning",
                "description": f"Total monthly debt servicing drains {effective_dti_pct:.1f}% of ₹{monthly_income:,.0f} net income.",
                "impact_detail": f"{int(dti_points)} / 200 pts (Safe borrowing corridor)"
            },
            {
                "factor_id": "credit_history",
                "name": "Credit History Length & Seasoning",
                "score": tenure_score_pct,
                "weight": 0.10,
                "status": "optimal" if credit_history_years >= 4.0 else "good" if credit_history_years >= 2.0 else "warning",
                "description": f"Oldest active account has {credit_history_years:.1f} years of seasoned tenure.",
                "impact_detail": f"{int(tenure_points)} / 100 pts tenure credit"
            },
            {
                "factor_id": "recent_spending",
                "name": "Spending Velocity & Cashflow Stability",
                "score": spend_score_pct,
                "weight": 0.10,
                "status": "optimal" if spending_ratio <= 1.05 else "good" if spending_ratio <= 1.20 else "warning",
                "description": f"Monthly spending rate is {spending_ratio:.2f}x of 6-month historical baseline.",
                "impact_detail": f"{int(spend_points)} / 100 pts cashflow stability"
            }
        ]

        history = [
            {"month": "Oct", "score": max(500, final_score - 32), "utilization": round(utilization_pct + 6.0, 1)},
            {"month": "Nov", "score": max(500, final_score - 24), "utilization": round(utilization_pct + 4.5, 1)},
            {"month": "Dec", "score": max(500, final_score - 17), "utilization": round(utilization_pct + 3.0, 1)},
            {"month": "Jan", "score": max(500, final_score - 12), "utilization": round(utilization_pct + 2.0, 1)},
            {"month": "Feb", "score": max(500, final_score - 18), "utilization": round(utilization_pct + 7.0, 1)},
            {"month": "Mar", "score": final_score, "utilization": round(utilization_pct, 1)},
        ]

        return {
            "health_score": final_score,
            "score_tier": tier,
            "score_delta": 18,
            "calculation_timestamp": "2026-03-28T10:00:00Z",
            "factors": factors,
            "history": history,
            "disclaimer": (
                "CreditLens Credit Health Score is an educational and diagnostic metric. "
                "It is NOT a CIBIL or official credit bureau score and does NOT constitute credit or financial advice."
            ),
            "is_demo": True
        }

credit_health_engine = CreditHealthEngine()
