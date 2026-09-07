import {
  DocumentMetadata,
  ChatMessage,
  PIDAnalysisResult,
  EquipmentTag,
  AgentExecution,
  HITLReviewItem,
  AuditEvent,
  SystemHealth,
  UserRole
} from "./types";

// Vercel / Production API URL dynamic configuration
const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
const API_BASE = rawApiUrl ? `${rawApiUrl}/api` : "/api";

export const api = {
  // Documents
  async listDocuments(): Promise<DocumentMetadata[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    return res.json();
  },

  async uploadDocument(file: File, classification: string, userRole: UserRole): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("classification", classification);
    formData.append("user_role", userRole);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload document");
    return res.json();
  },

  // RAG Chat
  async chat(message: string, documentIds: string[], userRole: UserRole, agentMode?: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/rag/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        document_ids: documentIds,
        user_role: userRole,
        agent_mode: agentMode,
        temperature: 0.15
      }),
    });
    if (!res.ok) throw new Error("Failed to send chat message");
    return res.json();
  },

  // Vision P&ID
  async getPIDAnalysis(pidId: string = "PID-SAMPLE-001"): Promise<PIDAnalysisResult> {
    const res = await fetch(`${API_BASE}/vision/analysis?pid_id=${pidId}`);
    if (!res.ok) throw new Error("Failed to fetch P&ID analysis");
    return res.json();
  },

  async verifyTag(pidId: string, tagId: string, status: string, verifiedBy: string, notes?: string): Promise<EquipmentTag> {
    const res = await fetch(`${API_BASE}/vision/verify-tag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pid_id: pidId,
        tag_id: tagId,
        status,
        verified_by: verifiedBy,
        notes
      }),
    });
    if (!res.ok) throw new Error("Failed to verify equipment tag");
    return res.json();
  },

  // Agents
  async listAgents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/agents`);
    if (!res.ok) throw new Error("Failed to list agents");
    return res.json();
  },

  async listExecutions(): Promise<AgentExecution[]> {
    const res = await fetch(`${API_BASE}/agents/executions`);
    if (!res.ok) throw new Error("Failed to list agent executions");
    return res.json();
  },

  async runAgent(agentId: string, documentId?: string, userRole: UserRole = "Lead Plant Engineer"): Promise<AgentExecution> {
    const res = await fetch(`${API_BASE}/agents/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_id: agentId,
        document_id: documentId,
        user_role: userRole
      }),
    });
    if (!res.ok) throw new Error("Failed to run agent");
    return res.json();
  },

  // HITL Gateway
  async getHITLQueue(status?: string): Promise<HITLReviewItem[]> {
    const url = status ? `${API_BASE}/hitl/queue?status=${status}` : `${API_BASE}/hitl/queue`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch review queue");
    return res.json();
  },

  async approveHITLItem(itemId: string, reviewer: string, comments?: string): Promise<HITLReviewItem> {
    const res = await fetch(`${API_BASE}/hitl/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: itemId,
        reviewer,
        comments
      }),
    });
    if (!res.ok) throw new Error("Failed to approve item");
    return res.json();
  },

  async rejectHITLItem(itemId: string, reviewer: string, comments: string): Promise<HITLReviewItem> {
    const res = await fetch(`${API_BASE}/hitl/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: itemId,
        reviewer,
        comments
      }),
    });
    if (!res.ok) throw new Error("Failed to reject item");
    return res.json();
  },

  // Security & Audit
  async getSecurityStatus(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/security/status`);
    if (!res.ok) throw new Error("Failed to get security status");
    return res.json();
  },

  async getAuditLogs(limit: number = 100): Promise<AuditEvent[]> {
    const res = await fetch(`${API_BASE}/security/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },

  // Demo
  async loadDemoWorkspace(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/load-workspace`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to load demo workspace");
    return res.json();
  },
};
