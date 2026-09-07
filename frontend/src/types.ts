export type UserRole = "Admin" | "Lead Plant Engineer" | "Safety Analyst" | "Plant Viewer";

export type NavTab = 
  | "dashboard" 
  | "workbench" 
  | "documents" 
  | "vision" 
  | "agents" 
  | "hitl" 
  | "security" 
  | "audit" 
  | "health";

export interface DocumentMetadata {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  page_count: number;
  upload_time: string;
  classification: string;
  sha256_hash: string;
  status: "PROCESSING" | "INDEXED" | "ERROR";
  tags: string[];
  summary?: string;
  chunks_count: number;
}

export interface Citation {
  document_id: string;
  document_name: string;
  page: number;
  section: string;
  snippet: string;
  confidence: number;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations: Citation[];
  confidence: number;
  model_used: string;
  inference_time_ms: number;
  is_air_gapped: boolean;
}

export type VisionDetectionStatus = "AI_DETECTED" | "HUMAN_VERIFIED" | "EDITED";

export interface EquipmentTag {
  id: string;
  tag_id: string;
  equipment_type: string;
  line_number?: string;
  zone: string;
  bbox: number[]; // [ymin, xmin, ymax, xmax] 0-1000
  confidence: number;
  status: VisionDetectionStatus;
  notes?: string;
  verified_by?: string;
  verified_at?: string;
}

export interface PIDAnalysisResult {
  id: string;
  image_name: string;
  image_url: string;
  total_components_detected: number;
  valves_count: number;
  pumps_count: number;
  instruments_count: number;
  vessels_count: number;
  detections: EquipmentTag[];
  hazop_flags: string[];
  line_list_summary: Record<string, any>;
  ai_confidence: number;
  timestamp: string;
}

export interface AgentStep {
  step_number: number;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  timestamp?: string;
  output_summary?: string;
}

export interface AgentExecution {
  id: string;
  agent_id: string;
  agent_name: string;
  document_id?: string;
  document_name?: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "AWAITING_HUMAN_APPROVAL" | "APPROVED" | "REJECTED";
  current_step: number;
  total_steps: number;
  steps: AgentStep[];
  final_output?: string;
  hitl_required: boolean;
  hitl_status: string;
  hitl_signed_by?: string;
  hitl_signature_hash?: string;
  hitl_comments?: string;
  created_at: string;
  completed_at?: string;
}

export interface HITLReviewItem {
  id: string;
  title: string;
  source_type: string;
  source_id: string;
  created_at: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  payload: Record<string, any>;
  reviewer?: string;
  reviewed_at?: string;
  comments?: string;
  digital_signature?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user_role: string;
  action: string;
  resource: string;
  ip_address: string;
  status: string;
  external_egress_bytes: number;
  latency_ms: number;
  data_hash: string;
  details: Record<string, any>;
}

export interface SystemHealth {
  air_gapped: boolean;
  local_inference_only: boolean;
  external_api_calls: number;
  gpu_device: string;
  gpu_vram_used_gb: number;
  gpu_vram_total_gb: number;
  cpu_utilization_pct: number;
  memory_used_gb: number;
  memory_total_gb: number;
  active_local_models: string[];
  vector_store_type: string;
  total_vectors_indexed: number;
  uptime_seconds: number;
}
