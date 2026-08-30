"""
CreditLens ML Data Ingestion & Dataset Loader
Loads and validates the public German Credit / South German Credit benchmark dataset.
"""
import os
import pandas as pd
from typing import Tuple

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(DATA_DIR, "south_german_credit.csv")

def load_credit_dataset() -> pd.DataFrame:
    """
    Loads the South German Credit dataset from local storage or downloads it if missing.
    Returns:
        pd.DataFrame: Raw dataset with 1,000 records and 21 columns (20 features + target).
    """
    if os.path.exists(CSV_PATH):
        df = pd.read_csv(CSV_PATH)
        return df

    # Fallback to fetching via OpenML if file was deleted
    from sklearn.datasets import fetch_openml
    dataset = fetch_openml(name="credit-g", version=1, as_frame=True)
    df = dataset.frame
    df.to_csv(CSV_PATH, index=False)
    return df

def get_train_features_and_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Separates feature matrix X and binary target y.
    Target definition:
        0 = Good Credit (non-default / creditworthy)
        1 = Bad Credit (default / risk event)
    """
    target_col = "class"
    X = df.drop(columns=[target_col]).copy()
    # In credit risk modeling, we model P(default=1)
    y = (df[target_col].str.lower() == "bad").astype(int)
    return X, y
