"use client";

import React, { useEffect } from "react";
import {
  Cpu,
  Layers,
  GitBranch,
  Database,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Workflow
} from "lucide-react";
import { useVoice } from "@/lib/voice";

export const TechnologyCenterSection = () => {
  const { speakSection } = useVoice();

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("technology");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          speakSection(
            "technology",
            "Model and Technology Center. Understanding the NASA C-MAPSS benchmark dataset, forty-eight dimensional feature engineering, and the distinction between offline batch training and real-time model inference."
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speakSection]);

  const pipelineSteps = [
    {
      num: "01",
      title: "NASA C-MAPSS Simulation Ingestion",
      desc: "Simulates 100 high-bypass turbofans run until failure at sea-level condition (FD001). Captures 21 sensor channels and 3 operational settings over 20,631 total cycles.",
    },
    {
      num: "02",
      title: "Sensor Pruning & Feature Extraction",
      desc: "Drops 7 constant channels with zero variance. Extracts 14 informative sensors, computing 5-cycle rolling means and standard deviations, generating a 48-dimensional feature vector.",
    },
    {
      num: "03",
      title: "RUL Capping & Engine-Aware Split",
      desc: "RUL is capped at 125 cycles to prevent overfitting during early undetectable wear. Strictly splits 80 engines for training and 20 engines for validation (never mixing rows).",
    },
    {
      num: "04",
      title: "Random Forest Decision Ensemble",
      desc: "Trains 100 orthogonal decision trees with max depth 16. Captures complex thermodynamic interactions between turbine temperature, pressure ratio, and shaft speeds.",
    },
    {
      num: "05",
      title: "FastAPI REST Deployment",
      desc: "Serializes fitted StandardScaler and Random Forest regressor with joblib. Exposes sub-15ms prediction endpoints with Pydantic validation and health tier classification.",
    },
  ];

  return (
    <section id="technology" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-theme-border bg-theme-bg relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Section 10 // Machine Learning Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-theme-textPrimary tracking-tight">
              Model & Technology Center <br />
              <span className="text-cyan-400">Data Science Pipeline</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-theme-textMuted max-w-md font-light">
            Deep dive into algorithmic methodology, feature engineering rationale, and training vs. inference separation.
          </p>
        </div>

        {/* Pipeline Step Flowchart Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-16">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-theme-border bg-theme-surface/50 hover:bg-theme-surface hover:border-cyan-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black font-mono text-cyan-400 block mb-2">
                  {step.num}
                </span>
                <h4 className="text-sm font-bold text-theme-textPrimary mb-2 leading-tight">
                  {step.title}
                </h4>
                <p className="text-xs text-theme-textMuted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Comparison: Training vs Inference */}
        <div className="p-8 rounded-2xl border border-theme-border bg-theme-surface/60 backdrop-blur-md mb-12">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-3">
            <Workflow className="w-4 h-4" />
            <span>Architectural Distinction</span>
          </div>
          <h3 className="text-2xl font-bold text-theme-textPrimary mb-6">
            Model Training vs. Production Inference Runtime
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
            {/* Training Mode */}
            <div className="p-6 rounded-xl border border-theme-border bg-theme-bg/60 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                <span className="font-bold text-base text-cyan-400">
                  OFFLINE TRAINING PIPELINE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  BATCH WORKLOAD
                </span>
              </div>
              <ul className="space-y-2.5 text-theme-textMuted">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400">▹</span>
                  <span><strong>Full Dataset Ingestion:</strong> 16,340 training cycles from 80 run-to-failure engines.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400">▹</span>
                  <span><strong>StandardScaler Fitting:</strong> Calculates population mean and standard deviation strictly on training units.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400">▹</span>
                  <span><strong>Tree Optimization:</strong> Recursively partitions 48-dimensional feature space across 100 estimator trees.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400">▹</span>
                  <span><strong>Artifact Serialization:</strong> Exports weights into model.joblib (28.5 MB) and scaler.joblib.</span>
                </li>
              </ul>
            </div>

            {/* Inference Mode */}
            <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <span className="font-bold text-base text-emerald-400">
                  ONLINE INFERENCE RUNTIME
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  SUB-15MS REST API
                </span>
              </div>
              <ul className="space-y-2.5 text-theme-textMuted">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">▹</span>
                  <span><strong>Zero Retraining Overhead:</strong> Loads pre-compiled joblib weights into memory on server startup.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">▹</span>
                  <span><strong>Deterministic Transformation:</strong> Transforms single-snapshot readings with frozen training scaler.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">▹</span>
                  <span><strong>Parallel Tree Traversal:</strong> Aggregates leaf node predictions across all 100 trees in &lt;10ms.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">▹</span>
                  <span><strong>Health Tier Assignment:</strong> Maps point estimate to HEALTHY, WATCH, or CRITICAL threshold.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

