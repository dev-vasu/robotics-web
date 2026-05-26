"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Send, ShieldAlert, CheckCircle2, ChevronLeft } from "lucide-react";

export default function AdminHQ() {
  const [passcode, setPasscode] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || !to || !subject || !message) {
      setErrorMsg("ALL_FIELDS_REQUIRED");
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/hq/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, to, subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setTo("");
        setSubject("");
        setMessage("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setErrorMsg(data.error || "TRANSMISSION_FAILED");
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("NETWORK_FAILURE");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-6 left-6 z-40">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 bg-black border border-white/10 hover:border-cyber-blue hover:text-cyber-blue transition-all group glass-panel"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Exit_HQ</span>
        </Link>
      </div>

      <div className="w-full max-w-3xl glass-panel border-4 border-cyber-blue/30 bg-black/80 relative z-10 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="p-3 bg-cyber-blue rounded-full shadow-[0_0_15px_#00f0ff]">
             <Lock className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">ROBOVIBE_HQ</h1>
            <p className="text-cyber-blue font-black uppercase tracking-[0.4em] text-[10px]">SECURE_TRANSMISSION_UPLINK</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">AUTH_PASSCODE</label>
            <input 
              type="password"
              placeholder="ENTER_SECRET_KEY..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">TARGET_NODE (Client Email)</label>
              <input 
                type="email"
                placeholder="CLIENT@DOMAIN.COM"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-cyber-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">TRANSMISSION_SUBJECT</label>
              <input 
                type="text"
                placeholder="RE: YOUR INQUIRY"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-cyber-blue transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">DATA_PAYLOAD (Your Message)</label>
            <textarea 
              rows={8}
              placeholder="TYPE YOUR RESPONSE HERE... (It will be automatically wrapped in the Cyber-Vapor HTML template)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-cyber-blue transition-colors resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={status === "loading"}
            className="w-full py-5 bg-cyber-blue text-black font-black text-xl uppercase italic hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {status === "loading" ? "ENCRYPTING_DATA..." : <><Send className="w-6 h-6" /> TRANSMIT_TO_CLIENT</>}
          </button>
        </form>

        {status === "success" && (
          <div className="mt-6 p-4 bg-electric-volt/10 border-l-4 border-electric-volt flex items-center gap-3 text-electric-volt font-black uppercase tracking-widest text-sm">
            <CheckCircle2 className="w-5 h-5" /> TRANSMISSION_DELIVERED_SUCCESSFULLY
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 p-4 bg-red-500/10 border-l-4 border-red-500 flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-sm">
            <ShieldAlert className="w-5 h-5" /> ERROR: {errorMsg}
          </div>
        )}
      </div>
    </main>
  );
}
