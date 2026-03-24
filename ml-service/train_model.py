"""
CredBuzz ML Model Training Pipeline v2.0
=========================================
Trains RandomForest classifier on realistic bid-success prediction

Dataset: mock_training_data.csv (2000 realistic samples)
Model: RandomForestClassifier (100 trees, balanced classes)
Features: 10 bid quality indicators
Output: Model + metadata + cross-validation scores
"""

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from pathlib import Path
import json
from datetime import datetime

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

# Feature columns (10 total, all 0-1 normalized)
FEATURES = [
    'skillMatchScore',        # 0-1: proposal vs task skill match
    'creditFairness',         # 0-1: fairness of proposed credits
    'deadlineRealism',        # 0-1: realistic timeline
    'completionRate',         # 0-1: worker's historical completion rate
    'avgRating',              # 0-1: normalized 0-5 rating
    'lateRatio',              # 0-1: fraction of late deliveries
    'workloadScore',          # 0-1: current active tasks / 10
    'experienceLevel',        # 0-1: normalized log(completed_tasks)
    'proposalRelevanceScore', # 0-1: keyword match relevance
    'keywordCoverageScore'    # 0-1: keywords covered
]

TARGET = 'success'



def load_training_data():
    """Load mock training data"""
    csv_path = DATA_DIR / "mock_training_data.csv"
    print(f"\n📥 Loading training data from {csv_path.name}...")
    df = pd.read_csv(csv_path)
    
    # Validate
    missing_features = [f for f in FEATURES if f not in df.columns]
    if missing_features:
        print(f"   ❌ Error: Missing features: {missing_features}")
        return None
    
    print(f"   ✓ Loaded {len(df)} samples")
    print(f"   ✓ Features: {len(FEATURES)}")
    print(f"   ✓ Target distribution: Success={df[TARGET].sum()} ({df[TARGET].mean():.1%})")
    
    return df


def train_model_classifier(X_train, y_train):
    """Train RandomForest classifier"""
    print("\n🤖 Training RandomForestClassifier...")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'  # Handle class imbalance
    )
    
    model.fit(X_train, y_train)
    print(f"   ✓ Model trained on {len(X_train)} samples")
    return model


