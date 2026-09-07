import os
import json

os.makedirs("backend/models", exist_ok=True)
os.makedirs("backend/services", exist_ok=True)
os.makedirs("backend/routers", exist_ok=True)
os.makedirs("backend/data/uploads", exist_ok=True)
os.makedirs("backend/data/samples", exist_ok=True)

# 1. schemas.py
schemas_code = """from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import time

class UserRole(str, Enum):
    ADMIN = "Admin"
    LEAD_ENGINEER = "Lead Plant Engineer"
    SAFETY_ANALYST = "Safety Analyst"
    VIEWER = "Plant Viewer"

class DocumentStatus(str, Enum):
    PROCESSING = "PROCESSING"
    INDEXED = "INDEXED"
    ERROR = "ERROR"

class DocumentMetadata(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    page_count: int = 1
    upload_time: str
    classification: str = "CONFIDENTIAL INDUSTRIAL"
    sha256_hash: str
    status: DocumentStatus = DocumentStatus.INDEXED
    tags: List[str] = []
    summary: Optional[str] = None
    chunks_count: int = 0

class Citation(BaseModel):
    document_id: str
    document_name: str
    page: int
    section: str
    snippet: str
    confidence: float
    relevance_score: float

class ChatMessage(BaseModel):
    id: str
    role: str # 'user' | 'assistant' | 'system'
    content: str
    timestamp: str
    citations: List[Citation] = []
    confidence: float = 0.95
    model_used: str = "DeepSeek-R1-Distill-Qwen (Local Q4_K_M)"
    inference_time_ms: int = 420
    is_air_gapped: bool = True

class ChatRequest(BaseModel):
    message: str
    document_ids: List[str] = []
    temperature: float = 0.2
    agent_mode: Optional[str] = None
    user_role: UserRole = UserRole.LEAD_ENGINEER

class VisionDetectionStatus(str, Enum):
    AI_DETECTED = "AI_DETECTED"
    HUMAN_VERIFIED = "HUMAN_VERIFIED"
    EDITED = "EDITED"

class EquipmentTag(BaseModel):
    id: str
    tag_id: str
    equipment_type: str
    line_number: Optional[str] = None
    zone: str
    bbox: List[float] # [ymin, xmin, ymax, xmax] (0 to 1000)
    confidence: float
    status: VisionDetectionStatus = VisionDetectionStatus.AI_DETECTED
    notes: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None

class PIDAnalysisResult(BaseModel):
    id: str
    image_name: str
    image_url: str
    total_components_detected: int
    valves_count: int
    pumps_count: int
    instruments_count: int
    vessels_count: int
    detections: List[EquipmentTag]
    hazop_flags: List[str] = []
    line_list_summary: Dict[str, Any] = {}
    ai_confidence: float = 0.94
    timestamp: str

class AgentStep(BaseModel):
    step_number: int
    name: str
    description: str
    status: str # 'pending' | 'running' | 'completed' | 'failed'
    timestamp: Optional[str] = None
    output_summary: Optional[str] = None

class AgentExecution(BaseModel):
    id: str
    agent_id: str
    agent_name: str
    document_id: Optional[str] = None
    document_name: Optional[str] = None
    status: str # 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'AWAITING_HUMAN_APPROVAL' | 'APPROVED' | 'REJECTED'
    current_step: int
    total_steps: int
    steps: List[AgentStep]
    final_output: Optional[str] = None
    hitl_required: bool = True
    hitl_status: str = "PENDING"
    hitl_signed_by: Optional[str] = None
    hitl_signature_hash: Optional[str] = None
    hitl_comments: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None

class HITLReviewItem(BaseModel):
    id: str
    title: str
    source_type: str
    source_id: str
    created_at: str
    status: str = "PENDING"
    payload: Dict[str, Any]
    reviewer: Optional[str] = None
    reviewed_at: Optional[str] = None
    comments: Optional[str] = None
    digital_signature: Optional[str] = None

class AuditEvent(BaseModel):
    id: str
    timestamp: str
    user_role: str
    action: str
    resource: str
    ip_address: str = "127.0.0.1 (Local Sovereign Enclave)"
    status: str = "SUCCESS"
    external_egress_bytes: int = 0
    latency_ms: int = 15
    data_hash: str
    details: Dict[str, Any] = {}

class SystemHealth(BaseModel):
    air_gapped: bool = True
    local_inference_only: bool = True
    external_api_calls: int = 0
    gpu_device: str = "NVIDIA RTX 4090 / On-Prem Sovereign Compute Node 01"
    gpu_vram_used_gb: float = 6.4
    gpu_vram_total_gb: float = 24.0
    cpu_utilization_pct: float = 18.5
    memory_used_gb: float = 12.2
    memory_total_gb: float = 64.0
    active_local_models: List[str] = [
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B (Q4_K_M)",
        "meta-llama/Llama-3.2-11B-Vision-Instruct (Q5_K_M)",
        "BAAI/bge-large-en-v1.5 (Local Embeddings)"
    ]
    vector_store_type: str = "ChromaDB Sovereign On-Prem"
    total_vectors_indexed: int = 1420
    uptime_seconds: int = 86400
"""
with open("backend/models/schemas.py", "w", encoding="utf-8") as f:
    f.write(schemas_code)

# 2. audit_service.py
audit_code = """import hashlib
import time
from datetime import datetime
from typing import List, Dict, Any
from models.schemas import AuditEvent

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
            self.events.append(AuditEvent(
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
            ))

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
        return event

    def get_events(self, limit: int = 100) -> List[AuditEvent]:
        return self.events[:limit]

audit_service = AuditService()
"""
with open("backend/services/audit_service.py", "w", encoding="utf-8") as f:
    f.write(audit_code)

print("Schemas and Audit Service generated successfully")
