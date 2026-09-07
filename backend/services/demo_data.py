import os
import hashlib
from datetime import datetime
from models.schemas import DocumentMetadata, DocumentStatus
from services.rag_engine import rag_engine

class DemoDataService:
    def __init__(self):
        self.is_loaded = False

    def load_demo_workspace(self):
        doc1_text = """# REFINERY ASSET INTEGRITY MANAGEMENT REPORT
Document Reference: AIM-2026-PV402-UT
Asset Description: Crude Distillation Unit (CDU) Flash Drum PV-402
Inspection Code: API 510 10th Edition / ASME Boiler & Pressure Vessel Code Sec VIII Div 1
Plant Location: Unit 12 Hydrocracker Complex, Bay 4

1.0 ASSET SPECIFICATION & DESIGN DATA
Nominal Diameter: 2,400 mm
Overall Tangent-to-Tangent Height: 8,600 mm
Material of Construction: SA-516 Grade 70 (Normalized Carbon Steel)
Design Pressure (MAWP): 15.2 bar gauge (220.4 psig)
Design Temperature: 280 C (536 F)
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
Recommended mitigation: Procure and apply Inconel Alloy 625 weld overlay cladding on nozzle C-04 during upcoming Q3 turnaround."""

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

        doc2_text = """# ROTATING EQUIPMENT RELIABILITY & MAINTENANCE LOG
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
2. WO-99202: Execute kidney-loop off-line electrostatic oil purification to restore ISO cleanliness to 16/14/11."""

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

        doc3_text = """# P&ID SCHEMATIC SPECIFICATION SHEET: P&ID-REF-HC-003 Rev 4
Unit: Hydrocracker Unit Fractionation Section
Governing P&ID Standard: ISA-5.1 / ISO 10628

Key Identified Tags & Loop Interlocks:
- Tag FV-102: 6-inch Globe Control Valve on Line 8-inch HC-104-300#. Fail Closed (FC).
- Tag PT-304: Smart Pressure Transmitter Range 0-40 bar g mounted on top vapor outlet.
- Tag PSV-801: Safety Relief Valve set at 16.5 bar g routing to High Pressure Flare Header Line 6-inch FLARE-HC-150#.
- Tag P-101A/B: Dual Centrifugal Heavy Bottom Pumps with API Plan 53A seal pot.
- Tag TI-208: Duplex RTD Temperature Indicator on Overhead Vapor Line.
- HAZOP Action: Bypass line valve HV-104 requires locked-closed tamper seal."""

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