def evaluate_model(model, X_train, X_test, y_train, y_test):
    """Comprehensive model evaluation"""
    print("\n📊 Model Evaluation")
    print("=" * 60)
    
    # Training metrics
    y_train_pred = model.predict(X_train)
    y_train_proba = model.predict_proba(X_train)[:, 1]
    
    train_acc = accuracy_score(y_train, y_train_pred)
    train_auc = roc_auc_score(y_train, y_train_proba)
    train_f1 = f1_score(y_train, y_train_pred)
    
    print(f"\n📈 Training Set ({len(X_train)} samples):")
    print(f"   Accuracy:  {train_acc:.4f}")
    print(f"   AUC-ROC:   {train_auc:.4f}")
    print(f"   F1-Score:  {train_f1:.4f}")
    
    # Test metrics
    y_test_pred = model.predict(X_test)
    y_test_proba = model.predict_proba(X_test)[:, 1]
    
    test_acc = accuracy_score(y_test, y_test_pred)
    test_auc = roc_auc_score(y_test, y_test_proba)
    test_f1 = f1_score(y_test, y_test_pred)
    test_precision = precision_score(y_test, y_test_pred)
    test_recall = recall_score(y_test, y_test_pred)
    
    print(f"\n🎯 Test Set ({len(X_test)} samples):")
    print(f"   Accuracy:  {test_acc:.4f}")
    print(f"   Precision: {test_precision:.4f}")
    print(f"   Recall:    {test_recall:.4f}")
    print(f"   F1-Score:  {test_f1:.4f}")
    print(f"   AUC-ROC:   {test_auc:.4f}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_test_pred)
    print(f"\n📋 Confusion Matrix (Test Set):")
    print(f"   TN: {cm[0,0]:4d}  FP: {cm[0,1]:4d}")
    print(f"   FN: {cm[1,0]:4d}  TP: {cm[1,1]:4d}")
    
    # Classification report
    print(f"\n📝 Classification Report:")
    print(classification_report(y_test, y_test_pred, target_names=['Failed', 'Success']))
    
    return {
        'train_accuracy': float(train_acc),
        'train_auc': float(train_auc),
        'train_f1': float(train_f1),
        'test_accuracy': float(test_acc),
        'test_auc': float(test_auc),
        'test_f1': float(test_f1),
        'test_precision': float(test_precision),
        'test_recall': float(test_recall),
        'confusion_matrix': cm.tolist()
    }


def cross_validate_model(model, X, y):
    """Perform 5-fold cross-validation"""
    print("\n🔄 Cross-Validation (5-Fold)")
    print("=" * 60)
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    cv_scores_acc = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
    cv_scores_auc = cross_val_score(model, X, y, cv=cv, scoring='roc_auc')
    cv_scores_f1 = cross_val_score(model, X, y, cv=cv, scoring='f1')
    
    print(f"\n   Accuracy:  {cv_scores_acc.mean():.4f} (+/- {cv_scores_acc.std():.4f})")
    print(f"   AUC-ROC:   {cv_scores_auc.mean():.4f} (+/- {cv_scores_auc.std():.4f})")
    print(f"   F1-Score:  {cv_scores_f1.mean():.4f} (+/- {cv_scores_f1.std():.4f})")
    
    print(f"\n   Fold Scores:")
    for i in range(5):
        print(f"     Fold {i+1}: Acc={cv_scores_acc[i]:.4f} AUC={cv_scores_auc[i]:.4f} F1={cv_scores_f1[i]:.4f}")
    
    return {
        'accuracy_mean': float(cv_scores_acc.mean()),
        'accuracy_std': float(cv_scores_acc.std()),
        'auc_mean': float(cv_scores_auc.mean()),
        'auc_std': float(cv_scores_auc.std()),
        'f1_mean': float(cv_scores_f1.mean()),
        'f1_std': float(cv_scores_f1.std()),
    }


def feature_importance(model):
    """Analyze and print feature importance"""
    print("\n⚡ Feature Importance")
    print("=" * 60)
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    print()
    for i, idx in enumerate(indices, 1):
        importance = importances[idx]
        bar = "█" * int(importance * 50)
        print(f"   {i:2d}. {FEATURES[idx]:25s} {importance:.4f} {bar}")
    
    return dict(zip(FEATURES, map(float, importances)))


def save_model_artifacts(model, metrics, importances):
    """Save model, scaler, and metadata"""
    print("\n💾 Saving Model Artifacts")
    print("=" * 60)
    
    timestamp = datetime.now().isoformat()
    
    # Save model
    model_path = MODEL_DIR / "bid_success_model.pkl"
    joblib.dump(model, model_path)
    print(f"   ✓ Model: {model_path}")
    
    # Save metadata
    metadata = {
        'version': '2.0',
        'release_date': timestamp,
        'model_type': 'RandomForestClassifier',
        'n_features': len(FEATURES),
        'features': FEATURES,
        'target': TARGET,
        'hyperparameters': {
            'n_estimators': 100,
            'max_depth': 15,
            'min_samples_split': 10,
            'min_samples_leaf': 5,
            'random_state': 42,
        },
        'training_data': 'mock_training_data.csv',
        'performance_metrics': metrics,
        'feature_importance': importances,
    }
    
    metadata_path = MODEL_DIR / "model_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"   ✓ Metadata: {metadata_path}")
    print(f"\n   ✅ Model successfully saved!")


def main():
    print("\n" + "=" * 60)
    print("CredBuzz Bid-Success ML Model Training v2.0")
    print("=" * 60)
    
    # Step 1: Load data
    df = load_training_data()
    if df is None:
        return
    
    X = df[FEATURES]
    y = df[TARGET]
    
    # Step 2: Train-test split
    print("\n📊 Data Split (80/20 stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Train: {len(X_train)} samples ({y_train.mean():.1%} success)")
    print(f"   Test:  {len(X_test)} samples ({y_test.mean():.1%} success)")
    
    # Step 3: Train
    model = train_model_classifier(X_train, y_train)
    
    # Step 4: Evaluate
    metrics = evaluate_model(model, X_train, X_test, y_train, y_test)
    
    # Step 5: Cross-validate
    cv_metrics = cross_validate_model(model, X_train, y_train)
    metrics.update(cv_metrics)
    
    # Step 6: Feature importance
    importances = feature_importance(model)
    
    # Step 7: Save
    save_model_artifacts(model, metrics, importances)
    
    print("\n" + "=" * 60)
    print("🎉 Training Complete!")
    print("=" * 60)
    print(f"\n✅ Model is ready for deployment")
    print(f"   Location: {MODEL_DIR / 'bid_success_model.pkl'}")
    print(f"   Metadata: {MODEL_DIR / 'model_metadata.json'}")


if __name__ == "__main__":
    main()
