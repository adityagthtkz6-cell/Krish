# ??? INDRA ? Sovereign Industrial AI (Production & Cloud Deployment Guide)
### *SIH 2026 Problem Statement 26117: Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work*

---

## ?? Overview

**INDRA** is an enterprise-grade AI workbench built for confidential industrial environments (oil & gas, power grids, nuclear facilities, chemical plants, and aerospace).

This codebase is production-ready for deployment:
- **Frontend:** Vercel (React + Vite + TypeScript + Tailwind CSS)
- **Backend:** Production ASGI FastAPI (Render / Railway / Fly.io / AWS / On-Premise Docker)
- **Database:** PostgreSQL (with automatic zero-config embedded SQLite fallback)
- **Vector DB:** Qdrant Cloud / On-Premise (with Sovereign RAG fallback)
- **AI Provider:** Configurable (`local` Ollama / `remote` DeepSeek/OpenAI / `mock` Sovereign Engine)
- **Demo Mode:** 100% operational out of the box without GPU/model setup.

---

## ⚡ 1. Vercel Deployment Options

You can deploy INDRA to Vercel in either **Unified Full-Stack Deployment** (Frontend + FastAPI Backend on one Vercel project) or **Separate Projects** (Frontend and Backend deployed as two independent Vercel projects).

---

### Option A: Unified Full-Stack Vercel Project (Recommended)

In this mode, a single Vercel deployment serves the React SPA on `/` and routes all `/api/*`, `/health`, `/docs`, `/openapi.json` to the FastAPI serverless function.

1. **Push Repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy INDRA Sovereign Industrial AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/indra-sovereign-ai.git
   git push -u origin main
   ```
2. **Import into Vercel**:
   - Go to [https://vercel.com/new](https://vercel.com/new).
   - Select your repository.
   - **Root Directory:** `./` (Leave as root)
   - **Framework Preset:** `Other` (or `Vite`)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
3. **Add Environment Variables in Vercel**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres` | Supabase PostgreSQL Connection URI |
   | `ENVIRONMENT` | `production` | Production environment mode |
   | `CORS_ORIGINS` | `*` | Or omit for auto Vercel regex matching |
   | `JWT_SECRET` | `your_secure_random_jwt_secret_key` | Sovereign JWT Signing Secret |
   | `AI_PROVIDER` | `auto` | Auto/Mock/Remote AI Provider |
   | `STORAGE_PROVIDER` | `production` | Stateless serverless memory storage |
   | `QDRANT_URL` | `https://your-cluster.qdrant.tech:6333` | Optional Qdrant Vector Cloud URI |
   | `QDRANT_API_KEY` | `your-qdrant-api-key` | Optional Qdrant API Key |
   | `VITE_API_URL` | (Leave empty or set to `/`) | Relative API routing on same domain |

4. Click **Deploy**.

---

### Option B: Separate Vercel Projects (Frontend & Backend)

#### 1. Backend Project (FastAPI Serverless):
- **Root Directory:** `./` (or `backend`)
- **Serverless Entrypoint:** `api/index.py` (handles all `/api/*` and `/health` requests)
- **Environment Variables:** Set `DATABASE_URL`, `JWT_SECRET`, `ENVIRONMENT=production`, `CORS_ORIGINS=https://indra-frontend.vercel.app`
- **Backend URL:** e.g. `https://indra-backend.vercel.app`

#### 2. Frontend Project (React + Vite):
- **Root Directory:** `frontend`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: `https://indra-backend.vercel.app`
- **Frontend URL:** e.g. `https://indra-frontend.vercel.app`

---

## 🗄️ 3. Database & Vector DB Setup (Supabase PostgreSQL & Qdrant)

### Supabase PostgreSQL Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string → URI**.
3. Copy the URI and set it in your backend environment variables:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   *(Or use Transaction Pooler URL on port 6543 if preferred for serverless environments)*
4. The backend automatically creates all 11 production tables, indexes, and initial RBAC roles/agents on first boot (`init_db()`).
5. **Zero-Crash Fallback:** If `DATABASE_URL` is omitted, unreachable, or in demo mode, INDRA automatically falls back to the embedded sovereign SQLite database without downtime.

### Qdrant Vector DB (Optional Cloud / On-Prem)
- Create a cluster at [https://cloud.qdrant.io](https://cloud.qdrant.io).
- Set `QDRANT_URL` and `QDRANT_API_KEY`.
- If unconfigured or offline, INDRA automatically routes queries through the Sovereign Dense Hybrid RAG Engine.

---

## ?? 4. On-Premise Docker & Air-Gapped Deployment

For full on-premise air-gapped industrial deployment:
```bash
docker-compose up --build -d
```
- **Frontend:** http://localhost:80
- **Backend:** http://localhost:8000
- **Health Check:** http://localhost:8000/health

---

## ? 5. SIH 2026 Evaluation Flow

1. Click **"? Load Demo Workspace"** on the top navigation bar.
2. In **AI Workbench**, ask: *"What is the remaining useful life (RUL) and corrosion rate for PV-402 per API 510?"*
3. In **Engineering Vision**, inspect and verify P&ID control valve `FV-102` and transmitter `PT-304`.
4. In **Agents Studio**, execute the **Management Brief Generator** to view the 7-step observable pipeline.
5. In **Human in the Loop**, approve the synthesized brief to apply the tamper-evident SHA-256 digital stamp.
6. In **Security Center** and **Audit Logs**, review the immutable event ledger.

---
**Built for SIH 2026 ? Problem Statement 26117: Sovereign On-Premise Industrial AI.**
