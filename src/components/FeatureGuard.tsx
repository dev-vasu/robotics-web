"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function FeatureGuard({ featureId, children }: { featureId: string, children: React.ReactNode }) {
  const [status, setStatus] = useState<{ isEnabled: boolean; isGlobal: boolean } | null>(null);

  useEffect(() => {
    fetch(`/api/features?id=${featureId}`)
      .then(res => res.json())
      .then(data => {
        setStatus({
          isEnabled: data.isEnabled !== false,
          isGlobal: !!data.globalMaintenance
        });
      })
      .catch(() => setStatus({ isEnabled: true, isGlobal: false }));
  }, [featureId]);

  if (status === null) return <div className="min-h-screen bg-transparent grid-bg" />;

  if (!status.isEnabled) {
    return (
      <main className="min-h-screen bg-background grid-bg flex flex-col pt-20 overflow-hidden relative">
        <Navbar />
        
        <div className="fixed top-24 left-6 z-40">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 bg-background border border-foreground/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-dim group-hover:text-foreground">RETURN_HOME</span>
          </Link>
        </div>

        <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center py-20 relative z-10">
          <div className="glass-panel border-4 border-[#ffaa00]/30 bg-background/90 p-12 max-w-2xl w-full flex flex-col items-center relative overflow-hidden">
             {/* Hazard stripes */}
             <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#ffaa00,#ffaa00_10px,#000_10px,#000_20px)] opacity-60" />
             <div className="absolute bottom-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#ffaa00,#ffaa00_10px,#000_10px,#000_20px)] opacity-60" />

             {status.isGlobal ? (
               <Lock className="w-24 h-24 text-[#ffaa00] mb-8 animate-bounce shadow-[0_0_30px_rgba(255,170,0,0.5)] rounded-full bg-background" />
             ) : (
               <ShieldAlert className="w-24 h-24 text-[#ffaa00] mb-8 animate-pulse shadow-[0_0_30px_rgba(255,170,0,0.5)] rounded-full bg-background" />
             )}
             
             <h1 className="text-4xl md:text-6xl font-black italic text-foreground uppercase tracking-tighter mb-4 leading-none">
               {status.isGlobal ? "SYSTEM_" : "MODULE_"}<span className="text-[#ffaa00] text-glitch">OFFLINE</span>
             </h1>
             
             <div className="w-full bg-[#ffaa00]/10 border-l-4 border-[#ffaa00] p-6 mb-8 text-left">
                <code className="text-[#ffaa00] text-xs md:text-sm font-bold block mb-2 font-mono">
                  [ STATUS: {status.isGlobal ? "GLOBAL_MAINTENANCE_LOCK" : `RE-CALIBRATING_${featureId.toUpperCase()}`} ]
                </code>
                <p className="text-foreground font-mono text-xs md:text-sm leading-relaxed">
                  {status.isGlobal 
                    ? "THE ENTIRE PLATFORM IS CURRENTLY UNDERGOING A CORE UPGRADE. ALL UPLINKS ARE TEMPORARILY SEVERED."
                    : `THE ${featureId.toUpperCase()} MODULE HAS BEEN TAKEN OFFLINE FOR CALIBRATION. OUR ENGINEERING SQUAD IS ON IT.`
                  }
                </p>
             </div>

             <p className="text-dim font-black uppercase tracking-[0.3em] text-[10px] mb-8">
               ESTIMATED_RECOVERY: T-MINUS_UNKNOWN
             </p>

             <Link href="/" className="px-10 py-5 bg-[#ffaa00] text-background font-black text-xl uppercase italic hover:bg-foreground transition-all shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
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
