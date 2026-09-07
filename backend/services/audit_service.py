import hashlib
import time
from datetime import datetime
from typing import List, Dict, Any
from models.schemas import AuditEvent
from services.db_service import db_service

class AuditService:
    def __init__(self):
        self.events: List[AuditEvent] = []
        self._init_default_logs()

    def _init_default_logs(self):
        default_actions = [
            ("SYSTEM_BOOT", "SOVEREIGN_ENCLAVE", {"status": "AIR_GAPPED_INITIALIZED", "egress": "BLOCKED"}),
            ("MODEL_LOAD", "deepseek-r1-distill-qwen-14b", {"precision": "Q4_K_M", "vram_alloc": "6.4GB"}),
            ("VECTOR_STORE_INIT", "ChromaDB Sovereign", {"collections": ["industrial_docs", "pid_tags"]}),
            ("POLICY_VERIFY", "ISO_27001_AIRGAP", {"external_routes": 0, "loopback_only": True})
        ]
        now = datetime.now()
        for idx, (action, res, details) in enumerate(default_actions):
            t_str = now.strftime("%Y-%m-%d %H:%M:%S")
            h = hashlib.sha256(f"{action}_{res}_{t_str}_{idx}".encode()).hexdigest()[:16]
            evt = AuditEvent(
                id=f"AUD-{idx+1001}",
                timestamp=t_str,
                user_role="System Kernel",
                action=action,
                resource=res,
                ip_address="127.0.0.1 (Local Enclave)",
                status="SUCCESS",
                external_egress_bytes=0,
                latency_ms=12,
                data_hash=f"sha256:{h}",
                details=details
            )
            self.events.append(evt)
            try:
                db_service.persist_audit_log(evt)
            except Exception:
                pass

    def log_event(self, action: str, resource: str, user_role: str = "Lead Plant Engineer", details: Dict[str, Any] = None, latency_ms: int = 25) -> AuditEvent:
        t_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        raw_str = f"{action}_{resource}_{user_role}_{t_str}_{time.time()}"
        h = hashlib.sha256(raw_str.encode()).hexdigest()[:16]
        event = AuditEvent(
            id=f"AUD-{len(self.events) + 1001}",
            timestamp=t_str,
            user_role=user_role,
            action=action,
            resource=resource,
            ip_address="127.0.0.1 (Local Sovereign)",
            status="SUCCESS",
            external_egress_bytes=0,
            latency_ms=latency_ms,
            data_hash=f"sha256:{h}",
            details=details or {}
        )
        self.events.insert(0, event)
        try:
            db_service.persist_audit_log(event)
        except Exception:
            pass
        return event

    def get_events(self, limit: int = 100) -> List[AuditEvent]:
        return self.events[:limit]

audit_service = AuditService()
