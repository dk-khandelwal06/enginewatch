"""
EngineWatch - Model Training and Evaluation Pipeline
Trains Random Forest Regressor and baseline models on NASA C-MAPSS FD001.
Saves model artifacts, scalers, and validation metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score

import sys

SRC_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SRC_DIR, '..'))
ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, '..'))

for p in [SRC_DIR, BACKEND_DIR, ROOT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.src.preprocess import (
        ACTIVE_SETTINGS,
        ACTIVE_SENSORS,
        BASE_FEATURES,
        SENSOR_METADATA,
        RUL_CAP,
        ROLLING_WINDOW,
        compute_rul_and_labels,
        generate_rolling_features,
        engine_aware_split,
        nasa_scoring_function,
        classify_health_status
    )
except ImportError:
    try:
        from .preprocess import (
            ACTIVE_SETTINGS,
            ACTIVE_SENSORS,
            BASE_FEATURES,
            SENSOR_METADATA,
            RUL_CAP,
            ROLLING_WINDOW,
            compute_rul_and_labels,
            generate_rolling_features,
            engine_aware_split,
            nasa_scoring_function,
            classify_health_status
        )
    except ImportError:
        from preprocess import (
            ACTIVE_SETTINGS,
            ACTIVE_SENSORS,
            BASE_FEATURES,
            SENSOR_METADATA,
            RUL_CAP,
            ROLLING_WINDOW,
            compute_rul_and_labels,
            generate_rolling_features,
            engine_aware_split,
            nasa_scoring_function,
            classify_health_status
        )

def train_and_evaluate():
    print("=== EngineWatch ML Pipeline: Training & Evaluation ===")
    
    # 1. Load Data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'train_FD001.txt')
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training data not found at {data_path}")
        
    cols = ['unit_nr', 'time_cycles', 'setting_1', 'setting_2', 'setting_3'] + [f's_{i}' for i in range(1, 22)]
    raw_df = pd.read_csv(data_path, sep=r'\s+', header=None, names=cols)
    print(f"Loaded {len(raw_df)} records across {raw_df['unit_nr'].nunique()} engines.")

    # 2. Compute RUL and Rolling Features
    df_with_rul = compute_rul_and_labels(raw_df, max_rul=RUL_CAP)
    df_features = generate_rolling_features(df_with_rul)

    # 3. Engine-Aware Train/Validation Split (80/20)
    train_df, val_df = engine_aware_split(df_features, train_ratio=0.8, seed=42)
    print(f"Train set: {len(train_df)} rows ({train_df['unit_nr'].nunique()} engines)")
    print(f"Validation set: {len(val_df)} rows ({val_df['unit_nr'].nunique()} engines)")

    # 4. Feature Selection
    feature_cols = BASE_FEATURES + [f"{c}_mean" for c in BASE_FEATURES] + [f"{c}_std" for c in BASE_FEATURES]
    print(f"Total engineered features: {len(feature_cols)}")

    X_train = train_df[feature_cols].values
    y_train = train_df['RUL'].values

    X_val = val_df[feature_cols].values
    y_val = val_df['RUL'].values

    # 5. Fit Scaler strictly on Training Data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    # 6. Model 1: Baseline Mean Predictor
    mean_val = float(np.mean(y_train))
    y_pred_mean = np.full_like(y_val, mean_val)
    mean_metrics = nasa_scoring_function(y_val, y_pred_mean)
    mean_metrics['r2'] = float(r2_score(y_val, y_pred_mean))
    print(f"Baseline (Mean): RMSE={mean_metrics['rmse']:.2f}, MAE={mean_metrics['mae']:.2f}, R2={mean_metrics['r2']:.4f}")

    # 7. Model 2: Baseline Ridge Regression
    ridge = Ridge(alpha=100.0, random_state=42)
    ridge.fit(X_train_scaled, y_train)
    y_pred_ridge = ridge.predict(X_val_scaled)
    ridge_metrics = nasa_scoring_function(y_val, y_pred_ridge)
    ridge_metrics['r2'] = float(r2_score(y_val, y_pred_ridge))
    print(f"Baseline (Ridge): RMSE={ridge_metrics['rmse']:.2f}, MAE={ridge_metrics['mae']:.2f}, R2={ridge_metrics['r2']:.4f}")

    # 8. Model 3: Random Forest Regressor
    print("Training Random Forest Regressor (100 trees)...")
    rf = RandomForestRegressor(
        n_estimators=100,
        max_depth=16,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train)
    y_pred_rf = rf.predict(X_val_scaled)
    rf_metrics = nasa_scoring_function(y_val, y_pred_rf)
    rf_metrics['r2'] = float(r2_score(y_val, y_pred_rf))
    print(f"Random Forest:   RMSE={rf_metrics['rmse']:.2f}, MAE={rf_metrics['mae']:.2f}, R2={rf_metrics['r2']:.4f}")
    print(f"  NASA Score Total: {rf_metrics['nasa_score_total']:.1f}")
    print(f"  Early Predictions: {rf_metrics['early_count']} (MAE={rf_metrics['early_mae']:.2f})")
    print(f"  Late Predictions:  {rf_metrics['late_count']} (MAE={rf_metrics['late_mae']:.2f})")

    # 9. Feature Importance Analysis
    importances = rf.feature_importances_
    ranked_indices = np.argsort(importances)[::-1]
    feature_importance_list = []
    for idx in ranked_indices:
        fname = feature_cols[idx]
        feature_importance_list.append({
            'feature': fname,
            'importance': float(importances[idx]),
            'base_sensor': fname.split('_')[0] + ('_' + fname.split('_')[1] if len(fname.split('_')) > 1 and fname.startswith('s_') else ''),
            'type': 'std' if fname.endswith('_std') else ('mean' if fname.endswith('_mean') else 'raw')
        })

    # 10. Sample Validation Engine Trajectories for Fleet Visualization
    val_units = sorted(list(val_df['unit_nr'].unique()))
    sample_engines = []
    for unit_id in val_units[:12]:  # Select 12 representative engines
        unit_data = val_df[val_df['unit_nr'] == unit_id].sort_values('time_cycles')
        max_cyc = int(unit_data['time_cycles'].max())
        
        # Take a snapshot at the last observed cycle
        latest_row = unit_data.iloc[-1]
        latest_features = latest_row[feature_cols].values.reshape(1, -1)
        latest_scaled = scaler.transform(latest_features)
        pred_rul = float(rf.predict(latest_scaled)[0])
        health = classify_health_status(pred_rul)

        # Also get downsampled history (every 5-10 cycles)
        step = max(1, len(unit_data) // 20)
        history_points = []
        for _, h_row in unit_data.iloc[::step].iterrows():
            history_points.append({
                'cycle': int(h_row['time_cycles']),
                'true_rul': float(h_row['RUL']),
                's_2': float(h_row['s_2']),
                's_3': float(h_row['s_3']),
                's_4': float(h_row['s_4']),
                's_7': float(h_row['s_7']),
                's_9': float(h_row['s_9']),
                's_11': float(h_row['s_11']),
                's_12': float(h_row['s_12']),
                's_14': float(h_row['s_14']),
                's_15': float(h_row['s_15']),
            })

        sample_engines.append({
            'unit_id': int(unit_id),
            'engine_serial': f"EW-CFM56-{int(unit_id):03d}",
            'current_cycle': max_cyc,
            'predicted_rul': round(pred_rul, 1),
            'true_rul': float(latest_row['RUL']),
            'health_status': health,
            'flight_hours_est': round(pred_rul * 1.85, 1), # Illustrative 1.85 hrs/cycle flight factor
            'active_sensors': {
                's_2': float(latest_row['s_2']),
                's_3': float(latest_row['s_3']),
                's_4': float(latest_row['s_4']),
                's_7': float(latest_row['s_7']),
                's_8': float(latest_row['s_8']),
                's_9': float(latest_row['s_9']),
                's_11': float(latest_row['s_11']),
                's_12': float(latest_row['s_12']),
                's_13': float(latest_row['s_13']),
                's_14': float(latest_row['s_14']),
                's_15': float(latest_row['s_15']),
                's_17': float(latest_row['s_17']),
                's_20': float(latest_row['s_20']),
                's_21': float(latest_row['s_21'])
            },
            'history': history_points
        })

    # 11. Save Models & Metadata
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(output_dir, exist_ok=True)

    joblib.dump(rf, os.path.join(output_dir, 'model.joblib'))
    joblib.dump(ridge, os.path.join(output_dir, 'ridge_baseline.joblib'))
    joblib.dump(scaler, os.path.join(output_dir, 'scaler.joblib'))

    all_metrics = {
        'dataset': 'NASA C-MAPSS Turbofan Engine Degradation Simulation (FD001)',
        'condition': 'Sea Level (Single Operating Condition)',
        'total_engines': int(raw_df['unit_nr'].nunique()),
        'total_cycles': int(len(raw_df)),
        'train_engines_count': int(train_df['unit_nr'].nunique()),
        'val_engines_count': int(val_df['unit_nr'].nunique()),
        'rul_cap': RUL_CAP,
        'rolling_window': ROLLING_WINDOW,
        'models': {
            'random_forest': rf_metrics,
            'ridge_regression': ridge_metrics,
            'mean_baseline': mean_metrics
        }
    }

    with open(os.path.join(output_dir, 'metrics.json'), 'w') as f:
        json.dump(all_metrics, f, indent=2)

    with open(os.path.join(output_dir, 'features.json'), 'w') as f:
        json.dump({
            'base_features': BASE_FEATURES,
            'all_engineered_features': feature_cols,
            'metadata': SENSOR_METADATA
        }, f, indent=2)

    with open(os.path.join(output_dir, 'feature_importance.json'), 'w') as f:
        json.dump(feature_importance_list, f, indent=2)

    with open(os.path.join(output_dir, 'sample_engines.json'), 'w') as f:
        json.dump(sample_engines, f, indent=2)

    print(f"\nAll artifacts successfully saved to {output_dir}")
    return all_metrics

if __name__ == '__main__':
    train_and_evaluate()
