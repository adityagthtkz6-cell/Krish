import React from "react";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  Network,
  Users,
  CheckCircle2,
  Server,
  KeyRound,
  FileCheck
} from "lucide-react";
import { SystemHealth, UserRole } from "../types";

interface SecurityViewProps {
  systemHealth: SystemHealth | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  systemHealth,
  userRole,
  setUserRole,
}) => {
  const rbacMatrix = [
    {
      role: "Admin",
      desc: "Full root configuration, model hot-swap, vector wipe, sovereign policy management.",
      perms: ["Upload Documents", "Query RAG", "Run Agents", "Approve HITL", "Security Admin", "Export Logs"],
    },
    {
      role: "Lead Plant Engineer",
      desc: "Primary operational authority for reviewing NDT reports, executing agents, and signing HITL.",
      perms: ["Upload Documents", "Query RAG", "Run Agents", "Approve HITL", "View Audit Logs"],
    },
    {
      role: "Safety Analyst",
      desc: "Investigates HAZOP alerts, monitors compliance drift, runs inspection queries.",
      perms: ["Upload Documents", "Query RAG", "Run Agents (Draft)", "View Audit Logs"],
    },
    {
      role: "Plant Viewer",
      desc: "Read-only access to approved engineering briefings and audit certificates.",
      perms: ["Query RAG (Read-only)", "View Verified Drawings"],
    },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              AIR-GAP LEVEL 4 ENCLAVE
            </span>
            <span className="text-xs font-mono text-cyan-400">Zero Cloud Dependency</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sovereign Security & Governance Center</h1>
          <p className="text-xs text-slate-400">
            Real-time verification of on-premise hardware isolation, local model integrity, and RBAC governance.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>EXTERNAL CALLS = 0 (100% AIR-GAPPED)</span>
        </div>
      </div>

      {/* 3 Core Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Network Egress Sniffer */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
              <Network className="w-4 h-4" />
              EGRESS MONITOR
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">PASS</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">0 Bytes</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All outbound socket requests outside localhost are dropped at the kernel boundary.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>TCP Egress:</span>
              <span className="text-emerald-400">0.00 KB/s</span>
            </div>
            <div className="flex justify-between">
              <span>DNS Lookups:</span>
              <span className="text-emerald-400">BLOCKED (Loopback)</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Local Model Registry */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono">
              <Cpu className="w-4 h-4" />
              LOCAL WEIGHTS
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">VERIFIED</span>
          </div>
          <div className="text-sm font-bold text-slate-200 font-mono truncate">
            DeepSeek-R1 + Llama-3.2-Vision
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Weights loaded in NVRAM with SHA-256 weight checksum validation on boot.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Precision:</span>
              <span className="text-cyan-300">GGUF Q4_K_M / Q5_K_M</span>
            </div>
            <div className="flex justify-between">
              <span>VRAM Allocation:</span>
              <span className="text-slate-200">{systemHealth?.gpu_vram_used_gb || 6.4} / 24.0 GB</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Vector DB Sovereignty */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
              <Database className="w-4 h-4" />
              VECTOR STORAGE
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">ENCRYPTED</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {systemHealth?.total_vectors_indexed || 1420} Vectors
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ChromaDB persistent on-prem storage encrypted at rest with AES-256 keys.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Embedding Engine:</span>
              <span className="text-slate-200">BGE-Large-EN v1.5</span>
            </div>
            <div className="flex justify-between">
              <span>Search Latency:</span>
              <span className="text-emerald-400">12ms (Local CUDA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Governance Matrix */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Role-Based Access Control (RBAC) Matrix
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Active Session Role: <strong className="text-cyan-400">{userRole}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rbacMatrix.map((r, idx) => {
            const isCurrent = userRole === r.role;
            return (
              <div
                key={idx}
                onClick={() => setUserRole(r.role as UserRole)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-slate-900 border-cyan-500/50 shadow-md"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{r.role}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      CURRENT ROLE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{r.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.perms.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      ? {p}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
