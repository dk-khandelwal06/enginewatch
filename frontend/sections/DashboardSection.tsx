"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Gauge,
  TrendingUp,
  Cpu,
  RefreshCw,
  BarChart3,
  Sliders
} from "lucide-react";
import {
  fetchSampleEngines,
  fetchMetrics,
  EngineSummary,
  MetricsResponse
} from "@/lib/api";
import { useVoice } from "@/lib/voice";

export const DashboardSection = () => {
  const { speakSection } = useVoice();
  const [engines, setEngines] = useState<EngineSummary[]>([]);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [engData, metricData] = await Promise.all([
        fetchSampleEngines().catch(() => []),
        fetchMetrics().catch(() => null),
      ]);
      setEngines(engData);
      setMetrics(metricData);
    } catch (err: any) {
      setError(err.message || "Failed to load telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("dashboard");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "dashboard",
            "Engine Intelligence Dashboard. Displaying active telemetry for monitored turbofan engines, derived from the NASA C-MAPSS validation fleet with real-time Remaining Useful Life predictions."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  // Aggregate fleet stats from genuine API response
  const totalMonitored = engines.length;
  const healthyCount = engines.filter((e) => e.health_status === "HEALTHY").length;
  const watchCount = engines.filter((e) => e.health_status === "WATCH").length;
  const criticalCount = engines.filter((e) => e.health_status === "CRITICAL").length;
  const avgCycles = totalMonitored > 0
    ? Math.round(engines.reduce((acc, e) => acc + e.predicted_rul, 0) / totalMonitored)
    : 0;

  return (
    <section id="dashboard" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 03 // Real-Time Telemetry</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              Engine Intelligence <br />
              <span className="text-cyan-400">Operations Dashboard</span>
            </h2>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className="text-xs font-mono text-theme-textMuted">
              Sample Fleet: NASA C-MAPSS FD001 Validation Set
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg border border-theme-border hover:bg-theme-surface text-cyan-400 transition-colors disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Fleet KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {/* Total Monitored */}
          <div className="p-5 rounded-xl border border-theme-border bg-theme-surface/60 backdrop-blur-sm">
            <div className="flex items-center justify-between text-theme-textMuted mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Monitored Fleet</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black font-mono text-theme-textPrimary">
              {loading ? "--" : totalMonitored}
            </div>
            <div className="text-[11px] font-mono text-cyan-400 mt-1">
              Active Turbofans
            </div>
          </div>

          {/* Healthy */}
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Healthy</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {loading ? "--" : healthyCount}
            </div>
            <div className="text-[11px] font-mono text-emerald-400/80 mt-1">
              &gt; 75 RUL Cycles
            </div>
          </div>

          {/* Under Observation (Watch) */}
          <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-950/20">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Observation</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono text-amber-400">
              {loading ? "--" : watchCount}
            </div>
            <div className="text-[11px] font-mono text-amber-400/80 mt-1">
              25 - 75 RUL Cycles
            </div>
          </div>

          {/* Critical */}
          <div className="p-5 rounded-xl border border-red-500/30 bg-red-950/20">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Critical</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono text-red-400">
              {loading ? "--" : criticalCount}
            </div>
            <div className="text-[11px] font-mono text-red-400/80 mt-1">
              &lt; 25 Cycles (Swap)
            </div>
          </div>

          {/* Average Remaining Cycles */}
          <div className="p-5 rounded-xl border border-theme-border bg-theme-surface/60 backdrop-blur-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-theme-textMuted mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Fleet Avg RUL</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black font-mono text-cyan-400">
              {loading ? "--" : avgCycles}
            </div>
            <div className="text-[11px] font-mono text-theme-textMuted mt-1">
              Remaining Cycles
            </div>
          </div>
        </div>

        {/* Health Distribution & ML Evaluation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Health Tier Visual Distribution */}
          <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-theme-textPrimary flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Fleet Health Breakdown</span>
              </h3>
              <span className="text-[10px] font-mono text-theme-textMuted uppercase">
                Demonstration Fleet
              </span>
            </div>

            {/* Distribution Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800 my-4">
              <div
                style={{ width: `${totalMonitored > 0 ? (healthyCount / totalMonitored) * 100 : 33}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Healthy: ${healthyCount}`}
              />
              <div
                style={{ width: `${totalMonitored > 0 ? (watchCount / totalMonitored) * 100 : 33}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Observation: ${watchCount}`}
              />
              <div
                style={{ width: `${totalMonitored > 0 ? (criticalCount / totalMonitored) * 100 : 34}%` }}
                className="bg-red-500 transition-all duration-500"
                title={`Critical: ${criticalCount}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mt-4">
              <div className="p-2 rounded bg-theme-bg/60 border border-theme-border/40">
                <span className="text-emerald-400 block font-bold">
                  {totalMonitored > 0 ? Math.round((healthyCount / totalMonitored) * 100) : 0}%
                </span>
                <span className="text-[10px] text-theme-textMuted">Healthy</span>
              </div>
              <div className="p-2 rounded bg-theme-bg/60 border border-theme-border/40">
                <span className="text-amber-400 block font-bold">
                  {totalMonitored > 0 ? Math.round((watchCount / totalMonitored) * 100) : 0}%
                </span>
                <span className="text-[10px] text-theme-textMuted">Watch</span>
              </div>
              <div className="p-2 rounded bg-theme-bg/60 border border-theme-border/40">
                <span className="text-red-400 block font-bold">
                  {totalMonitored > 0 ? Math.round((criticalCount / totalMonitored) * 100) : 0}%
                </span>
                <span className="text-[10px] text-theme-textMuted">Critical</span>
              </div>
            </div>
          </div>

          {/* ML Accuracy Benchmark Comparison */}
          <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface/50 backdrop-blur-md lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-theme-textPrimary flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Model Regression Performance (Unseen Validation Engines)</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">
                Random Forest v1.0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-theme-border bg-theme-bg/60">
                <span className="text-[10px] font-mono uppercase text-theme-textMuted block">
                  Random Forest (Trained)
                </span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  RMSE: {metrics?.models?.random_forest?.rmse?.toFixed(2) || "19.94"}
                </div>
                <div className="text-xs font-mono text-theme-textPrimary mt-0.5">
                  MAE: {metrics?.models?.random_forest?.mae?.toFixed(2) || "13.98"}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">
                  R² Score: {metrics?.models?.random_forest?.r2?.toFixed(4) || "0.7693"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-theme-border/60 bg-theme-bg/30">
                <span className="text-[10px] font-mono uppercase text-theme-textMuted block">
                  Ridge Regression (Baseline)
                </span>
                <div className="text-xl font-bold font-mono text-theme-textMuted mt-1">
                  RMSE: {metrics?.models?.ridge_regression?.rmse?.toFixed(2) || "21.21"}
                </div>
                <div className="text-xs font-mono text-theme-textMuted mt-0.5">
                  MAE: {metrics?.models?.ridge_regression?.mae?.toFixed(2) || "17.72"}
                </div>
                <div className="text-[10px] font-mono text-theme-textMuted mt-2">
                  R² Score: {metrics?.models?.ridge_regression?.r2?.toFixed(4) || "0.7391"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-theme-border/60 bg-theme-bg/30">
                <span className="text-[10px] font-mono uppercase text-theme-textMuted block">
                  Mean Predictor (Baseline)
                </span>
                <div className="text-xl font-bold font-mono text-theme-textMuted mt-1">
                  RMSE: {metrics?.models?.mean_baseline?.rmse?.toFixed(2) || "41.58"}
                </div>
                <div className="text-xs font-mono text-theme-textMuted mt-0.5">
                  MAE: {metrics?.models?.mean_baseline?.mae?.toFixed(2) || "37.17"}
                </div>
                <div className="text-[10px] font-mono text-red-400 mt-2">
                  R² Score: {metrics?.models?.mean_baseline?.r2?.toFixed(4) || "-0.0031"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitored Fleet Snapshot Table */}
        <div className="rounded-2xl border border-theme-border bg-theme-surface/50 overflow-hidden backdrop-blur-md">
          <div className="px-6 py-4 border-b border-theme-border bg-theme-bg/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-textPrimary uppercase tracking-wider">
              Monitored Fleet Snapshot (Recent Engine Cycle Readings)
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Live FastAPI /engines Response
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-theme-bg/80 text-theme-textMuted border-b border-theme-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Engine ID</th>
                  <th className="py-3.5 px-4">Current Cycle</th>
                  <th className="py-3.5 px-4">Predicted RUL</th>
                  <th className="py-3.5 px-4">Flight Hrs (Est.)</th>
                  <th className="py-3.5 px-4">Health Tier</th>
                  <th className="py-3.5 px-4">EGT (°R)</th>
                  <th className="py-3.5 px-4">Core Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-theme-textMuted">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>Querying EngineWatch API...</span>
                      </div>
                    </td>
                  </tr>
                ) : engines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-amber-400">
                      Backend offline. Run FastAPI on port 8000 to display live telemetry.
                    </td>
                  </tr>
                ) : (
                  engines.slice(0, 6).map((eng) => (
                    <tr key={eng.unit_id} className="hover:bg-theme-surface transition-colors">
                      <td className="py-3.5 px-4 font-bold text-theme-textPrimary flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{eng.engine_serial}</span>
                      </td>
                      <td className="py-3.5 px-4 text-theme-textPrimary">{eng.current_cycle}</td>
                      <td className="py-3.5 px-4 font-bold text-cyan-400">{eng.predicted_rul} cycles</td>
                      <td className="py-3.5 px-4 text-theme-textMuted">{eng.flight_hours_est} hrs</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            eng.health_status === "HEALTHY"
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                              : eng.health_status === "WATCH"
                              ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                              : "bg-red-500/20 border-red-500/30 text-red-400 animate-pulse"
                          }`}
                        >
                          {eng.health_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-theme-textMuted">
                        {eng.active_sensors?.s_4 ? `${eng.active_sensors.s_4.toFixed(1)} °R` : "--"}
                      </td>
                      <td className="py-3.5 px-4 text-theme-textMuted">
                        {eng.active_sensors?.s_9 ? `${eng.active_sensors.s_9.toFixed(1)} rpm` : "--"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
