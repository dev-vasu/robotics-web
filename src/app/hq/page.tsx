"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Lock, Send, ShieldAlert, CheckCircle2, ChevronLeft, Database, RefreshCcw, Radio, Users, Download, Mail, Settings, Trophy, Sparkles } from "lucide-react";
import gsap from "gsap";

type Record = {
  id: number;
  type: string;
  email: string;
  subject: string;
  content: string;
  created_at: string;
};

const SECTORS = [
  { id: "COMMUNICATIONS", label: "COMM_SECTOR", icon: Mail, sub: ["ALL", "QUERIES", "FEEDBACK", "TICKETS", "SQUAD"] },
  { id: "SYSTEMS", label: "SYSTEM_SECTOR", icon: Settings, sub: ["MAINTENANCE", "LEADERBOARDS"] },
  { id: "ALERTS", label: "BROADCAST_SECTOR", icon: Radio, sub: ["GLOBAL_ALERT"] }
];

const EMAIL_TEMPLATES = [
  { id: "WELCOME", label: "WELCOME", subj: "WELCOME_TO_THE_SQUAD // ACCESS_GRANTED", msg: "AYO! WELCOME TO THE INNER CIRCLE. YOUR VIBE-CHECK PASSED. PREPARE FOR EXCLUSIVE DATA DROPS AND ABSOLUTE CHAOS. NO CAP." },
  { id: "BUG_FIX", label: "FIXED", subj: "RE: SYSTEM_UPDATE // ISSUE_NEUTRALIZED", msg: "DIAGNOSTICS COMPLETE. THAT BUG YOU REPORTED? GONE. NUKED. DELETED. WE'RE COOKING NOW. THANKS FOR THE INTEL, GOAT." },
  { id: "SUPPORT", label: "SUPPORT", subj: "RE: SUPPORT_REQUEST // UPLINK_STABLE", msg: "WE HEAR YOU. OUR ENGINEERING SQUAD IS ON IT FR FR. STAY VIBEY WHILE WE RECALIBRATE YOUR CORE. WE'LL HIT YOU UP SHORTLY." }
];

const BROADCAST_TEMPLATES = [
  { label: "MAINTENANCE", msg: "⚠️ SYSTEM RELOAD IN PROGRESS. DON'T PANIC. JUST ADDING MORE RIZZ TO THE CORE. BACK IN 2 HOURS. STAY HYDRATED." },
  { label: "NEW_GAME", msg: "🚀 NEW SIMULATION DETECTED! A NEW GAME JUST DROPPED IN THE ARCADE. IT GOES HARD. BOOT IT NOW." },
  { label: "SQUAD", msg: "🔥 THE SQUAD IS ABSOLUTELY BLOWING UP. 100+ NEW NODES CONNECTED TODAY. WE ARE LITERALLY GLOBAL NOW." }
];

