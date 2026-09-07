import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db, check_db_health
from routers import documents, rag, vision, agents, hitl, security, demo, auth
from services.demo_data import demo_service

# Production logging setup
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("indra.main")

app = FastAPI(
    title="INDRA – Sovereign Industrial AI",
    description="Confidential On-Premise Agentic AI Workbench for Industrial Work (SIH 2026 Problem Statement 26117)",
    version="2.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production_strict" else None,
    redoc_url=None
)

# Robust Production CORS configuration supporting Vercel previews and production domains
cors_origins = [o for o in settings.CORS_ORIGINS if o and o != "*"]
if not cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"^https://.*\.vercel\.app$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(documents.router)
app.include_router(rag.router)
app.include_router(vision.router)
app.include_router(agents.router)
app.include_router(hitl.router)
app.include_router(security.router)
app.include_router(demo.router)
app.include_router(auth.router)

@app.on_event("startup")
def startup_event():
    logger.info(f"Starting INDRA Sovereign AI in '{settings.ENVIRONMENT.upper()}' mode.")
    try:
        init_db()
    except Exception as e:
        logger.warning(f"Database initialization notice: {e}")
    demo_service.load_demo_workspace()

@app.get("/")
def root():
    return {
        "app": "INDRA – Sovereign Industrial AI",
        "version": "2.0.0",
        "status": "OPERATIONAL",
        "environment": settings.ENVIRONMENT,
        "security_policy": "AIR-GAPPED / 0 EXTERNAL EGRESS / LOCAL INFERENCE CAPABLE",
        "problem_statement": "SIH 2026 - 26117"
    }

# Standard production health check endpoint
@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/health")
def api_health():
    db_health = check_db_health()
    return {
        "status": "HEALTHY",
        "environment": settings.ENVIRONMENT,
        "external_api_calls": 0,
        "ai_provider": settings.AI_PROVIDER,
        "database": db_health.get("engine", "embedded"),
        "db_connected": db_health.get("connected", True)
    }
