# EngineWatch — REST API Reference & OpenAPI Specification

The EngineWatch API is implemented in FastAPI (Python 3.13) and adheres strictly to REST principles with Pydantic v2 data models.

## Base URL
- Development: `http://127.0.0.1:8000`
- Production: Configurable via `NEXT_PUBLIC_API_URL`

---

## 1. GET `/health`
Returns system health, model readiness, runtime version, and dataset provenance.

### Response `200 OK`
```json
{
  "status": "OPERATIONAL",
  "backend": "FastAPI + Uvicorn (Python 3.13)",
  "model_loaded": true,
  "version": "1.0.0",
  "dataset": "NASA C-MAPSS FD001 Turbofan Simulation",
  "timestamp": "2026-11-04T14:41:07.833530+00:00"
}
```

---

## 2. POST `/predict`
Executes real-time Random Forest inference on submitted turbofan telemetry.

### Request Body
```json
{
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
```

### Response `200 OK`
```json
{
  "engine_id": "EW-CFM56-081",
  "current_cycle": 18,
  "predicted_rul_cycles": 123.9,
  "flight_hours_equivalent": 229.2,
  "flight_hours_assumption": "1 cycle ≈ 1.85 flight hours (based on standard regional turbofan mission profile). Demonstrative only.",
  "health_status": "HEALTHY",
  "model_version": "EngineWatch-RF-v1.0.0",
  "model_name": "RandomForestRegressor (100 trees, depth 16)",
  "inference_time_ms": 12.4,
  "sensor_analysis": [
    {
      "sensor": "s_4",
      "name": "LPT Outlet Temperature",
      "unit": "°R",
      "current_value": 1398.92,
      "nominal_baseline": 1402.83,
      "z_score": -0.66,
      "status": "NORMAL"
    }
  ],
  "disclaimer": "EngineWatch provides experimental predictive-maintenance estimates based on simulated engine degradation data. Predictions are not certified airworthiness assessments and must not be used as the sole basis for flight-safety or maintenance decisions."
}
```

---

## 3. GET `/model/info`
Returns model hyperparameters, feature names, RUL capping configuration, and top 10 ranked features by Gini importance.

---

## 4. GET `/metrics`
Returns validation loss metrics (RMSE, MAE, R², asymmetric challenge score) on the 20-engine validation split, comparing Random Forest to Ridge Regression and the Mean Baseline.

---

## 5. GET `/engines`
Returns summary records for all 12 monitored demonstration engines.

---

## 6. GET `/engines/{unit_id}`
Returns granular historical cycle degradation trajectory for an individual engine.

