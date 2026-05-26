"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Crosshair, ShieldAlert, Gamepad2, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ArcadeHub() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(".arcade-card", {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "expo.out"
    });
  }, []);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            ARCADE_<span className="text-hyper-pink">HUB</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-sm mt-4">
            SELECT_YOUR_SIMULATION_ [VER_3.0_STABLE]
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {/* Cyber Strike Card */}
          <Link href="/game/strike" className="arcade-card group relative block p-1 bg-gradient-to-br from-electric-volt to-transparent hover:from-white hover:to-electric-volt transition-all">
            <div className="bg-black p-10 h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Crosshair className="w-40 h-40 text-electric-volt" />
               </div>
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-electric-volt text-black text-[10px] font-black uppercase mb-6">
                    <Zap className="w-3 h-3" /> HIGH_OCTANE
                 </div>
                 <h2 className="text-4xl font-black italic text-white uppercase mb-4">CYBER_<span className="text-electric-volt">STRIKE</span></h2>
                 <p className="text-white/40 font-bold mb-8 text-sm">Twin-stick combat simulation. Target rogue AI cores and eliminate the threat.</p>
                 <div className="text-electric-volt font-black italic tracking-widest text-xs group-hover:translate-x-4 transition-transform">
                   INITIATE_STRIKE_ &gt;&gt;
                 </div>
               </div>
            </div>
          </Link>

          {/* Cyber Typer Card */}
          <Link href="/game/typer" className="arcade-card group relative block p-1 bg-gradient-to-br from-cyber-blue to-transparent hover:from-white hover:to-cyber-blue transition-all">
            <div className="bg-black p-10 h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Gamepad2 className="w-40 h-40 text-cyber-blue" />
               </div>
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-blue text-black text-[10px] font-black uppercase mb-6">
                    <Zap className="w-3 h-3" /> KEYBOARD_ONLY
                 </div>
                 <h2 className="text-4xl font-black italic text-white uppercase mb-4">CYBER_<span className="text-cyber-blue">TYPER</span></h2>
                 <p className="text-white/40 font-bold mb-8 text-sm">Keyboard hacking simulation. Decrypt protocols at high velocity.</p>
                 <div className="text-cyber-blue font-black italic tracking-widest text-xs group-hover:translate-x-4 transition-transform">
                   START_BREACH_ &gt;&gt;
                 </div>
               </div>
            </div>
          </Link>

          {/* Cyber Dodge Card */}
          <Link href="/game/dodge" className="arcade-card group relative block p-1 bg-gradient-to-br from-hyper-pink to-transparent hover:from-white hover:to-hyper-pink transition-all">
            <div className="bg-black p-10 h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <ShieldAlert className="w-40 h-40 text-hyper-pink" />
               </div>
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-hyper-pink text-black text-[10px] font-black uppercase mb-6">
                    <Gamepad2 className="w-3 h-3" /> SURVIVAL
                 </div>
                 <h2 className="text-4xl font-black italic text-white uppercase mb-4">CYBER_<span className="text-hyper-pink">DODGE</span></h2>
                 <p className="text-white/40 font-bold mb-8 text-sm">Evasion protocol enabled. Dodge the pink void for as long as your systems hold.</p>
                 <div className="text-hyper-pink font-black italic tracking-widest text-xs group-hover:translate-x-4 transition-transform">
                   INITIALIZE_EVASION_ &gt;&gt;
                 </div>
               </div>
            </div>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
