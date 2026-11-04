"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ArrowDown, Cpu, Activity, ShieldCheck, ChevronRight, Gauge } from "lucide-react";
import { useVoice } from "@/lib/voice";

export const HeroSection = () => {
  const { speakSection } = useVoice();

  useEffect(() => {
    // Optional voice narration on section entry
    const timer = setTimeout(() => {
      speakSection(
        "hero",
        "Welcome to EngineWatch. Premium aerospace intelligence platform. Delivering Remaining Useful Life estimation and real-time engine telemetry before failure occurs."
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, [speakSection]);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex flex-col justify-between pt-12 pb-16 px-4 sm:px-6 lg:px-8 aerospace-grid overflow-hidden border-b border-theme-border"
    >
      {/* Cinematic Atmospheric Radar Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] radar-gradient rounded-full pointer-events-none blur-3xl opacity-70" />

      {/* Decorative Technical Vector Overlays */}
      <div className="absolute top-8 left-8 hidden lg:flex flex-col space-y-1 text-[11px] font-mono text-theme-textMuted/60 pointer-events-none">
        <span>LAT: 34.0522° N // LON: 118.2437° W</span>
        <span>SURFACE: SEA LEVEL // ALT: 0 FT</span>
        <span>DATASET: NASA C-MAPSS FD001</span>
        <span>STATUS: ACTIVE_TELEMETRY</span>
      </div>

      <div className="absolute top-8 right-8 hidden lg:flex flex-col items-end space-y-1 text-[11px] font-mono text-theme-textMuted/60 pointer-events-none">
        <span>PREDICTIVE ENGINE: RF_REGRESSOR_v1</span>
        <span>FEATURES: 48 ENGINEERED</span>
        <span>ESTIMATOR DEPTH: 16 // TREES: 100</span>
        <span>RUL CAP: 125 CYCLES</span>
      </div>

      {/* Main Content Area */}
      <div className="relative max-w-5xl mx-auto my-auto text-center z-10 pt-8">
        {/* Aerospace Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md mb-8">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-medium tracking-widest text-cyan-300 uppercase">
            AEROSPACE PREDICTIVE INTELLIGENCE PLATFORM
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-theme-textPrimary uppercase leading-[0.95]">
          ENGINE INTELLIGENCE.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            BEFORE FAILURE.
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="mt-6 text-base sm:text-xl md:text-2xl font-light text-theme-textMuted max-w-3xl mx-auto leading-relaxed">
          Predictive intelligence for the next generation of aerospace maintenance.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#laboratory"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_24px_rgba(66,213,242,0.4)] hover:shadow-[0_0_32px_rgba(66,213,242,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Cpu className="w-4 h-4" />
            <span>Explore Engine Intelligence</span>
            <ChevronRight className="w-4 h-4" />
          </a>

          <a
            href="#dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold tracking-wider uppercase border border-theme-border bg-theme-surface/70 hover:bg-theme-surface hover:border-cyan-400/50 text-theme-textPrimary transition-all flex items-center justify-center space-x-2"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Launch Intelligence Dashboard</span>
          </a>
        </div>

        {/* Key Model Telemetry Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/40 backdrop-blur-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-theme-textMuted block">
              Validation RMSE
            </span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
              19.94 <span className="text-xs font-normal text-theme-textMuted">cycles</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
              52.0% better than mean baseline
            </span>
          </div>

          <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/40 backdrop-blur-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-theme-textMuted block">
              Mean Absolute Error
            </span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
              13.98 <span className="text-xs font-normal text-theme-textMuted">cycles</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
              Rigorous engine-aware split
            </span>
          </div>

          <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/40 backdrop-blur-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-theme-textMuted block">
              NASA Benchmark Data
            </span>
            <span className="text-2xl font-black font-mono text-theme-textPrimary mt-1 block">
              20,631 <span className="text-xs font-normal text-theme-textMuted">cycles</span>
            </span>
            <span className="text-[10px] font-mono text-theme-textMuted mt-1 block">
              100 Run-to-Failure Engines
            </span>
          </div>

          <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/40 backdrop-blur-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-theme-textMuted block">
              Prediction Latency
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              &lt; 15 <span className="text-xs font-normal text-theme-textMuted">ms</span>
            </span>
            <span className="text-[10px] font-mono text-theme-textMuted mt-1 block">
              Real-time REST Inference
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-8">
        <a
          href="#about"
          className="flex flex-col items-center space-y-1 text-xs font-mono text-theme-textMuted hover:text-cyan-400 transition-colors group"
        >
          <span className="tracking-widest uppercase text-[10px]">SCROLL TO EXPLORE ARCHITECTURE</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-cyan-400 group-hover:translate-y-1 transition-transform" />
        </a>
      </div>
    </section>
  );
};

