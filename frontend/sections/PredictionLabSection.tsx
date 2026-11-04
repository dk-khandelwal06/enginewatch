"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Send,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Code2,
  Clock,
  Gauge,
  Sparkles,
  Info
} from "lucide-react";
import {
  predictRulApi,
  fetchPresetInputs,
  PredictRequest,
  PredictResponse,
  SensorReading
} from "@/lib/api";
import { useVoice } from "@/lib/voice";

const DEFAULT_READINGS: SensorReading = {
  setting_1: 0.0014,
  setting_2: 0.0003,
  s_2: 642.5,
  s_3: 1588.2,
  s_4: 1404.1,
  s_7: 553.8,
  s_8: 2388.1,
  s_9: 9055.4,
  s_11: 47.45,
  s_12: 521.6,
  s_13: 2388.08,
  s_14: 8132.5,
  s_15: 8.42,
  s_17: 392.0,
  s_20: 38.85,
  s_21: 23.32,
};

export const PredictionLabSection = () => {
  const { speakSection } = useVoice();
  const [engineId, setEngineId] = useState("EW-CFM56-081");
  const [currentCycle, setCurrentCycle] = useState(85);
  const [readings, setReadings] = useState<SensorReading>(DEFAULT_READINGS);
  const [rawJsonMode, setRawJsonMode] = useState(false);
  const [rawJsonInput, setRawJsonInput] = useState("");
  const [presets, setPresets] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPresetInputs()
      .then((data) => setPresets(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("laboratory");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "laboratory",
            "Remaining Useful Life Prediction Laboratory. Load engine sensor profiles or adjust thermodynamic variables to generate live machine learning inference from our trained Random Forest model."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  const handleApplyPreset = (presetKey: string) => {
    if (!presets[presetKey]) return;
    const req = presets[presetKey].request;
    setEngineId(req.engine_id || "EW-CFM56-081");
    setCurrentCycle(req.current_cycle || 1);
    setReadings(req.readings);
    setRawJsonInput(JSON.stringify(req, null, 2));
    setErrorMessage(null);
  };

  const handleSensorChange = (sensor: keyof SensorReading, val: number) => {
    const updated = { ...readings, [sensor]: val };
    setReadings(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    let payload: PredictRequest;

    if (rawJsonMode) {
      try {
        payload = JSON.parse(rawJsonInput);
      } catch (err: any) {
        setErrorMessage("Invalid JSON formatting: " + err.message);
        setLoading(false);
        return;
      }
    } else {
      payload = {
        engine_id: engineId,
        current_cycle: currentCycle,
        readings: readings,
      };
    }

    try {
      const result = await predictRulApi(payload);
      setPredictionResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to execute model inference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="laboratory" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 05 // Inference Workspace</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              RUL Prediction <br />
              <span className="text-cyan-400">Engineering Laboratory</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-theme-textMuted max-w-md font-light">
            Real-time inference interface submitting thermodynamic and rotor telemetry directly to the trained Random Forest regressor.
          </p>
        </div>

        {/* 3 Quick Presets Bar */}
        <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/50 backdrop-blur-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-theme-textPrimary uppercase">
              1-Click Benchmark Scenarios:
            </span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleApplyPreset("nominal")}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 transition-colors"
            >
              1. Nominal (Early Life)
            </button>
            <button
              onClick={() => handleApplyPreset("wear_in")}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-amber-500/40 bg-amber-950/20 text-amber-400 hover:bg-amber-900/30 transition-colors"
            >
              2. Accelerated Wear (Mid Life)
            </button>
            <button
              onClick={() => handleApplyPreset("critical")}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 transition-colors"
            >
              3. Approaching Limit (Critical)
            </button>
          </div>
        </div>

        {/* Two-Column Lab Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Sensor Controls (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-theme-border bg-theme-surface/60 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-theme-border mb-6">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-theme-textPrimary">
                  Telemetry Input Parameters
                </h3>
              </div>

              {/* Toggle JSON Mode */}
              <button
                onClick={() => {
                  if (!rawJsonMode) {
                    setRawJsonInput(
                      JSON.stringify(
                        {
                          engine_id: engineId,
                          current_cycle: currentCycle,
                          readings: readings,
                        },
                        null,
                        2
                      )
                    );
                  }
                  setRawJsonMode(!rawJsonMode);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-mono rounded border transition-colors ${
                  rawJsonMode
                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-300"
                    : "border-theme-border text-theme-textMuted hover:text-theme-textPrimary"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{rawJsonMode ? "Switch to Sliders" : "Raw JSON Mode"}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {rawJsonMode ? (
                /* Raw JSON Editor */
                <div className="space-y-4">
                  <textarea
                    rows={18}
                    value={rawJsonInput}
                    onChange={(e) => setRawJsonInput(e.target.value)}
                    className="w-full p-4 font-mono text-xs rounded-xl border border-theme-border bg-slate-950 text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ) : (
                /* Interactive Sliders & Inputs */
                <div className="space-y-5">
                  {/* Engine Identification Row */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-theme-border/60">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-theme-textMuted block mb-1">
                        Engine Serial Number
                      </label>
                      <input
                        type="text"
                        value={engineId}
                        onChange={(e) => setEngineId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-theme-border bg-theme-bg text-theme-textPrimary focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-theme-textMuted block mb-1">
                        Current Operating Cycle
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={currentCycle}
                        onChange={(e) => setCurrentCycle(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-theme-border bg-theme-bg text-theme-textPrimary focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Core Sensor Channels Grid */}
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                    {/* s_4: EGT */}
                    <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border/60">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-theme-textPrimary font-semibold">
                          s_4: LPT Outlet EGT Temperature
                        </span>
                        <span className="text-cyan-400 font-bold">{readings.s_4.toFixed(1)} °R</span>
                      </div>
                      <input
                        type="range"
                        min={1380}
                        max={1450}
                        step={0.1}
                        value={readings.s_4}
                        onChange={(e) => handleSensorChange("s_4", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-theme-textMuted mt-1">
                        <span>Nominal: 1,402.8 °R</span>
                        <span>High Wear Limit: 1,435.0 °R</span>
                      </div>
                    </div>

                    {/* s_7: HPC Pressure */}
                    <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border/60">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-theme-textPrimary font-semibold">
                          s_7: HPC Total Outlet Pressure
                        </span>
                        <span className="text-cyan-400 font-bold">{readings.s_7.toFixed(2)} psia</span>
                      </div>
                      <input
                        type="range"
                        min={548}
                        max={558}
                        step={0.05}
                        value={readings.s_7}
                        onChange={(e) => handleSensorChange("s_7", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-theme-textMuted mt-1">
                        <span>Erosion Limit: 550.0 psia</span>
                        <span>Nominal: 553.9 psia</span>
                      </div>
                    </div>

                    {/* s_11: Static Pressure Ps30 */}
                    <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border/60">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-theme-textPrimary font-semibold">
                          s_11: HPC Static Pressure (Ps30)
                        </span>
                        <span className="text-cyan-400 font-bold">{readings.s_11.toFixed(2)} psia</span>
                      </div>
                      <input
                        type="range"
                        min={46.5}
                        max={48.8}
                        step={0.01}
                        value={readings.s_11}
                        onChange={(e) => handleSensorChange("s_11", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* s_2: LPC Outlet Temp */}
                    <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border/60">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-theme-textPrimary font-semibold">
                          s_2: LPC Outlet Temperature
                        </span>
                        <span className="text-cyan-400 font-bold">{readings.s_2.toFixed(2)} °R</span>
                      </div>
                      <input
                        type="range"
                        min={641.0}
                        max={644.8}
                        step={0.05}
                        value={readings.s_2}
                        onChange={(e) => handleSensorChange("s_2", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* s_9: Core Speed */}
                    <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border/60">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-theme-textPrimary font-semibold">
                          s_9: Core Rotor Physical Speed
                        </span>
                        <span className="text-cyan-400 font-bold">{readings.s_9.toFixed(1)} rpm</span>
                      </div>
                      <input
                        type="range"
                        min={9020}
                        max={9240}
                        step={0.5}
                        value={readings.s_9}
                        onChange={(e) => handleSensorChange("s_9", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* s_15: Bypass Ratio */}
                    <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border/60">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-theme-textPrimary font-semibold">
                          s_15: Bypass Ratio
                        </span>
                        <span className="text-cyan-400 font-bold">{readings.s_15.toFixed(4)}</span>
                      </div>
                      <input
                        type="range"
                        min={8.32}
                        max={8.58}
                        step={0.001}
                        value={readings.s_15}
                        onChange={(e) => handleSensorChange("s_15", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl border border-red-500/40 bg-red-950/30 text-red-400 text-xs font-mono flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setReadings(DEFAULT_READINGS)}
                  className="px-4 py-2 text-xs font-mono rounded-xl border border-theme-border text-theme-textMuted hover:text-theme-textPrimary hover:border-theme-textMuted transition-colors flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Nominal</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_16px_rgba(66,213,242,0.4)] hover:shadow-[0_0_24px_rgba(66,213,242,0.6)] disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  <Send className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`} />
                  <span>{loading ? "Computing Inference..." : "Execute Prediction"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Prediction Result Terminal (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface/70 backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-theme-border mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  ML Inference Terminal
                </span>
                <span className="text-[10px] font-mono text-theme-textMuted">
                  {predictionResult ? `${predictionResult.inference_time_ms} ms` : "Awaiting Input"}
                </span>
              </div>

              {predictionResult ? (
                <div className="space-y-6">
                  {/* Big RUL Display */}
                  <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-transparent text-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-theme-textMuted block">
                      Remaining Useful Life Estimate
                    </span>
                    <div className="text-5xl sm:text-6xl font-black font-mono text-cyan-400 my-2">
                      {predictionResult.predicted_rul_cycles}{" "}
                      <span className="text-base font-normal text-theme-textMuted">CYCLES</span>
                    </div>

                    <div className="flex items-center justify-center space-x-2 mt-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                          predictionResult.health_status === "HEALTHY"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : predictionResult.health_status === "WATCH"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                            : "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                        }`}
                      >
                        TIER: {predictionResult.health_status}
                      </span>
                    </div>
                  </div>

                  {/* Flight Hours Equivalent with Conversion Callout */}
                  <div className="p-4 rounded-xl border border-theme-border bg-theme-bg/60">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-theme-textMuted">Flight Hours Equivalent:</span>
                      <span className="text-base font-bold text-theme-textPrimary font-mono">
                        ~{predictionResult.flight_hours_equivalent} hrs
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-theme-textMuted/80 mt-1 italic leading-relaxed">
                      * {predictionResult.flight_hours_assumption}
                    </p>
                  </div>

                  {/* Sensor Deviation Diagnostics */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-theme-textPrimary mb-2">
                      Sensor Z-Score Deviation Matrix
                    </h4>
                    <div className="max-h-56 overflow-y-auto border border-theme-border rounded-xl">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-theme-bg/90 text-theme-textMuted border-b border-theme-border sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Sensor</th>
                            <th className="py-2 px-3">Value</th>
                            <th className="py-2 px-3">Z-Score</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border/30">
                          {predictionResult.sensor_analysis.map((s) => (
                            <tr key={s.sensor} className="hover:bg-theme-surface">
                              <td className="py-1.5 px-3 font-semibold text-theme-textPrimary">
                                {s.name}
                              </td>
                              <td className="py-1.5 px-3 text-theme-textMuted">
                                {s.current_value.toFixed(2)} {s.unit}
                              </td>
                              <td className="py-1.5 px-3">
                                <span
                                  className={
                                    Math.abs(s.z_score) > 2.5
                                      ? "text-red-400 font-bold"
                                      : Math.abs(s.z_score) > 1.5
                                      ? "text-amber-400"
                                      : "text-emerald-400"
                                  }
                                >
                                  {s.z_score > 0 ? `+${s.z_score}` : s.z_score}σ
                                </span>
                              </td>
                              <td className="py-1.5 px-3">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    s.status === "NORMAL"
                                      ? "text-emerald-400 bg-emerald-500/10"
                                      : s.status === "ELEVATED"
                                      ? "text-amber-400 bg-amber-500/10"
                                      : "text-red-400 bg-red-500/10"
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mandatory Regulatory Disclaimer */}
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-[10px] font-mono text-amber-300/90 leading-relaxed">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <span>{predictionResult.disclaimer}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty / Awaiting State */
                <div className="py-20 text-center text-theme-textMuted font-mono text-xs">
                  <Gauge className="w-12 h-12 mx-auto mb-3 text-cyan-400/40 animate-pulse" />
                  <p>Telemetry parameters configured.</p>
                  <p className="text-[11px] text-theme-textMuted/70 mt-1">
                    Click &ldquo;Execute Prediction&rdquo; or pick a preset scenario to run inference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

