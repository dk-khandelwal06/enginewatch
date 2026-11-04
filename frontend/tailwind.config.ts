import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aerospace: {
          darkBg: "#071522",
          deepNavy: "#0B1F30",
          charcoal: "#111B26",
          titanium: "#AEBBC7",
          aviationBlue: "#287FC4",
          electricCyan: "#42D5F2",
          warningAmber: "#F0A43A",
          criticalRed: "#E45454",
          healthyGreen: "#35B77A",
        },
        theme: {
          bg: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
          cardHover: "var(--bg-card-hover)",
          border: "var(--border-color)",
          textPrimary: "var(--text-primary)",
          textMuted: "var(--text-muted)",
          accent: "var(--accent-blue)",
          cyan: "var(--accent-cyan)",
          healthy: "var(--healthy-green)",
          warning: "var(--warning-amber)",
          critical: "var(--critical-red)",
          titanium: "var(--titanium)",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "sweep 4s linear infinite",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;

