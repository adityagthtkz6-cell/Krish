import os
import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from config import settings
from models.db_models import Base, Role, User, Agent, ModelRegistry

logger = logging.getLogger("indra.database")

def normalize_database_url(url: str) -> str:
    """Ensure Supabase/Heroku postgres:// URLs are compatible with SQLAlchemy 2.0 and pure-Python pg8000."""
    if not url:
        return "sqlite:///./indra_sovereign.db"
    
    # Prioritize pure-Python pg8000 driver for serverless PostgreSQL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+pg8000://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", "postgresql+pg8000://", 1)
            
    return url

DATABASE_URL = normalize_database_url(settings.DATABASE_URL)
IS_POSTGRES = "postgresql" in DATABASE_URL

# Engine configuration with serverless-safe parameters
try:
    if IS_POSTGRES:
        engine = create_engine(
            DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300
        )
        logger.info("Configured PostgreSQL engine for Supabase/Vercel deployment.")
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
        )
        logger.info("Configured embedded SQLite engine for sovereign local deployment.")
except Exception as e:
    logger.warning(f"Failed to create primary engine ({e}). Falling back to in-memory SQLite.")
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    IS_POSTGRES = False

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

_db_initialized = False

def init_db():
    """Create all tables and seed initial roles and metadata safely on Supabase / PostgreSQL."""
    global _db_initialized
    if _db_initialized:
        return
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
        
        # Seed initial system configuration safely
        db = SessionLocal()
        try:
            # 1. Seed Roles if missing
            if db.query(Role).count() == 0:
                default_roles = [
                    Role(
                        id="admin",
                        name="Admin",
                        description="Full sovereign enclave root configuration & model management.",
                        permissions=["upload", "query_rag", "run_agents", "approve_hitl", "security_admin", "export_logs"]
                    ),
                    Role(
                        id="lead_engineer",
                        name="Lead Plant Engineer",
                        description="Primary operational authority for NDT inspections and signing HITL reports.",
                        permissions=["upload", "query_rag", "run_agents", "approve_hitl", "view_audit"]
                    ),
                    Role(
                        id="safety_analyst",
                        name="Safety Analyst",
                        description="HAZOP investigation and compliance monitoring.",
                        permissions=["upload", "query_rag", "run_agents_draft", "view_audit"]
                    ),
                    Role(
                        id="viewer",
                        name="Plant Viewer",
                        description="Read-only access to approved industrial briefings.",
                        permissions=["query_rag_readonly", "view_drawings"]
                    )
                ]
                db.add_all(default_roles)
                db.commit()
                logger.info("Default RBAC roles seeded.")

            # 2. Seed Default User if missing
            if db.query(User).count() == 0:
                demo_user = User(
                    id="USR-LEAD-01",
                    username="lead_engineer",
                    email="engineer@sovereign.plant.internal",
                    hashed_password="sha256_mock_hash_for_sovereign_plant",
                    role="lead_engineer",
                    is_active=True
                )
                db.add(demo_user)
                db.commit()
                logger.info("Default plant engineer user seeded.")

            # 3. Seed Agents if missing
            if db.query(Agent).count() == 0:
                default_agents = [
                    Agent(id="agent-inspection", name="Inspection Report Analyzer", description="Parses NDE/UT records & calculates API 510 remaining life.", category="Mechanical Integrity", icon="ShieldAlert"),
                    Agent(id="agent-mgmt-brief", name="Management Brief Generator", description="Synthesizes raw telemetry into C-suite decision briefs.", category="Executive Strategy", icon="BarChart3"),
                    Agent(id="agent-pid", name="P&ID Analyzer & Line Reconciler", description="Correlates engineering schematics with maintenance records.", category="Engineering Vision", icon="Cpu"),
                    Agent(id="agent-summarizer", name="Document Summarizer & Safety Brief", description="Distills maintenance procedures into safety checklists.", category="Operational Intelligence", icon="FileText"),
                    Agent(id="agent-comparison", name="Document Comparison & Deviation Agent", description="Detects unapproved changes between revision versions.", category="Quality Assurance", icon="GitCompare")
                ]
                db.add_all(default_agents)
                db.commit()
                logger.info("Default autonomous agent fleet seeded.")

            # 4. Seed Models if missing
            if db.query(ModelRegistry).count() == 0:
                default_models = [
                    ModelRegistry(id="MOD-01", name="deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", type="LLM", precision="Q4_K_M", vram_alloc_gb=6.4),
                    ModelRegistry(id="MOD-02", name="meta-llama/Llama-3.2-11B-Vision-Instruct", type="VLM", precision="Q5_K_M", vram_alloc_gb=7.8),
                    ModelRegistry(id="MOD-03", name="BAAI/bge-large-en-v1.5", type="Embeddings", precision="FP16", vram_alloc_gb=1.3)
                ]
                db.add_all(default_models)
                db.commit()
                logger.info("Sovereign Model Registry seeded.")

            _db_initialized = True
        except Exception as seed_err:
            db.rollback()
            logger.warning(f"DB Seeding notice: {seed_err}")
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")

def check_db_health() -> dict:
    """Safe connectivity check returning status without exposing credentials."""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "healthy",
            "engine": "PostgreSQL (Supabase)" if IS_POSTGRES else "SQLite (Sovereign Local)",
            "connected": True
        }
    except Exception as e:
        return {
            "status": "degraded",
            "engine": "Fallback In-Memory",
            "connected": False,
            "message": "Local fallback operational"
        }

class DBManager:
    def get_status(self) -> dict:
        return check_db_health()

    def init_database(self):
        init_db()

db_manager = DBManager()


