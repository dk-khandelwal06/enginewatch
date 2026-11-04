"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  Copy,
  Check,
  Play,
  Terminal,
  Activity,
  Server,
  Layers,
  ArrowRight
} from "lucide-react";
import { API_BASE_URL, fetchHealth } from "@/lib/api";
import { useVoice } from "@/lib/voice";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/health",
    title: "System & Model Health Check",
    description: "Returns backend operational status, model loading confirmation, Python runtime, and simulation dataset version.",
    sampleRequest: `curl -X GET "${API_BASE_URL}/health"`,
    sampleResponse: {
      status: "OPERATIONAL",
      backend: "FastAPI + Uvicorn (Python 3.13)",
      model_loaded: true,
      version: "1.0.0",
      dataset: "NASA C-MAPSS FD001 Turbofan Simulation",
      timestamp: "2026-11-04T19:54:33.926Z",
    },
  },
  {
    method: "POST",
    path: "/predict",
    title: "Real-Time RUL Prediction",
    description: "Submits current cycle sensor readings and optional past cycles. Applies standard scaling and Random Forest regression to predict remaining cycles.",
    sampleRequest: `curl -X POST "${API_BASE_URL}/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
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
  }'`,
    sampleResponse: {
      engine_id: "EW-CFM56-081",
      current_cycle: 18,
      predicted_rul_cycles: 123.9,
      flight_hours_equivalent: 229.2,
      flight_hours_assumption: "1 cycle ≈ 1.85 flight hours (based on standard regional turbofan mission profile). Demonstrative only.",
      health_status: "HEALTHY",
      model_version: "EngineWatch-RF-v1.0.0",
      model_name: "RandomForestRegressor (100 trees, depth 16)",
      inference_time_ms: 8.45,
      sensor_analysis: [
        {
          sensor: "s_4",
          name: "LPT Outlet Temperature",
          unit: "°R",
          current_value: 1398.92,
          nominal_baseline: 1402.83,
          z_score: -0.66,
          status: "NORMAL",
        },
      ],
      disclaimer: "EngineWatch provides experimental predictive-maintenance estimates based on simulated engine degradation data...",
    },
  },
  {
    method: "GET",
    path: "/model/info",
    title: "Model Architecture & Features",
    description: "Returns tree depth, number of estimators, RUL capping strategy, health tier definitions, and ranked feature importance.",
    sampleRequest: `curl -X GET "${API_BASE_URL}/model/info"`,
    sampleResponse: {
      model_name: "EngineWatch Random Forest Regressor",
      architecture: "Ensemble Decision Trees (RandomForestRegressor)",
      hyperparameters: {
        n_estimators: 100,
        max_depth: 16,
        min_samples_split: 5,
        min_samples_leaf: 2,
        random_state: 42,
      },
      feature_count: 48,
      rul_cap: 125.0,
      health_thresholds: {
        HEALTHY: "> 75 remaining operating cycles",
        WATCH: "25 to 75 remaining operating cycles",
        CRITICAL: "< 25 remaining operating cycles",
      },
      top_features: [
        { feature: "s_11_mean", importance: 0.248, base_sensor: "s_11", type: "mean" },
        { feature: "s_4_mean", importance: 0.182, base_sensor: "s_4", type: "mean" },
        { feature: "s_12_mean", importance: 0.141, base_sensor: "s_12", type: "mean" },
      ],
    },
  },
  {
    method: "GET",
    path: "/metrics",
    title: "Validation Loss & Benchmarks",
    description: "Evaluates RMSE, MAE, R², and asymmetric NASA challenge scoring for the Random Forest, Ridge regression, and Mean baseline.",
    sampleRequest: `curl -X GET "${API_BASE_URL}/metrics"`,
    sampleResponse: {
      dataset: "NASA C-MAPSS Turbofan Engine Degradation Simulation (FD001)",
      total_cycles: 20631,
      train_engines_count: 80,
      val_engines_count: 20,
      models: {
        random_forest: {
          rmse: 19.94,
          mae: 13.98,
          r2: 0.7693,
          nasa_score_total: 100968.8,
        },
        ridge_regression: {
          rmse: 21.21,
          mae: 17.72,
          r2: 0.7391,
        },
        mean_baseline: {
          rmse: 41.58,
          mae: 37.17,
          r2: -0.0031,
        },
      },
    },
  },
  {
    method: "GET",
    path: "/engines",
    title: "Fleet Condition Telemetry",
    description: "Retrieves demonstration fleet engines from the C-MAPSS validation split with operating cycles and health tiers.",
    sampleRequest: `curl -X GET "${API_BASE_URL}/engines"`,
    sampleResponse: [
      {
        unit_id: 81,
        engine_serial: "EW-CFM56-081",
        current_cycle: 18,
        predicted_rul: 123.9,
        health_status: "HEALTHY",
        flight_hours_est: 229.2,
      },
    ],
  },
];

