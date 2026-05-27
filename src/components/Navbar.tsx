"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ThemeToggle from "./ThemeToggle";

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
      className="fixed top-0 left-0 right-0 z-50 border-b-2 border-hyper-pink/20 bg-background/80 backdrop-blur-xl"
    >
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-hyper-pink rounded-full group-hover:rotate-180 transition-transform duration-500">
            <Zap className="w-6 h-6 text-background fill-current" />
          </div>
          <span className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none border-b-2 border-transparent">
            ROBO<span className="text-hyper-pink">VIBE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/playground"
            className="text-xs font-black uppercase tracking-[0.2em] text-hyper-pink animate-pulse hover:text-foreground transition-all"
          >
            PLAYGROUND
          </Link>
          <Link
            href="/feedback"
            className="text-xs font-black uppercase tracking-[0.2em] text-[#ffaa00] hover:text-foreground transition-all"
          >
            FEEDBACK
          </Link>
          <Link
            href="/identity"
            className="text-xs font-black uppercase tracking-[0.2em] text-cyber-blue hover:text-foreground transition-all"
          >
            IDENTITY
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 bg-electric-volt text-background text-xs font-black uppercase tracking-[0.3em] hover:bg-foreground transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_0_0_#ff007a] active:translate-y-0"
          >
            Get_In
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
