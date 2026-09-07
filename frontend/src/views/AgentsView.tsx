import React, { useState } from "react";
import {
  Workflow,
  ShieldAlert,
  FileText,
  Cpu,
  BarChart3,
  GitCompare,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Eye
} from "lucide-react";
import { AgentExecution, DocumentMetadata, UserRole, NavTab } from "../types";

interface AgentsViewProps {
  executions: AgentExecution[];
  documents: DocumentMetadata[];
  onRunAgent: (agentId: string, docId?: string) => Promise<AgentExecution>;
  userRole: UserRole;
  setActiveTab: (tab: NavTab) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  executions,
  documents,
  onRunAgent,
  userRole,
  setActiveTab,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("agent-inspection");
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || "DOC-PV402");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeExecution, setActiveExecution] = useState<AgentExecution | null>(executions[0] || null);

  const agentsList = [
    {
      id: "agent-inspection",
      name: "Inspection Report Analyzer",
      description: "Calculates ultrasonic thickness, corrosion rate (mpy), remaining life (RUL), and API 510/570 compliance.",
      icon: ShieldAlert,
      tag: "API 510 / NDT",
      recommendedDoc: "Pressure_Vessel_PV-402_Inspection_Report.pdf",
    },
    {
      id: "agent-mgmt-brief",
      name: "Management Brief Generator",
      description: "Synthesizes multi-source engineering reports and operational risks into executive C-suite decision briefs.",
      icon: BarChart3,
      tag: "CAPEX / OPEX",
      recommendedDoc: "Multi-Source Plant Dossier",
    },
    {
      id: "agent-pid",
      name: "P&ID Analyzer & Tag Reconciler",
      description: "Cross-checks P&ID valves and instruments with plant maintenance records and HAZOP safeties.",
      icon: Cpu,
      tag: "ISA-5.1 / HAZOP",
      recommendedDoc: "Refinery_Hydrocracker_PID_Rev3.png",
    },
    {
      id: "agent-summarizer",
      name: "Document Summarizer & Safety Brief",
      description: "Distills hundred-page maintenance procedures and safety protocols into structured actionable checklists.",
      icon: FileText,
      tag: "OSHA 1910 PSM",
      recommendedDoc: "Turbine_Generator_TG02_Maintenance_Log.docx",
    },
    {
      id: "agent-comparison",
      name: "Document Comparison & Deviation Agent",
      description: "Detects unapproved changes, material substitutions, and design deviations across revision versions.",
      icon: GitCompare,
      tag: "Spec Diff / QA",
      recommendedDoc: "Rev 2.1 vs Rev 3.0 Blueprints",
    },
  ];

  const handleExecute = async () => {
    setIsRunning(true);
    try {
      const exec = await onRunAgent(selectedAgentId, selectedDocId);
      setActiveExecution(exec);
    } finally {
      setIsRunning(false);
    }
  };

  const currentAgentInfo = agentsList.find((a) => a.id === selectedAgentId) || agentsList[0];

  return (
    <div className="flex h-full overflow-hidden bg-[#080b11]">
      {/* Left Column: 5 Specialized Agents Selector */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 p-4 space-y-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            <Workflow className="w-4 h-4" />
            Autonomous Agent Fleet
          </div>
          <p className="text-[11px] text-slate-400">
            Select specialized sovereign agents to execute on confidential plant data.
          </p>
        </div>

        <div className="space-y-2">
          {agentsList.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgentId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-cyan-950/60 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold text-slate-200">{agent.name}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                    {agent.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Air-Gapped Node</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Execution Target Document Selector */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase font-mono text-slate-400">Target Artifact</div>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.filename}
              </option>
            ))}
          </select>

          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950" />
            )}
            <span>Run {currentAgentInfo.name}</span>
          </button>
        </div>
      </div>

      {/* Center / Right: Step-by-Step Observable Pipeline Stepper & Result */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
        {/* Agent Header */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ACTIVE AGENT PIPELINE
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero Private CoT Egress
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeExecution ? activeExecution.agent_name : currentAgentInfo.name}
            </h2>
            <p className="text-xs text-slate-400">
              Source Document: <strong className="text-slate-200">{activeExecution?.document_name || selectedDocId}</strong>
            </p>
          </div>

          {activeExecution && activeExecution.status === "AWAITING_HUMAN_APPROVAL" && (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AI Generated ? Human Review Required</span>
              </div>
              <button
                onClick={() => setActiveTab("hitl")}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow"
              >
                Go to Review Queue ?
              </button>
            </div>
          )}
        </div>

        {/* Observable High-Level Execution Pipeline Stepper */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Agent Execution Lifecycle Stepper
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              Step {activeExecution?.current_step || 7} of 7 Complete
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {(
              activeExecution?.steps || [
                { step_number: 1, name: "Document Ingestion", description: "Loading artifacts", status: "completed", output_summary: "Ingested PDF" },
                { step_number: 2, name: "Sovereign OCR", description: "Parsing tables", status: "completed", output_summary: "Extracted 42 tables" },
                { step_number: 3, name: "Graph RAG", description: "Chroma DB query", status: "completed", output_summary: "5 Chunks retrieved" },
                { step_number: 4, name: "Multimodal Synthesis", description: "DeepSeek / VLM", status: "completed", output_summary: "MAWP derived" },
                { step_number: 5, name: "Compliance Check", description: "API 510 / ASME", status: "completed", output_summary: "1 Flag detected" },
                { step_number: 6, name: "Drafting Report", description: "Citations verified", status: "completed", output_summary: "Draft generated" },
                { step_number: 7, name: "HITL Gateway", description: "Human sign-off", status: "running", output_summary: "Queued for Review" },
              ]
            ).map((st) => (
              <div
                key={st.step_number}
                className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                  st.status === "completed"
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                    : st.status === "running"
                      ? "bg-amber-950/30 border-amber-500/40 text-amber-300 animate-pulse"
                      : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span>STEP 0{st.step_number}</span>
                  {st.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="text-xs font-bold leading-tight truncate">{st.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{st.output_summary}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Synthesized Agent Report Output */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Synthesized Autonomous Agent Output
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
              Verified ISO 55000 Industrial Standard
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
            {activeExecution?.final_output ||
              "Run an agent from the fleet menu on the left to see the step-by-step observable pipeline trace and synthesized technical report."}
          </div>
        </div>
      </div>
    </div>
  );
};
