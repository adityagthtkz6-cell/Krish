import React from "react";
import {
  LayoutDashboard,
  BotMessageSquare,
  Files,
  Eye,
  Workflow,
  CheckCheck,
  ShieldCheck,
  FileClock,
  ActivitySquare
} from "lucide-react";
import { NavTab } from "../types";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingHITLCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingHITLCount,
}) => {
  const navItems = [
    { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "workbench" as NavTab, label: "AI Workbench", icon: BotMessageSquare },
    { id: "documents" as NavTab, label: "Documents", icon: Files },
    { id: "vision" as NavTab, label: "Engineering Vision", icon: Eye },
    { id: "agents" as NavTab, label: "Agents Studio", icon: Workflow },
    {
      id: "hitl" as NavTab,
      label: "Human in the Loop",
      icon: CheckCheck,
      badge: pendingHITLCount > 0 ? pendingHITLCount : undefined,
    },
    { id: "security" as NavTab, label: "Security Center", icon: ShieldCheck },
    { id: "audit" as NavTab, label: "Audit Logs", icon: FileClock },
    { id: "health" as NavTab, label: "System Health", icon: ActivitySquare },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#090d16] flex flex-col justify-between flex-shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-semibold"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sovereign Footprint Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono">Security Level</span>
            <span className="text-emerald-400 font-semibold font-mono">AIR-GAP L4</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono">Data Egress</span>
            <span className="text-slate-200 font-mono">0 Bytes / 0 APIs</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
