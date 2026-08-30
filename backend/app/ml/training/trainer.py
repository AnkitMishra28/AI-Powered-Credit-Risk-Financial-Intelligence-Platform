"""
CreditLens Model Training & Serialization Pipeline
Trains Baseline (Logistic Regression) and Primary (XGBoost) models on South German Credit benchmark data.
"""
import os
import json
from datetime import datetime
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import xgboost as xgb

from app.ml.data.loader import load_credit_dataset, get_train_features_and_target
from app.ml.features.feature_engineering import extract_credit_features
from app.ml.preprocessing.preprocessor import build_preprocessor
from app.ml.evaluation.evaluator import evaluate_model

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "artifacts")

def sanitize_feature_name(name: str) -> str:
    """Removes special characters disallowed by XGBoost feature names."""
    return (
        name.replace("<=", "_le_")
        .replace(">=", "_ge_")
        .replace("<", "_lt_")
        .replace(">", "_gt_")
        .replace("=", "_eq_")
        .replace("[", "_")
        .replace("]", "_")
        .replace(" ", "_")
        .replace("/", "_")
        .replace("-", "_")
    )

def train_and_evaluate() -> dict:
    """
    Executes the full end-to-end reproducible training pipeline:
    Data Loader -> Feature Engineering -> Stratified Split -> Fit Preprocessor ->
    Fit Baseline -> Fit XGBoost -> Evaluate -> Serialize Artifacts -> Metadata JSON.
    """
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    print("[1/6] Loading South German Credit dataset...")
    df = load_credit_dataset()
    total_samples = len(df)

    print("[2/6] Extracting financial domain features...")
    X_raw, y = get_train_features_and_target(df)
    X_engineered = extract_credit_features(X_raw)

    bad_count = int(y.sum())
    good_count = int(total_samples - bad_count)
    imbalance_ratio = round(good_count / bad_count, 2)

    print(f"      Total records: {total_samples}, Non-Default (Good): {good_count}, Default (Bad): {bad_count}")
    print(f"      Class imbalance ratio: {imbalance_ratio}:1")

    print("[3/6] Performing Stratified 80/20 train/test split (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_engineered, y, test_size=0.20, random_state=42, stratify=y
    )

    print("[4/6] Fitting preprocessing ColumnTransformer on training split...")
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    # Extract sanitized feature names for XGBoost
    raw_feature_names = list(preprocessor.get_feature_names_out())
    feature_names = [sanitize_feature_name(name) for name in raw_feature_names]

    print("[5/6] Training Models...")
    # Baseline: Logistic Regression
    baseline_model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
    baseline_model.fit(X_train_trans, y_train)
    baseline_metrics = evaluate_model(baseline_model, X_test_trans, y_test, model_name="Logistic Regression (Baseline)")

    # Primary: Tuned XGBoost Classifier
    scale_pos_weight = float(imbalance_ratio)
    xgb_model = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.04,
        scale_pos_weight=scale_pos_weight,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_model.fit(X_train_trans, y_train)
    xgb_metrics = evaluate_model(xgb_model, X_test_trans, y_test, model_name="XGBoost Classifier (Primary)")

    print(f"      Baseline ROC-AUC: {baseline_metrics['roc_auc']}, F1: {baseline_metrics['f1_score']}")
    print(f"      XGBoost  ROC-AUC: {xgb_metrics['roc_auc']}, F1: {xgb_metrics['f1_score']}")

    print("[6/6] Serializing model artifacts to disk...")
    model_path = os.path.join(ARTIFACTS_DIR, "model.joblib")
    preprocessor_path = os.path.join(ARTIFACTS_DIR, "preprocessor.joblib")
    baseline_path = os.path.join(ARTIFACTS_DIR, "baseline.joblib")
    metadata_path = os.path.join(ARTIFACTS_DIR, "metadata.json")

    joblib.dump(xgb_model, model_path)
    joblib.dump(preprocessor, preprocessor_path)
    joblib.dump(baseline_model, baseline_path)

    metadata = {
        "model_name": "CreditLens XGBoost Credit Risk Classifier",
        "model_version": "creditlens-risk-xgb-v1.2",
        "dataset": {
            "name": "South German Credit (Groemping, 2020 / UCI / OpenML credit-g)",
            "source": "UCI Machine Learning Repository & OpenML",
            "total_rows": total_samples,
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "raw_features_count": len(X_raw.columns),
            "transformed_features_count": len(feature_names),
            "target": "class (0: Good / Non-Default, 1: Bad / Default)",
            "class_distribution": {"good_non_default": good_count, "bad_default": bad_count},
            "class_imbalance_ratio": f"{imbalance_ratio}:1"
        },
        "training_timestamp": datetime.utcnow().isoformat(),
        "baseline_metrics": baseline_metrics,
        "primary_xgb_metrics": xgb_metrics,
        "feature_names": feature_names,
        "disclaimer": (
            "This model is trained on a public German credit benchmark dataset for educational, pattern analysis, "
            "and portfolio demonstration purposes. It is not an official credit bureau underwriting algorithm."
        )
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"      Saved: {model_path}")
    print(f"      Saved: {preprocessor_path}")
    print(f"      Saved: {metadata_path}")
    print("\nTraining completed successfully!")

    return metadata

if __name__ == "__main__":
    train_and_evaluate()
