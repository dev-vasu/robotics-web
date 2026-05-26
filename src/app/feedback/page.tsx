"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquareWarning, Send, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";

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
  const [formData, setFormData] = useState({ email: "", feature: "GENERAL_WEBSITE", feedback: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
        setStatus("success");
        setFormData({ email: "", feature: "GENERAL_WEBSITE", feedback: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 grid-bg flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-6 max-w-4xl">
        <div className="text-left mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#ffaa00] text-black text-[10px] font-black uppercase tracking-widest mb-6">
            <MessageSquareWarning className="w-3 h-3" />
            Vibe_Check_Portal
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase leading-none mb-6">
            RATE THE <br />
            <span className="text-[#ffaa00] text-glitch">
              EXPERIENCE
            </span>
          </h1>
          <p className="text-white/40 uppercase tracking-widest font-black text-sm">
            TELL US WHAT IS BROKEN, WHAT GOES HARD, AND WHAT WE SHOULD BUILD NEXT.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-1 md:p-1 bg-gradient-to-br from-[#ffaa00] via-transparent to-hyper-pink relative group"
        >
          <div className="bg-black p-8 md:p-12 relative overflow-hidden">
            <div className="space-y-10 relative z-10">
              
              {/* Custom Gen-Z Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffaa00] mb-2">TARGET_MODULE (Select Game/Feature)</label>
                
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-black border-b-2 border-white/20 pb-4 pt-2 text-xl md:text-2xl font-black uppercase text-white cursor-pointer flex justify-between items-center group"
                >
                  <span className="truncate group-hover:text-[#ffaa00] transition-colors">{formData.feature}</span>
                  <ChevronDown className={`w-6 h-6 text-[#ffaa00] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-black border-2 border-[#ffaa00] max-h-60 overflow-y-auto custom-scrollbar z-50 shadow-[0_10px_30px_rgba(255,170,0,0.2)]">
                    {FEATURES.map(f => (
                      <div 
                        key={f} 
                        onClick={() => { setFormData({ ...formData, feature: f }); setIsDropdownOpen(false); }}
                        className={`px-6 py-4 text-sm md:text-base font-black uppercase cursor-pointer hover:bg-[#ffaa00] hover:text-black transition-all ${formData.feature === f ? "text-[#ffaa00] bg-white/5 border-l-4 border-[#ffaa00]" : "text-white/60"}`}
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffaa00] mb-2">DIGITAL_ADDRESS (For Auto-Reply)</label>
                <input
                  type="email"
                  placeholder="USER@DOMAIN.COM"
                  required
                  className="w-full bg-transparent border-b-2 border-white/20 pb-4 text-2xl font-black uppercase text-white focus:outline-none focus:border-[#ffaa00] transition-colors placeholder:text-white/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffaa00] mb-2">DIAGNOSTIC_DATA (Your Feedback)</label>
                <textarea
                  placeholder="HOW CAN WE IMPROVE THIS MODULE? FOUND A BUG? BE BRUTAL."
                  required
                  rows={5}
                  className="w-full bg-transparent border-b-2 border-white/20 pb-4 text-xl md:text-2xl font-black uppercase text-white focus:outline-none focus:border-[#ffaa00] transition-colors placeholder:text-white/20 resize-none"
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full py-8 bg-white text-black font-black text-2xl uppercase italic tracking-widest hover:bg-[#ffaa00] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {status === "loading" ? "UPLOADING_DIAGNOSTICS..." : "SUBMIT_FEEDBACK"}
              </button>

              {status === "success" && (
                <div className="flex items-center gap-4 text-[#ffaa00] bg-[#ffaa00]/10 p-6 border-l-4 border-[#ffaa00]">
                  <CheckCircle2 className="w-8 h-8" />
                  <span className="font-black uppercase tracking-widest text-lg">FEEDBACK_LOGGED. THANKS FOR THE INTEL.</span>
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
  );
}
