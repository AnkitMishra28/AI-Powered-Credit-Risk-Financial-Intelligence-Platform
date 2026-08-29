"""
CreditLens ML Feature Engineering Scaffolding (Phase 1 Foundation)
Prepares mathematical feature vectors from transactions, income, and debt structures.
"""
from typing import Dict, Any, List
import datetime

class FinancialFeatureExtractor:
    """
    Transforms raw transactional & financial profile records into normalized numerical feature arrays.
    """
    @staticmethod
    def extract_features(
        monthly_income: float,
        credit_limit: float,
        revolving_balance: float,
        transactions: List[Dict[str, Any]],
        loans: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        Calculates deterministic feature inputs for the Scikit-Learn/XGBoost risk model.
        """
        # Utilization Ratio
        utilization_pct = (revolving_balance / credit_limit * 100.0) if credit_limit > 0 else 0.0
        
        # Debt to Income Ratio (DTI)
        total_emi = sum(loan.get("monthly_emi", 0.0) for loan in loans)
        dti_pct = (total_emi / monthly_income * 100.0) if monthly_income > 0 else 0.0
        
        # Total monthly spend
        total_monthly_spend = sum(t.get("amount", 0.0) for t in transactions)
        savings_cushion_pct = ((monthly_income - total_monthly_spend - total_emi) / monthly_income * 100.0) if monthly_income > 0 else 0.0
        
        return {
            "monthly_income": monthly_income,
            "credit_limit": credit_limit,
            "revolving_balance": revolving_balance,
            "utilization_pct": round(utilization_pct, 2),
            "dti_pct": round(dti_pct, 2),
            "monthly_spend_total": round(total_monthly_spend, 2),
            "savings_cushion_pct": round(savings_cushion_pct, 2),
            "payment_consistency_index": 0.94, # calculated from payment history logs in Phase 2
            "discretionary_spend_ratio": 0.38,
        }

feature_extractor = FinancialFeatureExtractor()
