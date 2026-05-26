"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
    });
  }, []);

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 border-b-2 border-hyper-pink/20 bg-black/80 backdrop-blur-xl"
    >
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-hyper-pink rounded-full group-hover:rotate-180 transition-transform duration-500">
            <Zap className="w-6 h-6 text-black fill-current" />
          </div>
          <span className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            ROBO<span className="text-hyper-pink">VIBE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/game"
            className="text-xs font-black uppercase tracking-[0.2em] text-hyper-pink animate-pulse hover:text-white transition-all"
          >
            PLAY_GAME
          </Link>
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-hyper-pink hover:line-through transition-all"
          >
            Sectors
          </Link>
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-electric-volt hover:line-through transition-all"
          >
            Tech_Stack
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 bg-electric-volt text-black text-xs font-black uppercase tracking-[0.3em] hover:bg-white transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_0_0_#ff007a] active:translate-y-0"
          >
            Get_In
          </Link>
        </div>
      </nav>
    </header>
  );
}
