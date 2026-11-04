"""
EngineWatch - Preprocessing and Feature Engineering Module
Handles NASA C-MAPSS Turbofan Engine Degradation Simulation data.
"""

import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any, Optional

# Active degradation sensors with non-zero variance in FD001
ACTIVE_SENSORS: List[str] = [
    's_2', 's_3', 's_4', 's_7', 's_8', 's_9',
    's_11', 's_12', 's_13', 's_14', 's_15', 's_17', 's_20', 's_21'
]

ACTIVE_SETTINGS: List[str] = ['setting_1', 'setting_2']

BASE_FEATURES: List[str] = ACTIVE_SETTINGS + ACTIVE_SENSORS

SENSOR_METADATA: Dict[str, Dict[str, str]] = {
    'setting_1': {'name': 'Altitude Setting', 'unit': 'Mach/Alt factor'},
    'setting_2': {'name': 'Throttle Resolver Angle', 'unit': 'TRA'},
    's_2': {'name': 'LPC Outlet Temperature', 'unit': '°R'},
    's_3': {'name': 'HPC Outlet Temperature', 'unit': '°R'},
    's_4': {'name': 'LPT Outlet Temperature', 'unit': '°R'},
    's_7': {'name': 'HPC Outlet Pressure', 'unit': 'psia'},
    's_8': {'name': 'Physical Fan Speed', 'unit': 'rpm'},
    's_9': {'name': 'Physical Core Speed', 'unit': 'rpm'},
    's_11': {'name': 'HPC Static Pressure', 'unit': 'psia'},
    's_12': {'name': 'Fuel Flow Ratio (W32/Ps30)', 'unit': 'pps/psia'},
    's_13': {'name': 'Corrected Fan Speed', 'unit': 'rpm'},
    's_14': {'name': 'Corrected Core Speed', 'unit': 'rpm'},
    's_15': {'name': 'Bypass Ratio', 'unit': 'ratio'},
    's_17': {'name': 'Bleed Enthalpy', 'unit': 'btu/lbm'},
    's_20': {'name': 'HPT Coolant Bleed', 'unit': 'lbm/s'},
    's_21': {'name': 'LPT Coolant Bleed', 'unit': 'lbm/s'}
}

RUL_CAP: float = 125.0
ROLLING_WINDOW: int = 5


def compute_rul_and_labels(df: pd.DataFrame, max_rul: float = RUL_CAP) -> pd.DataFrame:
    """
    Computes true Remaining Useful Life (RUL) for run-to-failure data and caps it at max_rul.
    """
    df = df.copy()
    max_cycles = df.groupby('unit_nr')['time_cycles'].transform('max')
    df['rul_raw'] = max_cycles - df['time_cycles']
    df['RUL'] = df['rul_raw'].clip(upper=max_rul)
    return df


def generate_rolling_features(df: pd.DataFrame, window: int = ROLLING_WINDOW) -> pd.DataFrame:
    """
    Computes rolling mean and std features per engine unit.
    """
    df = df.copy()
    rolling_cols = BASE_FEATURES
    
    # Compute rolling means grouped by unit_nr
    rolling_means = (
        df.groupby('unit_nr')[rolling_cols]
        .rolling(window=window, min_periods=1)
        .mean()
        .reset_index(level=0, drop=True)
    )
    rolling_means.columns = [f"{col}_mean" for col in rolling_cols]

    # Compute rolling std grouped by unit_nr
    rolling_stds = (
        df.groupby('unit_nr')[rolling_cols]
        .rolling(window=window, min_periods=1)
        .std()
        .fillna(0.0)
        .reset_index(level=0, drop=True)
    )
    rolling_stds.columns = [f"{col}_std" for col in rolling_cols]

    return pd.concat([df, rolling_means, rolling_stds], axis=1)


def engine_aware_split(
    df: pd.DataFrame,
    train_ratio: float = 0.8,
    seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Splits dataset into training and validation sets strictly by engine unit_nr,
    guaranteeing that no engine rows are mixed across splits.
    """
    np.random.seed(seed)
    unique_units = df['unit_nr'].unique()
    np.random.shuffle(unique_units)
    
    split_idx = int(len(unique_units) * train_ratio)
    train_units = set(unique_units[:split_idx])
    val_units = set(unique_units[split_idx:])

    train_df = df[df['unit_nr'].isin(train_units)].copy()
    val_df = df[df['unit_nr'].isin(val_units)].copy()

    return train_df, val_df


def nasa_scoring_function(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Calculates NASA PHM Data Challenge asymmetric scoring function and error metrics.
    Asymmetric penalty: Late predictions (predicted > true) are penalized heavier than early predictions.
    d = y_pred - y_true:
    if d < 0 (early): s = exp(-d / 13) - 1
    if d >= 0 (late): s = exp(d / 10) - 1
    """
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    errors = y_pred - y_true
    
    scores = np.where(errors < 0, np.exp(-errors / 13.0) - 1.0, np.exp(errors / 10.0) - 1.0)
    
    early_mask = errors < 0
    late_mask = errors >= 0

    return {
        'nasa_score_total': float(np.sum(scores)),
        'nasa_score_mean': float(np.mean(scores)),
        'rmse': float(np.sqrt(np.mean(errors ** 2))),
        'mae': float(np.mean(np.abs(errors))),
        'early_count': int(np.sum(early_mask)),
        'late_count': int(np.sum(late_mask)),
        'early_mae': float(np.mean(np.abs(errors[early_mask]))) if np.sum(early_mask) > 0 else 0.0,
        'late_mae': float(np.mean(np.abs(errors[late_mask]))) if np.sum(late_mask) > 0 else 0.0
    }


def classify_health_status(rul: float) -> str:
    """
    Classifies engine health status based on Remaining Useful Life (cycles).
    HEALTHY: RUL > 75 cycles
    WATCH: 25 <= RUL <= 75 cycles
    CRITICAL: RUL < 25 cycles
    """
    if rul > 75:
        return "HEALTHY"
    elif rul >= 25:
        return "WATCH"
    else:
        return "CRITICAL"
