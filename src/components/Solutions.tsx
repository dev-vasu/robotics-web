"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Activity, Shield, Target } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const solutions = [
  {
    title: "FORCE_ARMS",
    desc: "Aggressive mechanical precision for high-velocity fabrication.",
    icon: Target,
    color: "from-hyper-pink to-purple-600",
  },
  {
    title: "NEO_WAREHOUSE",
    desc: "Autonomous flow units that never sleep. Infinite inventory scaling.",
    icon: Activity,
    color: "from-electric-volt to-emerald-600",
  },
  {
    title: "SYNC_LABS",
    desc: "Collaborative neural-link systems for rapid prototyping.",
    icon: Zap,
    color: "from-cyber-blue to-blue-600",
  },
  {
    title: "CORE_DECISION",
    desc: "Edge-based survival logic. Local processing at the speed of light.",
    icon: Shield,
    color: "from-white to-gray-600",
  },
];

export default function Solutions() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.children;
    if (!cards) return;

    gsap.from(cards, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      scale: 0.5,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "expo.out",
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden grid-bg">
      <div className="container mx-auto px-6">
        <div className="mb-24 text-right">
          <h2 className="text-xs font-black text-hyper-pink uppercase tracking-[0.5em] mb-4">
            Industrial_Distruption
          </h2>
          <h3 className="text-6xl md:text-[8rem] font-black italic text-white tracking-tighter uppercase leading-none">
            CHOOSE YOUR <br />
            <span className="text-glitch">WEAPON</span>
          </h3>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {solutions.map((item, i) => (
            <div
              key={i}
              className="group relative p-10 bg-black border-2 border-white/5 hover:border-hyper-pink transition-all duration-300"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${item.color} p-4 mb-10 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_30px_rgba(255,0,122,0.3)]`}
              >
                <item.icon className="w-full h-full text-black" />
              </div>
              <h4 className="text-3xl font-black italic text-white mb-6 uppercase tracking-tighter">
                {item.title}
              </h4>
              <p className="text-white/40 text-sm font-bold leading-relaxed mb-10 group-hover:text-white transition-colors">
                {item.desc}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] text-hyper-pink">
                <span className="group-hover:translate-x-2 transition-transform underline decoration-2 underline-offset-8">INITIALIZE_DATA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
