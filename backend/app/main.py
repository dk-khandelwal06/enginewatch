"""
EngineWatch - FastAPI Backend Application
High-performance REST API for turbofan engine RUL estimation and health telemetry.
"""

import os
import sys
import time
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure application, backend, and src directories are in sys.path
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(APP_DIR, '..'))
SRC_DIR = os.path.join(BACKEND_DIR, 'src')
ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, '..'))

for p in [APP_DIR, BACKEND_DIR, SRC_DIR, ROOT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app.schemas import (
        PredictRequest,
        PredictResponse,
        HealthResponse,
        ModelInfoResponse,
        EngineSummary,
        EngineDetailResponse,
        SensorDeviation
    )
except ImportError:
    try:
        from .schemas import (
            PredictRequest,
            PredictResponse,
            HealthResponse,
            ModelInfoResponse,
            EngineSummary,
            EngineDetailResponse,
            SensorDeviation
        )
    except ImportError:
        from schemas import (
            PredictRequest,
            PredictResponse,
            HealthResponse,
            ModelInfoResponse,
            EngineSummary,
            EngineDetailResponse,
            SensorDeviation
        )

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] EngineWatch API: %(message)s"
)
logger = logging.getLogger("enginewatch")

# Base paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    yield

# Application state
app = FastAPI(
    title="EngineWatch Predictive Intelligence API",
    description=(
        "Production-grade REST API powering the EngineWatch aerospace platform. "
        "Delivers real-time Remaining Useful Life (RUL) estimation and degradation telemetry "
        "for aircraft turbofan engines using a trained Random Forest regressor on NASA C-MAPSS FD001 data."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Simple Rate Limiting (In-Memory sliding window)
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX", "120"))  # per minute
RATE_LIMIT_WINDOW = 60  # seconds
ip_request_history: Dict[str, List[float]] = {}

# Global ML Artifact Containers
model = None
scaler = None
features_meta = None
metrics_data = None
feature_importance_data = None
sample_engines_data = None

NOMINAL_BASELINES = {
    "setting_1": {"mean": 0.0, "std": 0.0022},
    "setting_2": {"mean": 0.0, "std": 0.0003},
    "s_2": {"mean": 642.3832, "std": 0.3796},
    "s_3": {"mean": 1586.8985, "std": 4.649},
    "s_4": {"mean": 1402.831, "std": 5.9317},
    "s_7": {"mean": 553.9477, "std": 0.6238},
    "s_8": {"mean": 2388.0592, "std": 0.0551},
    "s_9": {"mean": 9056.0621, "std": 8.404},
    "s_11": {"mean": 47.3561, "std": 0.1769},
    "s_12": {"mean": 521.9049, "std": 0.5069},
    "s_13": {"mean": 2388.0567, "std": 0.055},
    "s_14": {"mean": 8137.3841, "std": 7.9566},
    "s_15": {"mean": 8.4184, "std": 0.0264},
    "s_17": {"mean": 392.27, "std": 1.1426},
    "s_20": {"mean": 38.9323, "std": 0.1296},
    "s_21": {"mean": 23.3592, "std": 0.0787}
}

START_TIME = time.time()


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Protect against oversized payloads (>1MB)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 1024 * 1024:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "Payload exceeds maximum allowed size of 1MB."}
        )

    # 2. Rate limiting check
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    timestamps = ip_request_history.get(client_ip, [])
    # Filter timestamps within the current window
    valid_timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    
    if len(valid_timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning(f"Rate limit exceeded for client: {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Maximum 120 requests per minute."}
        )
    
    valid_timestamps.append(now)
    ip_request_history[client_ip] = valid_timestamps

    # Execute request
    start_ts = time.time()
    response: Response = await call_next(request)
    duration_ms = (time.time() - start_ts) * 1000
    
    # Add security & telemetry headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-EngineWatch-Latency-MS"] = f"{duration_ms:.2f}"
    
    return response


