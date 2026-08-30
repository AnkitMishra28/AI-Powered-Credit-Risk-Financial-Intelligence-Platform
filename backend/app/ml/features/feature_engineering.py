"""
CreditLens Feature Engineering Engine
Derives financial domain metrics from consumer banking & credit line attributes.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any

def extract_credit_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw banking profile records into an enriched feature matrix for risk modeling.
    Applies deterministic mathematical transformations without data leakage.
    """
    X = df.copy()

    # 1. Monthly Installment Burden: estimated monthly repayment amount
    if "credit_amount" in X.columns and "duration" in X.columns:
        X["monthly_installment_burden"] = X["credit_amount"] / (X["duration"].astype(float) + 1e-5)

    # 2. Credit Amount to Age Ratio: measure of debt leverage relative to life stage
    if "credit_amount" in X.columns and "age" in X.columns:
        X["credit_to_age_ratio"] = X["credit_amount"] / (X["age"].astype(float) + 1.0)

    # 3. Financial Stability Index: tenure in residence + tenure in credit relationship
    if "residence_since" in X.columns and "existing_credits" in X.columns:
        X["stability_index"] = X["residence_since"].astype(float) + (X["existing_credits"].astype(float) * 1.5)

    # 4. Critical Credit History Indicator
    if "credit_history" in X.columns:
        X["has_delinquency_history"] = X["credit_history"].astype(str).str.lower().apply(
            lambda s: 1.0 if ("critical" in s or "delay" in s) else 0.0
        )

    # 5. Liquid Savings Buffer Tier (Ordinal Score 0-4)
    if "savings_status" in X.columns:
        savings_map = {
            "<100": 1.0,
            "100<=X<500": 2.0,
            "500<=X<1000": 3.0,
            ">=1000": 4.0,
            "no known savings": 0.0,
        }
        X["savings_buffer_score"] = X["savings_status"].astype(str).map(savings_map).fillna(0.0)

    # 6. Checking Liquidity Tier (Ordinal Score 0-3)
    if "checking_status" in X.columns:
        checking_map = {
            "<0": 0.0,
            "0<=X<200": 1.0,
            ">=200": 2.0,
            "no checking": 1.5,
        }
        X["checking_liquidity_score"] = X["checking_status"].astype(str).map(checking_map).fillna(1.0)

    return X
