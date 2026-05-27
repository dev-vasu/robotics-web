"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Activity, Sparkles, Layout } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const solutions = [
  {
    title: "VIBE_CORE",
    desc: "Advanced generative dynamics for high-fidelity creative output.",
    icon: Sparkles,
    color: "from-hyper-pink to-purple-600",
    href: "/playground"
  },
  {
    title: "ARCADE_NET",
    desc: "Robust infrastructure powering 11+ unique game simulations.",
    icon: Activity,
    color: "from-electric-volt to-emerald-600",
    href: "/game"
  },
  {
    title: "NEON_LABS",
    desc: "Collaborative sandbox environments for rapid prototyping.",
    icon: Layout,
    color: "from-cyber-blue to-blue-600",
    href: "/playground/canvas"
  },
  {
    title: "SYNC_LOGIC",
    desc: "Intelligent interaction layers for a seamless user experience.",
    icon: Zap,
    color: "from-white to-gray-600",
    href: "/contact"
  },
];

export default function Solutions() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.children;
    if (!cards) return;

    gsap.fromTo(cards, 
      { scale: 0.5, opacity: 0 },
      {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        scale: 1,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "expo.out",
        immediateRender: false
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden grid-bg">
      <div className="container mx-auto px-6">
        <div className="mb-24 text-right">
          <h2 className="text-xs font-black text-hyper-pink uppercase tracking-[0.5em] mb-4">
            Creative_Ecosystem
          </h2>
          <h3 className="text-6xl md:text-[8rem] font-black italic text-foreground tracking-tighter uppercase leading-none">
            CHOOSE YOUR <br />
            <span className="text-glitch">MODULE</span>
          </h3>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {solutions.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="group relative p-10 bg-background border-2 border-foreground/5 hover:border-hyper-pink transition-all duration-300 block"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${item.color} p-4 mb-10 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_30px_rgba(255,0,122,0.3)]`}
              >
                <item.icon className="w-full h-full text-background" />
              </div>
              <h4 className="text-3xl font-black italic text-foreground mb-6 uppercase tracking-tighter">
                {item.title}
              </h4>
              <p className="text-dim text-sm font-bold leading-relaxed mb-10 group-hover:text-foreground transition-colors">
                {item.desc}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] text-hyper-pink">
                <span className="group-hover:translate-x-2 transition-transform underline decoration-2 underline-offset-8 uppercase">ENTER_MODULE</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