def load_artifacts():
    global model, scaler, features_meta, metrics_data, feature_importance_data, sample_engines_data
    logger.info("Initializing EngineWatch ML engine...")
    try:
        model_path = os.path.join(MODELS_DIR, 'model.joblib')
        scaler_path = os.path.join(MODELS_DIR, 'scaler.joblib')
        features_path = os.path.join(MODELS_DIR, 'features.json')
        metrics_path = os.path.join(MODELS_DIR, 'metrics.json')
        importance_path = os.path.join(MODELS_DIR, 'feature_importance.json')
        engines_path = os.path.join(MODELS_DIR, 'sample_engines.json')

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            logger.error("Model or Scaler artifacts missing in models/ directory!")
            return

        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)

        with open(features_path, 'r') as f:
            features_meta = json.load(f)

        with open(metrics_path, 'r') as f:
            metrics_data = json.load(f)

        with open(importance_path, 'r') as f:
            feature_importance_data = json.load(f)

        with open(engines_path, 'r') as f:
            sample_engines_data = json.load(f)

        logger.info("EngineWatch ML artifacts loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load ML artifacts: {str(e)}", exc_info=True)


@app.get("/health", response_model=HealthResponse, tags=["System Health"])
def get_health():
    """
    Returns platform health, model loading status, and system metadata.
    """
    return HealthResponse(
        status="OPERATIONAL" if model is not None else "DEGRADED",
        backend="FastAPI + Uvicorn (Python 3.13)",
        model_loaded=model is not None,
        version="1.0.0",
        dataset="NASA C-MAPSS FD001 Turbofan Simulation",
        timestamp=datetime.now(timezone.utc).isoformat()
    )


@app.get("/model/info", response_model=ModelInfoResponse, tags=["Model Intelligence"])
def get_model_info():
    """
    Returns comprehensive model architecture, training configuration, hyperparameters,
    and feature importance rankings.
    """
    if model is None or features_meta is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Please ensure training artifacts exist."
        )

    return ModelInfoResponse(
        model_name="EngineWatch Random Forest Regressor",
        architecture="Ensemble Decision Trees (RandomForestRegressor)",
        hyperparameters={
            "n_estimators": 100,
            "max_depth": 16,
            "min_samples_split": 5,
            "min_samples_leaf": 2,
            "random_state": 42
        },
        feature_count=len(features_meta.get("all_engineered_features", [])),
        features=features_meta.get("all_engineered_features", []),
        training_dataset="NASA C-MAPSS FD001 (100 run-to-failure engines, 20,631 total cycles)",
        rul_cap=125.0,
        health_thresholds={
            "HEALTHY": "> 75 remaining operating cycles",
            "WATCH": "25 to 75 remaining operating cycles",
            "CRITICAL": "< 25 remaining operating cycles"
        },
        disclaimer=(
            "EngineWatch provides experimental predictive-maintenance estimates based on simulated "
            "engine degradation data. Predictions are not certified airworthiness assessments and must "
            "not be used as the sole basis for flight-safety or maintenance decisions."
        ),
        top_features=feature_importance_data[:10] if feature_importance_data else []
    )


@app.get("/metrics", tags=["Model Intelligence"])
def get_metrics():
    """
    Returns model evaluation metrics (RMSE, MAE, R², NASA score, early vs late predictions)
    on the unseen 20-engine validation set.
    """
    if metrics_data is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Metrics data not loaded."
        )
    return metrics_data


