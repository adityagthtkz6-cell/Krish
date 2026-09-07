import React from "react";
import {
  FileText,
  BotMessageSquare,
  Eye,
  Workflow,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap
} from "lucide-react";
import { DocumentMetadata, AgentExecution, HITLReviewItem, NavTab } from "../types";

interface DashboardViewProps {
  documents: DocumentMetadata[];
  executions: AgentExecution[];
  hitlItems: HITLReviewItem[];
  setActiveTab: (tab: NavTab) => void;
  onRunQuickAgent: (agentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  executions,
  hitlItems,
  setActiveTab,
  onRunQuickAgent,
}) => {
  const pendingHITL = hitlItems.filter((i) => i.status === "PENDING").length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
      {/* Top Welcome & Air-Gap Compliance Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0c1527] border border-cyan-500/20 p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SIH 2026 Problem Statement 26117</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              INDRA Sovereign Industrial AI
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Air-Gapped Autonomous Multimodal Workbench for Confidential Industrial Facilities.
              Empowering engineers with local LLM reasoning, P&ID vision parsing, and Human-in-the-Loop governance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab("workbench")}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>Launch AI Workbench</span>
            </button>
            <button
              onClick={() => setActiveTab("vision")}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Analyze P&ID Drawing</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Sovereign Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Documents */}
        <div
          onClick={() => setActiveTab("documents")}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Ingested Documents</span>
            <FileText className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{documents.length}</div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>100% On-Premise Encrypted</span>
          </div>
        </div>

        {/* Card 2: Vision Analysis */}
        <div
          onClick={() => setActiveTab("vision")}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">P&ID Tags Extracted</span>
            <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">6 Detected</div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
            <span>2 Human Verified ? 4 AI Pending</span>
          </div>
        </div>

        {/* Card 3: Autonomous Agents */}
        <div
          onClick={() => setActiveTab("agents")}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Agent Executions</span>
            <Workflow className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{executions.length || 5}</div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>5 Specialized Pipelines</span>
          </div>
        </div>

        {/* Card 4: HITL Approvals */}
        <div
          onClick={() => setActiveTab("hitl")}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Human Review Queue</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{pendingHITL} Pending</div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
            <span>Sign-off Required</span>
          </div>
        </div>
      </div>

      {/* Flagship SIH Demo Stepper Section */}
      <div className="p-5 rounded-2xl bg-[#0e1320] border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Flagship SIH 2026 Evaluation Workflow
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-mono">Step-by-Step Sovereign Pipeline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            onClick={() => setActiveTab("documents")}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="text-[10px] font-mono text-cyan-400 font-semibold">STEP 01</div>
            <div className="text-xs font-bold text-slate-200">1. Ingest Report</div>
            <p className="text-[11px] text-slate-400">Upload ultrasonic testing PDF for PV-402.</p>
          </div>

          <div
            onClick={() => setActiveTab("workbench")}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="text-[10px] font-mono text-cyan-400 font-semibold">STEP 02</div>
            <div className="text-xs font-bold text-slate-200">2. Sovereign RAG</div>
            <p className="text-[11px] text-slate-400">Query corrosion rate & remaining life citations.</p>
          </div>

          <div
            onClick={() => setActiveTab("vision")}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="text-[10px] font-mono text-cyan-400 font-semibold">STEP 03</div>
            <div className="text-xs font-bold text-slate-200">3. Vision Inspection</div>
            <p className="text-[11px] text-slate-400">Examine Hydrocracker P&ID diagram & tags.</p>
          </div>

          <div
            onClick={() => setActiveTab("agents")}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="text-[10px] font-mono text-cyan-400 font-semibold">STEP 04</div>
            <div className="text-xs font-bold text-slate-200">4. Run Agent</div>
            <p className="text-[11px] text-slate-400">Generate executive management brief.</p>
          </div>

          <div
            onClick={() => setActiveTab("hitl")}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="text-[10px] font-mono text-cyan-400 font-semibold">STEP 05</div>
            <div className="text-xs font-bold text-slate-200">5. Sign & Approve</div>
            <p className="text-[11px] text-slate-400">Human-in-the-loop review & SHA-256 seal.</p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Quick Agents & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Agents */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-cyan-400" />
              Autonomous Industrial Agents
            </h3>
            <button
              onClick={() => setActiveTab("agents")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {[
              {
                id: "agent-inspection",
                name: "Inspection Report Analyzer",
                desc: "Calculates remaining life (RUL) & API 510 compliance.",
              },
              {
                id: "agent-mgmt-brief",
                name: "Management Brief Generator",
                desc: "Synthesizes CAPEX/OPEX impact for C-suite decisions.",
              },
              {
                id: "agent-pid",
                name: "P&ID Analyzer & Tag Reconciler",
                desc: "Cross-checks P&ID valves and transmitters with DCS.",
              },
            ].map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{agent.name}</div>
                  <div className="text-[11px] text-slate-400">{agent.desc}</div>
                </div>
                <button
                  onClick={() => {
                    onRunQuickAgent(agent.id);
                    setActiveTab("agents");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/60 transition-all"
                >
                  Run
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Confidential Ingested Documents */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Confidential Repository
            </h3>
            <button
              onClick={() => setActiveTab("documents")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Manage Docs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[280px]">
                    {doc.filename}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                      {doc.file_type}
                    </span>
                    <span>{doc.page_count} Pages</span>
                    <span>?</span>
                    <span className="text-emerald-400 font-semibold">{doc.classification}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("workbench")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
                >
                  Query
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