export default function AdminHQ() {
  const [passcode, setPasscode] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [records, setRecords] = useState<Record[]>([]);
  const [leaderboardScores, setLeaderboardScores] = useState<any[]>([]);
  const [features, setFeatures] = useState<{ id: string; is_enabled: boolean }[]>([]);
  const [activeBroadcast, setActiveBroadcast] = useState("");
  
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  
  const [activeSector, setActiveSector] = useState("COMMUNICATIONS");
  const [activeTab, setActiveTab] = useState("ALL");

  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      gsap.fromTo(".hq-panel", 
        { scale: 0.9, opacity: 0, rotateY: 20 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 1.2, ease: "expo.out", stagger: 0.2, immediateRender: false }
      );
    }
  }, [isAuthenticated]);

  const filteredRecords = records.filter(r => {
    const isNewsletter = r.type === "NEWSLETTER" || r.subject === "New Newsletter Subscription";
    if (activeTab === "ALL") return true;
    if (activeTab === "FEEDBACK") return r.type === "FEEDBACK";
    if (activeTab === "TICKETS") return r.type === "TICKET";
    if (activeTab === "SQUAD") return isNewsletter;
    if (activeTab === "QUERIES") return !isNewsletter && r.type !== "FEEDBACK" && r.type !== "TICKET" && (r.type === "RECEIVED" || r.type === "SENT");
    return true;
  });

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
    gsap.fromTo(".thread-view", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
  };

  const fetchRecords = async (currentPasscode: string) => {
    setIsLoadingRecords(true);
    try {
      const [resMsg, resLeader, resFeatures, resBroadcast] = await Promise.all([
        fetch("/api/hq/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: currentPasscode }) }),
        fetch("/api/hq/leaderboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: currentPasscode }) }),
        fetch("/api/hq/features", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: currentPasscode }) }),
        fetch(`/api/hq/broadcast?passcode=${currentPasscode}`)
      ]);

      if (resMsg.ok && resLeader.ok && resFeatures.ok && resBroadcast.ok) {
        const [dataMsg, dataLeader, dataFeatures, dataBroadcast] = await Promise.all([
          resMsg.json(), resLeader.json(), resFeatures.json(), resBroadcast.json()
        ]);
        setRecords(dataMsg.records || []);
        setLeaderboardScores(dataLeader.scores || []);
        setFeatures(dataFeatures.features || []);
        setActiveBroadcast(dataBroadcast.broadcast || "");
        setIsAuthenticated(true);
      } else { setIsAuthenticated(false); }
    } catch (error) { console.error(error); }
    setIsLoadingRecords(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || !to || !subject || !message) { setErrorMsg("FIELDS_REQUIRED"); setStatus("error"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/hq/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode, to, subject, message }) });
      if (res.ok) {
        setStatus("success"); setTo(""); setSubject(""); setMessage(""); fetchRecords(passcode);
        gsap.to(pulseRef.current, { scale: 1.5, opacity: 0, duration: 0.8, onComplete: () => gsap.set(pulseRef.current, { scale: 1, opacity: 1 }) });
        setTimeout(() => setStatus("idle"), 5000);
      } else { const d = await res.json(); setErrorMsg(d.error || "FAILED"); setStatus("error"); }
    } catch (error) { setErrorMsg("NETWORK_ERROR"); setStatus("error"); }
  };

  const handleToggleFeature = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch("/api/hq/features", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode, id, isEnabled: !currentState }) });
      if (res.ok) fetchRecords(passcode);
    } catch (error) { console.error(error); }
  };

  const handleDeleteScore = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch("/api/hq/leaderboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode, id }) });
      if (res.ok) fetchRecords(passcode);
    } catch (error) { console.error(error); }
  };

  const handleUpdateBroadcast = async () => {
    try {
      const res = await fetch("/api/hq/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode, content: activeBroadcast }) });
      if (res.ok) { alert("Broadcast Updated"); fetchRecords(passcode); }
    } catch (error) { console.error(error); }
  };

  const handleSquadBlast = async () => {
    if (!confirm("Send blast to ALL members?")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/hq/squad-blast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode, subject, message }) });
      if (res.ok) { setStatus("success"); fetchRecords(passcode); }
      else { setStatus("error"); setErrorMsg("BLAST_FAILED"); }
    } catch (error) { setStatus("error"); }
  };

  const handleExportData = () => {
    const data = { messages: records, scores: leaderboardScores, features };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ROBOVIBE_BACKUP_${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-transparent grid-bg flex flex-col items-center justify-center p-6 relative">
        <DataStreamBackground />
        <div className="w-full max-w-md glass-panel border-4 border-cyber-blue/30 bg-background/90 p-8 text-center relative z-10">
          <Lock className="w-16 h-16 text-cyber-blue mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-black italic text-foreground uppercase tracking-tighter mb-6">ROBOVIBE_HQ</h1>
          <form onSubmit={(e) => { e.preventDefault(); fetchRecords(passcode); }} className="space-y-4">
            <input type="password" placeholder="ENTER_ADMIN_PASSCODE..." value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full bg-foreground/5 border-2 border-foreground/10 px-4 py-3 text-center text-foreground font-mono focus:outline-none focus:border-hyper-pink" />
            <button type="submit" className="w-full py-4 bg-hyper-pink text-background font-black uppercase tracking-widest hover:bg-foreground transition-all shadow-[8px_8px_0_0_#00f0ff]">{isLoadingRecords ? "AUTHENTICATING..." : "ACCESS_CORE"}</button>
          </form>
        </div>
      </main>
    );
  }

  const squadCount = Array.from(new Set(records.filter(r => r.type === "NEWSLETTER").map(r => r.email))).length;

  return (
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 px-6 pb-20 relative overflow-x-hidden" ref={containerRef}>
      <DataStreamBackground />
      <div ref={pulseRef} className="fixed inset-0 pointer-events-none z-[100] border-[20px] border-cyber-blue opacity-0" />

      <div className="fixed top-6 left-6 z-40">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-background border border-foreground/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel"><ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /><span className="text-[10px] font-black uppercase tracking-widest text-dim group-hover:text-foreground">Exit_HQ</span></Link>
      </div>

      <div className="container mx-auto max-w-[1600px] flex flex-col gap-10 relative z-10">
        <div className="flex flex-wrap gap-4 border-b-4 border-foreground/5 pb-8">
           {SECTORS.map(s => (
             <button key={s.id} onClick={() => { setActiveSector(s.id); setActiveTab(s.sub[0]); setSelectedEmail(null); }} className={`flex items-center gap-4 px-8 py-5 border-2 transition-all group ${activeSector === s.id ? "bg-foreground text-background border-foreground shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-background/80 text-dim border-foreground/10 hover:border-hyper-pink hover:text-foreground"}`}><s.icon className={`w-6 h-6 transition-transform group-hover:scale-125 ${activeSector === s.id ? "text-hyper-pink" : ""}`} /><span className="text-xl font-black italic uppercase tracking-tighter">{s.label}</span></button>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 flex flex-col gap-10 hq-panel">
            <div className="glass-panel border-4 border-cyber-blue/30 bg-background/80 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue/40 shadow-[0_0_10px_#00f0ff] animate-scan opacity-0 group-hover:opacity-100" />
              <div className="flex items-center justify-between mb-8 border-b border-foreground/10 pb-6">
                <div className="flex items-center gap-4"><div className="p-3 bg-cyber-blue rounded-full"><Send className="w-6 h-6 text-background" /></div><div><h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none">TRANSMITTER</h2><p className="text-cyber-blue font-black uppercase tracking-[0.4em] text-[10px] mt-1">SECURE_UPLINK</p></div></div>
                {activeTab === "SQUAD" && <button onClick={handleSquadBlast} className="px-4 py-2 bg-[#ccff00] text-background font-black text-[10px] uppercase tracking-widest hover:bg-foreground transition-all shadow-[4px_4px_0_0_#ff007a]">SQUAD_BLAST</button>}
              </div>
              <form onSubmit={handleSend} className="space-y-6">
                <div className="space-y-4">
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2">TARGET_NODE</label><input type="email" placeholder="CLIENT@DOMAIN.COM" value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-foreground/5 border-2 border-foreground/10 px-4 py-3 text-foreground font-mono focus:outline-none focus:border-cyber-blue transition-colors" /></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2">SUBJECT</label><input type="text" placeholder="RE: YOUR INQUIRY" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-foreground/5 border-2 border-foreground/10 px-4 py-3 text-foreground font-mono focus:outline-none focus:border-cyber-blue transition-colors" /></div>
                  <div>
                    <div className="flex justify-between items-center mb-2"><label className="block text-[10px] font-black uppercase tracking-widest text-dim">DATA_PAYLOAD</label><div className="flex gap-2">{EMAIL_TEMPLATES.map(temp => (
                      <button key={temp.id} type="button" onClick={() => { setMessage(temp.msg); setSubject(temp.subj); }} className="text-[8px] font-black border border-foreground/10 px-2 py-1 hover:bg-hyper-pink hover:text-foreground transition-all uppercase rounded-sm bg-foreground/5">{temp.label}</button>
                    ))}</div></div>
                    <textarea rows={6} placeholder="TYPE RESPONSE..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-foreground/5 border-2 border-foreground/10 px-4 py-3 text-foreground font-mono focus:outline-none focus:border-cyber-blue transition-colors resize-none" />
                  </div>
                </div>
                <button type="submit" disabled={status === "loading"} className="w-full py-6 bg-cyber-blue text-background font-black text-xl uppercase italic hover:bg-foreground transition-all shadow-[10px_10px_0_0_#ff007a] disabled:opacity-50">{status === "loading" ? "ENCRYPTING..." : "TRANSMIT_SIGNAL"}</button>
              </form>
            </div>
            <div className="grid grid-cols-2 gap-4 hq-panel">
               <div className="glass-panel p-6 border-l-4 border-cyber-blue bg-background/80 flex flex-col justify-between"><div className="text-[10px] font-black text-dim uppercase mb-2 flex items-center gap-2"><Users className="w-3 h-3" /> SQUAD</div><div className="text-4xl font-black italic text-foreground animate-pulse">{squadCount}</div></div>
               <button onClick={handleExportData} className="glass-panel p-6 border-l-4 border-[#ffaa00] bg-background/80 hover:bg-foreground/5 transition-all text-left flex flex-col justify-between group"><div className="text-[10px] font-black text-dim uppercase mb-2">BACKUP</div><div className="flex items-center gap-2 text-2xl font-black italic text-[#ffaa00] group-hover:translate-x-2 transition-transform"><Download className="w-5 h-5" /> EXPORT</div></button>
            </div>
          </div>

          <div className="lg:col-span-8 glass-panel border-4 border-hyper-pink/30 bg-background/80 p-8 flex flex-col hq-panel" style={{ height: "800px" }}>
            <div className="flex items-center justify-between mb-8 border-b border-foreground/10 pb-6 shrink-0">
              <div className="flex items-center gap-4"><div className="p-3 bg-hyper-pink rounded-full shadow-[0_0_15px_#ff007a] animate-pulse"><Database className="w-6 h-6 text-background" /></div><div><h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none">{activeSector}</h2><p className="text-hyper-pink font-black uppercase tracking-[0.4em] text-[10px] mt-1">CORE_INTELLIGENCE_ACTIVE</p></div></div>
              <div className="flex items-center gap-4">{selectedEmail && <button onClick={() => { setSelectedEmail(null); setTo(""); setSubject(""); }} className="px-6 py-3 bg-foreground/5 border border-foreground/10 hover:bg-hyper-pink hover:text-background transition-all text-foreground rounded text-[10px] font-black tracking-widest uppercase shadow-[4px_4px_0_0_white]">CLOSE_THREAD</button>}<button onClick={() => fetchRecords(passcode)} className="p-4 bg-foreground/5 border border-foreground/10 hover:bg-hyper-pink hover:text-background transition-all text-foreground rounded"><RefreshCcw className={`w-6 h-6 ${isLoadingRecords ? "animate-spin" : ""}`} /></button></div>
            </div>

            {!selectedEmail && (
              <div className="flex gap-4 mb-8 bg-foreground/5 p-3 border border-foreground/10 rounded-xl shrink-0 overflow-x-auto">
                {SECTORS.find(s => s.id === activeSector)?.sub.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 px-6 text-[10px] font-black tracking-[0.2em] uppercase transition-all rounded-lg whitespace-nowrap ${activeTab === tab ? "bg-hyper-pink text-background shadow-[0_0_20px_#ff007a]" : "text-foreground/30 hover:bg-foreground/10 hover:text-foreground"}`}>{tab.replace('_', ' ')}</button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              {activeTab === "GLOBAL_ALERT" ? (
                <div className="p-10 space-y-8 animate-in fade-in zoom-in duration-500"><div className="flex items-center justify-between mb-4 border-b border-hyper-pink/20 pb-4"><div className="flex items-center gap-4 text-hyper-pink"><Radio className="w-12 h-12 animate-pulse" /><h3 className="text-5xl font-black italic uppercase tracking-tighter">LIVE_BROADCAST</h3></div><div className="flex gap-2">{BROADCAST_TEMPLATES.map(bt => (<button key={bt.label} onClick={() => setActiveBroadcast(bt.msg)} className="text-[8px] font-black border border-foreground/10 px-3 py-1.5 hover:bg-hyper-pink hover:text-background transition-all uppercase bg-foreground/5 rounded-sm">{bt.label}</button>))}</div></div><div className="space-y-6"><textarea value={activeBroadcast} onChange={(e) => setActiveBroadcast(e.target.value)} placeholder="ENTER_GLOBAL_MESSAGE..." className="w-full bg-background border-2 border-foreground/10 p-8 text-2xl text-foreground font-mono focus:border-hyper-pink focus:outline-none h-60 placeholder:text-foreground/5" /><button onClick={handleUpdateBroadcast} className="w-full py-8 bg-hyper-pink text-background font-black text-3xl uppercase italic hover:bg-foreground transition-all shadow-[15px_15px_0_0_white] active:translate-y-1 active:shadow-none">ACTIVATE_GLOBAL_UPLINK</button></div></div>
              ) : activeTab === "MAINTENANCE" ? (
                <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-5 duration-500">{["strike", "beat", "typer", "run", "pong", "snake", "brick", "stacks", "maze", "dodge", "jump", "canvas", "beats", "terminal"].map(id => {
                  const feat = features.find(f => f.id === id); const isEnabled = feat ? feat.is_enabled : true;
                  return ( <div key={id} className="flex items-center justify-between p-8 bg-background/50 border-2 border-foreground/5 hover:border-hyper-pink transition-all group relative overflow-hidden"><div className="absolute top-0 left-0 w-1 h-full bg-foreground/10 group-hover:bg-hyper-pink transition-colors" /><div><div className="text-[8px] font-black text-foreground/30 uppercase mb-1">MODULE_ID</div><div className="text-2xl font-black italic text-foreground uppercase group-hover:text-hyper-pink transition-colors">{id}</div></div><button onClick={() => handleToggleFeature(id, isEnabled)} className={`px-8 py-3 font-black uppercase italic transition-all shadow-[5px_5px_0_0_black] hover:shadow-none active:translate-x-1 active:translate-y-1 ${isEnabled ? "bg-electric-volt text-background" : "bg-red-500 text-foreground"}`}>{isEnabled ? "ACTIVE" : "OFFLINE"}</button></div> );
                })}</div>
              ) : activeTab === "LEADERBOARDS" ? (
                <div className="space-y-12 animate-in fade-in zoom-in duration-500">{Array.from(new Set(leaderboardScores.map(s => s.game_id))).map(gameId => (<div key={gameId} className="space-y-4"><div className="flex items-center gap-3 border-b border-cyber-blue/30 pb-3"><Trophy className="w-6 h-6 text-cyber-blue" /><h3 className="text-2xl font-black italic text-foreground uppercase tracking-wider">{gameId}</h3></div><table className="w-full text-left border-collapse"><thead><tr className="border-b border-foreground/10 text-[10px] uppercase text-dim"><th className="pb-3 px-6 font-black">ALIAS_ID</th><th className="pb-3 px-6 font-black">DATA_POINTS</th><th className="pb-3 px-6 font-black text-right">ACTION</th></tr></thead><tbody>{leaderboardScores.filter(s => s.game_id === gameId).map(s => (<tr key={s.id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-all"><td className="py-4 px-6 font-black text-foreground text-lg tracking-widest">{s.initials}</td><td className="py-4 px-6 font-black italic text-electric-volt text-2xl tabular-nums">{s.score}</td><td className="py-4 px-6 text-right"><button onClick={() => handleDeleteScore(s.id)} className="p-2 text-red-500 hover:bg-red-500 hover:text-foreground transition-all rounded border border-transparent hover:border-foreground/20"><ShieldAlert className="w-6 h-6" /></button></td></tr>))}</tbody></table></div>))}{leaderboardScores.length === 0 && <div className="text-center text-foreground/20 font-black uppercase tracking-[0.5em] py-20 italic">NO_SIMULATION_DATA_DETECTED</div>}</div>
              ) : !selectedEmail ? (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-500"><table className="w-full text-left border-collapse"><thead><tr className="border-b-2 border-foreground/10 text-[10px] uppercase text-dim"><th className="pb-3 px-6">CATEGORY</th><th className="pb-3 px-6">PARTNER_NODE</th><th className="pb-3 px-6 text-right">TIMESTAMP</th></tr></thead><tbody>{Array.from(new Set(filteredRecords.map(r => r.email))).map(email => {
                  const thread = filteredRecords.filter(r => r.email === email); const latest = thread[0]; let c = "text-hyper-pink"; let l = "MIXED";
                  if (thread.every(t => t.type === "NEWSLETTER")) { c = "text-[#ccff00]"; l = "SQUAD"; }
                  else if (thread.every(t => t.type === "FEEDBACK")) { c = "text-cyber-blue"; l = "FEEDBACK"; }
                  else if (thread.every(t => t.type === "TICKET")) { c = "text-[#ffaa00]"; l = "TICKET"; }
                  else if (thread.some(t => t.type === "RECEIVED")) { c = "text-electric-volt"; l = "QUERY"; }
                  return (<tr key={email} onClick={() => handleSelectConversation(email)} className="border-b border-foreground/5 hover:bg-foreground/10 transition-all cursor-pointer group"><td className="py-5 px-6 whitespace-nowrap"><span className={`inline-flex items-center px-3 py-1 bg-${c.replace('text-', '')}/10 border border-${c.replace('text-', '')}/30 ${c} text-[10px] font-black tracking-widest uppercase rounded-sm`}>{l} <span className="text-dim ml-2">[{thread.length}]</span></span></td><td className="py-5 px-6 font-bold text-foreground text-base group-hover:text-hyper-pink transition-colors">{email}</td><td className="py-5 px-6 text-[10px] text-dim font-mono text-right whitespace-nowrap uppercase">{new Date(latest.created_at).toLocaleString()}</td></tr>);
                })}</tbody></table></div>
              ) : (
                <div className="space-y-8 thread-view pb-10">{filteredRecords.filter(r => r.email === selectedEmail).map(r => (
                  <div key={r.id} className={`p-8 border-l-8 bg-background/60 relative overflow-hidden group ${r.type === 'RECEIVED' ? 'border-electric-volt shadow-[0_0_20px_rgba(204,255,0,0.05)]' : r.type === 'FEEDBACK' ? 'border-cyber-blue' : r.type === 'TICKET' ? 'border-[#ffaa00]' : r.type === 'NEWSLETTER' ? 'border-[#ccff00]' : 'border-cyber-blue shadow-[0_0_20px_rgba(0,240,255,0.05)]'}`}><div className="flex justify-between items-start mb-6"><span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-foreground/5 border border-foreground/10 ${r.type === 'RECEIVED' ? 'text-electric-volt' : r.type === 'FEEDBACK' ? 'text-cyber-blue' : r.type === 'TICKET' ? 'text-[#ffaa00]' : r.type === 'NEWSLETTER' ? 'text-[#ccff00]' : 'text-cyber-blue'}`}>{r.type === 'RECEIVED' ? 'INCOMING_UPLINK' : r.type === 'FEEDBACK' ? 'DIAGNOSTIC_DATA' : r.type === 'TICKET' ? 'SUPPORT_TICKET' : r.type === 'NEWSLETTER' ? 'SQUAD_INIT' : 'OUTGOING_SIGNAL'}</span><span className="text-[10px] text-foreground/30 font-mono uppercase italic">{new Date(r.created_at).toLocaleString()}</span></div><div className="text-lg font-black text-foreground mb-3 italic tracking-tighter">{r.subject}</div><div className="text-base font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed border-t border-foreground/5 pt-4">{r.content}</div></div>
                ))}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DataStreamBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-5 overflow-hidden">
      <div className="absolute inset-0 bg-background opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,122,0.05),transparent_80%)] animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        {mounted && Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute text-[10px] font-mono text-hyper-pink whitespace-pre leading-none animate-data-fall" 
            style={{ 
              left: `${i * 3.33}%`, 
              animationDelay: `${Math.random() * 8}s`, 
              animationDuration: `${8 + Math.random() * 15}s` 
            }}
          >
            {Array.from({ length: 60 }).map(() => Math.round(Math.random())).join('\n')}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes data-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(1200%); opacity: 0; }
        }
        .animate-data-fall { animation: data-fall linear infinite; }
      `}</style>
    </div>
  );
}
