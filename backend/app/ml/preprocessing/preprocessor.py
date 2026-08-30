"""
CreditLens Preprocessing Pipeline
Constructs leakage-free ColumnTransformer with OneHotEncoder and StandardScaler.
"""
from typing import List, Tuple
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import pandas as pd

NUMERICAL_COLS = [
    "duration",
    "credit_amount",
    "installment_commitment",
    "residence_since",
    "age",
    "existing_credits",
    "num_dependents",
    "monthly_installment_burden",
    "credit_to_age_ratio",
    "stability_index",
    "has_delinquency_history",
    "savings_buffer_score",
    "checking_liquidity_score",
]

CATEGORICAL_COLS = [
    "checking_status",
    "credit_history",
    "purpose",
    "savings_status",
    "employment",
    "personal_status",
    "other_parties",
    "property_magnitude",
    "other_payment_plans",
    "housing",
    "job",
    "own_telephone",
    "foreign_worker",
]

def build_preprocessor() -> ColumnTransformer:
    """
    Constructs a scikit-learn ColumnTransformer for numerical scaling and categorical one-hot encoding.
    Ensures zero data leakage by being fitted exclusively on training splits.
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_COLS),
            ("cat", cat_pipeline, CATEGORICAL_COLS),
        ],
        remainder="drop"
    )

    return preprocessor
