"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Send, ShieldAlert, CheckCircle2, ChevronLeft, Database, RefreshCcw } from "lucide-react";

type Record = {
  id: number;
  type: string;
  email: string;
  subject: string;
  content: string;
  created_at: string;
};

export default function AdminHQ() {
  const [passcode, setPasscode] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const handleSelectConversation = (email: string) => {
    setSelectedEmail(email);
    setTo(email);
    const originalMsg = records.find(r => r.email === email && r.type === 'RECEIVED');
    const lastMsg = records.find(r => r.email === email);
    let subj = originalMsg ? originalMsg.subject : lastMsg?.subject || "";
    if (subj && !subj.toUpperCase().startsWith("RE:")) {
      subj = "RE: " + subj;
    }
    setSubject(subj);
  };

  const fetchRecords = async (currentPasscode: string) => {
    setIsLoadingRecords(true);
    try {
      const res = await fetch("/api/hq/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: currentPasscode }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecords(data.records || []);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoadingRecords(false);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(passcode);
  };

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
        fetchRecords(passcode); // Refresh records after sending
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

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black grid-bg flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-md glass-panel border-4 border-cyber-blue/30 bg-black/80 p-8 text-center">
          <Lock className="w-16 h-16 text-cyber-blue mx-auto mb-6" />
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-6">ROBOVIBE_HQ</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password"
              placeholder="ENTER_ADMIN_PASSCODE..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 px-4 py-3 text-center text-white font-mono focus:outline-none focus:border-cyber-blue"
            />
            <button type="submit" className="w-full py-4 bg-cyber-blue text-black font-black uppercase tracking-widest hover:bg-white transition-all">
              {isLoadingRecords ? "AUTHENTICATING..." : "ACCESS_CORE"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20 px-6 pb-20 relative overflow-x-hidden">
      <div className="fixed top-6 left-6 z-40">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 bg-black border border-white/10 hover:border-cyber-blue hover:text-cyber-blue transition-all group glass-panel"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Exit_HQ</span>
        </Link>
      </div>

      <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-10">
        
        {/* Left Column: Transmission Form */}
        <div className="glass-panel border-4 border-cyber-blue/30 bg-black/80 p-8 h-fit">
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="p-3 bg-cyber-blue rounded-full shadow-[0_0_15px_#00f0ff]">
               <Send className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">TRANSMITTER</h2>
              <p className="text-cyber-blue font-black uppercase tracking-[0.4em] text-[10px]">SECURE_UPLINK</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
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
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">SUBJECT</label>
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">DATA_PAYLOAD</label>
              <textarea 
                rows={8}
                placeholder="TYPE YOUR RESPONSE HERE..."
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
              {status === "loading" ? "ENCRYPTING_DATA..." : "TRANSMIT"}
            </button>
          </form>

          {status === "success" && (
            <div className="mt-6 p-4 bg-electric-volt/10 border-l-4 border-electric-volt flex items-center gap-3 text-electric-volt font-black uppercase tracking-widest text-sm">
              <CheckCircle2 className="w-5 h-5" /> TRANSMISSION_DELIVERED
            </div>
          )}
          {status === "error" && (
            <div className="mt-6 p-4 bg-red-500/10 border-l-4 border-red-500 flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-sm">
              <ShieldAlert className="w-5 h-5" /> ERROR: {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Database Logs */}
        <div className="glass-panel border-4 border-hyper-pink/30 bg-black/80 p-8 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-hyper-pink rounded-full shadow-[0_0_15px_#ff007a]">
                 <Database className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">DATA_LOGS</h2>
                <p className="text-hyper-pink font-black uppercase tracking-[0.4em] text-[10px]">NEON_DB_CONNECTION_ACTIVE</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {selectedEmail && (
                <button 
                  onClick={() => { setSelectedEmail(null); setTo(""); setSubject(""); }}
                  className="px-4 py-2 bg-white/10 hover:bg-hyper-pink hover:text-black transition-all text-white rounded text-[10px] font-black tracking-widest uppercase"
                >
                  BACK_TO_LIST
                </button>
              )}
              <button 
                onClick={() => fetchRecords(passcode)}
                className="p-3 bg-white/10 hover:bg-hyper-pink hover:text-black transition-all text-white rounded"
              >
                 <RefreshCcw className={`w-5 h-5 ${isLoadingRecords ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
            {records.length === 0 ? (
               <div className="text-center text-white/30 font-mono text-sm py-10">NO_RECORDS_FOUND_IN_DATABASE</div>
            ) : !selectedEmail ? (
              // Conversation List
              Array.from(new Set(records.map(r => r.email))).map(email => {
                const thread = records.filter(r => r.email === email);
                const latest = thread[0];
                return (
                  <div 
                    key={email} 
                    onClick={() => handleSelectConversation(email)}
                    className="p-4 border-l-4 border-hyper-pink bg-black/50 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black tracking-widest uppercase text-hyper-pink">
                        THREAD // {thread.length} MESSAGES
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {new Date(latest.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mb-1 truncate">{email}</div>
                    <div className="text-xs text-white/60 truncate">{latest.subject}</div>
                  </div>
                );
              })
            ) : (
              // Thread View
              records.filter(r => r.email === selectedEmail).map(record => (
                <div key={record.id} className={`p-4 border-l-4 bg-black/50 ${record.type === 'RECEIVED' ? 'border-electric-volt' : record.type === 'FEEDBACK' ? 'border-[#ffaa00]' : 'border-cyber-blue'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black tracking-widest uppercase ${record.type === 'RECEIVED' ? 'text-electric-volt' : record.type === 'FEEDBACK' ? 'text-[#ffaa00]' : 'text-cyber-blue'}`}>
                      {record.type === 'RECEIVED' ? 'INCOMING_UPLINK' : record.type === 'FEEDBACK' ? 'DIAGNOSTIC_FEEDBACK' : 'OUTGOING_TRANSMISSION'}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {new Date(record.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-white/60 mb-3 truncate border-b border-white/10 pb-2">{record.subject}</div>
                  <div className="text-xs font-mono text-white/80 whitespace-pre-wrap">{record.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
