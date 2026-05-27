"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Crosshair, ShieldAlert, Gamepad2, Zap, Terminal, Music, Smartphone, MousePointer2, Move, Ghost, Target, Eye, Layers } from "lucide-react";
import { useEffect, useRef } from "react";

const CATEGORIES = [
  {
    title: "MOBILE_READY",
    icon: Smartphone,
    color: "text-cyber-blue",
    games: [
      {
        id: "jump",
        title: "CYBER_JUMP",
        desc: "One-tap survival. Jump over high-velocity laser beams.",
        href: "/game/jump",
        icon: Zap,
        color: "bg-cyber-blue",
        text: "text-cyber-blue",
        tag: "MOBILE_ONLY"
      },
      {
        id: "stacks",
        title: "CYBER_STACKS",
        desc: "Precision timing. Build the highest tower in the void.",
        href: "/game/stacks",
        icon: Layers,
        color: "bg-hyper-pink",
        text: "text-hyper-pink",
        tag: "TOUCH_READY"
      },
      {
        id: "dodge",
        title: "CYBER_DODGE",
        desc: "Evasion protocol. Dodge the void using touch or mouse.",
        href: "/game/dodge",
        icon: ShieldAlert,
        color: "bg-electric-volt",
        text: "text-electric-volt",
        tag: "HYBRID_TOUCH"
      }
    ]
  },
  {
    title: "PC_MASTER_RACE",
    icon: MousePointer2,
    color: "text-electric-volt",
    games: [
      {
        id: "strike",
        title: "CYBER_STRIKE",
        desc: "Twin-stick combat. Eliminate rogue AI cores via mouse.",
        href: "/game/strike",
        icon: Crosshair,
        color: "bg-electric-volt",
        text: "text-electric-volt",
        tag: "MOUSE_REQUIRED"
      },
      {
        id: "beat",
        title: "CYBER_BEAT",
        desc: "Rhythm survival. Sync inputs with data streams (A,S,D,F).",
        href: "/game/beat",
        icon: Music,
        color: "bg-cyber-blue",
        text: "text-cyber-blue",
        tag: "KEYBOARD_SYNC"
      },
      {
        id: "typer",
        title: "CYBER_TYPER",
        desc: "Hacking simulation. Decrypt protocols at high velocity.",
        href: "/game/typer",
        icon: Terminal,
        color: "bg-white",
        text: "text-white",
        tag: "KEYBOARD_ONLY"
      },
      {
        id: "run",
        title: "CYBER_RUN",
        desc: "Infinite speed. Leap over firewalls in the matrix.",
        href: "/game/run",
        icon: Move,
        color: "bg-hyper-pink",
        text: "text-hyper-pink",
        tag: "SPACE_BAR"
      },
      {
        id: "pong",
        title: "VOID_PONG",
        desc: "Glow combat. Outplay the rogue AI in a duel of light.",
        href: "/game/pong",
        icon: Target,
        color: "bg-electric-volt",
        text: "text-electric-volt",
        tag: "MOUSE_ONLY"
      },
      {
        id: "snake",
        title: "NEON_SNAKE",
        desc: "Growth hack. Consume data packets to expand your link.",
        href: "/game/snake",
        icon: Ghost,
        color: "bg-cyber-blue",
        text: "text-cyber-blue",
        tag: "ARROWS_ONLY"
      },
      {
        id: "brick",
        title: "BIT_CRUSH",
        desc: "Deconstruction mode. Shatter the walls of the mainframe.",
        href: "/game/brick",
        icon: Target,
        color: "bg-white",
        text: "text-white",
        tag: "MOUSE_PLAY"
      },
      {
        id: "maze",
        title: "DARK_MAZE",
        desc: "Pathfinding protocol. Find the exit before systems fail.",
        href: "/game/maze",
        icon: Eye,
        color: "bg-hyper-pink",
        text: "text-hyper-pink",
        tag: "NAVIGATION"
      }
    ]
  }
];

export default function ArcadeHub() {
  return (
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 py-20">
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            ARCADE_<span className="text-hyper-pink">HUB</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-sm mt-4">
            SELECT_YOUR_SIMULATION_ [VER_10.0_ULTIMATE]
          </p>
        </div>

        <div className="space-y-32 max-w-7xl mx-auto">
          {CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-6 mb-12 border-b-4 border-white/5 pb-6">
                <cat.icon className={`w-12 h-12 ${cat.color}`} />
                <h2 className={`text-4xl md:text-6xl font-black italic uppercase text-white`}>
                  {cat.title}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cat.games.map((game) => (
                  <Link 
                    key={game.id}
                    href={game.href} 
                    className={`group relative block p-1 bg-foreground/10 hover:bg-foreground transition-all`}
                  >
                    <div className="arcade-card-inner p-10 h-full relative overflow-hidden">
                      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity ${game.textClass}`}>
                        <game.icon className="w-40 h-40" />
                      </div>
                      <div className="relative z-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 ${game.colorClass} text-black text-[10px] font-black uppercase mb-6`}>
                          <Zap className="w-3 h-3" /> {game.tag}
                        </div>
                        <h2 className="text-4xl font-black italic text-foreground uppercase mb-4">
                          {game.title.split("_")[0]}_<span className={game.textClass}>{game.title.split("_")[1]}</span>
                        </h2>
                        <p className="text-dim font-bold mb-8 text-sm leading-relaxed">
                          {game.desc}
                        </p>
                        <div className={`${game.textClass} font-black italic tracking-widest text-xs group-hover:translate-x-4 transition-transform`}>
                          INITIALIZE_LINK_ &gt;&gt;
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
