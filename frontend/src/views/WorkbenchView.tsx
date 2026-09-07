import React, { useState } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw
} from "lucide-react";
import { DocumentMetadata, ChatMessage, UserRole } from "../types";

interface WorkbenchViewProps {
  documents: DocumentMetadata[];
  messages: ChatMessage[];
  onSendMessage: (msg: string, selectedDocIds: string[]) => Promise<void>;
  isLoadingChat: boolean;
  userRole: UserRole;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  documents,
  messages,
  onSendMessage,
  isLoadingChat,
  userRole,
}) => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeCitation, setActiveCitation] = useState<any | null>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoadingChat) return;
    const q = inputPrompt;
    setInputPrompt("");
    await onSendMessage(q, selectedDocIds);
  };

  const sampleQuestions = [
    {
      title: "PV-402 Corrosion & Remaining Life",
      query: "What is the ultrasonic measured thickness and calculated remaining life (RUL) for Flash Drum PV-402 per API 510?",
    },
    {
      title: "TG-02 Turbine Vibration Severity",
      query: "Analyze the vibration telemetry for Turbine Generator TG-02. What ISO 10816-3 severity zone does it fall into?",
    },
    {
      title: "P&ID Control Valve FV-102 Analysis",
      query: "Explain the line specifications, fail-safe mode, and upstream transmitter for control valve FV-102 in the P&ID.",
    },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left / Center: Chat Console */}
      <div className="flex-1 flex flex-col h-full bg-[#080b11] border-r border-slate-800">
        {/* Top Workbench Filter Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Context Docs:
            </span>
            <button
              onClick={() => setSelectedDocIds([])}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                selectedDocIds.length === 0
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              All Ingested ({documents.length})
            </button>
            {documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedDocIds(selectedDocIds.filter((id) => id !== doc.id));
                    } else {
                      setSelectedDocIds([...selectedDocIds, doc.id]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs truncate max-w-[180px] font-mono transition-all ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {doc.filename}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30 flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RAG Air-Gapped</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
                <Bot className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Sovereign Industrial AI Workbench</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Query confidential engineering documents, API 510/570 inspection codes, vibration spectra, and P&ID diagrams with zero data egress.
                </p>
              </div>

              {/* Sample Quick Questions */}
              <div className="w-full space-y-2 text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Recommended Industrial Inquiries
                </div>
                {sampleQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputPrompt(sq.query)}
                    className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                      {sq.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{sq.query}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-4xl ${isUser ? "ml-auto" : "mr-auto"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-cyan-950 border border-cyan-500/40 text-cyan-400"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-2.5 max-w-3xl">
                    {/* Role Header */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="font-semibold text-slate-300">
                        {isUser ? userRole : "INDRA Sovereign AI"}
                      </span>
                      <span>?</span>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <>
                          <span>?</span>
                          <span className="text-cyan-400 font-semibold">{msg.model_used}</span>
                          <span>?</span>
                          <span className="text-slate-400">{msg.inference_time_ms}ms</span>
                        </>
                      )}
                    </div>

                    {/* Content Box */}
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white shadow-md font-medium"
                          : "bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl space-y-3"
                      }`}
                    >
                      <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* Source Citations Section */}
                      {!isUser && msg.citations && msg.citations.length > 0 && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-semibold">
                            <span>VERIFIED LOCAL SOURCE CITATIONS ({msg.citations.length})</span>
                            <span className="text-emerald-400">Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.citations.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                onClick={() => setActiveCitation(c)}
                                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1 group"
                              >
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                  <span className="text-cyan-300 font-semibold truncate max-w-[160px]">
                                    {c.document_name}
                                  </span>
                                  <span className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">
                                    P.{c.page}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-300 font-medium line-clamp-2">
                                  {c.snippet}
                                </div>
                                <div className="text-[9px] text-emerald-400 font-mono">
                                  Section: {c.section} ? Match {Math.round(c.relevance_score * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isLoadingChat && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="font-mono">Local Sovereign Model generating industrial RAG response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-slate-800 bg-[#090d16] flex items-center gap-3"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask anything about industrial pressure vessels, API 510, vibration spectra, or P&ID valves..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500/60 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoadingChat}
            className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Query</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Right Drawer: Citation Inspector Modal */}
      {activeCitation && (
        <div className="w-80 bg-slate-950 border-l border-slate-800 p-4 space-y-4 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-mono">
              <FileText className="w-4 h-4" />
              Citation Inspector
            </div>
            <button
              onClick={() => setActiveCitation(null)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ?
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Document</div>
              <div className="text-xs font-semibold text-slate-200">{activeCitation.document_name}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono">PAGE</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">{activeCitation.page}</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono">CONFIDENCE</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {(activeCitation.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Section Reference</div>
              <div className="text-xs font-mono text-cyan-400">{activeCitation.section}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Raw Context Snippet</div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                {activeCitation.snippet}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
