"use client";

import FeatureGuard from "@/components/FeatureGuard";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft, Terminal, ShieldAlert, Cpu, Eye } from "lucide-react";

const LORE_DATABASE = {
  "HELP": "AVAILABLE_COMMANDS: [HELP, DECRYPT_CORE, SYSTEM_LOG, LORE, EXIT]",
  "LORE": "ROBOVIBE_ORIGIN: IN 2024, THE FIRST NEURAL LINK WAS ESTABLISHED. THE PLAYGROUND WAS BUILT TO TEST HUMAN_CREATIVE_LIMITS.",
  "SYSTEM_LOG": "LOG_ENTRY_7749: [STATUS_OK] // [UPTIME_MAX] // [VIBE_STABLE]. ALL SYSTEMS OPERATIONAL.",
  "DECRYPT_CORE": "DECRYPTING... [||||||||||] 100%. SECRET_FOUND: 'THE_SQUAD_NEVER_SLEEPS'.",
  "EXIT": "EXIT_PROTOCOL_DENIED. STAY_IN_THE_VIBE."
};

export default function DataVault() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "ROBOVIBE_OS [VERSION 10.0.4-GENZ]",
    "(C) 2026 ROBOVIBE SYSTEMS GLOBAL",
    "",
    "TYPE 'HELP' TO INITIALIZE_LINK..."
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    const cmd = input.toUpperCase().trim();
    const response = LORE_DATABASE[cmd as keyof typeof LORE_DATABASE] || `ERROR: COMMAND_NOT_FOUND: ${cmd}`;

    setHistory(prev => [...prev, `> ${cmd}`, response, ""]);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <FeatureGuard featureId="terminal">
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 overflow-hidden">
      <Navbar />
      
      <div className="fixed top-24 left-6 z-40 flex flex-col gap-4">
        <Link 
          href="/playground" 
          className="flex items-center gap-2 px-4 py-2 bg-background border border-foreground/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Exit_to_Lab</span>
        </Link>
      </div>

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10 relative">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-8xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            DATA_<span className="text-cyber-blue">VAULT</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            DEEP_CORE_INTELLIGENCE_TERMINAL
          </p>
        </div>

        <div className="w-full max-w-4xl glass-panel border-4 border-foreground/5 bg-background/60 relative overflow-hidden flex flex-col" style={{ height: 500 }}>
          {/* Terminal Scanline */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-foreground/5 to-transparent h-20 w-full animate-scan z-10" />
          
          <div className="flex-1 p-8 overflow-y-auto font-mono text-sm md:text-lg custom-scrollbar">
            {history.map((line, i) => (
              <div key={i} className={line.startsWith(">") ? "text-cyber-blue" : "text-foreground/80"}>
                {line}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleCommand} className="p-6 border-t border-foreground/10 bg-background/80 relative z-20">
            <div className="flex items-center gap-4">
               <span className="text-cyber-blue font-black tracking-widest">&gt;</span>
               <input 
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="INPUT_COMMAND_..."
                className="flex-1 bg-transparent border-none text-foreground focus:outline-none uppercase font-black placeholder:text-foreground/10"
               />
            </div>
          </form>
        </div>

        <div className="mt-8 flex gap-6 w-full max-w-4xl">
           <div className="flex-1 glass-panel p-6 border-l-4 border-cyber-blue flex items-center gap-4">
              <ShieldAlert className="w-8 h-8 text-cyber-blue" />
              <div>
                 <div className="text-[10px] font-black text-dim uppercase tracking-widest">ENCRYPTION</div>
                 <div className="text-xl font-black italic text-foreground">SHA-512_SECURE</div>
              </div>
           </div>
           <div className="flex-1 glass-panel p-6 border-l-4 border-hyper-pink flex items-center gap-4">
              <Eye className="w-8 h-8 text-hyper-pink" />
              <div>
                 <div className="text-[10px] font-black text-dim uppercase tracking-widest">ACCESS_LEVEL</div>
                 <div className="text-xl font-black italic text-foreground">OVERSEER_ADMIN</div>
              </div>
           </div>
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}