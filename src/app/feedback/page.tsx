"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquareWarning, Send, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import FeatureGuard from "@/components/FeatureGuard";

const FEATURES = [
  "GENERAL_WEBSITE",
  "CYBER_STRIKE (Mouse Shooter)",
  "CYBER_BEAT (Keyboard Rhythm)",
  "CYBER_TYPER (Hacking Game)",
  "CYBER_RUN (Infinite Runner)",
  "VOID_PONG (AI Duel)",
  "NEON_SNAKE (Retro Snake)",
  "BIT_CRUSH (Brick Breaker)",
  "DARK_MAZE (Pathfinding)",
  "CYBER_JUMP (Mobile Laser Jump)",
  "CYBER_STACKS (Mobile Tower)",
  "CYBER_DODGE (Hybrid Evasion)",
  "NEON_CANVAS (Art Tool)",
  "ROBO_BEATS (Sequencer)",
  "DATA_VAULT (Lore Terminal)"
];

export default function FeedbackPage() {
  const [formData, setFormData] = useState({ 
    email: "", 
    feature: "GENERAL_WEBSITE", 
    feedback: "",
    type: "FEEDBACK" as "FEEDBACK" | "BUG_REPORT"
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ticketId, setTicketId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setTicketId(data.ticketId || "");
        setStatus("success");
        setFormData({ email: "", feature: "GENERAL_WEBSITE", feedback: "", type: "FEEDBACK" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <FeatureGuard featureId="feedback_portal">
      <main className="min-h-screen pt-32 pb-20 grid-bg flex flex-col">
        <Navbar />
        
        <div className="flex-1 container mx-auto px-6 max-w-4xl">
          <div className="text-left mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#ffaa00] text-background text-[10px] font-black uppercase tracking-widest mb-6">
              <MessageSquareWarning className="w-3 h-3" />
              Vibe_Check_Portal
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic text-foreground uppercase leading-none mb-6">
              UPLINK <br />
              <span className="text-[#ffaa00] text-glitch">
                STATION
              </span>
            </h1>
            <p className="text-dim uppercase tracking-widest font-black text-sm">
              SELECT YOUR TRANSMISSION TYPE AND HELP US OPTIMIZE THE SQUAD EXPERIENCE.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-1 md:p-1 bg-gradient-to-br from-[#ffaa00] via-transparent to-hyper-pink relative group"
          >
            <div className="bg-background p-8 md:p-12 relative overflow-hidden">
              <div className="space-y-10 relative z-10">
                
                {/* Type Selector */}
                <div className="flex gap-4">
                  {["FEEDBACK", "BUG_REPORT"].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type as any })}
                      className={`flex-1 py-4 border-2 font-black italic text-sm transition-all ${formData.type === type ? "bg-foreground text-background border-foreground" : "bg-background text-dim border-foreground/10 hover:border-foreground/40"}`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Custom Gen-Z Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffaa00] mb-2">TARGET_MODULE (Select Game/Feature)</label>
                  
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-background border-b-2 border-foreground/20 pb-4 pt-2 text-xl md:text-2xl font-black uppercase text-foreground cursor-pointer flex justify-between items-center group"
                  >
                    <span className="truncate group-hover:text-[#ffaa00] transition-colors">{formData.feature}</span>
                    <ChevronDown className={`w-6 h-6 text-[#ffaa00] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-background border-2 border-[#ffaa00] max-h-60 overflow-y-auto custom-scrollbar z-50 shadow-[0_10px_30px_rgba(255,170,0,0.2)]">
                      {FEATURES.map(f => (
                        <div 
                          key={f} 
                          onClick={() => { setFormData({ ...formData, feature: f }); setIsDropdownOpen(false); }}
                          className={`px-6 py-4 text-sm md:text-base font-black uppercase cursor-pointer hover:bg-[#ffaa00] hover:text-background transition-all ${formData.feature === f ? "text-[#ffaa00] bg-foreground/5 border-l-4 border-[#ffaa00]" : "text-dim"}`}
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffaa00] mb-2">DIGITAL_ADDRESS (For Contact)</label>
                  <input
                    type="email"
                    placeholder="USER@DOMAIN.COM"
                    required
                    className="w-full bg-transparent border-b-2 border-foreground/20 pb-4 text-2xl font-black uppercase text-foreground focus:outline-none focus:border-[#ffaa00] transition-colors placeholder:text-foreground/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffaa00] mb-2">DIAGNOSTIC_DATA ({formData.type === 'FEEDBACK' ? 'Your Thoughts' : 'Describe the bug'})</label>
                  <textarea
                    placeholder={formData.type === 'FEEDBACK' ? "WHAT'S ON YOUR MIND? SUGGESTIONS? LOVE LETTERS?" : "HOW CAN WE IMPROVE THIS MODULE? FOUND A BUG? BE BRUTAL."}
                    required
                    rows={5}
                    className="w-full bg-transparent border-b-2 border-foreground/20 pb-4 text-xl md:text-2xl font-black uppercase text-foreground focus:outline-none focus:border-[#ffaa00] transition-colors placeholder:text-foreground/20 resize-none"
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="w-full py-8 bg-foreground text-background font-black text-2xl uppercase italic tracking-widest hover:bg-[#ffaa00] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {status === "loading" ? "UPLOADING..." : formData.type === 'FEEDBACK' ? "SEND_VIBE" : "SUBMIT_REPORT"}
                </button>

                {status === "success" && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[#ffaa00] bg-[#ffaa00]/10 p-6 border-l-4 border-[#ffaa00]">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="w-8 h-8" />
                      <span className="font-black uppercase tracking-widest text-lg">
                        {formData.type === 'FEEDBACK' ? "FEEDBACK_LOGGED. GG." : "ISSUE_LOGGED."}
                      </span>
                    </div>
                    {ticketId && (
                      <div className="text-xl font-black italic tracking-tighter bg-background px-4 py-2 border border-[#ffaa00]">
                        TICKET: {ticketId}
                      </div>
                    )}
                  </div>
                )}

                {status === "error" && (
                  <div className="flex items-center gap-4 text-red-500 bg-red-500/10 p-6 border-l-4 border-red-500">
                    <AlertCircle className="w-8 h-8" />
                    <span className="font-black uppercase tracking-widest text-lg">SYSTEM_ERROR. TRY_AGAIN.</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="mt-20">
          <Footer />
        </div>
      </main>
    </FeatureGuard>
  );
}