export const ApiCenterSection = () => {
  const { speakSection } = useVoice();
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[1]); // Default POST /predict
  const [copied, setCopied] = useState(false);
  const [liveTestResponse, setLiveTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("api-center");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "api-center",
            "API Intelligence Center. Complete OpenAPI documentation, interactive request runner, and schema definitions for the EngineWatch FastAPI backend."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedEndpoint.sampleRequest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeLiveTest = async () => {
    setTesting(true);
    setLiveTestResponse(null);
    try {
      const targetUrl = `${API_BASE_URL}${selectedEndpoint.path}`;
      let res;
      if (selectedEndpoint.method === "GET") {
        res = await fetch(targetUrl);
      } else {
        // Send nominal preset
        res = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            engine_id: "EW-CFM56-API-TEST",
            current_cycle: 20,
            readings: {
              setting_1: 0.0,
              setting_2: 0.0,
              s_2: 642.1,
              s_3: 1582.0,
              s_4: 1399.0,
              s_7: 554.5,
              s_8: 2388.06,
              s_9: 9052.0,
              s_11: 47.2,
              s_12: 522.2,
              s_13: 2388.05,
              s_14: 8139.0,
              s_15: 8.39,
              s_17: 391.0,
              s_20: 39.0,
              s_21: 23.4,
            },
          }),
        });
      }
      const data = await res.json();
      setLiveTestResponse({ status: res.status, data });
    } catch (err: any) {
      setLiveTestResponse({ status: 503, error: err.message || "Failed to reach backend." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <section id="api-center" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 08 // Developer Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              API Intelligence <br />
              <span className="text-cyan-400">Documentation & Test Runner</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-theme-textMuted max-w-md font-light">
            Fully typed REST API schemas with integrated OpenAPI specification, Pydantic bounds validation, and live query execution.
          </p>
        </div>

        {/* Layout: Sidebar Endpoints + Main Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Endpoint List (4 Cols) */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-theme-textMuted block mb-2 px-1">
              Registered Endpoints
            </span>
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setLiveTestResponse(null);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedEndpoint.path === ep.path
                    ? "bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(66,213,242,0.15)]"
                    : "bg-theme-surface/50 border-theme-border hover:bg-theme-surface hover:border-theme-textMuted"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      ep.method === "GET"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono font-bold text-theme-textPrimary">
                    {ep.path}
                  </span>
                </div>
                <h4 className="text-xs font-medium text-theme-textMuted mt-2 line-clamp-1">
                  {ep.title}
                </h4>
              </button>
            ))}

            {/* OpenAPI Docs Link Banner */}
            <div className="p-4 rounded-xl border border-theme-border/60 bg-theme-surface/30 mt-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                Interactive Swagger UI
              </span>
              <p className="text-xs text-theme-textMuted mb-3">
                Access FastAPI automated Swagger and ReDoc documentation directly at:
              </p>
              <a
                href={`${API_BASE_URL}/docs`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:underline"
              >
                <span>{API_BASE_URL}/docs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Code Viewer & Request Runner (8 Cols) */}
          <div className="lg:col-span-8 p-6 rounded-2xl border border-theme-border bg-theme-surface/70 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-theme-border gap-3 mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      selectedEndpoint.method === "GET"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-base font-bold font-mono text-theme-textPrimary">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <p className="text-xs text-theme-textMuted mt-1">
                  {selectedEndpoint.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg border border-theme-border text-theme-textMuted hover:text-theme-textPrimary hover:border-theme-textMuted flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy cURL"}</span>
                </button>

                <button
                  onClick={executeLiveTest}
                  disabled={testing}
                  className="px-4 py-1.5 text-xs font-mono rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
                  <span>{testing ? "Testing..." : "Send Test Query"}</span>
                </button>
              </div>
            </div>

            {/* Request View */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-theme-textMuted block mb-1">
                  Command Line Request (cURL)
                </span>
                <pre className="p-4 rounded-xl bg-slate-950 border border-theme-border text-cyan-300 font-mono text-xs overflow-x-auto">
                  {selectedEndpoint.sampleRequest}
                </pre>
              </div>

              {/* Live or Sample Response View */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-theme-textMuted">
                    {liveTestResponse ? "Live API Response Output" : "Sample Schema Response (HTTP 200 OK)"}
                  </span>
                  {liveTestResponse && (
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        liveTestResponse.status === 200 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      HTTP {liveTestResponse.status}
                    </span>
                  )}
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-theme-border text-emerald-300 font-mono text-xs max-h-80 overflow-y-auto">
                  {JSON.stringify(
                    liveTestResponse ? liveTestResponse.data || liveTestResponse.error : selectedEndpoint.sampleResponse,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

