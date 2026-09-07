import React from "react";
import { ShieldAlert, Lock, CheckCircle2, Server, Cloud } from "lucide-react";

export const AirGapBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border-b border-emerald-500/20 px-4 py-2 flex flex-wrap items-center justify-between text-xs select-none gap-2">
      <div className="flex items-center gap-2 text-emerald-400 font-mono">
        <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span className="font-bold">SOVEREIGN ARCHITECTURE:</span>
        <span className="text-slate-300 hidden md:inline">
          Production deployment runs entirely inside an organization's air-gapped security perimeter.
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
          <Cloud className="w-3 h-3 text-cyan-400" />
          <span>Evaluation Showcase</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Ext. AI API Calls: <strong className="text-emerald-400">0</strong></span>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-slate-400">
          <span>Compliance: <strong className="text-cyan-400">ISO 27001 / OSHA 1910</strong></span>
        </div>
      </div>
    </div>
  );
};
