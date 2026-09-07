import React, { useState } from "react";
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tag,
  ShieldCheck,
  Edit3,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";
import { PIDAnalysisResult, EquipmentTag, VisionDetectionStatus, UserRole } from "../types";

interface EngineeringVisionViewProps {
  pidAnalysis: PIDAnalysisResult | null;
  onVerifyTag: (tagId: string, status: VisionDetectionStatus, notes?: string) => Promise<void>;
  userRole: UserRole;
}

export const EngineeringVisionView: React.FC<EngineeringVisionViewProps> = ({
  pidAnalysis,
  onVerifyTag,
  userRole,
}) => {
  const [selectedTag, setSelectedTag] = useState<EquipmentTag | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!pidAnalysis) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading Sovereign Multimodal Vision Engine...
      </div>
    );
  }

  const detections = pidAnalysis.detections || [];
  const filteredTags = filterType === "ALL" 
    ? detections 
    : filterType === "VERIFIED" 
      ? detections.filter((t) => t.status === "HUMAN_VERIFIED")
      : detections.filter((t) => t.status === "AI_DETECTED");

  const handleVerify = async (status: VisionDetectionStatus) => {
    if (!selectedTag) return;
    await onVerifyTag(selectedTag.id, status, editNotes || selectedTag.notes);
    setIsEditing(false);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#080b11]">
      {/* Center: Interactive P&ID Drawing Canvas View */}
      <div className="flex-1 flex flex-col h-full border-r border-slate-800">
        {/* Top Controls */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 font-mono">
              {pidAnalysis.image_name}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              ISA-5.1 Multimodal VLM
            </span>
          </div>

          {/* Zoom and Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(60, zoomLevel - 15))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(160, zoomLevel + 15))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                  filterType === "ALL" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
                }`}
              >
                All ({detections.length})
              </button>
              <button
                onClick={() => setFilterType("VERIFIED")}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                  filterType === "VERIFIED" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-400"
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilterType("AI_PENDING")}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                  filterType === "AI_PENDING" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400"
                }`}
              >
                AI Pending
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Schematic Diagram Viewport */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center tech-grid relative">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
            className="transition-transform duration-150 relative bg-[#0d1424] border-2 border-slate-700 rounded-xl shadow-2xl p-4 w-[850px] h-[580px] overflow-hidden select-none"
          >
            {/* SVG Engineering Schematic Layer */}
            <svg
              viewBox="0 0 1000 700"
              className="w-full h-full text-slate-400 stroke-slate-500"
              style={{ strokeWidth: "2" }}
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="1000" height="700" fill="url(#grid)" />

              {/* Title Block */}
              <rect x="680" y="600" width="300" height="80" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
              <text x="700" y="625" fill="#94a3b8" fontSize="12" fontFamily="monospace">DWG: P&ID-REF-HC-003</text>
              <text x="700" y="645" fill="#00f0ff" fontSize="13" fontWeight="bold">HYDROCRACKER UNIT REV 3</text>
              <text x="700" y="665" fill="#64748b" fontSize="10">CONFIDENTIAL ON-PREMISE AI SCAN</text>

              {/* Major Vessel PV-402 */}
              <rect x="240" y="120" width="280" height="360" rx="40" fill="#141e33" stroke="#38bdf8" strokeWidth="3" />
              <text x="330" y="300" fill="#38bdf8" fontSize="20" fontWeight="bold" fontFamily="monospace">PV-402</text>
              <text x="300" y="325" fill="#94a3b8" fontSize="12" fontFamily="monospace">FLASH DRUM (API 510)</text>

              {/* Process Lines */}
              {/* Line 1: Feed Line to PV-402 */}
              <path d="M 60 280 L 240 280" fill="none" stroke="#f59e0b" strokeWidth="4" />
              <text x="90" y="270" fill="#f59e0b" fontSize="11" fontFamily="monospace">12"-HC-201-300#</text>

              {/* Line 2: Overhead Relief to PSV-801 */}
              <path d="M 380 120 L 380 60 L 600 60" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="6,4" />
              <text x="430" y="50" fill="#ef4444" fontSize="11" fontFamily="monospace">6"-FLARE-HC-150#</text>

              {/* Line 3: Bottom Effluent to Pump Skid */}
              <path d="M 380 480 L 380 580 L 720 580" fill="none" stroke="#10b981" strokeWidth="4" />
              <text x="450" y="570" fill="#10b981" fontSize="11" fontFamily="monospace">10"-HC-099-150#</text>

              {/* Line 4: Discharge with FV-102 */}
              <path d="M 180 540 L 400 540" fill="none" stroke="#06b6d4" strokeWidth="3" />
              <text x="210" y="530" fill="#06b6d4" fontSize="11" fontFamily="monospace">8"-HC-104-300#</text>

              {/* Symbols */}
              {/* Valve FV-102 Symbol */}
              <polygon points="200,530 200,550 250,540" fill="#06b6d4" />
              <polygon points="300,530 300,550 250,540" fill="#06b6d4" />
              <line x1="250" y1="540" x2="250" y2="510" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="250" cy="500" r="10" fill="#090d16" stroke="#06b6d4" strokeWidth="2" />
              <text x="246" y="504" fill="#06b6d4" fontSize="10">M</text>

              {/* PSV-801 Relief Valve */}
              <polygon points="370,80 390,80 380,60" fill="#ef4444" />
              <text x="400" y="85" fill="#ef4444" fontSize="11" fontWeight="bold">PSV-801</text>

              {/* Pumps P-101A/B */}
              <circle cx="780" cy="550" r="35" fill="#1e293b" stroke="#10b981" strokeWidth="3" />
              <polygon points="765,585 795,585 810,550" fill="#10b981" />
              <text x="745" y="555" fill="#10b981" fontSize="13" fontWeight="bold">P-101A</text>

              {/* Transmitter PT-304 bubble */}
              <circle cx="600" cy="300" r="22" fill="#0e1726" stroke="#38bdf8" strokeWidth="2" />
              <line x1="578" y1="300" x2="622" y2="300" stroke="#38bdf8" strokeWidth="1" />
              <text x="590" y="293" fill="#38bdf8" fontSize="11" fontWeight="bold">PT</text>
              <text x="585" y="314" fill="#38bdf8" fontSize="10">304</text>
              <line x1="520" y1="300" x2="578" y2="300" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" />

              {/* Temperature Indicator TI-208 */}
              <circle cx="760" cy="420" r="20" fill="#0e1726" stroke="#f59e0b" strokeWidth="2" />
              <text x="750" y="425" fill="#f59e0b" fontSize="11" fontWeight="bold">TI</text>
            </svg>

            {/* Bounding Box Overlays */}
            {filteredTags.map((tag) => {
              const isSelected = selectedTag?.id === tag.id;
              const isVerified = tag.status === "HUMAN_VERIFIED";

              // Coordinates normalized (0 to 1000)
              const top = `${(tag.bbox[0] / 1000) * 100}%`;
              const left = `${(tag.bbox[1] / 1000) * 100}%`;
              const height = `${((tag.bbox[2] - tag.bbox[0]) / 1000) * 100}%`;
              const width = `${((tag.bbox[3] - tag.bbox[1]) / 1000) * 100}%`;

              return (
                <div
                  key={tag.id}
                  onClick={() => {
                    setSelectedTag(tag);
                    setEditNotes(tag.notes || "");
                  }}
                  style={{ top, left, width, height }}
                  className={`absolute cursor-pointer transition-all border-2 rounded-lg flex flex-col justify-between p-1 select-none ${
                    isSelected
                      ? "ring-4 ring-cyan-400/60 bg-cyan-500/20 z-20"
                      : isVerified
                        ? "border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 z-10"
                        : "border-amber-400 border-dashed bg-amber-500/10 hover:bg-amber-500/20 z-10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shadow ${
                        isVerified
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-amber-500 text-slate-950"
                      }`}
                    >
                      {tag.tag_id}
                    </span>
                    <span className="text-[9px] font-mono text-white/90 bg-slate-950/80 px-1 rounded">
                      {(tag.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-[9px] font-semibold text-slate-200 truncate bg-slate-950/80 px-1 rounded">
                    {tag.equipment_type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Drawer: Tag Inspector & Human-in-the-loop Verification Panel */}
      <div className="w-96 bg-slate-950 p-4 space-y-4 overflow-y-auto flex-shrink-0 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
              <Eye className="w-4 h-4" />
              Multimodal Vision Inspector
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {detections.length} Total Tags
            </span>
          </div>

          {selectedTag ? (
            <div className="space-y-4">
              {/* Selected Tag Card */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white font-mono">{selectedTag.tag_id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      selectedTag.status === "HUMAN_VERIFIED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {selectedTag.status === "HUMAN_VERIFIED" ? "? HUMAN VERIFIED" : "? AI DETECTED"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Equipment Type</span>
                    <div className="font-semibold text-slate-200">{selectedTag.equipment_type}</div>
                  </div>

                  {selectedTag.line_number && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Line Specification</span>
                      <div className="font-mono text-cyan-300">{selectedTag.line_number}</div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Process Zone</span>
                    <div className="text-slate-300">{selectedTag.zone}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">VLM Confidence Score</span>
                    <div className="font-mono text-emerald-400 font-bold">
                      {(selectedTag.confidence * 100).toFixed(1)}% Local Match
                    </div>
                  </div>

                  {selectedTag.verified_by && (
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                      <div>Verified by: {selectedTag.verified_by}</div>
                      <div className="text-slate-500 text-[10px]">{selectedTag.verified_at}</div>
                    </div>
                  )}
                </div>

                {/* Notes and Human Feedback */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>ENGINEERING NOTES</span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                      {selectedTag.notes || "No engineering remarks added yet."}
                    </div>
                  )}
                </div>

                {/* Human Verification Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleVerify("HUMAN_VERIFIED")}
                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Tag</span>
                  </button>
                  <button
                    onClick={() => handleVerify("EDITED")}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Update Info</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Tag List Table when none is selected */
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400">
                Click any tag box on the drawing or select from the list below to inspect & verify:
              </div>
              <div className="space-y-1.5">
                {detections.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => setSelectedTag(tag)}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-cyan-300 font-mono">{tag.tag_id}</div>
                      <div className="text-[10px] text-slate-400">{tag.equipment_type}</div>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        tag.status === "HUMAN_VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {tag.status === "HUMAN_VERIFIED" ? "VERIFIED" : "AI"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HAZOP Automated Flags Section */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              Automated HAZOP Flags ({pidAnalysis.hazop_flags.length})
            </div>
            <div className="space-y-1.5">
              {pidAnalysis.hazop_flags.map((flag, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 p-2 rounded bg-slate-950/60 border border-slate-800/80 leading-relaxed">
                  {flag}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800">
          All image analysis executed on local Llama-3.2-Vision enclave.
        </div>
      </div>
    </div>
  );
};
