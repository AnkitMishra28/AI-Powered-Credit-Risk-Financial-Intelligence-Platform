"""
CreditLens Recurring Payment Detection Engine
Identifies likely recurring subscription charges, loan EMIs, utilities, and memberships.
"""
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime
from app.ingestion.models import CanonicalTransaction, RecurringPayment

KNOWN_SUBSCRIPTIONS = {
    "NETFLIX": ("Entertainment", 649.0, "Monthly"),
    "SPOTIFY": ("Entertainment", 119.0, "Monthly"),
    "AMAZON PRIME": ("Entertainment", 299.0, "Monthly"),
    "DISNEY+ HOTSTAR": ("Entertainment", 299.0, "Monthly"),
    "YOUTUBE PREMIUM": ("Entertainment", 149.0, "Monthly"),
    "APPLE SERVICES": ("Entertainment", 99.0, "Monthly"),
    "AIRTEL": ("Utilities", 999.0, "Monthly"),
    "RELIANCE JIO": ("Utilities", 799.0, "Monthly"),
    "CULT.FIT GYM": ("Healthcare", 1750.0, "Monthly"),
    "CRED CLUB": ("EMI / Loan", 8500.0, "Monthly"),
    "HDFC BANK LOAN": ("EMI / Loan", 12500.0, "Monthly"),
    "SBI LOAN": ("EMI / Loan", 9500.0, "Monthly"),
}

def detect_recurring_payments(
    transactions: List[CanonicalTransaction]
) -> List[RecurringPayment]:
    """
    Scans transaction history to identify likely recurring payments and subscriptions.
    """
    if len(transactions) == 0:
        return []

    # Group debit transactions by normalized merchant
    merchant_txns = defaultdict(list)
    for t in transactions:
        if t.transaction_type == "debit":
            merchant_txns[t.normalized_merchant].append(t)

    recurring_list: List[RecurringPayment] = []
    seen_merchants = set()

    for merchant, txns in merchant_txns.items():
        merchant_upper = merchant.upper()
        
        # 1. Match against known subscription providers
        for sub_key, (sub_cat, default_est, freq) in KNOWN_SUBSCRIPTIONS.items():
            if sub_key in merchant_upper:
                latest_txn = max(txns, key=lambda x: x.date)
                avg_amount = sum(t.amount for t in txns) / len(txns)
                rec = RecurringPayment(
                    merchant=merchant,
                    category=sub_cat,
                    estimated_amount=round(avg_amount if avg_amount > 0 else default_est, 2),
                    frequency=freq, # type: ignore
                    last_payment_date=latest_txn.date,
                    confidence=0.95,
                    status="active"
                )
                recurring_list.append(rec)
                seen_merchants.add(merchant)
                break

        if merchant in seen_merchants:
            continue

        # 2. Check for multi-month recurring pattern (>= 2 transactions with similar amounts)
        if len(txns) >= 2:
            amounts = [t.amount for t in txns]
            avg_amt = sum(amounts) / len(amounts)
            max_dev = max(abs(a - avg_amt) for a in amounts)
            # If all occurrences within 10% of mean
            if (max_dev / (avg_amt + 1e-5)) < 0.10 and avg_amt >= 200.0:
                latest_txn = max(txns, key=lambda x: x.date)
                rec = RecurringPayment(
                    merchant=merchant,
                    category=latest_txn.category,
                    estimated_amount=round(avg_amt, 2),
                    frequency="Monthly",
                    last_payment_date=latest_txn.date,
                    confidence=0.88,
                    status="active"
                )
                recurring_list.append(rec)
                seen_merchants.add(merchant)

    # If small single-month statement, include high-confidence default subscription detected
    if len(recurring_list) == 0:
        for t in transactions:
            if "NETFLIX" in t.normalized_merchant.upper() or "SPOTIFY" in t.normalized_merchant.upper() or "AIRTEL" in t.normalized_merchant.upper():
                rec = RecurringPayment(
                    merchant=t.normalized_merchant,
                    category=t.category,
                    estimated_amount=t.amount,
                    frequency="Monthly",
                    last_payment_date=t.date,
                    confidence=0.92,
                    status="active"
                )
                recurring_list.append(rec)

    return recurring_list
