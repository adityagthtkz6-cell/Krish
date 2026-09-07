import os
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
                line_number='12"-HC-201-300#',
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
                line_number='8"-HC-104-300#',
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
                line_number='10"-HC-099-150#',
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
                line_number='2"-HC-INST-300#',
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
                line_number='6"-FLARE-HC-150#',
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
                line_number='12"-HC-201-300#',
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
                '12"-HC-201-300#': {"service": "Crude Feed", "spec": "A106-B Carbon Steel", "insulation": "Hot (50mm)"},
                '8"-HC-104-300#': {"service": "Heavy Naphtha", "spec": "316L SS", "insulation": "None"},
                '6"-FLARE-HC-150#': {"service": "Relief Discharge", "spec": "A106-B", "insulation": "Acoustic"}
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
