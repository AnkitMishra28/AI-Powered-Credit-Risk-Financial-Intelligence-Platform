from typing import List
from app.schemas.spending import (
    SpendingIntelligenceResponse,
    CategorySpend,
    MonthlySpendTrend,
    SpendingAnomaly,
    TransactionItem
)

class SpendingIntelligenceService:
    @staticmethod
    def get_demo_spending_intelligence() -> SpendingIntelligenceResponse:
        """
        Returns structured demo spending categories, trend analytics, anomalies, and transaction ledger.
        """
        categories = [
            CategorySpend(category="Food & Dining", amount=14200.0, percentage=28.8, color="#10B981", month_over_month_change_pct=31.0),
            CategorySpend(category="Shopping", amount=11850.0, percentage=24.1, color="#3B82F6", month_over_month_change_pct=-8.4),
            CategorySpend(category="Utilities & Bills", amount=7600.0, percentage=15.4, color="#8B5CF6", month_over_month_change_pct=2.1),
            CategorySpend(category="Transport & Fuel", amount=5400.0, percentage=11.0, color="#F59E0B", month_over_month_change_pct=-4.5),
            CategorySpend(category="Entertainment", amount=4180.0, percentage=8.5, color="#EC4899", month_over_month_change_pct=12.0),
            CategorySpend(category="Healthcare", amount=3200.0, percentage=6.5, color="#06B6D4", month_over_month_change_pct=-15.0),
            CategorySpend(category="Other", amount=2800.0, percentage=5.7, color="#64748B", month_over_month_change_pct=0.0),
        ]

        monthly_trend = [
            MonthlySpendTrend(month="Oct", amount=46200.0, budget=50000.0),
            MonthlySpendTrend(month="Nov", amount=51400.0, budget=50000.0),
            MonthlySpendTrend(month="Dec", amount=54800.0, budget=52000.0),
            MonthlySpendTrend(month="Jan", amount=47300.0, budget=50000.0),
            MonthlySpendTrend(month="Feb", amount=51400.0, budget=50000.0),
            MonthlySpendTrend(month="Mar", amount=49230.0, budget=50000.0),
        ]

        anomalies = [
            SpendingAnomaly(
                id="anom-001",
                category="Food & Dining",
                title="Dining Spending Spike",
                description="Dining expenditure increased 31% compared with your 3-month rolling average (₹10,840 avg vs ₹14,200 actual).",
                percentage_above_average=31.0,
                historical_average=10840.0,
                current_amount=14200.0,
                severity="warning"
            ),
            SpendingAnomaly(
                id="anom-002",
                category="Entertainment",
                title="Subscription Clustering",
                description="3 recurring streaming subscriptions billed within a 48-hour window totaling ₹1,899.",
                percentage_above_average=12.0,
                historical_average=3700.0,
                current_amount=4180.0,
                severity="info"
            )
        ]

        recent_transactions = [
            TransactionItem(id="tx-101", date="2026-03-28", merchant="Swiggy Gourmet", category="Food & Dining", amount=1240.00, account_type="Credit Card", is_anomaly=True, anomaly_reason="Category spend velocity +31%"),
            TransactionItem(id="tx-102", date="2026-03-27", merchant="Amazon Retail", category="Shopping", amount=3499.00, account_type="Credit Card", is_anomaly=False),
            TransactionItem(id="tx-103", date="2026-03-26", merchant="Uber Premier", category="Transport & Fuel", amount=620.00, account_type="Credit Card", is_anomaly=False),
            TransactionItem(id="tx-104", date="2026-03-25", merchant="Netflix Premium", category="Entertainment", amount=649.00, account_type="Credit Card", is_anomaly=False),
            TransactionItem(id="tx-105", date="2026-03-24", merchant="Tata Power Electricity", category="Utilities & Bills", amount=2850.00, account_type="Bank Account", is_anomaly=False),
            TransactionItem(id="tx-106", date="2026-03-23", merchant="Apollo Pharmacy", category="Healthcare", amount=1120.00, account_type="Credit Card", is_anomaly=False),
            TransactionItem(id="tx-107", date="2026-03-22", merchant="Zomato Dining", category="Food & Dining", amount=2180.00, account_type="Credit Card", is_anomaly=True, anomaly_reason="Weekend dining clustering"),
            TransactionItem(id="tx-108", date="2026-03-20", merchant="HP Petrol Pump", category="Transport & Fuel", amount=2500.00, account_type="Credit Card", is_anomaly=False),
        ]

        return SpendingIntelligenceResponse(
            total_spending_current_month=49230.0,
            spending_delta_pct=-4.2,
            average_monthly_spend=50055.0,
            categories=categories,
            monthly_trend=monthly_trend,
            anomalies=anomalies,
            recent_transactions=recent_transactions,
            is_demo=True
        )

spending_service = SpendingIntelligenceService()
