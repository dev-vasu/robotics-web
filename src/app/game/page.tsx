"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Crosshair, ShieldAlert, Gamepad2, Zap, Terminal, Music } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const GAMES = [
  {
    id: "strike",
    title: "CYBER_STRIKE",
    desc: "Twin-stick combat simulation. Target rogue AI cores and eliminate the threat.",
    href: "/game/strike",
    icon: Crosshair,
    color: "electric-volt",
    tag: "HIGH_OCTANE"
  },
  {
    id: "beat",
    title: "CYBER_BEAT",
    desc: "Rhythm survival. Sync your inputs with the data stream. Keys: A,S,D,F.",
    href: "/game/beat",
    icon: Music,
    color: "cyber-blue",
    tag: "RHYTHM_SYNC"
  },
  {
    id: "typer",
    title: "CYBER_TYPER",
    desc: "Keyboard hacking simulation. Decrypt protocols at high velocity.",
    href: "/game/typer",
    icon: Terminal,
    color: "white",
    tag: "KEYBOARD_ONLY"
  },
  {
    id: "dodge",
    title: "CYBER_DODGE",
    desc: "Evasion protocol enabled. Dodge the pink void for as long as your systems hold.",
    href: "/game/dodge",
    icon: ShieldAlert,
    color: "hyper-pink",
    tag: "SURVIVAL"
  }
];

export default function ArcadeHub() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Explicitly define From and To states to ensure elements stay visible
    const ctx = gsap.context(() => {
      gsap.fromTo(".arcade-card", 
        { 
          y: 100, 
          opacity: 0,
          scale: 0.9 
        }, 
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 1, 
          stagger: 0.1, 
          ease: "power4.out",
          immediateRender: false 
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-20" ref={containerRef}>
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            ARCADE_<span className="text-hyper-pink">HUB</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-sm mt-4">
            SELECT_YOUR_SIMULATION_ [VER_4.0_EXPANDED]
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1400px]">
          {GAMES.map((game) => (
            <Link 
              key={game.id}
              href={game.href} 
              className={`arcade-card group relative block p-1 bg-gradient-to-br from-${game.color} to-transparent hover:from-white hover:to-${game.color} transition-all`}
            >
              <div className="bg-black p-10 h-full relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${game.color}`}>
                  <game.icon className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${game.color} text-black text-[10px] font-black uppercase mb-6`}>
                    <Zap className="w-3 h-3" /> {game.tag}
                  </div>
                  <h2 className="text-4xl font-black italic text-white uppercase mb-4">
                    {game.title.split("_")[0]}_<span className={`text-${game.color}`}>{game.title.split("_")[1]}</span>
                  </h2>
                  <p className="text-white/40 font-bold mb-8 text-sm leading-relaxed">
                    {game.desc}
                  </p>
                  <div className={`text-${game.color} font-black italic tracking-widest text-xs group-hover:translate-x-4 transition-transform`}>
                    INITIALIZE_LINK_ &gt;&gt;
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