@app.post("/predict", response_model=PredictResponse, tags=["Inference Laboratory"])
def predict_rul(request: PredictRequest):
    """
    Executes real-time ML inference using the trained Random Forest model.
    Applies identical feature engineering (rolling windows, standard scaling)
    and returns predicted RUL, health status, and sensor diagnostics.
    """
    if model is None or scaler is None or features_meta is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is not loaded. Cannot perform inference."
        )

    t_start = time.perf_counter()

    base_features = features_meta["base_features"]  # 16 features: setting_1, setting_2, s_2..s_21
    curr_dict = request.readings.model_dump()

    # Build sequence of readings (history + current)
    history_dicts = [h.model_dump() for h in (request.historical_cycles or [])]
    all_readings = history_dicts + [curr_dict]

    # Compute rolling values across the window
    # 1. Base values (current reading)
    raw_vals = [curr_dict[col] for col in base_features]

    # 2. Rolling means & stds
    mean_vals = []
    std_vals = []
    for col in base_features:
        series_vals = [r[col] for r in all_readings]
        mean_vals.append(float(np.mean(series_vals)))
        if len(series_vals) > 1:
            std_vals.append(float(np.std(series_vals)))
        else:
            std_vals.append(0.0)

    # Full engineered vector (48 features: raw + mean + std)
    feature_vector = np.array(raw_vals + mean_vals + std_vals).reshape(1, -1)

    # Standard scaling using fitted scaler
    scaled_vector = scaler.transform(feature_vector)

    # Model inference
    raw_prediction = float(model.predict(scaled_vector)[0])
    # Clip between 0 and 125 cycles
    predicted_rul = round(max(0.0, min(125.0, raw_prediction)), 1)

    # Health classification
    if predicted_rul > 75:
        health_status = "HEALTHY"
    elif predicted_rul >= 25:
        health_status = "WATCH"
    else:
        health_status = "CRITICAL"

    # Flight hours conversion (explicit assumption)
    flight_hours = round(predicted_rul * 1.85, 1)

    # Sensor deviation analysis against nominal baselines
    sensor_analysis: List[SensorDeviation] = []
    for col in base_features:
        if col in NOMINAL_BASELINES:
            base_meta = NOMINAL_BASELINES[col]
            current_val = float(curr_dict[col])
            mean = base_meta["mean"]
            std = base_meta["std"] if base_meta["std"] > 1e-6 else 1.0
            z_score = round((current_val - mean) / std, 2)

            if abs(z_score) > 2.5:
                stat = "WARNING"
            elif abs(z_score) > 1.5:
                stat = "ELEVATED"
            else:
                stat = "NORMAL"

            meta_info = features_meta.get("metadata", {}).get(col, {"name": col, "unit": ""})
            sensor_analysis.append(SensorDeviation(
                sensor=col,
                name=meta_info.get("name", col),
                unit=meta_info.get("unit", ""),
                current_value=current_val,
                nominal_baseline=mean,
                z_score=z_score,
                status=stat
            ))

    t_end = time.perf_counter()
    latency_ms = round((t_end - t_start) * 1000, 2)

    return PredictResponse(
        engine_id=request.engine_id or "ENG-TEST-001",
        current_cycle=request.current_cycle or 1,
        predicted_rul_cycles=predicted_rul,
        flight_hours_equivalent=flight_hours,
        flight_hours_assumption="1 cycle ≈ 1.85 flight hours (based on standard regional turbofan mission profile). Demonstrative only.",
        health_status=health_status,
        model_version="EngineWatch-RF-v1.0.0",
        model_name="RandomForestRegressor (100 trees, depth 16)",
        inference_time_ms=latency_ms,
        sensor_analysis=sensor_analysis,
        disclaimer=(
            "EngineWatch provides experimental predictive-maintenance estimates based on simulated "
            "engine degradation data. Predictions are not certified airworthiness assessments and must "
            "not be used as the sole basis for flight-safety or maintenance decisions."
        )
    )


@app.get("/engines", response_model=List[EngineSummary], tags=["Fleet Monitoring"])
def list_sample_engines():
    """
    Returns the monitored demonstration fleet (derived from the genuine C-MAPSS validation split).
    Provides real operating cycles, model-predicted RUL, and health classification.
    """
    if sample_engines_data is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sample engines data not loaded."
        )
    summaries = []
    for eng in sample_engines_data:
        summaries.append(EngineSummary(
            unit_id=eng["unit_id"],
            engine_serial=eng["engine_serial"],
            current_cycle=eng["current_cycle"],
            predicted_rul=eng["predicted_rul"],
            true_rul=eng.get("true_rul"),
            health_status=eng["health_status"],
            flight_hours_est=eng["flight_hours_est"],
            active_sensors=eng["active_sensors"]
        ))
    return summaries


