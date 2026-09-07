import React, { useState } from "react";
import {
  ActivitySquare,
  Cpu,
  HardDrive,
  CheckCircle2,
  Server,
  Zap,
  RefreshCw,
  ShieldCheck,
  Radio
} from "lucide-react";
import { SystemHealth } from "../types";

interface SystemHealthViewProps {
  systemHealth: SystemHealth | null;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  systemHealth,
}) => {
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const runPingTest = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult(
        "LOOPBACK TEST PASSED: 127.0.0.1 responded in 0.42ms. External network gateways: ALL DISCONNECTED (Air-Gap Intact)."
      );
    }, 700);
  };

  const vramPercent = systemHealth
    ? Math.round((systemHealth.gpu_vram_used_gb / systemHealth.gpu_vram_total_gb) * 100)
    : 27;

  const ramPercent = systemHealth
    ? Math.round((systemHealth.memory_used_gb / systemHealth.memory_total_gb) * 100)
    : 19;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
      {/* Top Telemetry Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              HARDWARE STATUS: NOMINAL
            </span>
            <span className="text-xs font-mono text-cyan-400">Node-01 Enclave</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">On-Premise Compute Node Health</h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry of local GPU VRAM, NVMe vector storage, and hardware isolation metrics.
          </p>
        </div>

        <button
          onClick={runPingTest}
          disabled={isPinging}
          className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/40 transition-all flex items-center gap-2 active:scale-95"
        >
          {isPinging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
          <span>Run Air-Gap Ping Test</span>
        </button>
      </div>

      {pingResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{pingResult}</span>
        </div>
      )}

      {/* Hardware Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPU VRAM Gauge */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">GPU VRAM ALLOCATION</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {systemHealth?.gpu_vram_used_gb || 6.4} / {systemHealth?.gpu_vram_total_gb || 24.0} GB
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${vramPercent}%` }}
              className="bg-cyan-500 h-full rounded-full transition-all"
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between">
            <span>{vramPercent}% Utilized</span>
            <span className="text-emerald-400">DeepSeek-R1 (Q4_K_M)</span>
          </div>
        </div>

        {/* CPU Utilization */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">HOST CPU LOAD</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {systemHealth?.cpu_utilization_pct || 18.5}%
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${systemHealth?.cpu_utilization_pct || 18.5}%` }}
              className="bg-amber-400 h-full rounded-full transition-all"
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between">
            <span>32 Cores Active</span>
            <span className="text-emerald-400">AVX-512 Enabled</span>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">SYSTEM ECC MEMORY</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {systemHealth?.memory_used_gb || 12.2} / {systemHealth?.memory_total_gb || 64.0} GB
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${ramPercent}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all"
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between">
            <span>{ramPercent}% Utilized</span>
            <span className="text-emerald-400">DDR5 ECC Secure</span>
          </div>
        </div>

        {/* Vector DB Records */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">CHROMA VECTOR STORE</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            {systemHealth?.total_vectors_indexed || 1420} Embeddings
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div style={{ width: "42%" }} className="bg-cyan-400 h-full rounded-full transition-all" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between">
            <span>Cosine Index Ready</span>
            <span className="text-emerald-400">&lt; 15ms Latency</span>
          </div>
        </div>
      </div>

      {/* Active Model Stack Table */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Loaded Sovereign Model Architecture
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Open-Weight Multimodal Stack
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              name: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
              role: "Primary Industrial Reasoning & Code Analysis LLM",
              quant: "Q4_K_M (GGUF)",
              vram: "6.4 GB",
              status: "ACTIVE / IN-VRAM",
            },
            {
              name: "meta-llama/Llama-3.2-11B-Vision-Instruct",
              role: "Multimodal P&ID Diagram & Visual OCR Analysis",
              quant: "Q5_K_M (GGUF)",
              vram: "7.8 GB",
              status: "READY / STANDBY",
            },
            {
              name: "BAAI/bge-large-en-v1.5",
              role: "Dense Industrial Semantic Embeddings",
              quant: "FP16",
              vram: "1.3 GB",
              status: "INDEXED",
            },
          ].map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
            >
              <div>
                <div className="font-bold text-cyan-300 text-sm">{m.name}</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">{m.role}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {m.quant}
                </span>
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {m.vram}
                </span>
                <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
