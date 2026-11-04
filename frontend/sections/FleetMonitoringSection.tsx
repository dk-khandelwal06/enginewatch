"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  Eye,
  Sliders,
  X,
  Gauge,
  Activity
} from "lucide-react";
import {
  fetchSampleEngines,
  fetchEngineDetail,
  EngineSummary,
  EngineDetailResponse
} from "@/lib/api";
import { Engine3DViewer } from "@/components/Engine3DViewer";
import { useVoice } from "@/lib/voice";

export const FleetMonitoringSection = () => {
  const { speakSection } = useVoice();
  const [engines, setEngines] = useState<EngineSummary[]>([]);
  const [filteredEngines, setFilteredEngines] = useState<EngineSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedEngineId, setSelectedEngineId] = useState<number | null>(null);
  const [engineDetail, setEngineDetail] = useState<EngineDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchSampleEngines()
      .then((data) => {
        setEngines(data);
        setFilteredEngines(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let result = engines;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.engine_serial.toLowerCase().includes(q) ||
          e.unit_id.toString().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((e) => e.health_status === statusFilter);
    }
    setFilteredEngines(result);
  }, [searchQuery, statusFilter, engines]);

  const handleSelectEngine = async (unitId: number) => {
    setSelectedEngineId(unitId);
    setDetailLoading(true);
    try {
      const detail = await fetchEngineDetail(unitId);
      setEngineDetail(detail);
    } catch {
      setEngineDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("monitoring");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "monitoring",
            "Turbofan Fleet Monitoring and 3D Digital Twin. Inspect real-time operational cycles, component thermal stations, and degradation trends for individual aircraft engines."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  return (
    <section id="monitoring" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 04 // Condition Monitoring</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              Fleet Health & <br />
              <span className="text-cyan-400">3D Component Digital Twin</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-theme-textMuted max-w-md font-light">
            Granular degradation telemetry across all monitored turbofan units with integrated 3D station inspection.
          </p>
        </div>

        {/* 3D Engine Digital Twin Embed */}
        <div className="mb-14">
          <Engine3DViewer />
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/50 backdrop-blur-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-textMuted" />
            <input
              type="text"
              placeholder="Search by Engine Serial (e.g. EW-CFM56)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-lg border border-theme-border bg-theme-bg text-theme-textPrimary placeholder:text-theme-textMuted/60 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
            {["ALL", "HEALTHY", "WATCH", "CRITICAL"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                  statusFilter === status
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                    : "border-theme-border text-theme-textMuted hover:border-theme-textMuted"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEngines.map((eng) => (
            <div
              key={eng.unit_id}
              onClick={() => handleSelectEngine(eng.unit_id)}
              className="p-5 rounded-xl border border-theme-border bg-theme-surface/60 hover:bg-theme-surface hover:border-cyan-400/50 transition-all cursor-pointer group relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-theme-textMuted uppercase tracking-wider">
                    Unit ID #{eng.unit_id}
                  </span>
                  <h4 className="text-base font-bold text-theme-textPrimary font-mono group-hover:text-cyan-400 transition-colors">
                    {eng.engine_serial}
                  </h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    eng.health_status === "HEALTHY"
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : eng.health_status === "WATCH"
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      : "bg-red-500/20 border-red-500/30 text-red-400"
                  }`}
                >
                  {eng.health_status}
                </span>
              </div>

              {/* Cycle & RUL Meter */}
              <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                <div className="p-2 rounded bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-[10px] text-theme-textMuted block">Current Cycle</span>
                  <span className="text-sm font-bold text-theme-textPrimary">{eng.current_cycle}</span>
                </div>
                <div className="p-2 rounded bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-[10px] text-theme-textMuted block">Predicted RUL</span>
                  <span className="text-sm font-bold text-cyan-400">{eng.predicted_rul} cyc</span>
                </div>
              </div>

              {/* RUL Progress Indicator */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (eng.predicted_rul / 125) * 100)}%` }}
                  className={`h-full ${
                    eng.health_status === "HEALTHY"
                      ? "bg-emerald-400"
                      : eng.health_status === "WATCH"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between mt-4 text-[11px] font-mono text-theme-textMuted">
                <span>Flight Hrs: ~{eng.flight_hours_est} hrs</span>
                <span className="text-cyan-400 flex items-center group-hover:translate-x-1 transition-transform">
                  Inspect Telemetry <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Engine Telemetry Detail Modal */}
        {selectedEngineId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-theme-border bg-theme-surface shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-theme-border">
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                    Diagnostic Telemetry Log
                  </span>
                  <h3 className="text-xl font-bold text-theme-textPrimary font-mono mt-0.5">
                    {engineDetail?.engine_serial || `Engine #${selectedEngineId}`}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEngineId(null)}
                  className="p-1.5 rounded-lg border border-theme-border text-theme-textMuted hover:text-theme-textPrimary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailLoading ? (
                <div className="py-12 text-center text-xs font-mono text-theme-textMuted">
                  Loading engine telemetry record...
                </div>
              ) : engineDetail ? (
                <div className="mt-6 space-y-6">
                  {/* Status overview */}
                  <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-theme-bg border border-theme-border">
                      <span className="text-theme-textMuted block text-[10px]">Predicted RUL</span>
                      <span className="text-lg font-bold text-cyan-400">
                        {engineDetail.predicted_rul} cycles
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-theme-bg border border-theme-border">
                      <span className="text-theme-textMuted block text-[10px]">Total Cycles Run</span>
                      <span className="text-lg font-bold text-theme-textPrimary">
                        {engineDetail.current_cycle}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-theme-bg border border-theme-border">
                      <span className="text-theme-textMuted block text-[10px]">Health Tier</span>
                      <span
                        className={`text-lg font-bold ${
                          engineDetail.health_status === "HEALTHY"
                            ? "text-emerald-400"
                            : engineDetail.health_status === "WATCH"
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {engineDetail.health_status}
                      </span>
                    </div>
                  </div>

                  {/* Active Sensor Readings */}
                  <div>
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                      Active Sensor Channels (Current Cycle #{engineDetail.current_cycle})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                      {Object.entries(engineDetail.active_sensors || {}).map(([sKey, sVal]) => (
                        <div key={sKey} className="p-2 rounded bg-theme-bg/80 border border-theme-border/60">
                          <span className="text-[10px] text-theme-textMuted block uppercase">{sKey}</span>
                          <span className="text-theme-textPrimary font-semibold">{sVal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Cycle Points */}
                  <div>
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                      Historical Degradation Trajectory (Cycles 1 to {engineDetail.current_cycle})
                    </h4>
                    <div className="max-h-48 overflow-y-auto border border-theme-border rounded-lg">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-theme-bg/90 text-theme-textMuted border-b border-theme-border sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Cycle</th>
                            <th className="py-2 px-3">True RUL</th>
                            <th className="py-2 px-3">EGT (°R)</th>
                            <th className="py-2 px-3">HPC Press</th>
                            <th className="py-2 px-3">Core Speed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border/30">
                          {engineDetail.history.map((h) => (
                            <tr key={h.cycle} className="hover:bg-theme-surface">
                              <td className="py-1.5 px-3">{h.cycle}</td>
                              <td className="py-1.5 px-3 text-cyan-400">{h.true_rul}</td>
                              <td className="py-1.5 px-3">{h.s_4.toFixed(1)}</td>
                              <td className="py-1.5 px-3">{h.s_7.toFixed(1)}</td>
                              <td className="py-1.5 px-3">{h.s_9.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

