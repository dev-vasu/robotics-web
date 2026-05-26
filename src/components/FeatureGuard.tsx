"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function FeatureGuard({ featureId, children }: { featureId: string, children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/features?id=${featureId}`)
      .then(res => res.json())
      .then(data => setIsEnabled(data.isEnabled !== false)) // Default true
      .catch(() => setIsEnabled(true));
  }, [featureId]);

  if (isEnabled === null) return <div className="min-h-screen bg-transparent grid-bg" />;

  if (!isEnabled) {
    return (
      <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 overflow-hidden relative">
        <Navbar />
        
        <div className="fixed top-24 left-6 z-40">
          <Link 
            href="/playground" 
            className="flex items-center gap-2 px-4 py-2 bg-black border border-white/10 hover:border-[#ffaa00] hover:text-[#ffaa00] transition-all group glass-panel"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">RETURN_TO_HUB</span>
          </Link>
        </div>

        <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center py-20 relative z-10">
          <div className="glass-panel border-4 border-[#ffaa00]/30 bg-black/90 p-12 max-w-2xl w-full flex flex-col items-center relative overflow-hidden">
             {/* Hazard stripes */}
             <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#ffaa00,#ffaa00_10px,#000_10px,#000_20px)]" />
             <div className="absolute bottom-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#ffaa00,#ffaa00_10px,#000_10px,#000_20px)]" />

             <ShieldAlert className="w-24 h-24 text-[#ffaa00] mb-8 animate-pulse shadow-[0_0_30px_rgba(255,170,0,0.5)] rounded-full bg-black" />
             <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4 leading-none">
               MODULE_<span className="text-[#ffaa00] text-glitch">OFFLINE</span>
             </h1>
             
             <div className="w-full bg-[#ffaa00]/10 border-l-4 border-[#ffaa00] p-6 mb-8 text-left">
                <code className="text-[#ffaa00] text-xs md:text-sm font-bold block mb-2">
                  [ ERROR_CODE: MAINT_0x7749 ]
                </code>
                <p className="text-white/80 font-mono text-xs md:text-sm leading-relaxed">
                  ACCESS DENIED. THIS MODULE IS CURRENTLY UNDER MAINTENANCE. OUR ENGINEERING SQUAD IS RECALIBRATING THE CORE SYSTEMS. 
                </p>
             </div>

             <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] mb-8">
               PLEASE_CHECK_BACK_LATER
             </p>

             <Link href="/playground" className="px-10 py-5 bg-[#ffaa00] text-black font-black text-xl uppercase italic hover:bg-white transition-all shadow-[8px_8px_0_0_rgba(255,255,255,0.2)]">
               RE-ROUTE_CONNECTION
             </Link>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  return <>{children}</>;
}
