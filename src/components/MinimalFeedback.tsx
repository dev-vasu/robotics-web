"use client";

import { useState } from "react";
import { MessageSquareWarning, Send, X, CheckCircle2, AlertCircle } from "lucide-react";

export default function MinimalFeedback({ featureName }: { featureName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feature: featureName, feedback }),
      });
      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          setFeedback("");
        }, 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-black border-2 border-[#ffaa00]/50 text-[#ffaa00] hover:bg-[#ffaa00] hover:text-black transition-all group glass-panel shadow-[0_0_15px_rgba(255,170,0,0.2)]"
        >
          <MessageSquareWarning className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">REPORT_BUG</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 bg-black/95 border-2 border-[#ffaa00] p-6 shadow-[0_0_30px_rgba(255,170,0,0.3)] glass-panel relative animate-in slide-in-from-bottom-5">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-[#ffaa00] transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-6">
            <MessageSquareWarning className="w-5 h-5 text-[#ffaa00]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ffaa00] truncate">REPORT // {featureName}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="USER@DOMAIN.XYZ"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-[#ffaa00] transition-colors"
            />
            <textarea
              required
              rows={4}
              placeholder="WHAT'S BROKEN? BE BRUTAL."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-[#ffaa00] resize-none transition-colors"
            />
            <button 
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full py-4 bg-[#ffaa00] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {status === "loading" ? "SENDING..." : 
               status === "success" ? <><CheckCircle2 className="w-4 h-4" /> LOGGED</> : 
               status === "error" ? <><AlertCircle className="w-4 h-4" /> ERROR</> : 
               <><Send className="w-4 h-4" /> SUBMIT</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
