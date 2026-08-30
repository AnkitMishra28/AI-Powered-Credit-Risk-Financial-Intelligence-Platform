"""
CreditLens Feature Dictionary
Formal metadata catalog documenting all features used by the Credit Risk XGBoost and SHAP engines.
"""
from typing import Dict, Any

FEATURE_DICTIONARY: Dict[str, Dict[str, str]] = {
    "checking_status": {
        "display_name": "Checking Account Liquidity",
        "type": "Categorical",
        "description": "Current status of primary operating checking account (<0, 0-200, >=200, none).",
        "source": "Primary checking balance",
        "rationale": "Direct indicator of immediate cashflow solvency and overdraft frequency."
    },
    "duration": {
        "display_name": "Credit Duration (Months)",
        "type": "Numerical",
        "description": "Repayment tenure in months for credit facility.",
        "source": "Credit term",
        "rationale": "Longer durations increase exposure time to macroeconomic and life shocks."
    },
    "credit_history": {
        "display_name": "Historical Repayment Track Record",
        "type": "Categorical",
        "description": "Record of past payment consistency, prompt settlements, or past delays.",
        "source": "Historical repayment logs",
        "rationale": "Past repayment behavior is historically the strongest predictive factor in credit default modeling."
    },
    "purpose": {
        "display_name": "Credit Facility Purpose",
        "type": "Categorical",
        "description": "Stated purpose of credit (e.g. vehicle, business, education, electronics).",
        "source": "Application data",
        "rationale": "Asset-backed purchases (e.g. car, property) historically experience lower default rates than unsecured discretionary consumption."
    },
    "credit_amount": {
        "display_name": "Total Credit / Balance (Currency Units)",
        "type": "Numerical",
        "description": "Aggregate credit principal or outstanding revolving balance.",
        "source": "Credit facility limit/drawdown",
        "rationale": "Absolute scale of liability that must be amortized."
    },
    "savings_status": {
        "display_name": "Savings & Liquid Reserves",
        "type": "Categorical",
        "description": "Available savings balances, liquid bonds, or emergency reserves.",
        "source": "Savings deposit records",
        "rationale": "Liquidity buffer providing shock absorption during adverse financial events."
    },
    "employment": {
        "display_name": "Employment Tenure",
        "type": "Categorical",
        "description": "Years of continuous tenure with current employer or business.",
        "source": "Employment record",
        "rationale": "Tenure correlates with cashflow certainty and income stability."
    },
    "installment_commitment": {
        "display_name": "Debt-to-Income / Installment Burden Tier",
        "type": "Numerical (1-4)",
        "description": "Installment rate as a percentage of disposable monthly income (1: <20%, 4: >35%).",
        "source": "Monthly debt EMI / disposable income",
        "rationale": "Quantifies leverage ratio; higher installment burdens restrict disposable cashflow."
    },
    "age": {
        "display_name": "Borrower Age",
        "type": "Numerical",
        "description": "Age of the primary borrower in completed years.",
        "source": "Identity verification",
        "rationale": "Correlates with career lifecycle stage, wealth accumulation, and stability."
    },
    "monthly_installment_burden": {
        "display_name": "Monthly Amortization Velocity",
        "type": "Numerical (Derived)",
        "description": "Estimated monthly repayment amount (credit_amount / duration).",
        "source": "Calculated: credit_amount / duration",
        "rationale": "Monthly cashflow drain required to service the active balance."
    },
    "credit_to_age_ratio": {
        "display_name": "Debt Leverage to Age Ratio",
        "type": "Numerical (Derived)",
        "description": "Ratio of total credit exposure to borrower age.",
        "source": "Calculated: credit_amount / (age + 1)",
        "rationale": "Detects excessive leverage relative to wealth accumulation seasoning."
    },
    "has_delinquency_history": {
        "display_name": "Delinquency Indicator Flag",
        "type": "Binary (Derived)",
        "description": "Binary flag indicating past delayed payments or critical credit history.",
        "source": "Derived from credit_history",
        "rationale": "Direct flag for adverse credit remarks."
    },
    "savings_buffer_score": {
        "display_name": "Savings Buffer Index",
        "type": "Numerical Ordinal (Derived)",
        "description": "Ordinal rating of liquid emergency cushion (0 = none, 4 = >=1000).",
        "source": "Derived from savings_status",
        "rationale": "Provides linear feature for tree splits representing emergency reserves."
    }
}
