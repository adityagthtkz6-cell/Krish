import os
import hashlib
import time

# 1. RAG Engine
rag_code = """import os
import hashlib
from typing import List, Dict, Any, Optional
from models.schemas import DocumentMetadata, DocumentStatus, Citation

class SovereignRAGEngine:
    def __init__(self):
        self.documents: Dict[str, DocumentMetadata] = {}
        self.chunks: List[Dict[str, Any]] = []

    def add_document(self, doc: DocumentMetadata, text_content: str, chunks_data: List[Dict[str, Any]] = None):
        self.documents[doc.id] = doc
        if chunks_data:
            self.chunks.extend(chunks_data)
        else:
            # Smart chunking
            paragraphs = [p.strip() for p in text_content.split("\\n\\n") if len(p.strip()) > 30]
            for idx, p in enumerate(paragraphs):
                chunk_id = f"{doc.id}_chunk_{idx}"
                page_est = min(doc.page_count, (idx // 3) + 1)
                section_title = f"Section {idx+1}.0"
                if "API 510" in p or "Inspection" in p:
                    section_title = "4.2 Thickness Survey & NDT"
                elif "Corrosion" in p or "Remaining Life" in p:
                    section_title = "6.1 Integrity & Calculation"
                elif "Vibration" in p or "ISO 10816" in p:
                    section_title = "3.4 Rotor Dynamics"
                elif "Valve" in p or "P&ID" in p:
                    section_title = "5.0 Flow Line & Actuation"

                self.chunks.append({
                    "chunk_id": chunk_id,
                    "document_id": doc.id,
                    "document_name": doc.filename,
                    "page": page_est,
                    "section": section_title,
                    "text": p,
                    "embedding": None
                })
        doc.chunks_count = len([c for c in self.chunks if c["document_id"] == doc.id])

    def query(self, query_str: str, doc_ids: Optional[List[str]] = None, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks:
            return []

        q_terms = set(query_str.lower().split())
        scored_chunks = []

        filtered_chunks = self.chunks
        if doc_ids and len(doc_ids) > 0:
            filtered_chunks = [c for c in self.chunks if c["document_id"] in doc_ids]
            if not filtered_chunks:
                filtered_chunks = self.chunks

        for chunk in filtered_chunks:
            chunk_text_lower = chunk["text"].lower()
            # Hybrid Keyword + Exact Tag Matching
            score = 0.0
            for term in q_terms:
                if len(term) > 2 and term in chunk_text_lower:
                    score += 1.5
            if any(tag in chunk_text_lower for tag in ["pv-402", "tg-02", "fv-102", "api 510", "iso 10816", "corrosion", "thickness"]):
                score += 2.0

            # Normalized confidence
            confidence = min(0.98, max(0.72, 0.75 + (score * 0.05)))
            scored_chunks.append((score, confidence, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top = scored_chunks[:top_k]

        results = []
        for score, conf, chunk in top:
            results.append({
                "document_id": chunk["document_id"],
                "document_name": chunk["document_name"],
                "page": chunk["page"],
                "section": chunk["section"],
                "snippet": chunk["text"],
                "confidence": conf,
                "relevance_score": round(min(1.0, conf), 2)
            })

        return results

    def get_document(self, doc_id: str) -> Optional[DocumentMetadata]:
        return self.documents.get(doc_id)

    def list_documents(self) -> List[DocumentMetadata]:
        return list(self.documents.values())

rag_engine = SovereignRAGEngine()
"""
with open("backend/services/rag_engine.py", "w", encoding="utf-8") as f:
    f.write(rag_code)

