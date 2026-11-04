"""
EngineWatch - Backend API Test Suite
Direct verification of endpoints, Pydantic schemas, ML inference accuracy, validation, and error handling.
"""

import os
import sys
import pytest
from pydantic import ValidationError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from main import (
    load_artifacts,
    get_health,
    get_model_info,
    get_metrics,
    predict_rul,
    list_sample_engines,
    get_engine_detail,
    get_preset_inputs
)
from schemas import PredictRequest, SensorReading

# Setup fixture
@pytest.fixture(scope="session", autouse=True)
def init_models():
    load_artifacts()


def test_health_endpoint():
    """Verify system health, model loaded status, and dataset metadata"""
    data = get_health().model_dump()
    assert data["status"] == "OPERATIONAL"
    assert data["model_loaded"] is True
    assert "NASA C-MAPSS" in data["dataset"]
    assert "FastAPI" in data["backend"]


def test_model_info_endpoint():
    """Verify model architecture, 48 engineered features, and training dataset"""
    info = get_model_info()
    assert info.model_name == "EngineWatch Random Forest Regressor"
    assert info.feature_count == 48
    assert len(info.top_features) == 10
    assert "HEALTHY" in info.health_thresholds
    assert "disclaimer" in info.model_dump()


def test_metrics_endpoint():
    """Verify genuine ML evaluation metrics against baselines"""
    metrics = get_metrics()
    assert "models" in metrics
    assert "random_forest" in metrics["models"]
    rf = metrics["models"]["random_forest"]
    assert rf["rmse"] < 25.0  # RF RMSE is 19.94
    assert rf["mae"] < 15.0   # RF MAE is 13.98
    assert rf["r2"] > 0.70    # RF R2 is 0.769
    assert "ridge_regression" in metrics["models"]
    assert "mean_baseline" in metrics["models"]
    # Check that RF beats ridge baseline
    assert rf["rmse"] < metrics["models"]["ridge_regression"]["rmse"]


def test_predict_nominal_healthy():
    """Verify prediction for a nominal healthy engine produces HEALTHY tier and RUL > 75"""
    req = PredictRequest(
        engine_id="TEST-HEALTHY-01",
        current_cycle=15,
        readings=SensorReading(
            setting_1=0.0,
            setting_2=0.0,
            s_2=642.1,
            s_3=1582.0,
            s_4=1399.0,
            s_7=554.5,
            s_8=2388.06,
            s_9=9052.0,
            s_11=47.2,
            s_12=522.2,
            s_13=2388.05,
            s_14=8139.0,
            s_15=8.39,
            s_17=391.0,
            s_20=39.0,
            s_21=23.4
        )
    )
    res = predict_rul(req)
    assert res.health_status == "HEALTHY"
    assert res.predicted_rul_cycles > 75.0
    assert res.flight_hours_equivalent > 0
    assert len(res.sensor_analysis) == 16
    assert any(s.sensor == "s_4" for s in res.sensor_analysis)


def test_predict_critical_degraded():
    """Verify prediction for a heavily degraded engine approaching failure produces CRITICAL tier"""
    req = PredictRequest(
        engine_id="TEST-CRITICAL-01",
        current_cycle=200,
        readings=SensorReading(
            setting_1=0.002,
            setting_2=-0.0002,
            s_2=643.9,
            s_3=1604.5,
            s_4=1429.0,
            s_7=551.2,
            s_8=2388.25,
            s_9=9079.0,
            s_11=48.2,
            s_12=519.5,
            s_13=2388.22,
            s_14=8116.0,
            s_15=8.52,
            s_17=397.0,
            s_20=38.25,
            s_21=22.95
        )
    )
    res = predict_rul(req)
    assert res.health_status == "CRITICAL"
    assert res.predicted_rul_cycles < 25.0
    assert "1 cycle ≈ 1.85 flight hours" in res.flight_hours_assumption


def test_predict_invalid_schema():
    """Verify Pydantic input validation blocks physically impossible sensor readings"""
    with pytest.raises(ValidationError):
        # Negative temperature should fail ge=600 validation
        SensorReading(
            setting_1=0.0,
            setting_2=0.0,
            s_2=-50.0,
            s_3=1582.0,
            s_4=1399.0,
            s_7=554.5,
            s_8=2388.06,
            s_9=9052.0,
            s_11=47.2,
            s_12=522.2,
            s_13=2388.05,
            s_14=8139.0,
            s_15=8.39,
            s_17=391.0,
            s_20=39.0,
            s_21=23.4
        )


def test_engines_fleet_endpoint():
    """Verify fleet monitoring endpoint returns validation engines"""
    engines = list_sample_engines()
    assert len(engines) >= 10
    first = engines[0]
    assert first.engine_serial.startswith("EW-CFM56-")
    assert first.predicted_rul >= 0.0
    assert first.health_status in ["HEALTHY", "WATCH", "CRITICAL"]


def test_engine_detail_endpoint():
    """Verify engine detail endpoint returns multi-cycle historical telemetry"""
    detail = get_engine_detail(2)
    assert detail["unit_id"] == 2
    assert len(detail["history"]) > 0
    first_hist = detail["history"][0]
    assert first_hist["cycle"] >= 1
    assert first_hist["s_4"] > 0


def test_preset_inputs_endpoint():
    """Verify preset inputs for demonstration in prediction laboratory"""
    presets = get_preset_inputs()
    assert "nominal" in presets
    assert "wear_in" in presets
    assert "critical" in presets
    assert presets["nominal"]["expected_tier"] == "HEALTHY"
    assert presets["critical"]["expected_tier"] == "CRITICAL"
