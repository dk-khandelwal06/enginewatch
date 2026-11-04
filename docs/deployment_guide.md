# EngineWatch — Production Deployment Guide

## 1. Architecture Overview
- **Frontend**: Next.js 14 App Router, deployed to **Vercel**.
- **Backend**: FastAPI + Uvicorn + Scikit-Learn, deployed to **Render** or **Railway** (or containerized Docker / AWS ECS).

---

## 2. Vercel Frontend Deployment

1. **Connect GitHub Repository**:
   - In the Vercel Dashboard, import the `EngineWatch` repository.
   - Set the **Root Directory** to `frontend`.
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Environment Variables on Vercel**:
   - `NEXT_PUBLIC_API_URL`: Set to your production backend URL (e.g. `https://enginewatch-api.onrender.com`).

3. **Verify Deployment**:
   - Navigate to the assigned Vercel URL.
   - Verify that the persistent flight canvas, 3D turbofan digital twin, and theme selector render smoothly.

---

## 3. Render / Backend Deployment

1. **Create Web Service on Render**:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `.` (repository root, so `backend/models/` artifacts are accessible).

2. **Backend Environment Variables on Render**:
   - `CORS_ORIGINS`: Set to `https://your-vercel-domain.vercel.app,http://localhost:3000`
   - `RATE_LIMIT_MAX`: `120`

3. **Health Check Verification**:
   - Health check path: `/health`
   - Expected status: `HTTP 200 OK` with `"status": "OPERATIONAL"`.

---

## 4. Local Full-Stack Development

```bash
# Terminal 1: Backend
cd backend/app
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
# Opens on http://localhost:3000
```
