"use client";

import React, { useEffect } from "react";
import { Radio, Compass, Plane, Navigation, Shield, Info, Activity } from "lucide-react";
import { useVoice } from "@/lib/voice";

const FLIGHT_ROUTES = [
  {
    id: "EW-FLIGHT-01",
    engineSerial: "EW-CFM56-081",
    route: "SFO → ORD",
    altitude: "FL360 (36,000 FT)",
    health: "HEALTHY",
    rul: "123.9 Cyc",
    pos: { x: 28, y: 38 },
  },
  {
    id: "EW-FLIGHT-02",
    engineSerial: "EW-CFM56-085",
    route: "DEN → ATL",
    altitude: "FL340 (34,000 FT)",
    health: "WATCH",
    rul: "54.2 Cyc",
    pos: { x: 52, y: 56 },
  },
  {
    id: "EW-FLIGHT-03",
    engineSerial: "EW-CFM56-092",
    route: "DFW → JFK",
    altitude: "FL380 (38,000 FT)",
    health: "CRITICAL",
    rul: "11.8 Cyc",
    pos: { x: 74, y: 44 },
  },
];

export const FlightOpsSection = () => {
  const { speakSection } = useVoice();

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("flight-ops");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "flight-ops",
            "Flight Operations Intelligence. Real-time situational overview linking in-flight aircraft vectors with continuous turbofan condition telemetry."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  return (
    <section id="flight-ops" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 07 // Operations Corridor</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              Flight Operations & <br />
              <span className="text-cyan-400">Airspace Telemetry Corridor</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-theme-textMuted max-w-md font-light">
            Situational tracking connecting airborne airframe routes to real-time engine health thresholds.
          </p>
        </div>

        {/* Radar Map & Ops Grid View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Radar Screen (8 Cols) */}
          <div className="lg:col-span-8 relative h-[520px] rounded-2xl border border-theme-border bg-slate-950 overflow-hidden shadow-2xl">
            {/* Radar Circular Grid Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[180px] h-[180px] rounded-full border border-cyan-500/20" />
              <div className="w-[340px] h-[340px] rounded-full border border-cyan-500/20" />
              <div className="w-[480px] h-[480px] rounded-full border border-cyan-500/15" />
              <div className="absolute w-full h-[1px] bg-cyan-500/20" />
              <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            </div>

            {/* Rotating Radar Sweep Line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[480px] h-[480px] rounded-full overflow-hidden animate-radar-sweep">
                <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-cyan-400/30 to-transparent" />
              </div>
            </div>

            {/* Radar Header Telemetry */}
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-3 text-xs font-mono text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>AIRSPACE RADAR SECTOR 04 // 250 NM RANGE</span>
            </div>

            {/* Stylized Flight Path Vectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Route 1 */}
              <path
                d="M 120 180 Q 240 220 380 260"
                stroke="#35B77A"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                fill="none"
                opacity="0.6"
              />
              {/* Route 2 */}
              <path
                d="M 320 280 Q 420 340 540 380"
                stroke="#F0A43A"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                fill="none"
                opacity="0.6"
              />
              {/* Route 3 */}
              <path
                d="M 450 200 Q 550 240 680 210"
                stroke="#E45454"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                fill="none"
                opacity="0.6"
              />
            </svg>

            {/* Active Moving Aircraft Radar Blips */}
            {FLIGHT_ROUTES.map((flight) => (
              <div
                key={flight.id}
                style={{ left: `${flight.pos.x}%`, top: `${flight.pos.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
              >
                {/* Ping wave */}
                <div
                  className={`w-4 h-4 rounded-full absolute -inset-1 opacity-75 animate-ping ${
                    flight.health === "HEALTHY"
                      ? "bg-emerald-400"
                      : flight.health === "WATCH"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
                {/* Core Blip */}
                <div
                  className={`w-3 h-3 rounded-full relative border border-white ${
                    flight.health === "HEALTHY"
                      ? "bg-emerald-400"
                      : flight.health === "WATCH"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />

                {/* Radar Aircraft Data Tag */}
                <div className="absolute left-5 top-0 bg-slate-900/90 border border-theme-border/80 p-2 rounded-lg backdrop-blur-md text-[10px] font-mono text-white whitespace-nowrap shadow-lg">
                  <div className="font-bold text-cyan-400 flex items-center space-x-1">
                    <Plane className="w-3 h-3" />
                    <span>{flight.id}</span>
                  </div>
                  <div className="text-theme-textMuted">{flight.engineSerial}</div>
                  <div className="text-theme-textMuted">{flight.altitude}</div>
                  <div
                    className={`font-semibold ${
                      flight.health === "HEALTHY"
                        ? "text-emerald-400"
                        : flight.health === "WATCH"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    RUL: {flight.rul}
                  </div>
                </div>
              </div>
            ))}

            {/* Illustrative Disclaimer Tag */}
            <div className="absolute bottom-3 right-4 z-10 text-[10px] font-mono text-theme-textMuted/70 bg-slate-900/80 px-2 py-1 rounded border border-theme-border/40">
              Illustrative aerospace simulation based on C-MAPSS mission profiles.
            </div>
          </div>

          {/* Right Column: Airframe Status Cards (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 px-1">
              Active Monitored Airframes
            </h3>

            {FLIGHT_ROUTES.map((flight) => (
              <div
                key={flight.id}
                className="p-4 rounded-xl border border-theme-border bg-theme-surface/60 backdrop-blur-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      {flight.id}
                    </span>
                    <h4 className="text-sm font-bold text-theme-textPrimary font-mono mt-0.5">
                      {flight.engineSerial}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      flight.health === "HEALTHY"
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : flight.health === "WATCH"
                        ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                        : "bg-red-500/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    {flight.health}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-theme-border/40 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-theme-textMuted block">Assigned Corridor</span>
                    <span className="text-theme-textPrimary">{flight.route}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-theme-textMuted block">Cruising Altitude</span>
                    <span className="text-theme-textPrimary">{flight.altitude}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Operational Rules Box */}
            <div className="p-4 rounded-xl border border-theme-border/60 bg-theme-surface/30 text-xs font-mono text-theme-textMuted leading-relaxed">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Airworthiness Routing Policy</span>
              </div>
              Aircraft with turbofans entering WATCH tier are automatically prioritized for hub maintenance turnaround within 3 cycles.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

