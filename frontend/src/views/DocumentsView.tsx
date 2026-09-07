import React, { useState } from "react";
import {
  FileText,
  Upload,
  ShieldCheck,
  Lock,
  HardDrive,
  CheckCircle2,
  FileCode,
  Tag,
  Hash,
  RefreshCw
} from "lucide-react";
import { DocumentMetadata, UserRole } from "../types";

interface DocumentsViewProps {
  documents: DocumentMetadata[];
  onUploadDocument: (file: File, classification: string) => Promise<void>;
  userRole: UserRole;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onUploadDocument,
  userRole,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [classification, setClassification] = useState<string>("CONFIDENTIAL INDUSTRIAL");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(documents[0] || null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    try {
      await onUploadDocument(selectedFile, classification);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#080b11]">
      {/* Left List: Ingested Documents */}
      <div className="w-96 border-r border-slate-800 bg-slate-950 p-4 space-y-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              <FileText className="w-4 h-4" />
              Ingested Documents ({documents.length})
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Air-Gapped
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Confidential plant records parsed and embedded directly in local Chroma vector space.
          </p>
        </div>

        <div className="space-y-2">
          {documents.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
                    {doc.filename}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                    {doc.file_type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{(doc.size_bytes / 1024 / 1024).toFixed(2)} MB ? {doc.page_count}p</span>
                  <span className="text-emerald-400 font-semibold">{doc.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Ingestion Center & Document Detail Inspector */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
        {/* Upload Box */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Sovereign Local Document Ingestion
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Outbound Transmission
            </span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">
                  Select File (PDF, DOCX, PNG, Scanned Blueprints)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">
                  Security Classification
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="CONFIDENTIAL INDUSTRIAL">CONFIDENTIAL INDUSTRIAL</option>
                  <option value="STRICTLY CONFIDENTIAL INDUSTRIAL">STRICTLY CONFIDENTIAL INDUSTRIAL</option>
                  <option value="RESTRICTED ENGINEERING BLUEPRINT">RESTRICTED ENGINEERING BLUEPRINT</option>
                  <option value="CRITICAL INFRASTRUCTURE DEFENSE">CRITICAL INFRASTRUCTURE DEFENSE</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-40"
            >
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Ingest Document to Sovereign Enclave</span>
            </button>
          </form>
        </div>

        {/* Selected Document Details & SHA-256 Cryptographic Fingerprint */}
        {selectedDoc ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase">{selectedDoc.file_type} ARTIFACT</div>
                <h2 className="text-lg font-bold text-white">{selectedDoc.filename}</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40">
                {selectedDoc.classification}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono">FILE SIZE</div>
                <div className="text-sm font-bold text-slate-200 font-mono">
                  {(selectedDoc.size_bytes / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono">PAGE COUNT</div>
                <div className="text-sm font-bold text-slate-200 font-mono">{selectedDoc.page_count}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono">VECTOR CHUNKS</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">{selectedDoc.chunks_count || 18}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono">INGEST STATUS</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">{selectedDoc.status}</div>
              </div>
            </div>

            {/* SHA-256 Hash Integrity Fingerprint */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-semibold">
                <Hash className="w-3.5 h-3.5" />
                <span>SHA-256 DATA INTEGRITY HASH (IMMUTABLE)</span>
              </div>
              <div className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {selectedDoc.sha256_hash}
              </div>
            </div>

            {/* Document Summary */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400 uppercase">Executive Synopsis</div>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                {selectedDoc.summary}
              </div>
            </div>

            {/* Industrial Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedDoc.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
