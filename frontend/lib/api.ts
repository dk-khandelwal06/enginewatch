export interface SensorReading {
  setting_1: number;
  setting_2: number;
  s_2: number;
  s_3: number;
  s_4: number;
  s_7: number;
  s_8: number;
  s_9: number;
  s_11: number;
  s_12: number;
  s_13: number;
  s_14: number;
  s_15: number;
  s_17: number;
  s_20: number;
  s_21: number;
}

export interface SensorDeviation {
  sensor: string;
  name: string;
  unit: string;
  current_value: number;
  nominal_baseline: number;
  z_score: number;
  status: "NORMAL" | "ELEVATED" | "WARNING";
}

export interface PredictRequest {
  engine_id?: string;
  current_cycle?: number;
  readings: SensorReading;
  historical_cycles?: SensorReading[];
}

export interface PredictResponse {
  engine_id: string;
  current_cycle: number;
  predicted_rul_cycles: number;
  flight_hours_equivalent: number;
  flight_hours_assumption: string;
  health_status: "HEALTHY" | "WATCH" | "CRITICAL";
  model_version: string;
  model_name: string;
  inference_time_ms: number;
  sensor_analysis: SensorDeviation[];
  disclaimer: string;
}

export interface HealthResponse {
  status: "OPERATIONAL" | "DEGRADED";
  backend: string;
  model_loaded: boolean;
  version: string;
  dataset: string;
  timestamp: string;
}

export interface ModelMetrics {
  rmse: number;
  mae: number;
  r2: number;
  nasa_score_total: number;
  nasa_score_mean: number;
  early_count: number;
  late_count: number;
  early_mae: number;
  late_mae: number;
}

export interface MetricsResponse {
  dataset: string;
  condition: string;
  total_engines: number;
  total_cycles: number;
  train_engines_count: number;
  val_engines_count: number;
  rul_cap: number;
  rolling_window: number;
  models: {
    random_forest: ModelMetrics;
    ridge_regression: ModelMetrics;
    mean_baseline: ModelMetrics;
  };
}

export interface ModelInfoResponse {
  model_name: string;
  architecture: string;
  hyperparameters: Record<string, any>;
  feature_count: number;
  features: string[];
  training_dataset: string;
  rul_cap: number;
  health_thresholds: Record<string, string>;
  disclaimer: string;
  top_features: Array<{
    feature: string;
    importance: number;
    base_sensor: string;
    type: string;
  }>;
}

export interface EngineSummary {
  unit_id: number;
  engine_serial: string;
  current_cycle: number;
  predicted_rul: number;
  true_rul?: number;
  health_status: "HEALTHY" | "WATCH" | "CRITICAL";
  flight_hours_est: number;
  active_sensors: Record<string, number>;
}

export interface EngineHistoryPoint {
  cycle: number;
  true_rul: number;
  s_2: number;
  s_3: number;
  s_4: number;
  s_7: number;
  s_9: number;
  s_11: number;
  s_12: number;
  s_14: number;
  s_15: number;
}

export interface EngineDetailResponse {
  unit_id: number;
  engine_serial: string;
  current_cycle: number;
  predicted_rul: number;
  true_rul: number;
  health_status: "HEALTHY" | "WATCH" | "CRITICAL";
  flight_hours_est: number;
  active_sensors: Record<string, number>;
  history: EngineHistoryPoint[];
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const res = await fetch(`${API_BASE_URL}/model/info`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Model info failed: ${res.statusText}`);
  return res.json();
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  const res = await fetch(`${API_BASE_URL}/metrics`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Metrics failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSampleEngines(): Promise<EngineSummary[]> {
  const res = await fetch(`${API_BASE_URL}/engines`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Engines fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchEngineDetail(unitId: number): Promise<EngineDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/engines/${unitId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Engine ${unitId} detail failed: ${res.statusText}`);
  return res.json();
}

export async function predictRulApi(request: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchPresetInputs(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE_URL}/preset-inputs`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Presets fetch failed: ${res.statusText}`);
  return res.json();
}