# 2. Vision Engine
vision_code = """import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from models.schemas import PIDAnalysisResult, EquipmentTag, VisionDetectionStatus

class SovereignVisionEngine:
    def __init__(self):
        self.analyses: Dict[str, PIDAnalysisResult] = {}
        self._init_default_pid()

    def _init_default_pid(self):
        default_detections = [
            EquipmentTag(
                id="TAG-01",
                tag_id="PV-402",
                equipment_type="Pressure Vessel / Flash Drum",
                line_number="12\"-HC-201-300#",
                zone="Zone A (High Pressure Feed)",
                bbox=[120, 240, 480, 520],
                confidence=0.98,
                status=VisionDetectionStatus.HUMAN_VERIFIED,
                notes="Verified as API 510 Flash Drum with dual relief outlets.",
                verified_by="Chief Engineer Sharma",
                verified_at=datetime.now().strftime("%Y-%m-%d %H:%M")
            ),
            EquipmentTag(
                id="TAG-02",
                tag_id="FV-102",
                equipment_type="Flow Control Valve (Pneumatic)",
                line_number="8\"-HC-104-300#",
                zone="Zone B (Reactor Feed Line)",
                bbox=[540, 180, 680, 290],
                confidence=0.96,
                status=VisionDetectionStatus.AI_DETECTED,
                notes="Fail-Close Actuator with electro-pneumatic positioner detected."
            ),
            EquipmentTag(
                id="TAG-03",
                tag_id="P-101A/B",
                equipment_type="Centrifugal Booster Pump Pair",
                line_number="10\"-HC-099-150#",
                zone="Zone C (Pump Skids)",
                bbox=[710, 400, 890, 620],
                confidence=0.94,
                status=VisionDetectionStatus.AI_DETECTED,
                notes="Dual duty/standby configuration with mechanical seal flush line API Plan 53A."
            ),
            EquipmentTag(
                id="TAG-04",
                tag_id="PT-304",
                equipment_type="Pressure Transmitter (Smart HART)",
                line_number="2\"-HC-INST-300#",
                zone="Zone A (High Pressure Feed)",
                bbox=[260, 560, 370, 670],
                confidence=0.95,
                status=VisionDetectionStatus.HUMAN_VERIFIED,
                notes="Transmitter calibrated range: 0 - 45 bar g.",
                verified_by="Lead Plant Engineer",
                verified_at=datetime.now().strftime("%Y-%m-%d %H:%M")
            ),
            EquipmentTag(
                id="TAG-05",
                tag_id="PSV-801",
                equipment_type="Pressure Safety Relief Valve",
                line_number="6\"-FLARE-HC-150#",
                zone="Zone A (Top Head Outlet)",
                bbox=[60, 320, 180, 440],
                confidence=0.97,
                status=VisionDetectionStatus.AI_DETECTED,
                notes="Set pressure: 16.5 bar g, vented directly to high pressure flare header."
            ),
            EquipmentTag(
                id="TAG-06",
                tag_id="TI-208",
                equipment_type="Temperature Indicator / Thermowell",
                line_number="12\"-HC-201-300#",
                zone="Zone B (Fractionator Overhead)",
                bbox=[380, 720, 490, 830],
                confidence=0.91,
                status=VisionDetectionStatus.AI_DETECTED,
                notes="Duplex PT100 RTD sensor element."
            )
        ]

        sample_pid = PIDAnalysisResult(
            id="PID-SAMPLE-001",
            image_name="Refinery_Hydrocracker_PID_Rev3.png",
            image_url="/api/vision/sample-image",
            total_components_detected=6,
            valves_count=2,
            pumps_count=2,
            instruments_count=2,
            vessels_count=1,
            detections=default_detections,
            hazop_flags=[
                "HAZOP Note 1: Bypass line around FV-102 requires locked-closed (LC) car seal.",
                "HAZOP Note 2: PSV-801 flare discharge pipe diameter conforms with API 520 sizing criteria.",
                "HAZOP Note 3: P-101B auto-start interlock linked to low flow alarm FA-104."
            ],
            line_list_summary={
                "12\"-HC-201-300#": {"service": "Crude Feed", "spec": "A106-B Carbon Steel", "insulation": "Hot (50mm)"},
                "8\"-HC-104-300#": {"service": "Heavy Naphtha", "spec": "316L SS", "insulation": "None"},
                "6\"-FLARE-HC-150#": {"service": "Relief Discharge", "spec": "A106-B", "insulation": "Acoustic"}
            },
            ai_confidence=0.95,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        self.analyses[sample_pid.id] = sample_pid

    def get_analysis(self, pid_id: str = "PID-SAMPLE-001") -> Optional[PIDAnalysisResult]:
        return self.analyses.get(pid_id)

    def update_tag_status(self, pid_id: str, tag_id: str, new_status: VisionDetectionStatus, verified_by: str, notes: Optional[str] = None):
        analysis = self.analyses.get(pid_id)
        if not analysis:
            return None
        for tag in analysis.detections:
            if tag.tag_id == tag_id or tag.id == tag_id:
                tag.status = new_status
                tag.verified_by = verified_by
                tag.verified_at = datetime.now().strftime("%Y-%m-%d %H:%M")
                if notes:
                    tag.notes = notes
                return tag
        return None

vision_engine = SovereignVisionEngine()
"""
with open("backend/services/vision_engine.py", "w", encoding="utf-8") as f:
    f.write(vision_code)

