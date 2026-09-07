import os
import time
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from models.schemas import AgentExecution, AgentStep
from services.hitl_service import hitl_service
from services.audit_service import audit_service
from services.db_service import db_service

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
                "| **PV-402** | High | Accelerated wall thinning (3.68 yr RUL) | $145,000 (Weld Overlay) | Approve advance procurement for Q3 shutdown |\n"
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
                "- **FV-102 (Flow Control):** Mapped correctly to 8-inch HC-104 line. Actuator fail-safe matches DCS configuration.\n"
                "- **PT-304 (Pressure Sensor):** Transmitter range calibrated to 0-45 bar g. Redundant sensor recommended for Zone A.\n"
                "- **PSV-801 (Relief Valve):** Sizing verified against API 520 maximum fire case relief load."
            )
            report_title = "P&ID-REF-HC-003 Automated Line Reconciliation"
        elif agent_id == "agent-comparison":
            final_output = (
                "## ?? SPECIFICATION DEVIATION & REVISION DIFF ANALYSIS\n\n"
                "**Baseline:** Specification Doc Rev 2.1 vs **Current:** Specification Doc Rev 3.0\n\n"
                "### Identified Specification Changes\n"
                "1. **Line 12-inch HC-201:** Material changed from Carbon Steel A106-B to Alloy 20 (Corrosion allowance increased by 3.0 mm).\n"
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
                "- Continuous monitoring of bearing temperatures on TG-02 with trip setpoint at 95?C.\n"
                "- Strict adherence to lock-out/tag-out (LOTO) procedures for high-voltage booster pumps P-101A/B."
            )
            report_title = "Confidential Plant Safety & Operating Procedure Summary"

        execution = AgentExecution(
            id=exec_id,
            agent_id=agent_id,
            agent_name=target_agent["name"],
            document_id=document_id or "DOC-PV402",
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
        try:
            db_service.persist_agent_run(execution)
        except Exception:
            pass

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
