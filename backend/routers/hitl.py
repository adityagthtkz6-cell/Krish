from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional
from models.schemas import HITLReviewItem
from services.hitl_service import hitl_service
from services.audit_service import audit_service

router = APIRouter(prefix="/api/hitl", tags=["Human in the Loop"])

@router.get("/queue", response_model=List[HITLReviewItem])
def get_review_queue(status: Optional[str] = None):
    return hitl_service.list_items(status)

@router.post("/approve", response_model=HITLReviewItem)
def approve_item(
    item_id: str = Body(...),
    reviewer: str = Body("Lead Plant Engineer"),
    comments: Optional[str] = Body(None)
):
    item = hitl_service.approve_item(item_id, reviewer, comments)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    audit_service.log_event(
        action="HITL_GATEWAY_APPROVED",
        resource=item.title,
        user_role=reviewer,
        details={"signature": item.digital_signature, "comments": comments}
    )
    return item

@router.post("/reject", response_model=HITLReviewItem)
def reject_item(
    item_id: str = Body(...),
    reviewer: str = Body("Lead Plant Engineer"),
    comments: str = Body(...)
):
    item = hitl_service.reject_item(item_id, reviewer, comments)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    audit_service.log_event(
        action="HITL_GATEWAY_REJECTED",
        resource=item.title,
        user_role=reviewer,
        details={"comments": comments}
    )
    return item
