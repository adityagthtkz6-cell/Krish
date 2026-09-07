from fastapi import APIRouter
from typing import Dict, Any
from services.demo_data import demo_service
from services.audit_service import audit_service

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])

@router.post("/load-workspace")
def load_demo_workspace():
    docs = demo_service.load_demo_workspace()
    audit_service.log_event(
        action="DEMO_WORKSPACE_LOADED",
        resource="Industrial Sample Suite",
        user_role="Lead Plant Engineer",
        details={"documents_loaded": len(docs)}
    )
    return {
        "success": True,
        "message": "INDRA Sovereign Industrial Demo Workspace Loaded Successfully",
        "documents_count": len(docs),
        "security_mode": "AIR-GAPPED / LOCAL INFERENCE ONLY"
    }
