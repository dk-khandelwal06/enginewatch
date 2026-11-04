"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Clock, Activity, Cpu, CheckCircle2, TrendingDown, Layers, ShieldAlert } from "lucide-react";
import { useVoice } from "@/lib/voice";

export const AboutSection = () => {
  const { speakSection } = useVoice();

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("about");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "about",
            "About EngineWatch. Commercial turbofan maintenance is shifting from reactive schedules to physics-informed machine learning, capturing high-pressure turbine degradation and thermal fatigue cycles before failure."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  const pillars = [
    {
      icon: Clock,
      title: "Limitations of Fixed-Interval Maintenance",
      description:
        "Traditional aviation maintenance relies on static flight-hour thresholds. This incurs premature overhauls on healthy engines while risking uncontained failures on engines subjected to severe thermal cycles or abrasive flight paths.",
      tag: "CONVENTIONAL PARADIGM",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      icon: TrendingDown,
      title: "The Physics of Turbofan Degradation",
      description:
        "Degradation begins imperceptibly with blade tip erosion, seal clearance loss, and thermal barrier coating spallation. As compressor pressure ratio drops, core temperatures rise to maintain thrust, creating exponential mechanical wear.",
      tag: "THERMODYNAMIC WEAR",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      icon: Cpu,
      title: "Remaining Useful Life (RUL) Modeling",
      description:
        "RUL specifies the exact number of remaining flight cycles before an engine breaches safe airworthiness operating limits. EngineWatch caps early-life RUL at 125 cycles where wear is non-observable, focusing regression power on critical failure descent.",
      tag: "PROGNOSTIC METRIC",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      icon: Layers,
      title: "Machine Learning Multi-Sensor Fusion",
      description:
        "By ingesting 14 non-stationary sensor channels—including exhaust gas temperature (s_4), HPC static pressure (s_11), and bypass ratio (s_15)—our Random Forest architecture isolates multi-variate drift from normal atmospheric variability.",
      tag: "DECISION ENSEMBLE",
      badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    },
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 02 // Engineering Foundations</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              Predictive Intelligence <br />
              <span className="text-cyan-400">Versus Reactive Maintenance</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm sm:text-base text-theme-textMuted max-w-md font-light">
            How physics-informed machine learning transforms turbofan engine life-cycle management from rigid calendar intervals to dynamic condition prognostics.
          </p>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-theme-border bg-theme-surface/50 hover:bg-theme-surface hover:border-cyan-500/40 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/80 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono border ${pillar.badgeColor}`}>
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-theme-textPrimary mb-3 group-hover:text-cyan-400 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-sm text-theme-textMuted leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Visual Degradation Comparison Banner */}
        <div className="mt-12 p-8 rounded-2xl border border-theme-border bg-gradient-to-r from-theme-surface/90 via-theme-card to-theme-surface/90 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                Progression Profile
              </span>
              <h4 className="text-2xl font-bold text-theme-textPrimary">
                Run-to-Failure Degradation Trajectory
              </h4>
              <p className="text-xs text-theme-textMuted mt-2 leading-relaxed">
                NASA C-MAPSS FD001 simulations demonstrate that turbofan degradation is non-linear. Normal wear transitions into rapid exponential degradation over the final 50 cycles.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="font-bold">HEALTHY TIER</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xl font-bold text-theme-textPrimary">&gt; 75 Cycles</div>
                <p className="text-[11px] text-theme-textMuted mt-1">
                  Stable EGT margins, nominal baseline fuel-flow ratios, minimal blade clearance wear.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="font-bold">WATCH TIER</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-xl font-bold text-theme-textPrimary">25 - 75 Cycles</div>
                <p className="text-[11px] text-theme-textMuted mt-1">
                  Accelerating thermal drift, detectable HPC pressure decline, scheduled depot servicing flagged.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20">
                <div className="flex items-center justify-between text-red-400 mb-2">
                  <span className="font-bold">CRITICAL TIER</span>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="text-xl font-bold text-theme-textPrimary">&lt; 25 Cycles</div>
                <p className="text-[11px] text-theme-textMuted mt-1">
                  Severe turbine thermal creep, high bleed enthalpy, mandatory engine swap required before failure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
