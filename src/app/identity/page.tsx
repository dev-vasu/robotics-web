"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Shield, Zap, Star, Trophy, LogOut, Loader2, Fingerprint, Edit3, Check, X, RefreshCcw, MessageSquare, Activity, Palette } from "lucide-react";
import gsap from "gsap";
import NeonChat from "@/components/NeonChat";

type UserData = {
  id: number;
  email: string;
  username: string;
  xp: number;
  level: number;
  unlocked_colors: string[];
  active_accent: string;
};

type SimHistory = {
  id: number;
  game_id: string;
  score: number;
  created_at: string;
};

export default function IdentityPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [history, setHistory] = useState<SimHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [authForm, setAuthForm] = useState({ email: "", username: "" });
  const [isNewUser, setIsNewUser] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  
  const [isEditing, setIsEditing] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [updateStatus, setUpdateStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHistory = async (userId: number) => {
    try {
      const res = await fetch(`/api/identity/history?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) { console.error(e); }
  };

  const syncIdentity = async (userId: number) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/identity/sync?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("robo-user", JSON.stringify(data.user));
        fetchHistory(userId);
      }
    } catch (e) { console.error("Sync Failure:", e); }
    setIsSyncing(false);
    setLoading(false);
  };

  const handleUpdateAccent = async (color: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/identity/accent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, color }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("robo-user", JSON.stringify(data.user));
        // Force global variable update
        document.documentElement.style.setProperty('--hyper-pink', color);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("robo-user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      syncIdentity(parsed.id);
      if (parsed.active_accent) {
        document.documentElement.style.setProperty('--hyper-pink', parsed.active_accent);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/identity/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("robo-user", JSON.stringify(data.user));
        if (data.user.active_accent) {
          document.documentElement.style.setProperty('--hyper-pink', data.user.active_accent);
        }
        fetchHistory(data.user.id);
        setStatus("idle");
      } else {
        if (data.error === "USERNAME_REQUIRED_FOR_INIT") {
          setIsNewUser(true);
          setStatus("idle");
        } else {
          alert(data.error || "AUTH_FAILED");
          setStatus("error");
        }
      }
    } catch (e) {
      setStatus("error");
    }
  };

  const handleUpdateAlias = async () => {
    if (!newAlias || !user) return;
    setUpdateStatus("loading");
    try {
      const res = await fetch("/api/identity/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newUsername: newAlias }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("robo-user", JSON.stringify(data.user));
        setUpdateStatus("success");
        setTimeout(() => {
          setIsEditing(false);
          setUpdateStatus("idle");
        }, 1500);
      } else {
        alert(data.error || "UPDATE_FAILED");
        setUpdateStatus("error");
      }
    } catch (e) {
      setUpdateStatus("error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("robo-user");
    document.documentElement.style.removeProperty('--hyper-pink');
    setUser(null);
    setHistory([]);
    setIsNewUser(false);
    setAuthForm({ email: "", username: "" });
  };

  if (loading) return <div className="min-h-screen bg-background grid-bg flex items-center justify-center"><Loader2 className="w-12 h-12 text-hyper-pink animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 py-20 flex flex-col items-center text-foreground">
        {!user ? (
          <div className="w-full max-w-lg animate-in fade-in zoom-in duration-700">
            <div className="text-center mb-12">
               <Fingerprint className="w-20 h-20 text-hyper-pink mx-auto mb-6 animate-pulse" />
               <h1 className="text-5xl font-black italic uppercase text-foreground tracking-tighter leading-none mb-4">
                 NEURAL_<span className="text-hyper-pink">LINK</span>
               </h1>
               <p className="text-dim font-black uppercase tracking-[0.4em] text-xs">
                 {isNewUser ? "INITIATE_NEW_MEMBER_PROTOCOL" : "RE-ESTABLISH_SESSION_UPLINK"}
               </p>
            </div>

            <form onSubmit={handleAuth} className="glass-panel p-10 border-4 border-foreground/10 bg-background/80 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-hyper-pink shadow-[0_0_20px_#ff007a] animate-scan opacity-0 group-hover:opacity-100" />
               <div className="space-y-8 text-foreground">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2">DIGITAL_NODE (Email)</label>
                    <input 
                      type="email" 
                      placeholder="USER@DOMAIN.COM" 
                      required
                      className="w-full bg-foreground/5 border-2 border-foreground/10 p-4 font-black uppercase text-xl focus:outline-none focus:border-cyber-blue text-foreground transition-all"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    />
                  </div>
                  
                  {isNewUser && (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-hyper-pink mb-2">CHOOSE_SQUAD_ALIAS</label>
                      <input 
                        type="text" 
                        placeholder="X_USERNAME_X" 
                        required
                        className="w-full bg-foreground/5 border-2 border-hyper-pink p-4 font-black uppercase text-xl focus:outline-none text-foreground transition-all"
                        value={authForm.username}
                        onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      />
                    </div>
                  )}

                  <button 
                    disabled={status === "loading"}
                    className="w-full py-6 bg-foreground text-background font-black text-2xl uppercase italic hover:bg-hyper-pink hover:text-foreground transition-all shadow-[12px_12px_0_0_#00f0ff] active:translate-y-1 active:shadow-none"
                  >
                    {status === "loading" ? "SYNCING..." : isNewUser ? "CREATE_IDENTITY" : "RESYNC_UPLINK"}
                  </button>
                  
                  {!isNewUser && (
                    <p className="text-center text-[10px] font-black text-dim uppercase tracking-widest">
                      FIRST TIME? JUST ENTER EMAIL TO START.
                    </p>
                  )}
               </div>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-20 animate-in slide-in-from-bottom-10 duration-700">
            {/* Identity Card */}
            <div className="grid md:grid-cols-3 gap-10">
               <div className="md:col-span-2 glass-panel p-10 border-4 border-hyper-pink/30 bg-background/80 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-8">
                     <Shield className="w-40 h-40 text-foreground/5 -rotate-12" />
                  </div>
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-hyper-pink text-background text-[10px] font-black uppercase">
                           <User className="w-3 h-3" /> SQUAD_MEMBER_ACTIVE
                        </div>
                        <button onClick={() => syncIdentity(user.id)} title="Neural Sync" className={`p-2 bg-foreground/5 border border-foreground/10 rounded hover:bg-hyper-pink hover:text-background transition-all ${isSyncing ? 'animate-spin text-hyper-pink' : 'text-dim'}`}>
                           <RefreshCcw className="w-4 h-4" />
                        </button>
                     </div>

                     {isEditing ? (
                        <div className="mb-6 flex gap-4 items-center animate-in slide-in-from-left-4 duration-300">
                           <input 
                              autoFocus
                              className="bg-foreground/10 border-b-4 border-hyper-pink text-4xl md:text-6xl font-black italic text-foreground uppercase focus:outline-none w-full max-w-lg"
                              value={newAlias}
                              onChange={(e) => setNewAlias(e.target.value)}
                              placeholder={user.username}
                           />
                           <div className="flex gap-2">
                              <button onClick={handleUpdateAlias} className="p-4 bg-electric-volt text-background hover:bg-white transition-all rounded">
                                 {updateStatus === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                              </button>
                              <button onClick={() => setIsEditing(false)} className="p-4 bg-background border border-foreground/20 text-foreground hover:bg-red-500 transition-all rounded">
                                 <X className="w-6 h-6" />
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="group flex items-center gap-6 mb-2">
                           <h2 className="text-6xl md:text-8xl font-black italic text-foreground uppercase tracking-tighter leading-none">
                              {user.username}
                           </h2>
                           <button 
                              onClick={() => { setIsEditing(true); setNewAlias(user.username); }}
                              className="p-3 bg-foreground/5 border border-foreground/10 hover:bg-cyber-blue hover:text-background transition-all rounded opacity-0 group-hover:opacity-100"
                           >
                              <Edit3 className="w-5 h-5" />
                           </button>
                        </div>
                     )}

                     <p className="text-dim font-mono text-sm tracking-widest uppercase mb-10">{user.email}</p>
                     
                     <div className="flex gap-12">
                        <div>
                           <div className="text-[10px] font-black text-dim uppercase tracking-widest mb-1">XP_ACCUMULATED</div>
                           <div className="text-4xl font-black italic text-foreground tabular-nums">{user.xp}</div>
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-dim uppercase tracking-widest mb-1">CURRENT_LEVEL</div>
                           <div className="text-4xl font-black italic text-electric-volt tabular-nums">LVL_{user.level}</div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-foreground/10 flex justify-between items-end">
                     <div className="flex gap-4">
                        {(user.unlocked_colors || ['#ff007a']).map(color => (
                           <button 
                             key={color} 
                             onClick={() => handleUpdateAccent(color)}
                             className={`w-10 h-10 rounded-full border-4 transition-all transform hover:scale-110 ${user.active_accent === color ? 'border-white scale-110' : 'border-foreground/10'}`} 
                             style={{ backgroundColor: color }} 
                           />
                        ))}
                     </div>
                     <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase hover:text-white transition-colors">
                        <LogOut className="w-3 h-3" /> DE-SYNC_PROTOCOL
                     </button>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="glass-panel p-8 border-l-4 border-electric-volt bg-background/80">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-electric-volt rounded-full text-background"><Star className="w-6 h-6" /></div>
                        <div>
                           <h3 className="text-xl font-black italic text-foreground uppercase">NEXT_UNLOCK</h3>
                           <p className="text-[10px] text-dim font-bold uppercase">REACH LVL_{user.level + 1}</p>
                        </div>
                     </div>
                     <div className="w-full h-3 bg-foreground/5 rounded-full overflow-hidden border border-foreground/10">
                        <div className="h-full bg-electric-volt animate-pulse" style={{ width: `${(user.xp % 1000) / 10}%` }} />
                     </div>
                  </div>

                  <div className="glass-panel p-8 border-l-4 border-cyber-blue bg-background/80">
                     <div className="flex items-center gap-4 mb-4 text-cyber-blue">
                        <Palette className="w-8 h-8" />
                        <div>
                           <h3 className="text-xl font-black italic text-foreground uppercase">CUSTOMIZER</h3>
                           <p className="text-[10px] text-dim font-bold uppercase">RE-SKIN PLATFORM</p>
                        </div>
                     </div>
                     <p className="text-[10px] text-foreground/60 font-bold leading-relaxed uppercase">
                        LEVEL UP TO UNLOCK NEW NEON ACCENTS FOR YOUR UI.
                     </p>
                  </div>
               </div>
            </div>

            {/* Live Chat System */}
            <div className="space-y-8">
               <h3 className="text-2xl font-black italic text-foreground uppercase tracking-wider flex items-center gap-4">
                  <MessageSquare className="w-6 h-6 text-cyber-blue" /> GLOBAL_UPLINK
               </h3>
               <NeonChat user={{ id: user.id, username: user.username }} />
            </div>

            {/* Simulation History */}
            <div className="glass-panel p-10 border-4 border-foreground/10 bg-background/80">
               <h3 className="text-2xl font-black italic text-foreground uppercase tracking-wider mb-10 flex items-center gap-4 border-b border-foreground/5 pb-6">
                  <Activity className="w-6 h-6 text-hyper-pink" /> RECENT_SIMULATIONS
               </h3>
               
               {history.length === 0 ? (
                 <div className="text-center py-20 border-2 border-dashed border-foreground/5">
                    <p className="text-dim font-black uppercase tracking-[0.4em] text-xs">NO_DATA_LOGGED_YET</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {history.map(sim => (
                      <div key={sim.id} className="flex items-center justify-between p-6 bg-foreground/5 border-l-4 border-hyper-pink hover:bg-foreground/10 transition-all group">
                         <div className="flex items-center gap-6">
                            <div className="text-[8px] font-black text-dim uppercase vertical-text border-r border-foreground/10 pr-4">LOG_ENTRY</div>
                            <div>
                               <h4 className="text-xl font-black italic text-foreground uppercase group-hover:text-hyper-pink transition-colors">
                                  {sim.game_id.replace("_", " ")}
                               </h4>
                               <p className="text-[10px] text-dim font-mono uppercase">
                                  {new Date(sim.created_at).toLocaleString()}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-[8px] font-black text-dim uppercase mb-1">DATA_YIELD</div>
                            <div className="text-2xl font-black italic text-electric-volt tabular-nums">
                               {sim.score}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
