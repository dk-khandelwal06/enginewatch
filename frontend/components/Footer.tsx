"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Cpu, Code2, Layers, Radio } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-theme-border bg-theme-bg/95 py-16 px-4 sm:px-6 lg:px-8 text-xs font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-theme-border/60">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-900 flex items-center justify-center p-1">
                <Image
                  src="/assets/logo.png"
                  alt="EngineWatch Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-black tracking-wider text-theme-textPrimary uppercase">
                ENGINE<span className="text-cyan-400">WATCH</span>
              </span>
            </div>
            <p className="text-theme-textMuted leading-relaxed">
              Aerospace predictive intelligence and Remaining Useful Life estimation for aircraft turbofan propulsion systems.
            </p>
            <div className="text-[11px] text-cyan-400/80">
              Model: Random Forest Regressor (FD001)
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-textPrimary mb-4">
              Intelligence Platform
            </h4>
            <ul className="space-y-2 text-theme-textMuted">
              <li><a href="#hero" className="hover:text-cyan-400 transition-colors">Overview & Telemetry</a></li>
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">Degradation Mechanics</a></li>
              <li><a href="#dashboard" className="hover:text-cyan-400 transition-colors">Operations Dashboard</a></li>
              <li><a href="#monitoring" className="hover:text-cyan-400 transition-colors">Fleet Monitoring & 3D Twin</a></li>
              <li><a href="#laboratory" className="hover:text-cyan-400 transition-colors">RUL Prediction Lab</a></li>
            </ul>
          </div>

          {/* Technical Docs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-textPrimary mb-4">
              Engineering Specs
            </h4>
            <ul className="space-y-2 text-theme-textMuted">
              <li><a href="#degradation" className="hover:text-cyan-400 transition-colors">Sensor Drift Curves</a></li>
              <li><a href="#flight-ops" className="hover:text-cyan-400 transition-colors">Airspace Radar Corridor</a></li>
              <li><a href="#api-center" className="hover:text-cyan-400 transition-colors">REST API Reference</a></li>
              <li><a href="#security" className="hover:text-cyan-400 transition-colors">Security Architecture</a></li>
              <li><a href="#technology" className="hover:text-cyan-400 transition-colors">Machine Learning Pipeline</a></li>
            </ul>
          </div>

          {/* Research & Data Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-textPrimary mb-4">
              Benchmark Dataset
            </h4>
            <ul className="space-y-2 text-theme-textMuted">
              <li>NASA Ames Prognostics Data Repository</li>
              <li>Turbofan Engine Simulation (C-MAPSS)</li>
              <li>Dataset Subset: FD001 (Sea Level)</li>
              <li>100 Run-to-Failure Engine Units</li>
              <li>20,631 Operational Cycle Records</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Airworthiness Statement */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-theme-textMuted text-[11px] gap-4">
          <div>
            &copy; {new Date().getFullYear()} EngineWatch Aerospace Technologies. All rights reserved.
          </div>
          <div className="text-center md:text-right max-w-xl text-[10px] text-theme-textMuted/70">
            EngineWatch provides experimental predictive-maintenance estimates based on simulated engine degradation data. Predictions are not certified airworthiness assessments and must not be used as the sole basis for flight-safety or maintenance decisions.
          </div>
        </div>
      </div>
    </footer>
  );
};

