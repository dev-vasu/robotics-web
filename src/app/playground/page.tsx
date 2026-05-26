"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Gamepad2, Palette, Terminal, Music, Zap, Smartphone, Cpu } from "lucide-react";
import { useEffect } from "react";
import gsap from "gsap";

const SECTORS = [
  {
    id: "arcade",
    title: "ARCADE_HUB",
    desc: "11+ High-intensity simulations. Breach the high score.",
    href: "/game",
    icon: Gamepad2,
    color: "hyper-pink",
    tag: "GAMING"
  },
  {
    id: "canvas",
    title: "NEON_CANVAS",
    desc: "Interactive generative art lab. Paint with physics-based light particles.",
    href: "/playground/canvas",
    icon: Palette,
    color: "cyber-blue",
    tag: "CREATIVE"
  },
  {
    id: "beats",
    title: "ROBO_BEATS",
    desc: "Industrial soundscape generator. Create technical rhythms.",
    href: "/playground/beats",
    icon: Music,
    color: "electric-volt",
    tag: "AUDIO"
  },
  {
    id: "terminal",
    title: "DATA_VAULT",
    desc: "Deep-core lore terminal. Unlock hidden robotics intelligence.",
    href: "/playground/terminal",
    icon: Terminal,
    color: "white",
    tag: "INTEL"
  }
];

export default function PlaygroundHub() {
  useEffect(() => {
    gsap.fromTo(".sector-card", 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "expo.out", immediateRender: false }
    );
  }, []);

  return (
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 py-20">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest mb-6">
            <Cpu className="w-3 h-3" />
            Central_Playground_Core
          </div>
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            VIBE_<span className="text-hyper-pink">LABS</span>
          </h1>
          <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-sm mt-4">
            MULTIPLE_CREATIVE_SECTORS_ACTIVE
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {SECTORS.map((sector) => (
            <Link 
              key={sector.id}
              href={sector.href} 
              className={`sector-card group relative block p-1 bg-white/10 hover:bg-white transition-all`}
            >
              <div className="bg-black p-12 h-full relative overflow-hidden">
                <div className={`absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity text-${sector.color}`}>
                  <sector.icon className="w-64 h-64" />
                </div>
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${sector.color} text-black text-[10px] font-black uppercase mb-8`}>
                    <Zap className="w-3 h-3" /> {sector.tag}_ACTIVE
                  </div>
                  
                  <h2 className="text-5xl font-black italic text-white uppercase mb-6 leading-none">
                    {sector.title.split("_")[0]}<br/>
                    <span className={`text-${sector.color}`}>{sector.title.split("_")[1]}</span>
                  </h2>
                  
                  <p className="text-white/40 font-bold mb-10 text-lg leading-relaxed max-w-sm">
                    {sector.desc}
                  </p>
                  
                  <div className={`text-${sector.color} font-black italic tracking-[0.3em] text-xs group-hover:translate-x-4 transition-transform flex items-center gap-2`}>
                    ENTER_SECTOR <span className="text-white">&gt;&gt;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
