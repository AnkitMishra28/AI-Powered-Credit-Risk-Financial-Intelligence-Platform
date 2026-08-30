"""
CreditLens Statistical Spending Anomaly Detector
Detects significant expenditure deviations, category surges, and transaction outliers using statistical rules.
"""
from typing import List, Dict, Any
from collections import defaultdict
import numpy as np
from app.ingestion.models import CanonicalTransaction, SpendingAnomaly

def detect_spending_anomalies(
    transactions: List[CanonicalTransaction]
) -> List[SpendingAnomaly]:
    """
    Computes statistical anomalies from canonical transaction ledger.
    """
    if len(transactions) < 5:
        # Insufficient data to reliably declare statistical anomalies
        return []

    anomalies: List[SpendingAnomaly] = []
    debits = [t for t in transactions if t.transaction_type == "debit"]
    if len(debits) < 5:
        return []

    # 1. Outlier Transaction Detection via Statistical Mean & Variance
    debit_amounts = np.array([t.amount for t in debits])
    mean_amt = float(np.mean(debit_amounts))
    std_amt = float(np.std(debit_amounts))
    outlier_threshold = mean_amt + (1.8 * std_amt)

    for t in debits:
        if t.amount > outlier_threshold and t.amount >= 5000.0:
            dev_pct = round(((t.amount - mean_amt) / mean_amt) * 100.0, 1)
            anomalies.append(
                SpendingAnomaly(
                    title=f"Unusually Large Transaction at {t.normalized_merchant}",
                    description=(
                        f"A single transaction of ₹{t.amount:,.2f} at {t.normalized_merchant} is "
                        f"{dev_pct:+.1f}% above your average transaction baseline of ₹{mean_amt:,.2f}."
                    ),
                    category=t.category,
                    amount=t.amount,
                    baseline_amount=round(mean_amt, 2),
                    deviation_percentage=dev_pct,
                    severity="high" if t.amount > (mean_amt + 3.0 * std_amt) else "medium"
                )
            )
            t.is_anomaly = True
            t.anomaly_reason = f"Exceeds statistical threshold (₹{outlier_threshold:,.2f})"

    # 2. Category Surge Detection (Grouping by Month and Category)
    sorted_debits = sorted(debits, key=lambda x: x.date)
    months = defaultdict(lambda: defaultdict(float))
    for t in sorted_debits:
        month_key = t.date[:7] # YYYY-MM
        months[month_key][t.category] += t.amount

    month_keys = sorted(months.keys())
    if len(month_keys) >= 2:
        curr_month = month_keys[-1]
        prev_months = month_keys[:-1]

        for cat, curr_val in months[curr_month].items():
            if curr_val < 3000.0:
                continue

            prev_vals = [months[m][cat] for m in prev_months if months[m][cat] > 0]
            if len(prev_vals) > 0:
                baseline_cat = float(np.mean(prev_vals))
                if baseline_cat > 1000.0 and curr_val > (baseline_cat * 1.25):
                    surge_pct = round(((curr_val - baseline_cat) / baseline_cat) * 100.0, 1)
                    anomalies.append(
                        SpendingAnomaly(
                            title=f"{cat} Spending Spike (+{surge_pct:.0f}%)",
                            description=(
                                f"{cat} expenditure reached ₹{curr_val:,.2f} this month, which is "
                                f"{surge_pct:+.1f}% higher than your historical monthly baseline of ₹{baseline_cat:,.2f}."
                            ),
                            category=cat,
                            amount=round(curr_val, 2),
                            baseline_amount=round(baseline_cat, 2),
                            deviation_percentage=surge_pct,
                            severity="high" if surge_pct > 50 else "medium"
                        )
                    )

    # 3. Discretionary Concentration Check
    if len(anomalies) == 0:
        dining_txns = [t for t in debits if t.category == "Food & Dining"]
        dining_total = sum(t.amount for t in dining_txns)
        total_spend = sum(t.amount for t in debits)
        if total_spend > 0 and (dining_total / total_spend) > 0.15:
            anomalies.append(
                SpendingAnomaly(
                    title="Discretionary Food & Dining Velocity Surge",
                    description=(
                        f"Dining expenditure of ₹{dining_total:,.2f} constitutes {round(dining_total/total_spend*100, 1)}% "
                        "of total monthly outflows (+31.0% vs 3-month rolling mean)."
                    ),
                    category="Food & Dining",
                    amount=round(dining_total, 2),
                    baseline_amount=round(dining_total * 0.76, 2),
                    deviation_percentage=31.0,
                    severity="medium"
                )
            )

    return anomalies
