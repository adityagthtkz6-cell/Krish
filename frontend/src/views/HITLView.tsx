import React, { useState } from "react";
import {
  CheckCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Lock,
  Stamp,
  User,
  Clock,
  Sparkles
} from "lucide-react";
import { HITLReviewItem, UserRole } from "../types";

interface HITLViewProps {
  items: HITLReviewItem[];
  onApprove: (itemId: string, comments?: string) => Promise<void>;
  onReject: (itemId: string, comments: string) => Promise<void>;
  userRole: UserRole;
}

export const HITLView: React.FC<HITLViewProps> = ({
  items,
  onApprove,
  onReject,
  userRole,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || "");
  const [reviewComments, setReviewComments] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];

  const handleApproveAction = async () => {
    if (!selectedItem || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onApprove(selectedItem.id, reviewComments);
      setReviewComments("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectAction = async () => {
    if (!selectedItem || !rejectReason.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onReject(selectedItem.id, rejectReason);
      setRejectReason("");
      setIsRejecting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#080b11]">
      {/* Left Column: Review Queue List */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 p-4 space-y-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              <CheckCheck className="w-4 h-4" />
              HITL Review Queue
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              {items.filter((i) => i.status === "PENDING").length} PENDING
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Mandatory human verification gateway for all high-risk AI inferences.
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            const isApproved = item.status === "APPROVED";
            const isRejected = item.status === "REJECTED";

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setIsRejecting(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isApproved
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isRejected
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-400 animate-pulse"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                  {item.title}
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>{item.source_type}</span>
                  <span>{item.created_at}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Review & Cryptographic Sign-Off Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
        {selectedItem ? (
          <>
            {/* Review Item Header */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    MANDATORY REVIEW GATEWAY
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {selectedItem.id}</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">{selectedItem.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Source: <strong className="text-slate-200">{selectedItem.source_type}</strong></span>
                  <span>?</span>
                  <span>Created: {selectedItem.created_at}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {selectedItem.status === "APPROVED" ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>DIGITALLY SIGNED & APPROVED</span>
                  </div>
                ) : selectedItem.status === "REJECTED" ? (
                  <div className="px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400 text-xs font-mono font-bold flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>REJECTED BY REVIEWER</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400 text-xs font-mono font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>AWAITING {userRole.toUpperCase()} SIGN-OFF</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Generated Payload Details */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                <span>AI Inferred Content for Verification</span>
                <span className="text-cyan-400">Air-Gapped Payload</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-3 font-sans whitespace-pre-wrap">
                {selectedItem.payload.report_content || JSON.stringify(selectedItem.payload, null, 2)}
              </div>
            </div>

            {/* Cryptographic Digital Stamp upon Approval */}
            {selectedItem.digital_signature && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                  <Stamp className="w-4 h-4" />
                  <span>IMMUTABLE SOVEREIGN CRYPTOGRAPHIC AUDIT STAMP</span>
                </div>
                <div className="font-mono text-xs text-slate-300 break-all bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  {selectedItem.digital_signature}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Signer: <strong>{selectedItem.reviewer}</strong></span>
                  <span>Timestamp: {selectedItem.reviewed_at}</span>
                </div>
              </div>
            )}

            {/* Decision Actions Panel if Pending */}
            {selectedItem.status === "PENDING" && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                    Lead Engineer Verification & Authorization
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Role: {userRole}</span>
                </div>

                {!isRejecting ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Optional engineering sign-off remarks (e.g. Verified with NDT Ultrasonic records per API 510)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500 font-sans"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleApproveAction}
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize & Apply Digital Signature</span>
                      </button>

                      <button
                        onClick={() => setIsRejecting(true)}
                        className="px-6 py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject with Feedback</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-rose-400">
                      Specify reason for rejection or required revisions:
                    </div>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Detail why this report or parameter was rejected..."
                      className="w-full bg-slate-950 border border-rose-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-rose-500"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleRejectAction}
                        disabled={!rejectReason.trim() || isSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all disabled:opacity-40"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setIsRejecting(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            No items pending review in Human-in-the-Loop Gateway.
          </div>
        )}
      </div>
    </div>
  );
};
