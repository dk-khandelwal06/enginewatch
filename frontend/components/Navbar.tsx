"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sun,
  Moon,
  CloudMoon,
  Volume2,
  VolumeX,
  Radio,
  Menu,
  X,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  Code
} from "lucide-react";
import { useTheme, ThemeMode } from "@/lib/theme";
import { useVoice } from "@/lib/voice";
import { fetchHealth } from "@/lib/api";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { isEnabled: voiceEnabled, toggleVoice, isSpeaking } = useVoice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"CONNECTING" | "ONLINE" | "OFFLINE">("CONNECTING");

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        if (data.status === "OPERATIONAL") setBackendStatus("ONLINE");
        else setBackendStatus("OFFLINE");
      })
      .catch(() => setBackendStatus("OFFLINE"));
  }, []);

  const navLinks = [
    { name: "Overview", href: "#hero" },
    { name: "About", href: "#about" },
    { name: "Dashboard", href: "#dashboard" },
    { name: "Fleet Monitoring", href: "#monitoring" },
    { name: "RUL Laboratory", href: "#laboratory" },
    { name: "Degradation", href: "#degradation" },
    { name: "Flight Ops", href: "#flight-ops" },
    { name: "API Center", href: "#api-center" },
    { name: "Security", href: "#security" },
    { name: "Technology", href: "#technology" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-theme-border bg-theme-bg/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link href="#hero" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(66,213,242,0.2)] bg-slate-900 flex items-center justify-center p-1">
              <Image
                src="/assets/logo.png"
                alt="EngineWatch Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-theme-textPrimary uppercase group-hover:text-cyan-400 transition-colors">
                ENGINE<span className="text-cyan-400">WATCH</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-theme-textMuted uppercase -mt-1">
                Aerospace Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3 py-1.5 text-xs font-mono text-theme-textMuted hover:text-cyan-400 hover:bg-theme-surface/60 rounded-md transition-all"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Action Controls: Voice, 3 Appearance Modes, Backend Status */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Live Backend Indicator Badge */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                backendStatus === "ONLINE"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : backendStatus === "CONNECTING"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
              title={
                backendStatus === "ONLINE"
                  ? "Connected to FastAPI REST Engine"
                  : "Backend service unreachable - check server on :8000"
              }
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "ONLINE"
                    ? "bg-emerald-400 animate-ping"
                    : backendStatus === "CONNECTING"
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
              />
              <span className="font-semibold">{backendStatus}</span>
            </div>

            {/* Voice Experience Toggle */}
            <button
              onClick={toggleVoice}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                voiceEnabled
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-[0_0_12px_rgba(66,213,242,0.3)]"
                  : "border-theme-border text-theme-textMuted hover:text-theme-textPrimary hover:border-theme-textMuted"
              }`}
              title={voiceEnabled ? "Voice Narration Enabled (Click to Mute)" : "Enable Voice Telemetry Narration"}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-bounce text-cyan-400" : ""}`} />
                  <span>VOICE ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>VOICE OFF</span>
                </>
              )}
            </button>

            {/* 3-State Theme Selector */}
            <div className="flex items-center p-1 rounded-lg border border-theme-border bg-theme-surface/70">
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "dark"
                    ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                    : "text-theme-textMuted hover:text-theme-textPrimary"
                }`}
                title="Dark Appearance Mode (Aerospace Navy)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("medium")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "medium"
                    ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                    : "text-theme-textMuted hover:text-theme-textPrimary"
                }`}
                title="Medium Appearance Mode (Technical Slate)"
              >
                <CloudMoon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "light"
                    ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                    : "text-theme-textMuted hover:text-theme-textPrimary"
                }`}
                title="Light Appearance Mode (Engineering White)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-theme-border text-theme-textPrimary hover:bg-theme-surface"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-theme-border bg-theme-bg/95 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-mono text-theme-textMuted hover:text-cyan-400 hover:bg-theme-surface rounded-md"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-theme-border flex items-center justify-between">
            <span className="text-xs font-mono text-theme-textMuted">Theme & Audio</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoice}
                className="px-2.5 py-1 text-xs font-mono rounded border border-theme-border text-cyan-400"
              >
                {voiceEnabled ? "Voice ON" : "Voice OFF"}
              </button>
              <div className="flex items-center p-1 rounded border border-theme-border">
                <button onClick={() => setTheme("dark")} className="p-1 text-cyan-400"><Moon className="w-3 h-3" /></button>
                <button onClick={() => setTheme("medium")} className="p-1 text-cyan-400"><CloudMoon className="w-3 h-3" /></button>
                <button onClick={() => setTheme("light")} className="p-1 text-cyan-400"><Sun className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
