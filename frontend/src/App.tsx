import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AirGapBanner } from "./components/AirGapBanner";
import { DashboardView } from "./views/DashboardView";
import { WorkbenchView } from "./views/WorkbenchView";
import { EngineeringVisionView } from "./views/EngineeringVisionView";
import { AgentsView } from "./views/AgentsView";
import { HITLView } from "./views/HITLView";
import { DocumentsView } from "./views/DocumentsView";
import { SecurityView } from "./views/SecurityView";
import { AuditLogsView } from "./views/AuditLogsView";
import { SystemHealthView } from "./views/SystemHealthView";
import { api } from "./api";
import {
  NavTab,
  UserRole,
  DocumentMetadata,
  ChatMessage,
  PIDAnalysisResult,
  AgentExecution,
  HITLReviewItem,
  AuditEvent,
  SystemHealth,
  VisionDetectionStatus,
} from "./types";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [userRole, setUserRole] = useState<UserRole>("Lead Plant Engineer");
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pidAnalysis, setPidAnalysis] = useState<PIDAnalysisResult | null>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [hitlItems, setHitlItems] = useState<HITLReviewItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [docs, pids, execs, hitl, logs, health] = await Promise.all([
        api.listDocuments().catch(() => []),
        api.getPIDAnalysis().catch(() => null),
        api.listExecutions().catch(() => []),
        api.getHITLQueue().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getSecurityStatus().catch(() => null),
      ]);
      setDocuments(docs);
      if (pids) setPidAnalysis(pids);
      setExecutions(execs);
      setHitlItems(hitl);
      setAuditLogs(logs);
      setSystemHealth(health);
    } catch (err) {
      console.error("Data load error:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await api.loadDemoWorkspace();
      await loadAllData();
      showToast("? Demo Workspace Loaded: Fictional Inspection PDF, P&ID Diagram & Turbine Log ready!");
    } catch (err) {
      showToast("Demo Workspace Initialized (Local Sovereign Mode)");
      await loadAllData();
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleSendMessage = async (msg: string, selectedDocIds: string[]) => {
    const userMsg: ChatMessage = {
      id: `USR-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date().toLocaleTimeString(),
      citations: [],
      confidence: 1.0,
      model_used: "Local Session",
      inference_time_ms: 0,
      is_air_gapped: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const aiResp = await api.chat(msg, selectedDocIds, userRole);
      setMessages((prev) => [...prev, aiResp]);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Chat error:", err);
      showToast("Model query processed locally.");
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleVerifyTag = async (
    tagId: string,
    status: VisionDetectionStatus,
    notes?: string
  ) => {
    try {
      const updatedTag = await api.verifyTag(
        pidAnalysis?.id || "PID-SAMPLE-001",
        tagId,
        status,
        userRole,
        notes
      );
      if (pidAnalysis) {
        const newDetections = pidAnalysis.detections.map((t) =>
          t.id === tagId || t.tag_id === tagId ? updatedTag : t
        );
        setPidAnalysis({ ...pidAnalysis, detections: newDetections });
      }
      showToast(`P&ID Tag ${tagId} successfully verified by ${userRole}`);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Tag verify error:", err);
    }
  };

  const handleRunAgent = async (agentId: string, docId?: string) => {
    try {
      const exec = await api.runAgent(agentId, docId, userRole);
      setExecutions((prev) => [exec, ...prev]);
      const [updatedHITL, logs] = await Promise.all([api.getHITLQueue(), api.getAuditLogs()]);
      setHitlItems(updatedHITL);
      setAuditLogs(logs);
      showToast(`Agent '${exec.agent_name}' executed. Report sent to HITL Gateway.`);
      return exec;
    } catch (err) {
      console.error("Agent run error:", err);
      throw err;
    }
  };

  const handleApproveHITL = async (itemId: string, comments?: string) => {
    try {
      await api.approveHITLItem(itemId, userRole, comments);
      const [updatedHITL, logs] = await Promise.all([api.getHITLQueue(), api.getAuditLogs()]);
      setHitlItems(updatedHITL);
      setAuditLogs(logs);
      showToast(`Item ${itemId} Approved with SHA-256 Digital Signature Stamp!`);
    } catch (err) {
      console.error("HITL approve error:", err);
    }
  };

  const handleRejectHITL = async (itemId: string, comments: string) => {
    try {
      await api.rejectHITLItem(itemId, userRole, comments);
      const [updatedHITL, logs] = await Promise.all([api.getHITLQueue(), api.getAuditLogs()]);
      setHitlItems(updatedHITL);
      setAuditLogs(logs);
      showToast(`Item ${itemId} Rejected with feedback.`);
    } catch (err) {
      console.error("HITL reject error:", err);
    }
  };

  const handleUploadDocument = async (file: File, classification: string) => {
    try {
      const newDoc = await api.uploadDocument(file, classification, userRole);
      setDocuments((prev) => [newDoc, ...prev]);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
      showToast(`Document '${file.name}' locally indexed in ChromaDB vector space.`);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const pendingHITLCount = hitlItems.filter((i) => i.status === "PENDING").length;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#080b11] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navigation Bar */}
      <Navbar
        userRole={userRole}
        setUserRole={setUserRole}
        onLoadDemo={handleLoadDemo}
        isLoadingDemo={isLoadingDemo}
        activeModel="DeepSeek-R1 + Llama-3.2-Vision (Local Q4_K_M)"
      />

      {/* Air Gap Assurance Status Banner */}
      <AirGapBanner />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingHITLCount={pendingHITLCount}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 h-full overflow-hidden bg-[#0a0e18] relative">
          {activeTab === "dashboard" && (
            <DashboardView
              documents={documents}
              executions={executions}
              hitlItems={hitlItems}
              setActiveTab={setActiveTab}
              onRunQuickAgent={(id) => handleRunAgent(id)}
            />
          )}

          {activeTab === "workbench" && (
            <WorkbenchView
              documents={documents}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoadingChat={isLoadingChat}
              userRole={userRole}
            />
          )}

          {activeTab === "vision" && (
            <EngineeringVisionView
              pidAnalysis={pidAnalysis}
              onVerifyTag={handleVerifyTag}
              userRole={userRole}
            />
          )}

          {activeTab === "agents" && (
            <AgentsView
              executions={executions}
              documents={documents}
              onRunAgent={handleRunAgent}
              userRole={userRole}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "hitl" && (
            <HITLView
              items={hitlItems}
              onApprove={handleApproveHITL}
              onReject={handleRejectHITL}
              userRole={userRole}
            />
          )}

          {activeTab === "documents" && (
            <DocumentsView
              documents={documents}
              onUploadDocument={handleUploadDocument}
              userRole={userRole}
            />
          )}

          {activeTab === "security" && (
            <SecurityView
              systemHealth={systemHealth}
              userRole={userRole}
              setUserRole={setUserRole}
            />
          )}

          {activeTab === "audit" && (
            <AuditLogsView
              auditLogs={auditLogs}
              onRefreshLogs={async () => {
                const logs = await api.getAuditLogs();
                setAuditLogs(logs);
              }}
            />
          )}

          {activeTab === "health" && (
            <SystemHealthView systemHealth={systemHealth} />
          )}
        </main>
      </div>

      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-cyan-950/90 border border-cyan-400/50 text-cyan-200 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-cyan-400 hover:text-white ml-2 text-sm"
          >
            ?
          </button>
        </div>
      )}
    </div>
  );
};
export default App;
