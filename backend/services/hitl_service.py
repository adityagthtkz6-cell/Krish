import hashlib
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from models.schemas import HITLReviewItem

class HITLService:
    def __init__(self):
        self.items: Dict[str, HITLReviewItem] = {}
        self._init_default_items()

    def _init_default_items(self):
        item1 = HITLReviewItem(
            id="HITL-101",
            title="PV-402 API 510 Integrity Assessment & Turnaround Schedule",
            source_type="AGENT_REPORT",
            source_id="EXEC-AGT-01",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
            status="PENDING",
            payload={
                "asset": "Pressure Vessel PV-402",
                "finding": "Remaining useful life is 3.68 years. Recommended inspection interval reduced from 5.0 to 1.84 years.",
                "proposed_action": "Schedule internal ultrasonic B-scan during Q3 planned shutdown; procure Alloy 625 weld overlay sleeve.",
                "risk_level": "HIGH",
                "compliance_standard": "API 510 / ASME Sec VIII"
            }
        )
        self.items[item1.id] = item1

    def list_items(self, status: Optional[str] = None) -> List[HITLReviewItem]:
        all_items = list(self.items.values())
        if status:
            return [i for i in all_items if i.status.upper() == status.upper()]
        return all_items

    def approve_item(self, item_id: str, reviewer: str, comments: Optional[str] = None) -> Optional[HITLReviewItem]:
        item = self.items.get(item_id)
        if not item:
            return None
        item.status = "APPROVED"
        item.reviewer = reviewer
        item.reviewed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        item.comments = comments or "Approved without deviation. Compliant with plant safety SOP."
        raw_sig = f"{item_id}_{reviewer}_{item.reviewed_at}_{comments}"
        item.digital_signature = f"SOVEREIGN-SIG-SHA256-{hashlib.sha256(raw_sig.encode()).hexdigest()[:24].upper()}"
        return item

    def reject_item(self, item_id: str, reviewer: str, comments: str) -> Optional[HITLReviewItem]:
        item = self.items.get(item_id)
        if not item:
            return None
        item.status = "REJECTED"
        item.reviewer = reviewer
        item.reviewed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        item.comments = comments
        item.digital_signature = f"REJECT-STAMP-{hashlib.sha256(comments.encode()).hexdigest()[:16].upper()}"
        return item

    def create_item(self, title: str, source_type: str, source_id: str, payload: Dict[str, Any]) -> HITLReviewItem:
        new_id = f"HITL-{len(self.items) + 101}"
        item = HITLReviewItem(
            id=new_id,
            title=title,
            source_type=source_type,
            source_id=source_id,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
            status="PENDING",
            payload=payload
        )
        self.items[new_id] = item
        return item

hitl_service = HITLService()
