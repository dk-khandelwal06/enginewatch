# EngineWatch — Architecture & System Design

## 1. System Topology

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|  +---------------------------------------------------------------------------+  |
|  |  Next.js 14 App Router + React 18 + Tailwind CSS + Framer Motion          |  |
|  |  - Persistent Flight Experience (Scroll-Linked SVG Jet Animation)          |  |
|  |  - Interactive 3D Turbofan Digital Twin (Three.js WebGL + Hotspot Rig)    |  |
|  |  - Tri-State Theme Engine (Dark: Aerospace Navy, Light, Medium Slate)     |  |
|  |  - Voice Experience (Web SpeechSynthesis Guided Telemetry)                |  |
|  |  - Recharts Prognostic Curves & Airspace Radar Corridor                   |  |
|  +---------------------------------------------------------------------------+  |
+----------------------------------------+----------------------------------------+
                                         | HTTPS / REST
                                         v
+---------------------------------------------------------------------------------+
|                                 REST API TIER                                   |
|  +---------------------------------------------------------------------------+  |
|  |  FastAPI + Uvicorn (Python 3.13)                                          |  |
|  |  - Pydantic v2 Schema Bounds & Thermodynamic Limits Validation             |  |
|  |  - Sliding-Window In-Memory Rate Limiting (120 req/min)                    |  |
|  |  - CORS Policy & Security Headers (nosniff, DENY, 1MB Payload Cap)         |  |
|  +-------------------------------------+-------------------------------------+  |
+----------------------------------------|----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                            PROGNOSTIC INFERENCE TIER                            |
|  +---------------------------------------------------------------------------+  |
|  |  Frozen StandardScaler (48 Features: 16 Base, 16 Rolling Mean, 16 Std)     |  |
|  |  Random Forest Regressor (100 Trees, Depth 16, Trained on C-MAPSS FD001)  |  |
|  |  Validation Metrics: RMSE = 19.94, MAE = 13.98, R2 = 0.7693               |  |
|  |  Health Classification: HEALTHY (>75 cyc) / WATCH (25-75) / CRITICAL (<25) |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

## 2. Sensor Channel Mapping (NASA C-MAPSS FD001)

| Sensor Column | Measurement Description | Physical Units | Nominal Baseline | Degradation Signal |
|:---:|:---|:---:|:---:|:---|
| `setting_1` | Altitude / Mach Resolver | Ratio | 0.0000 | Operational envelope |
| `setting_2` | Throttle Resolver Angle (TRA) | Ratio | 0.0000 | Pilot thrust demand |
| `s_2` | LPC Outlet Temperature | °R | 642.38 | Gradual thermal creep |
| `s_3` | HPC Outlet Temperature | °R | 1586.90 | High thermal degradation |
| `s_4` | LPT Outlet Exhaust Gas Temp (EGT) | °R | 1402.83 | Core degradation indicator |
| `s_7` | HPC Outlet Total Pressure | psia | 553.95 | Declines with blade wear |
| `s_8` | Physical Fan Rotor Speed | rpm | 2388.06 | High inertia stability |
| `s_9` | Physical Core Rotor Speed | rpm | 9056.06 | Increases to maintain thrust |
| `s_11` | HPC Static Pressure (Ps30) | psia | 47.36 | Highest importance feature |
| `s_12` | Fuel Flow Ratio (W32/Ps30) | pps/psia | 521.90 | Drops as burner efficiency falls |
| `s_13` | Corrected Fan Speed | rpm | 2388.06 | Rotor health index |
| `s_14` | Corrected Core Speed | rpm | 8137.38 | Governor compensation tracking |
| `s_15` | Bypass Ratio | ratio | 8.42 | Thermodynamic efficiency |
| `s_17` | Bleed Enthalpy | btu/lbm | 392.27 | Customer bleed thermal load |
| `s_20` | High-Pressure Turbine Coolant Bleed | lbm/s | 38.93 | Cooling margin degradation |
| `s_21` | Low-Pressure Turbine Coolant Bleed | lbm/s | 23.36 | Thermal barrier fatigue |

