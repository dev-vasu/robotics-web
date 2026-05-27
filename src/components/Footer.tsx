"use client";

import Link from "next/link";
import { Zap, Globe, Share2, Mail, ExternalLink, Check } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="bg-background border-t-4 border-hyper-pink pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 text-[20rem] font-black italic text-foreground/[0.02] -translate-y-1/2 translate-x-1/4 select-none">
        ROBOVIBE
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-10">
              <div className="p-1.5 bg-hyper-pink rounded-full">
                <Zap className="w-8 h-8 text-background fill-current" />
              </div>
              <span className="text-4xl font-black italic tracking-tighter text-foreground uppercase">
                ROBO<span className="text-hyper-pink">VIBE</span>
              </span>
            </Link>
            <p className="text-text-dim text-xl font-bold leading-tight max-w-md mb-10 italic">
              WE BUILD THE TOOLS. YOU BUILD THE FUTURE. WELCOME TO THE ULTIMATE CREATIVE HUB.
            </p>
            <div className="flex gap-6">
              {[Globe, Share2, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="w-14 h-14 bg-foreground/5 flex items-center justify-center hover:bg-hyper-pink hover:text-background transition-all border border-foreground/10">
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-hyper-pink font-black mb-10 uppercase text-xs tracking-[0.4em]">_SYSTEM_MAP</h4>
            <ul className="space-y-6">
              {["PLAYGROUND", "ARCADE", "CANVAS", "COMMS", "FEEDBACK"].map((item) => (
                <li key={item}>
                  <Link href={item === "PLAYGROUND" ? "/playground" : item === "ARCADE" ? "/game" : item === "CANVAS" ? "/playground/canvas" : item === "FEEDBACK" ? "/feedback" : "/contact"} className="text-foreground/60 hover:text-foreground font-black text-lg transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-4 h-1 bg-hyper-pink transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-electric-volt font-black mb-10 uppercase text-xs tracking-[0.4em]">_JOIN_SQUAD</h4>
            <p className="text-text-dim font-bold mb-6 text-sm">DROP YOUR DIGITAL SIGNATURE FOR UPDATES.</p>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="USER@DOMAIN.XYZ" 
                required
                className="w-full bg-foreground/5 border-2 border-foreground/10 p-4 font-black uppercase text-sm focus:outline-none focus:border-electric-volt text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                onClick={handleSubscribe}
                disabled={status === "loading"}
                className={`w-full py-4 font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  status === "success" ? "bg-electric-volt text-background" : 
                  status === "error" ? "bg-red-500 text-foreground" :
                  "bg-hyper-pink text-background hover:bg-foreground disabled:opacity-50"
                }`}
              >
                {status === "loading" ? "UPLOADING..." : 
                 status === "success" ? <><Check className="w-4 h-4" /> SIGNED_UP</> :
                 status === "error" ? "FAIL_RETRY" :
                 "_SUBSCRIBE"}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-foreground/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-foreground/20 text-[10px] font-black tracking-widest uppercase">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL. BUILT_FOR_THE_SQUAD.
          </p>
          <div className="flex gap-12 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
            <a href="#" className="hover:text-hyper-pink transition-colors">PRIVACY_VOID</a>
            <a href="#" className="hover:text-cyber-blue transition-colors">TERMS_OF_CHAOS</a>
            <a href="#" className="hover:text-electric-volt transition-colors">CORE_LOGS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