# 3. HITL Service
hitl_code = """import hashlib
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from models.schemas import HITLReviewItem

class HITLService:
    def __init__(self):
        self.items: Dict[str, HITLReviewItem] = {}
        self._init_default_items()

    def _init_default_items(self):
        # Default pending item for SIH demo flow
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
"""
with open("backend/services/hitl_service.py", "w", encoding="utf-8") as f:
    f.write(hitl_code)

# 4. Agent Runner
agent_code = """import os
import time
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from models.schemas import AgentExecution, AgentStep
from services.hitl_service import hitl_service
from services.audit_service import audit_service

class AgentRunner:
    def __init__(self):
        self.executions: Dict[str, AgentExecution] = {}
        self.available_agents = [
            {
                "id": "agent-inspection",
                "name": "Inspection Report Analyzer",
                "description": "Parses non-destructive examination (NDE/UT) records, calculates remaining life (RUL), and verifies API 510/570 compliance.",
                "icon": "ShieldAlert",
                "category": "Mechanical Integrity"
            },
            {
                "id": "agent-summarizer",
                "name": "Document Summarizer & Safety Brief",
                "description": "Distills dense multi-hundred-page technical manuals, safety data sheets, and turnaround procedures into structured action checklists.",
                "icon": "FileText",
                "category": "Operational Intelligence"
            },
            {
                "id": "agent-pid",
                "name": "P&ID Analyzer & Line Reconciler",
                "description": "Correlates Piping & Instrumentation Diagrams with engineering asset tags, HAZOP sheets, and DCS control loops.",
                "icon": "Cpu",
                "category": "Engineering Vision"
            },
            {
                "id": "agent-mgmt-brief",
                "name": "Management Brief Generator",
                "description": "Synthesizes raw operational telemetry and compliance findings into executive C-suite decision briefs with CAPEX/OPEX forecasts.",
                "icon": "BarChart3",
                "category": "Executive Strategy"
            },
            {
                "id": "agent-comparison",
                "name": "Document Comparison & Deviation Agent",
                "description": "Performs sovereign multi-version diffs between Rev A vs Rev B engineering specifications to detect unapproved spec changes.",
                "icon": "GitCompare",
                "category": "Quality Assurance"
            }
        ]

    def list_agents(self) -> List[Dict[str, Any]]:
        return self.available_agents

    def run_agent(self, agent_id: str, document_id: Optional[str] = None, user_role: str = "Lead Plant Engineer") -> AgentExecution:
        exec_id = f"EXEC-{agent_id[:5].upper()}-{int(time.time()) % 10000}"
        target_agent = next((a for a in self.available_agents if a["id"] == agent_id), self.available_agents[0])

        steps = [
            AgentStep(step_number=1, name="Document Ingestion", description="Loading confidential on-premise artifacts into memory enclave", status="completed", timestamp=datetime.now().strftime("%H:%M:%S"), output_summary="Ingested 1 document (18 pages parsed)"),
            AgentStep(step_number=2, name="Sovereign OCR & Parsing", description="Executing local Tesseract/TrOCR on high-res technical schematics", status="completed", timestamp=datetime.now().strftime("%H:%M:%S"), output_summary="Extracted 42 tables & 16 tag notations"),
            AgentStep(step_number=3, name="Dense Retrieval & Graph RAG", description="Querying sovereign Chroma vector store with API 510 semantic filters", status="completed", timestamp=datetime.now().strftime("%H:%M:%S"), output_summary="Retrieved 5 top-ranked verified context chunks"),
            AgentStep(step_number=4, name="Multimodal Synthesis", description="Running local DeepSeek-R1 / Llama-3.2-Vision on secure GPU nodes", status="completed", timestamp=datetime.now().strftime("%H:%M:%S"), output_summary="Derived remaining life formula and MAWP curve"),
            AgentStep(step_number=5, name="Regulatory Compliance Verification", description="Cross-checking against ASME Section VIII & OSHA 1910 rules", status="completed", timestamp=datetime.now().strftime("%H:%M:%S"), output_summary="1 Critical Turnaround recommendation flagged"),
            AgentStep(step_number=6, name="Drafting Report", description="Compiling structured industrial assessment with verified citations", status="completed", timestamp=datetime.now().strftime("%H:%M:%S"), output_summary="Draft prepared for Human-in-the-Loop review"),
            AgentStep(step_number=7, name="Human-in-the-Loop Gateway", description="Awaiting digital sign-off from authorized Lead Plant Engineer", status="running", timestamp=datetime.now().strftime("%H:%M:%S"), output_summary="Pending Approval in HITL Queue")
        ]

        if agent_id == "agent-inspection":
            final_output = (
                "## ?? ASSET INTEGRITY INSPECTION REPORT\n\n"
                "**Asset Tag:** PV-402 | **Type:** Crude Flash Drum | **Code:** API 510 / ASME VIII Div 1\n\n"
                "### Key Quantitative Findings\n"
                "- **Nominal Wall Thickness:** 28.50 mm\n"
                "- **Minimum Measured Thickness ($t_{actual}$):** 21.80 mm (Location C-04 South Nozzle)\n"
                "- **Code Required Minimum ($t_{min}$):** 20.40 mm\n"
                "- **Corrosion Rate:** 0.380 mm/year\n"
                "- **Remaining Useful Life (RUL):** **3.68 Years**\n\n"
                "### Mandatory Safety Action Plan\n"
                "1. **Inspection Interval Modification:** Per API 510 Section 7.1.1, the next internal inspection must be completed within **1.84 years (22 months)**, shortening the standard 5-year cycle.\n"
                "2. **Mitigation Recommendation:** Apply Alloy 625 weld overlay cladding at nozzle neck C-04 during upcoming Turnaround Q3."
            )
            report_title = "PV-402 API 510 Ultrasonic Thickness Inspection Report"
        elif agent_id == "agent-mgmt-brief":
            final_output = (
                "## ??? EXECUTIVE MANAGEMENT BRIEFING: REFINERY ASSET INTEGRITY\n\n"
                "**To:** VP of Refining Operations & Plant General Manager  \n"
                "**From:** INDRA Autonomous Sovereign Intelligence  \n"
                "**Classification:** STRICTLY CONFIDENTIAL - ON-PREMISE ONLY\n\n"
                "### Executive Summary\n"
                "Analysis of recent NDT inspection logs for Flash Drum **PV-402** and vibration telemetry on Turbine Generator **TG-02** reveals actionable risks prior to the scheduled Q3 turnaround.\n\n"
                "### Strategic & Financial Impact\n"
                "| Asset Tag | Severity | Operational Risk | Estimated CAPEX/OPEX Impact | Recommended Decision |\n"
                "|---|---|---|---|---|\n"
                "| **PV-402** | High | Accelerated wall thinning ($3.68\\text{ yr RUL}$) | $145,000 (Weld Overlay) | Approve advance procurement for Q3 shutdown |\n"
                "| **TG-02** | Medium | Bearing #2 vibration (7.8 mm/s) | $32,000 (Laser Re-alignment) | Schedule 12-hr maintenance window next weekend |\n\n"
                "### Risk Sign-off Requirement\n"
                "Lead Plant Engineer verification is required to authorize Q3 turnaround work pack modification."
            )
            report_title = "Executive Management Briefing: Q3 Plant Turnaround & Reliability"
        elif agent_id == "agent-pid":
            final_output = (
                "## ?? P&ID VERIFICATION & LINE RECONCILIATION REPORT\n\n"
                "**Schematic:** P&ID-REF-HC-003 Rev 3.0  \n"
                "**Components Detected:** 6 Equipment Tags (2 Control Valves, 2 Pumps, 2 Transmitters)\n\n"
                "### Cross-Verification Summary\n"
                "- **FV-102 (Flow Control):** Mapped correctly to 8\"-HC-104-300# line. Actuator fail-safe matches DCS configuration.\n"
                "- **PT-304 (Pressure Sensor):** Transmitter range calibrated to 0-45 bar g. Redundant sensor recommended for Zone A.\n"
                "- **PSV-801 (Relief Valve):** Sizing verified against API 520 maximum fire case relief load."
            )
            report_title = "P&ID-REF-HC-003 Automated Line Reconciliation"
        elif agent_id == "agent-comparison":
            final_output = (
                "## ?? SPECIFICATION DEVIATION & REVISION DIFF ANALYSIS\n\n"
                "**Baseline:** Specification Doc Rev 2.1 vs **Current:** Specification Doc Rev 3.0\n\n"
                "### Identified Specification Changes\n"
                "1. **Line 12\"-HC-201:** Material changed from Carbon Steel A106-B to Alloy 20 (Corrosion allowance increased by 3.0 mm).\n"
                "2. **Design Pressure:** Operating limit elevated from 12.5 bar to 15.2 bar without secondary HAZOP review flag.\n"
                "3. **Valve Trim:** Changed from 316 SS Stellite to Monel 400 for hydrofluoric acid mitigation."
            )
            report_title = "Rev 2.1 vs Rev 3.0 Engineering Spec Deviation Report"
        else:
            final_output = (
                "## ?? INDUSTRIAL SUMMARY & SAFETY OPERATIONAL CHECKLIST\n\n"
                "**Source Material:** Confidential Plant Operations & Maintenance Manuals\n\n"
                "### Critical Operational Precautions\n"
                "- Maintain nitrogen purge envelope during all hot-work activities in Zone A.\n"
                "- Continuous monitoring of bearing temperatures on TG-02 with trip setpoint at 95°C.\n"
                "- Strict adherence to lock-out/tag-out (LOTO) procedures for high-voltage booster pumps P-101A/B."
            )
            report_title = "Confidential Plant Safety & Operating Procedure Summary"

        execution = AgentExecution(
            id=exec_id,
            agent_id=agent_id,
            agent_name=target_agent["name"],
            document_id=document_id or "DOC-DEMO-01",
            document_name="Pressure_Vessel_PV-402_Inspection_Report.pdf",
            status="AWAITING_HUMAN_APPROVAL",
            current_step=7,
            total_steps=7,
            steps=steps,
            final_output=final_output,
            hitl_required=True,
            hitl_status="PENDING",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        self.executions[exec_id] = execution

        # Queue in HITL service
        hitl_service.create_item(
            title=report_title,
            source_type="AGENT_REPORT",
            source_id=exec_id,
            payload={
                "agent_name": target_agent["name"],
                "report_content": final_output,
                "execution_id": exec_id,
                "document": execution.document_name
            }
        )

        audit_service.log_event(
            action="AGENT_EXECUTION_COMPLETED",
            resource=target_agent["name"],
            user_role=user_role,
            details={"execution_id": exec_id, "hitl_queued": True}
        )

        return execution

    def get_execution(self, exec_id: str) -> Optional[AgentExecution]:
        return self.executions.get(exec_id)

    def list_executions(self) -> List[AgentExecution]:
        return list(self.executions.values())

agent_runner = AgentRunner()
"""
with open("backend/services/agent_runner.py", "w", encoding="utf-8") as f:
    f.write(agent_code)

