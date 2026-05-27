"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Shield, Zap, Star, Trophy, LogOut, Loader2, Fingerprint } from "lucide-react";
import gsap from "gsap";

type UserData = {
  id: number;
  email: string;
  username: string;
  xp: number;
  level: number;
  unlocked_colors: string[];
};

export default function IdentityPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authForm, setAuthForm] = useState({ email: "", username: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const savedUser = localStorage.getItem("robo-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
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
        setStatus("idle");
      } else {
        alert(data.error || "AUTH_FAILED");
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("robo-user");
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-background grid-bg flex items-center justify-center"><Loader2 className="w-12 h-12 text-hyper-pink animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 py-20 flex flex-col items-center">
        {!user ? (
          <div className="w-full max-w-lg animate-in fade-in zoom-in duration-700">
            <div className="text-center mb-12">
               <Fingerprint className="w-20 h-20 text-hyper-pink mx-auto mb-6 animate-pulse" />
               <h1 className="text-5xl font-black italic uppercase text-foreground tracking-tighter leading-none mb-4">
                 NEURAL_<span className="text-hyper-pink">LINK</span>
               </h1>
               <p className="text-dim font-black uppercase tracking-[0.4em] text-xs">
                 ESTABLISH_IDENTITY_FOR_SQUAD_XP
               </p>
            </div>

            <form onSubmit={handleAuth} className="glass-panel p-10 border-4 border-foreground/10 bg-background/80 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-hyper-pink shadow-[0_0_20px_#ff007a] animate-scan opacity-0 group-hover:opacity-100" />
               <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-dim mb-2">SQUAD_ALIAS</label>
                    <input 
                      type="text" 
                      placeholder="X_USERNAME_X" 
                      required
                      className="w-full bg-foreground/5 border-2 border-foreground/10 p-4 font-black uppercase text-xl focus:outline-none focus:border-hyper-pink text-foreground transition-all"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    />
                  </div>
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
                  <button 
                    disabled={status === "loading"}
                    className="w-full py-6 bg-foreground text-background font-black text-2xl uppercase italic hover:bg-hyper-pink hover:text-foreground transition-all shadow-[12px_12px_0_0_#00f0ff] active:translate-y-1 active:shadow-none"
                  >
                    {status === "loading" ? "SYNCING..." : "INITIALIZE_LINK"}
                  </button>
               </div>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-12 animate-in slide-in-from-bottom-10 duration-700">
            {/* Identity Card */}
            <div className="grid md:grid-cols-3 gap-10">
               <div className="md:col-span-2 glass-panel p-10 border-4 border-hyper-pink/30 bg-background/80 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-8">
                     <Shield className="w-40 h-40 text-foreground/5 -rotate-12" />
                  </div>
                  <div className="relative z-10">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-hyper-pink text-background text-[10px] font-black uppercase mb-8">
                        <User className="w-3 h-3" /> SQUAD_MEMBER_ACTIVE
                     </div>
                     <h2 className="text-6xl md:text-8xl font-black italic text-foreground uppercase tracking-tighter leading-none mb-2">
                        {user.username}
                     </h2>
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
                        {user.unlocked_colors.map(color => (
                           <div key={color} className={`w-8 h-8 rounded-full border-2 border-foreground/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ backgroundColor: color === 'hyper-pink' ? '#ff007a' : color }} />
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
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-cyber-blue rounded-full text-background"><Trophy className="w-6 h-6" /></div>
                        <div>
                           <h3 className="text-xl font-black italic text-foreground uppercase">SQUAD_RANK</h3>
                           <p className="text-[10px] text-dim font-bold uppercase">ELITE_PILOT</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-3xl font-black italic text-foreground">
                        # <span className="text-cyber-blue">248</span> / 1.2k
                     </div>
                  </div>
               </div>
            </div>

            {/* Simulation History Placeholder */}
            <div className="glass-panel p-10 border-4 border-foreground/10 bg-background/80">
               <h3 className="text-2xl font-black italic text-foreground uppercase tracking-wider mb-8 flex items-center gap-4">
                  <Zap className="w-6 h-6 text-hyper-pink" /> RECENT_SIMULATIONS
               </h3>
               <div className="text-center py-20 border-2 border-dashed border-foreground/5">
                  <p className="text-dim font-black uppercase tracking-[0.4em] text-xs">NO_DATA_LOGGED_YET</p>
               </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
