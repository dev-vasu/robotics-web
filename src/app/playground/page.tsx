"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Gamepad2, Palette, Terminal, Music, Zap, Smartphone, Cpu, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [features, setFeatures] = useState<any[]>([]);
  const [isSiteOffline, setIsSiteOffline] = useState(false);

  useEffect(() => {
    fetch("/api/features")
      .then(res => res.json())
      .then(data => {
        if (data.features) {
          setFeatures(data.features);
          const global = data.features.find((f: any) => f.id === 'site_wide');
          if (global && !global.is_enabled) setIsSiteOffline(true);
        }
      })
      .catch(console.error);

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
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-foreground text-background text-[10px] font-black uppercase tracking-widest mb-6">
            <Cpu className="w-3 h-3" />
            Central_Playground_Core
          </div>
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            VIBE_<span className="text-hyper-pink">LABS</span>
          </h1>
          <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-sm mt-4">
            MULTIPLE_CREATIVE_SECTORS_ACTIVE
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {SECTORS.map((sector) => {
             const feat = features.find(f => f.id === sector.id);
             const isEnabled = feat ? feat.is_enabled : true;
             const isLocked = !isEnabled || (isSiteOffline && sector.id !== 'hq');

             if (isLocked) {
               return (
                <div key={sector.id} className="sector-card relative p-1 bg-red-500/20 grayscale opacity-80">
                  <div className="bg-background p-12 h-full relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <ShieldAlert className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
                    <h2 className="text-4xl font-black italic text-foreground/40 uppercase mb-4">{sector.title}</h2>
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">OFFLINE_FOR_CALIBRATION</p>
                  </div>
                </div>
               );
             }

             return (
              <Link 
                key={sector.id}
                href={sector.href} 
                className={`sector-card group relative block p-1 bg-foreground/10 hover:bg-foreground transition-all`}
              >
                <div className="bg-background p-12 h-full relative overflow-hidden">
                  <div className={`absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity text-${sector.color}`}>
                    <sector.icon className="w-64 h-64" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${sector.color} text-background text-[10px] font-black uppercase mb-8`}>
                      <Zap className="w-3 h-3" /> {sector.tag}_ACTIVE
                    </div>
                    
                    <h2 className="text-5xl font-black italic text-foreground uppercase mb-6 leading-none">
                      {sector.title.split("_")[0]}<br/>
                      <span className={`text-${sector.color}`}>{sector.title.split("_")[1]}</span>
                    </h2>
                    
                    <p className="text-dim font-bold mb-10 text-lg leading-relaxed max-w-sm">
                      {sector.desc}
                    </p>
                    
                    <div className={`text-${sector.color} font-black italic tracking-[0.3em] text-xs group-hover:translate-x-4 transition-transform flex items-center gap-2`}>
                      ENTER_SECTOR <span className="text-foreground">&gt;&gt;</span>
                    </div>
                  </div>
                </div>
              </Link>
             );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
