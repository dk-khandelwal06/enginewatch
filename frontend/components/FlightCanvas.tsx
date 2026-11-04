"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const FlightCanvas = () => {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { scrollYProgress } = useScroll();

  // Smooth out scroll progress for cinematic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 18,
    restDelta: 0.001
  });

  // Check reduced motion preference
  useEffect(() => {
    setMounted(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
    }
  }, []);

  // X coordinate: traverse across viewport based on scroll
  // Hero (0): -10% -> 25% (hero traverse)
  // Mid (0.45): 85% -> 15% (bank return)
  // End (0.85+): 15% -> 95% (approach corridor)
  const posX = useTransform(
    smoothProgress,
    [0, 0.22, 0.5, 0.75, 1],
    ["-8vw", "48vw", "82vw", "22vw", "96vw"]
  );

  // Y coordinate: vertical descent and ascent profile
  const posY = useTransform(
    smoothProgress,
    [0, 0.25, 0.55, 0.8, 1],
    ["18vh", "28vh", "52vh", "42vh", "65vh"]
  );

  // Scale: distance perspective (distant during high cruise, closer on approach)
  const scale = useTransform(
    smoothProgress,
    [0, 0.25, 0.55, 0.8, 1],
    [0.75, 1.15, 0.9, 1.25, 1.05]
  );

  // Rotation / banking angle in degrees
  const rotate = useTransform(
    smoothProgress,
    [0, 0.15, 0.35, 0.55, 0.75, 1],
    [3, 8, -6, 12, -4, 2]
  );

  // Opacity: smoothly fades during heavy data sections so it never obstructs inputs
  const opacity = useTransform(
    smoothProgress,
    [0, 0.05, 0.3, 0.55, 0.72, 0.92, 1],
    [0.9, 0.95, 0.75, 0.3, 0.85, 0.9, 0.8]
  );

  if (!mounted || reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Scroll-Linked Flying Aircraft */}
      <motion.div
        style={{
          left: posX,
          top: posY,
          scale: scale,
          rotate: rotate,
          opacity: opacity,
        }}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
      >
        <div className="relative group">
          {/* Jet Contrails / Vapor Trail */}
          <div className="absolute right-[88%] top-[38%] w-36 h-[3px] bg-gradient-to-l from-cyan-400/50 via-white/20 to-transparent blur-[1px] transform -translate-y-1/2" />
          <div className="absolute right-[88%] top-[62%] w-36 h-[3px] bg-gradient-to-l from-cyan-400/50 via-white/20 to-transparent blur-[1px] transform -translate-y-1/2" />

          {/* High-Fidelity Vector Jet Profile */}
          <svg
            width="170"
            height="110"
            viewBox="0 0 170 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          >
            {/* Ambient Jet Exhaust Heat Distortion glow */}
            <circle cx="28" cy="42" r="14" fill="rgba(66, 213, 242, 0.25)" className="animate-pulse-subtle" />
            <circle cx="28" cy="68" r="14" fill="rgba(66, 213, 242, 0.25)" className="animate-pulse-subtle" />

            {/* Main Wings & Aerodynamic Surfaces */}
            <path
              d="M72 55 L32 12 L48 10 L108 51 Z"
              fill="url(#wingGradient)"
              stroke="rgba(66,213,242,0.4)"
              strokeWidth="0.8"
            />
            <path
              d="M72 55 L32 98 L48 100 L108 59 Z"
              fill="url(#wingGradient)"
              stroke="rgba(66,213,242,0.4)"
              strokeWidth="0.8"
            />

            {/* Fuselage (Titanium / Aerospace Finish) */}
            <path
              d="M158 55 C154 50 138 46 112 46 L38 48 C28 48 16 51 10 55 C16 59 28 62 38 62 L112 64 C138 64 154 60 158 55 Z"
              fill="url(#fuselageGradient)"
              stroke="rgba(174, 187, 199, 0.6)"
              strokeWidth="1.2"
            />

            {/* Cockpit Windshield */}
            <path
              d="M142 52 C140 50 132 49 128 50 L126 55 L136 55 Z"
              fill="#42D5F2"
              fillOpacity="0.8"
            />

            {/* Port & Starboard Turbofan Engine Nacelles */}
            {/* Left Engine */}
            <rect x="42" y="32" width="30" height="11" rx="5.5" fill="url(#engineGradient)" stroke="#42D5F2" strokeWidth="0.8" />
            <ellipse cx="72" cy="37.5" rx="2.5" ry="5.5" fill="#111B26" />
            <ellipse cx="42" cy="37.5" rx="1.5" ry="4" fill="#42D5F2" fillOpacity="0.9" />

            {/* Right Engine */}
            <rect x="42" y="67" width="30" height="11" rx="5.5" fill="url(#engineGradient)" stroke="#42D5F2" strokeWidth="0.8" />
            <ellipse cx="72" cy="72.5" rx="2.5" ry="5.5" fill="#111B26" />
            <ellipse cx="42" cy="72.5" rx="1.5" ry="4" fill="#42D5F2" fillOpacity="0.9" />

            {/* Horizontal & Vertical Stabilizers */}
            <path d="M24 55 L8 28 L14 26 L34 52 Z" fill="#287FC4" opacity="0.9" />
            <path d="M24 55 L8 82 L14 84 L34 58 Z" fill="#287FC4" opacity="0.9" />

            {/* Active Strobe Nav Lights */}
            {/* Port wingtip (Red) */}
            <circle cx="33" cy="12" r="2.5" fill="#E45454" className="animate-ping" />
            {/* Starboard wingtip (Green) */}
            <circle cx="33" cy="98" r="2.5" fill="#35B77A" className="animate-ping" />
            {/* Tail strobe (White flash) */}
            <circle cx="10" cy="55" r="2.2" fill="#FFFFFF" className="animate-pulse" />

            {/* Telemetry Vector Tag */}
            <g className="opacity-75">
              <line x1="158" y1="55" x2="168" y2="40" stroke="#42D5F2" strokeWidth="0.8" strokeDasharray="2,2" />
              <rect x="168" y="32" width="34" height="13" rx="2" fill="rgba(7,21,34,0.85)" stroke="#42D5F2" strokeWidth="0.6" />
              <text x="171" y="41" fill="#42D5F2" fontSize="7" fontFamily="monospace">EW-01</text>
            </g>

            {/* SVG Gradients */}
            <defs>
              <linearGradient id="fuselageGradient" x1="10" y1="55" x2="158" y2="55" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1B2B3A" />
                <stop offset="35%" stopColor="#3A536B" />
                <stop offset="70%" stopColor="#AEBBC7" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id="wingGradient" x1="32" y1="12" x2="108" y2="51" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1A2D3E" />
                <stop offset="60%" stopColor="#287FC4" />
                <stop offset="100%" stopColor="#5EA7E0" />
              </linearGradient>
              <linearGradient id="engineGradient" x1="42" y1="32" x2="72" y2="43" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#111B26" />
                <stop offset="50%" stopColor="#2C3E50" />
                <stop offset="100%" stopColor="#7F8C8D" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
