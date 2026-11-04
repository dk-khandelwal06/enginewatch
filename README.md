# EngineWatch
### Premium Aerospace Predictive Maintenance Intelligence Platform

![EngineWatch Platform](frontend/public/assets/logo.png)

EngineWatch is an independent, commercial-grade aerospace predictive maintenance intelligence platform engineered to estimate Remaining Useful Life (RUL) and monitor thermodynamic degradation in commercial aircraft turbofan engines.

Powered by an ensemble Random Forest regressor trained on the benchmark **NASA C-MAPSS FD001** simulation dataset, EngineWatch predicts structural wear and thermal creep before catastrophic in-flight failure occurs.

---

## Key Features

1. **Persistent Cinematic Flight Experience**
   - Scroll-linked aircraft animation following curved trajectory waypoints across the viewport.
   - Dynamic banking, altitude perspective scaling, and navigational strobe lights.
   - Respects accessibility and `prefers-reduced-motion` settings.

2. **Interactive 3D Turbofan Digital Twin**
   - Hardware-accelerated Three.js WebGL procedural jet engine model with rotating titanium fan stage, multi-stage compressor discs, and glowing annular combustor.
   - Interactive orbit controls, mouse-wheel zoom, and clickable component hotspots mapped to C-MAPSS sensor stations.

3. **Tri-State Aerospace Theme Engine**
   - **Dark Mode**: Aerospace Navy (`#071522`), Deep Navy, Titanium, Electric Cyan.
   - **Medium Mode**: Technical Slate (`#263746`), Neutral Titanium.
   - **Light Mode**: Crisp Technical White (`#F2F5F8`), Aviation Blue.
   - System appearance auto-detection with persistent `localStorage` synchronization.

4. **Speech-Guided Audio Narration**
   - Optional voice telemetry guide utilizing browser `SpeechSynthesis`.
   - Context-aware section narrations with auto-silencing during form input interactions.

5. **RUL Prediction Engineering Laboratory**
   - Real-time submission of 16 thermodynamic parameters to the FastAPI model backend.
   - 1-click benchmark presets: Nominal Early-Life, Accelerated Wear Mid-Life, and Approaching Maintenance Limit.
   - Visual Z-score deviation breakdown against baseline healthy operating distributions.

6. **Degradation Analytics & Airspace Radar Corridor**
   - Interactive Recharts visualization tracking multi-sensor drift (EGT temperature, HPC static pressure, bypass ratio).
   - Animated vector radar sweep tracking illustrative airframe routes and telemetry bounds.

---

## Technology Architecture

- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Three.js, Recharts, Lucide Icons.
- **Backend**: FastAPI, Pydantic v2, Uvicorn, Scikit-learn, NumPy, Pandas, Joblib.
- **Machine Learning**: Random Forest Regressor (100 trees, max depth 16) trained on 20,631 cycles of NASA C-MAPSS FD001 run-to-failure data with strict engine-aware validation splitting.

### Model Benchmarks (Unseen 20-Engine Validation Split)
- **Random Forest**: RMSE = `19.94 cycles`, MAE = `13.98 cycles`, R² = `0.7693`
- **Ridge Regression (Baseline)**: RMSE = `21.21 cycles`, MAE = `17.72 cycles`, R² = `0.7391`
- **Mean Predictor (Baseline)**: RMSE = `41.58 cycles`, MAE = `37.17 cycles`, R² = `-0.0031`

---

## Quickstart

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run model training & evaluation pipeline (generates model artifacts)
python backend/src/train.py

# Run API test suite
pytest backend/tests/test_api.py -v

# Start FastAPI server
cd backend/app
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:3000 in your browser
```

---

## Security & Reliability Controls
- **Pydantic v2 Bounds Validation**: Physically impossible sensor readings are blocked at the perimeter with HTTP 422.
- **Sliding-Window Rate Limiting**: In-memory limiter restricts clients to 120 requests/minute.
- **Oversized Payload Mitigation**: 1MB payload ceiling enforced via HTTP middleware.
- **Zero Client-Side Secrets**: Model weights and backend configurations remain strictly server-side.

---

## Regulatory & Safety Disclaimer
*EngineWatch provides experimental predictive-maintenance estimates based on simulated engine degradation data. Predictions are not certified airworthiness assessments and must not be used as the sole basis for flight-safety or maintenance decisions.*

