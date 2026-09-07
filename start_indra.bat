@echo off
echo =========================================================================
echo       INDRA - Sovereign On-Premise Industrial AI Workbench (SIH 2026)
echo       Problem Statement 26117: Open-Weight Multimodal Industrial AI
echo =========================================================================
echo.
echo [1/2] Starting Sovereign FastAPI Backend on http://127.0.0.1:8000 ...
start "INDRA Sovereign Backend" cmd /k "cd backend && uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 >nul

echo [2/2] Starting Sovereign React Vite Frontend on http://localhost:5173 ...
start "INDRA Sovereign Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo  INDRA is running in Sovereign Air-Gapped Mode!
echo  Open your browser at: http://localhost:5173
echo =========================================================================
pause
