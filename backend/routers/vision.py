from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from models.schemas import PIDAnalysisResult, EquipmentTag, VisionDetectionStatus
from services.vision_engine import vision_engine
from services.audit_service import audit_service

router = APIRouter(prefix="/api/vision", tags=["Engineering Vision"])

@router.get("/analysis", response_model=PIDAnalysisResult)
def get_pid_analysis(pid_id: str = "PID-SAMPLE-001"):
    res = vision_engine.get_analysis(pid_id)
    if not res:
        raise HTTPException(status_code=404, detail="P&ID analysis not found")
    return res

@router.post("/verify-tag", response_model=EquipmentTag)
def verify_equipment_tag(
    pid_id: str = Body(...),
    tag_id: str = Body(...),
    status: VisionDetectionStatus = Body(...),
    verified_by: str = Body("Lead Plant Engineer"),
    notes: Optional[str] = Body(None)
):
    tag = vision_engine.update_tag_status(pid_id, tag_id, status, verified_by, notes)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    audit_service.log_event(
        action="PID_TAG_HUMAN_VERIFIED",
        resource=f"{tag_id} ({tag.equipment_type})",
        user_role=verified_by,
        details={"status": status.value, "notes": notes}
    )
    return tag
