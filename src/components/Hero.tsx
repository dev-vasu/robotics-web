"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Ghost, Sparkles, Orbit } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      scale: 2,
      opacity: 0,
      duration: 1.5,
      ease: "expo.out",
    })
    .from(".hero-pill", {
      x: -50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "back.out(2)",
    }, "-=0.5");

    gsap.to(".hero-float", {
      y: 30,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-hyper-pink/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-electric-volt/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      <div className="container mx-auto px-6 text-center" ref={containerRef}>
        <div className="hero-pill inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-electric-volt/30 bg-electric-volt/5 mb-10">
          <Sparkles className="w-4 h-4 text-electric-volt" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-electric-volt">
            Next_Gen_Automation_Unlocks
          </span>
        </div>

        <h1
          ref={titleRef}
          className="text-6xl md:text-[10rem] font-black italic tracking-tight text-white leading-none uppercase mb-12"
        >
          CREATIVE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-hyper-pink via-white to-electric-volt text-glitch">
            PLAYGROUND
          </span>
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          {[
            { icon: Ghost, label: "PLAY_ARCADE", color: "text-hyper-pink", bg: "bg-hyper-pink/10", href: "/game" },
            { icon: Sparkles, label: "CREATE_ART", color: "text-cyber-blue", bg: "bg-cyber-blue/10", href: "/playground/canvas" },
            { icon: Orbit, label: "SYNC_VIBE", color: "text-electric-volt", bg: "bg-electric-volt/10", href: "/playground" }
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`hero-float flex items-center gap-4 px-8 py-6 rounded-2xl glass-panel group hover:scale-110 transition-transform cursor-pointer`}
            >
              <div className={`p-3 rounded-xl ${item.bg}`}>
                {/* @ts-ignore */}
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/80">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/2 right-10 w-20 h-20 border-4 border-hyper-pink/20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-20 left-10 w-16 h-16 border-4 border-electric-volt/20 rotate-45 animate-bounce" />
    </section>
  );
}
