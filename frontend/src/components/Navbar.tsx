import React from "react";
import { Shield, ShieldAlert, Cpu, Sparkles, User, RefreshCw, Activity } from "lucide-react";
import { UserRole } from "../types";

interface NavbarProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onLoadDemo: () => void;
  isLoadingDemo: boolean;
  activeModel: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  setUserRole,
  onLoadDemo,
  isLoadingDemo,
  activeModel,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c101a]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Air-Gap Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 tracking-wider">
            IN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">INDRA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.0 Sovereign
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Sovereign Industrial AI Workbench ? Problem 26117
            </p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden md:block" />

        {/* Dynamic Air-Gapped Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wide">AIR-GAPPED</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-300">0 EXTERNAL EGRESS</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">LOCAL GPU INFERENCE</span>
        </div>
      </div>

      {/* Center Model Status Pill */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
        <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>Model:</span>
        <span className="text-cyan-300 font-medium truncate max-w-[220px]">{activeModel}</span>
      </div>

      {/* Right Actions: Demo Loader & RBAC */}
      <div className="flex items-center gap-3">
        <button
          onClick={onLoadDemo}
          disabled={isLoadingDemo}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20 transition-all border border-cyan-400/30 active:scale-95 disabled:opacity-50"
        >
          {isLoadingDemo ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          )}
          <span className="font-semibold">? Load Demo Workspace</span>
        </button>

        {/* RBAC Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <User className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-medium text-slate-200 outline-none pr-2 py-0.5 cursor-pointer"
          >
            <option value="Lead Plant Engineer" className="bg-slate-900 text-slate-200">
              Lead Plant Engineer
            </option>
            <option value="Admin" className="bg-slate-900 text-slate-200">
              Admin (Full Control)
            </option>
            <option value="Safety Analyst" className="bg-slate-900 text-slate-200">
              Safety Analyst
            </option>
            <option value="Plant Viewer" className="bg-slate-900 text-slate-200">
              Plant Viewer (Read-only)
            </option>
          </select>
        </div>
      </div>
    </header>
  );
};
