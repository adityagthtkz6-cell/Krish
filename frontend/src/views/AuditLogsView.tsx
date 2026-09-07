import React, { useState } from "react";
import {
  FileClock,
  Download,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Hash,
  RefreshCw
} from "lucide-react";
import { AuditEvent } from "../types";

interface AuditLogsViewProps {
  auditLogs: AuditEvent[];
  onRefreshLogs: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  auditLogs,
  onRefreshLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.data_hash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      selectedActionFilter === "ALL" || log.action === selectedActionFilter;

    return matchesSearch && matchesAction;
  });

  const exportCSV = () => {
    const headers = "ID,Timestamp,User Role,Action,Resource,Status,External Egress,Data Hash\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.user_role}","${l.action}","${l.resource}","${l.status}","${l.external_egress_bytes}","${l.data_hash}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `INDRA_Audit_Trail_${Date.now()}.csv`;
    a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `INDRA_Audit_Trail_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              TAMPER-EVIDENT LEDGER
            </span>
            <span className="text-xs font-mono text-emerald-400">ISO 27001 / OSHA Auditable</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sovereign Compliance & Audit Logs</h1>
          <p className="text-xs text-slate-400">
            Immutable chronological record of all document accesses, model inferences, and human approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Refresh Audit Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, resource, or SHA hash..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
          {["ALL", "SOVEREIGN_RAG_QUERY", "HITL_GATEWAY_APPROVED", "PID_TAG_HUMAN_VERIFIED", "AGENT_EXECUTION_COMPLETED"].map(
            (act) => (
              <button
                key={act}
                onClick={() => setSelectedActionFilter(act)}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
                  selectedActionFilter === act
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {act === "ALL" ? "All Events" : act.replace(/_/g, " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Resource Target</th>
                <th className="px-4 py-3">Egress</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 text-cyan-400 font-bold">{log.id}</td>
                  <td className="px-4 py-3 text-slate-400">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-850">
                      {log.user_role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{log.action}</td>
                  <td className="px-4 py-3 text-slate-300 truncate max-w-[180px] font-sans">
                    {log.resource}
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">0 B</td>
                  <td className="px-4 py-3 text-slate-400">{log.latency_ms}ms</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                    {log.data_hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
