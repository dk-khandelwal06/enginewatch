"""
EngineWatch - Pydantic Request & Response Schemas
Strict validation and complete documentation for API endpoints.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, field_validator


class SensorReading(BaseModel):
    """
    Sensor and operational settings snapshot for an aircraft turbofan engine.
    Values represent physical units from NASA C-MAPSS simulation.
    """
    setting_1: float = Field(
        default=0.0,
        ge=-0.05,
        le=0.05,
        description="Operating Setting 1 (Altitude / Mach number resolver)",
        examples=[0.0014]
    )
    setting_2: float = Field(
        default=0.0,
        ge=-0.01,
        le=0.01,
        description="Operating Setting 2 (Throttle Resolver Angle - TRA)",
        examples=[0.0003]
    )
    s_2: float = Field(
        ...,
        ge=600.0,
        le=700.0,
        description="LPC Outlet Temperature (°R)",
        examples=[642.5]
    )
    s_3: float = Field(
        ...,
        ge=1500.0,
        le=1700.0,
        description="HPC Outlet Temperature (°R)",
        examples=[1588.2]
    )
    s_4: float = Field(
        ...,
        ge=1300.0,
        le=1500.0,
        description="LPT Outlet Temperature (°R)",
        examples=[1404.1]
    )
    s_7: float = Field(
        ...,
        ge=540.0,
        le=570.0,
        description="HPC Outlet Pressure (psia)",
        examples=[553.8]
    )
    s_8: float = Field(
        ...,
        ge=2350.0,
        le=2420.0,
        description="Physical Fan Speed (rpm)",
        examples=[2388.1]
    )
    s_9: float = Field(
        ...,
        ge=8900.0,
        le=9300.0,
        description="Physical Core Speed (rpm)",
        examples=[9055.4]
    )
    s_11: float = Field(
        ...,
        ge=45.0,
        le=50.0,
        description="HPC Static Pressure (psia)",
        examples=[47.45]
    )
    s_12: float = Field(
        ...,
        ge=510.0,
        le=530.0,
        description="Fuel Flow Ratio (W32/Ps30 pps/psia)",
        examples=[521.6]
    )
    s_13: float = Field(
        ...,
        ge=2350.0,
        le=2420.0,
        description="Corrected Fan Speed (rpm)",
        examples=[2388.08]
    )
    s_14: float = Field(
        ...,
        ge=8000.0,
        le=8400.0,
        description="Corrected Core Speed (rpm)",
        examples=[8132.5]
    )
    s_15: float = Field(
        ...,
        ge=8.0,
        le=9.0,
        description="Bypass Ratio",
        examples=[8.42]
    )
    s_17: float = Field(
        ...,
        ge=380.0,
        le=420.0,
        description="Bleed Enthalpy (btu/lbm)",
        examples=[392.0]
    )
    s_20: float = Field(
        ...,
        ge=37.0,
        le=41.0,
        description="HPT Coolant Bleed (lbm/s)",
        examples=[38.85]
    )
    s_21: float = Field(
        ...,
        ge=22.0,
        le=25.0,
        description="LPT Coolant Bleed (lbm/s)",
        examples=[23.32]
    )


class PredictRequest(BaseModel):
    """
    RUL Prediction Request containing current cycle readings,
    optional past historical cycles for rolling feature calculation,
    and engine metadata.
    """
    engine_id: Optional[str] = Field(
        default="ENG-TEST-001",
        description="Identifier or serial number of the engine"
    )
    current_cycle: Optional[int] = Field(
        default=1,
        ge=1,
        le=1000,
        description="Current operational cycle number"
    )
    readings: SensorReading = Field(
        ...,
        description="Current sensor reading snapshot"
    )
    historical_cycles: Optional[List[SensorReading]] = Field(
        default=None,
        description="Optional list of up to 4 previous cycle readings to compute precise rolling mean and std features"
    )


class SensorDeviation(BaseModel):
    sensor: str
    name: str
    unit: str
    current_value: float
    nominal_baseline: float
    z_score: float
    status: str  # NORMAL, ELEVATED, WARNING


class PredictResponse(BaseModel):
    """
    Inference response with predicted Remaining Useful Life,
    health tier classification, flight hour conversion, and sensor diagnostics.
    """
    engine_id: str
    current_cycle: int
    predicted_rul_cycles: float = Field(
        description="Predicted Remaining Useful Life in operating cycles (clipped at 125 cycles max)"
    )
    flight_hours_equivalent: float = Field(
        description="Estimated operational flight hours based on standard conversion assumption"
    )
    flight_hours_assumption: str = Field(
        default="1 cycle ≈ 1.85 flight hours (based on standard regional turbofan mission profile). Demonstrative only."
    )
    health_status: str = Field(
        description="HEALTHY (>75 cycles), WATCH (25-75 cycles), or CRITICAL (<25 cycles)"
    )
    model_version: str = "EngineWatch-RF-v1.0.0"
    model_name: str = "RandomForestRegressor (100 estimators, depth 16)"
    inference_time_ms: float
    sensor_analysis: List[SensorDeviation]
    disclaimer: str = (
        "EngineWatch provides experimental predictive-maintenance estimates based on simulated "
        "engine degradation data. Predictions are not certified airworthiness assessments and must "
        "not be used as the sole basis for flight-safety or maintenance decisions."
    )


class HealthResponse(BaseModel):
    status: str
    backend: str
    model_loaded: bool
    version: str
    dataset: str
    timestamp: str


class ModelInfoResponse(BaseModel):
    model_name: str
    architecture: str
    hyperparameters: Dict[str, Any]
    feature_count: int
    features: List[str]
    training_dataset: str
    rul_cap: float
    health_thresholds: Dict[str, str]
    disclaimer: str
    top_features: List[Dict[str, Any]]


class EngineSummary(BaseModel):
    unit_id: int
    engine_serial: str
    current_cycle: int
    predicted_rul: float
    true_rul: Optional[float]
    health_status: str
    flight_hours_est: float
    active_sensors: Dict[str, float]


class EngineHistoryPoint(BaseModel):
    cycle: int
    true_rul: float
    s_2: float
    s_3: float
    s_4: float
    s_7: float
    s_9: float
    s_11: float
    s_12: float
    s_14: float
    s_15: float


class EngineDetailResponse(BaseModel):
    unit_id: int
    engine_serial: str
    current_cycle: int
    predicted_rul: float
    true_rul: float
    health_status: str
    flight_hours_est: float
    active_sensors: Dict[str, float]
    history: List[EngineHistoryPoint]