@app.get("/engines/{unit_id}", response_model=EngineDetailResponse, tags=["Fleet Monitoring"])
def get_engine_detail(unit_id: int):
    """
    Returns detailed history and multi-sensor degradation trajectory for an individual engine.
    """
    if sample_engines_data is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sample engines data not loaded."
        )
    for eng in sample_engines_data:
        if eng["unit_id"] == unit_id:
            return eng
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Engine {unit_id} not found in monitored fleet.")


@app.get("/preset-inputs", tags=["Inference Laboratory"])
def get_preset_inputs():
    """
    Returns three pre-configured real engine sensor input scenarios for laboratory testing:
    1. Nominal (Early Cycle, Healthy)
    2. Wear-In (Mid Cycle, Watch)
    3. Degradation Alert (Late Cycle, Critical)
    """
    return {
        "nominal": {
            "name": "Nominal Baseline (Early Life)",
            "description": "Engine at cycle 18 operating normally with low wear and healthy thermal margins.",
            "expected_tier": "HEALTHY",
            "request": {
                "engine_id": "EW-CFM56-081",
                "current_cycle": 18,
                "readings": {
                    "setting_1": -0.0007,
                    "setting_2": -0.0004,
                    "s_2": 642.12,
                    "s_3": 1581.15,
                    "s_4": 1398.92,
                    "s_7": 554.45,
                    "s_8": 2388.06,
                    "s_9": 9051.10,
                    "s_11": 47.18,
                    "s_12": 522.25,
                    "s_13": 2388.05,
                    "s_14": 8139.80,
                    "s_15": 8.398,
                    "s_17": 391.0,
                    "s_20": 39.02,
                    "s_21": 23.41
                }
            }
        },
        "wear_in": {
            "name": "Accelerating Wear (Mid Life)",
            "description": "Engine at cycle 140 showing elevated EGT exhaust temperatures and declining compressor pressure ratio.",
            "expected_tier": "WATCH",
            "request": {
                "engine_id": "EW-CFM56-085",
                "current_cycle": 140,
                "readings": {
                    "setting_1": 0.0018,
                    "setting_2": 0.0002,
                    "s_2": 642.75,
                    "s_3": 1592.40,
                    "s_4": 1412.35,
                    "s_7": 553.12,
                    "s_8": 2388.14,
                    "s_9": 9062.80,
                    "s_11": 47.62,
                    "s_12": 521.15,
                    "s_13": 2388.12,
                    "s_14": 8131.20,
                    "s_15": 8.452,
                    "s_17": 394.0,
                    "s_20": 38.65,
                    "s_21": 23.24
                }
            }
        },
        "critical": {
            "name": "Approaching Maintenance Limit (End of Life)",
            "description": "Engine at cycle 196 exhibiting severe turbine thermal creep, high bleed enthalpy, and critical margin erosion.",
            "expected_tier": "CRITICAL",
            "request": {
                "engine_id": "EW-CFM56-092",
                "current_cycle": 196,
                "readings": {
                    "setting_1": 0.0028,
                    "setting_2": -0.0003,
                    "s_2": 643.85,
                    "s_3": 1603.90,
                    "s_4": 1429.50,
                    "s_7": 551.45,
                    "s_8": 2388.22,
                    "s_9": 9078.40,
                    "s_11": 48.15,
                    "s_12": 519.80,
                    "s_13": 2388.20,
                    "s_14": 8118.60,
                    "s_15": 8.515,
                    "s_17": 397.0,
                    "s_20": 38.30,
                    "s_21": 22.98
                }
            }
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
