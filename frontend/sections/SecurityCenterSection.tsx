"use client";

import React, { useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Sliders,
  FileCheck,
  AlertOctagon,
  KeyRound,
  EyeOff,
  Server,
  Scale
} from "lucide-react";
import { useVoice } from "@/lib/voice";

const CONTROLS = [
  {
    icon: Sliders,
    title: "Pydantic v2 Schema Bounds Validation",
    description:
      "Every single incoming sensor reading is strictly verified against thermodynamic and physical limits (e.g. temperatures ge=600°R, pressures le=570 psia). Impossible or out-of-bounds measurements are blocked at the boundary with HTTP 422.",
    status: "IMPLEMENTED",
  },
  {
    icon: Lock,
    title: "CORS & Origin Policy Configuration",
    description:
      "Cross-Origin Resource Sharing is controlled via environment variables (CORS_ORIGINS). Pre-flight requests are validated, and unnecessary HTTP methods (DELETE, PUT, PATCH) are completely blocked.",
    status: "IMPLEMENTED",
  },
  {
    icon: AlertOctagon,
    title: "In-Memory Sliding Window Rate Limiting",
    description:
      "API endpoints are shielded with an in-memory sliding-window rate limiter restricted to 120 requests per minute per IP address, preventing volumetric denial-of-service and model resource exhaustion.",
    status: "IMPLEMENTED",
  },
  {
    icon: Server,
    title: "Oversized Payload Mitigation",
    description:
      "A custom HTTP middleware checks the Content-Length header on incoming requests. Any payload exceeding 1MB is immediately rejected with HTTP 413 Payload Too Large before reaching memory deserialization.",
    status: "IMPLEMENTED",
  },
  {
    icon: KeyRound,
    title: "Zero Client-Side Secret Exposure",
    description:
      "All ML model inference weights, scaling parameters, and environment secrets remain strictly isolated on the backend server. No secret keys or privileged tokens are embedded in client-side Next.js bundles.",
    status: "IMPLEMENTED",
  },
  {
    icon: EyeOff,
    title: "Sanitized Diagnostic Logging",
    description:
      "Structured server logs record endpoint latencies and HTTP status codes without dumping raw telemetry payloads or credential headers, ensuring zero data leakage in observability traces.",
    status: "IMPLEMENTED",
  },
];

export const SecurityCenterSection = () => {
  const { speakSection } = useVoice();

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("security");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "security",
            "Security and Reliability Center. Overview of implemented system controls, input bounds validation, rate limiting, and airworthiness safety boundaries."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  return (
    <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 09 // Security Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              Security & Reliability <br />
              <span className="text-cyan-400">Implemented System Controls</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-theme-textMuted max-w-md font-light">
            Defensive engineering specifications protecting machine learning inference endpoints and backend reliability.
          </p>
        </div>

        {/* Security Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CONTROLS.map((ctrl, idx) => {
            const Icon = ctrl.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-theme-border bg-theme-surface/50 hover:bg-theme-surface hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl border border-theme-border bg-theme-bg/80 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ctrl.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-theme-textPrimary mb-2">
                    {ctrl.title}
                  </h3>
                  <p className="text-xs text-theme-textMuted leading-relaxed">
                    {ctrl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-theme-border/40 text-[10px] font-mono text-cyan-400/80">
                  Control Verified in Pytest Suite
                </div>
              </div>
            );
          })}
        </div>

        {/* Regulatory & Safety Notice Box */}
        <div className="p-8 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-theme-surface to-amber-950/20 backdrop-blur-md">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-400 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                Airworthiness & Decision Support Disclaimer
              </span>
              <h4 className="text-xl font-bold text-theme-textPrimary mb-2">
                Predictive Maintenance Advisory Scope
              </h4>
              <p className="text-xs text-theme-textMuted leading-relaxed">
                EngineWatch provides experimental predictive-maintenance estimates based on simulated engine degradation data. Predictions are not certified airworthiness assessments and must not be used as the sole basis for flight-safety or maintenance decisions. All operational maintenance actions must adhere strictly to FAA, EASA, or relevant civil aviation authority approved Airworthiness Directives and engine manufacturer maintenance manuals (AMM).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