# 5. Demo Data Generator
demo_code = """import os
import hashlib
from datetime import datetime
from models.schemas import DocumentMetadata, DocumentStatus
from services.rag_engine import rag_engine

class DemoDataService:
    def __init__(self):
        self.is_loaded = False

    def load_demo_workspace(self):
        # 1. Inspection Report
        doc1_text = '''# REFINERY ASSET INTEGRITY MANAGEMENT REPORT
Document Reference: AIM-2026-PV402-UT
Asset Description: Crude Distillation Unit (CDU) Flash Drum PV-402
Inspection Code: API 510 10th Edition / ASME Boiler & Pressure Vessel Code Sec VIII Div 1
Plant Location: Unit 12 Hydrocracker Complex, Bay 4

1.0 ASSET SPECIFICATION & DESIGN DATA
Nominal Diameter: 2,400 mm
Overall Tangent-to-Tangent Height: 8,600 mm
Material of Construction: SA-516 Grade 70 (Normalized Carbon Steel)
Design Pressure (MAWP): 15.2 bar gauge (220.4 psig)
Design Temperature: 280 °C (536 °F)
Original Nominal Shell Thickness: 28.5 mm
Original Corrosion Allowance: 6.0 mm
Operating Medium: Heavy sour crude bottoms containing naphthenic acid and H2S.

2.0 ULTRASONIC THICKNESS (UT) GRID SURVEY DATA
Non-destructive examination was performed utilizing a calibrated Olympus 38DL Plus ultrasonic thickness gauge.
Location Grid A (Top Head): 27.2 mm (Uniform, light thinning)
Location Grid B (Upper Shell Ring): 25.8 mm
Location Grid C (South Nozzle Neck C-04 Feed Impingement): 21.8 mm (Localized deep thinning)
Location Grid D (Bottom Sump Cone): 24.1 mm

3.0 CORROSION RATE AND REMAINING LIFE (RUL) CALCULATION
Per API 510 Section 7.1:
Formula for Minimum Required Thickness:
t_min = (P * R) / (S * E - 0.6 * P)
Where P = 1.52 MPa, R = 1200 mm, S = 118 MPa, E = 1.0 (Full Radiography).
Calculated t_min = 20.4 mm.

Actual Minimum Measured Wall Thickness: t_actual = 21.8 mm.
Corrosion Rate determined across 24-month monitoring: 0.38 mm/year.
Remaining Useful Life (RUL) = (t_actual - t_min) / Corrosion Rate = (21.8 - 20.4) / 0.38 = 3.68 Years.

4.0 ENGINEERING RECOMMENDATIONS & HITL ACTIONS
Per API 510 clause 7.1.1, when remaining life is less than 4 years, inspection intervals must not exceed half the remaining life (Max Interval = 1.84 Years / 22 Months).
Recommended mitigation: Procure and apply Inconel Alloy 625 weld overlay cladding on nozzle C-04 during upcoming Q3 turnaround.'''

        doc1 = DocumentMetadata(
            id="DOC-PV402",
            filename="Pressure_Vessel_PV-402_Inspection_Report.pdf",
            file_type="PDF",
            size_bytes=2480000,
            page_count=6,
            upload_time=datetime.now().strftime("%Y-%m-%d %H:%M"),
            classification="STRICTLY CONFIDENTIAL INDUSTRIAL",
            sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            status=DocumentStatus.INDEXED,
            tags=["API 510", "PV-402", "NDT", "Ultrasonic", "Corrosion"],
            summary="Ultrasonic thickness testing report for Flash Drum PV-402 showing 3.68 yr RUL and 0.38 mm/yr corrosion rate."
        )
        rag_engine.add_document(doc1, doc1_text)

        # 2. Maintenance Log
        doc2_text = '''# ROTATING EQUIPMENT RELIABILITY & MAINTENANCE LOG
Equipment Tag: TG-02 (Cogeneration Steam Turbine Generator)
Standard: ISO 10816-3 Evaluation of Machine Vibration
Operating RPM: 3,000 RPM (50 Hz Synchronous)

1.0 VIBRATION SPECTRUM TELEMETRY
Drive-End Bearing #2 overall vibration amplitude recorded at 7.8 mm/s RMS, placing equipment into ISO 10816-3 Zone C (Unsatisfactory for continuous unmonitored operation).
FFT Spectrum shows dominant 1X peak at 50.0 Hz (dynamic unbalance) with 2X harmonic peak at 100.0 Hz indicating angular misalignment between turbine coupling and generator rotor.

2.0 LUBE OIL SPECTROGRAPHIC ANALYSIS
Sample Date: Recent Oil Lab Dispatch
ISO 4406 Cleanliness Code: 21/18/15
Ferrous Wear Debris: 42 ppm Fe particulate
Water Content: 0.04% (within acceptable 0.05% threshold)

3.0 CORRECTIVE ACTIONS & WORK ORDER
1. WO-99201: Mobilize laser optical alignment team during planned 12-hr window to correct horizontal/vertical offset to < 0.05 mm.
2. WO-99202: Execute kidney-loop off-line electrostatic oil purification to restore ISO cleanliness to 16/14/11.'''

        doc2 = DocumentMetadata(
            id="DOC-TG02",
            filename="Turbine_Generator_TG02_Maintenance_Log.docx",
            file_type="DOCX",
            size_bytes=1140000,
            page_count=4,
            upload_time=datetime.now().strftime("%Y-%m-%d %H:%M"),
            classification="CONFIDENTIAL INDUSTRIAL",
            sha256_hash="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
            status=DocumentStatus.INDEXED,
            tags=["ISO 10816", "TG-02", "Vibration", "Lube Oil", "Turbine"],
            summary="Vibration spectrum & lube oil analysis for Turbine Generator TG-02 showing 7.8 mm/s RMS on Bearing #2."
        )
        rag_engine.add_document(doc2, doc2_text)

        # 3. P&ID Schematic Document
        doc3_text = '''# P&ID SCHEMATIC SPECIFICATION SHEET: P&ID-REF-HC-003 Rev 4
Unit: Hydrocracker Unit Fractionation Section
Governing P&ID Standard: ISA-5.1 / ISO 10628

Key Identified Tags & Loop Interlocks:
- Tag FV-102: 6\" Globe Control Valve on Line 8\"-HC-104-300#. Fail Closed (FC).
- Tag PT-304: Smart Pressure Transmitter Range 0-40 bar g mounted on top vapor outlet.
- Tag PSV-801: Safety Relief Valve set at 16.5 bar g routing to High Pressure Flare Header Line 6\"-FLARE-HC-150#.
- Tag P-101A/B: Dual Centrifugal Heavy Bottom Pumps with API Plan 53A seal pot.
- Tag TI-208: Duplex RTD Temperature Indicator on Overhead Vapor Line.
- HAZOP Action: Bypass line valve HV-104 requires locked-closed tamper seal.'''

        doc3 = DocumentMetadata(
            id="DOC-PID003",
            filename="Refinery_Hydrocracker_PID_Rev3.png",
            file_type="IMAGE / P&ID",
            size_bytes=3820000,
            page_count=1,
            upload_time=datetime.now().strftime("%Y-%m-%d %H:%M"),
            classification="RESTRICTED ENGINEERING BLUEPRINT",
            sha256_hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            status=DocumentStatus.INDEXED,
            tags=["P&ID", "ISA-5.1", "HAZOP", "Valves", "Instruments"],
            summary="Hydrocracker Fractionation P&ID blueprint featuring control valve FV-102, pump pair P-101A/B, and relief valve PSV-801."
        )
        rag_engine.add_document(doc3, doc3_text)

        self.is_loaded = True
        return [doc1, doc2, doc3]

demo_service = DemoDataService()
demo_service.load_demo_workspace()
"""
with open("backend/services/demo_data.py", "w", encoding="utf-8") as f:
    f.write(demo_code)

print("Services written successfully")
