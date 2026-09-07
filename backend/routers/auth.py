from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db, SessionLocal
from models.db_models import User, Role
from models.schemas import UserRole

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = "demo_password"
    role: Optional[str] = "Lead Plant Engineer"

class AuthResponse(BaseModel):
    token: str
    username: str
    role: str
    permissions: List[str]
    expires_at: str
    is_air_gapped: bool = True

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    # Sovereign on-prem authentication validator
    role_name = req.role or "Lead Plant Engineer"
    role_key = role_name.lower().replace(" ", "_")
    
    perms = ["upload", "query_rag", "run_agents", "approve_hitl", "view_audit"]
    if "admin" in role_key:
        perms.extend(["security_admin", "export_logs", "model_swap"])
    elif "viewer" in role_key:
        perms = ["query_rag_readonly", "view_drawings"]

    token = f"sovereign_jwt_{req.username}_{int(datetime.utcnow().timestamp())}"

    return AuthResponse(
        token=token,
        username=req.username,
        role=role_name,
        permissions=perms,
        expires_at="2026-12-31T23:59:59Z",
        is_air_gapped=True
    )

@router.get("/me")
def get_current_user(role: str = "Lead Plant Engineer"):
    return {
        "username": "lead_plant_engineer",
        "role": role,
        "classification": "CONFIDENTIAL INDUSTRIAL ENCLAVE",
        "status": "AUTHENTICATED"
    }

@router.get("/roles")
def list_roles():
    return [
        {"id": "admin", "name": "Admin", "description": "Full sovereign root & model management"},
        {"id": "lead_engineer", "name": "Lead Plant Engineer", "description": "NDT inspection & HITL signing"},
        {"id": "safety_analyst", "name": "Safety Analyst", "description": "HAZOP investigation"},
        {"id": "viewer", "name": "Plant Viewer", "description": "Read-only access"}
    ]
