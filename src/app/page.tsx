"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Solutions from "@/components/Solutions";
import Footer from "@/components/Footer";
import Link from "next/link";
import FeatureGuard from "@/components/FeatureGuard";

export default function Home() {
  return (
    <FeatureGuard featureId="site_wide">
      <main className="relative flex flex-col bg-transparent">
        <Navbar />
        <Hero />
        <Solutions />
        
        {/* Aggressive Stats Section */}
        <section className="py-40 relative overflow-hidden bg-foreground text-background">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none grid-bg" />
          
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-24">
              <div className="flex-1 order-2 lg:order-1">
                 <div className="text-[10rem] md:text-[18rem] font-black italic leading-none text-background/5 absolute -left-20 top-0 select-none">
                   VIBE_CHECK
                 </div>
                 
                 <h2 className="text-6xl md:text-8xl font-black italic uppercase leading-none mb-12 tracking-tighter">
                   UNLEASH <br/> <span className="text-hyper-pink">CREATIVITY</span> <br/> LIMITS ARE OVER.
                 </h2>
                 
                 <div className="grid grid-cols-2 gap-10">
                   {[
                     { l: "SIMULATIONS", v: "11+" },
                     { l: "CREATIVE_LABS", v: "4" },
                     { l: "VIBE_LEVEL", v: "MAX" },
                     { l: "LATENCY", v: "0.2ms" }
                   ].map((s) => (
                     <div key={s.l} className="border-l-8 border-background pl-6">
                       <div className="text-xs font-black tracking-widest text-background/40">{s.l}</div>
                       <div className="text-5xl font-black italic">{s.v}</div>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="flex-1 order-1 lg:order-2 w-full">
                 <div className="relative aspect-square w-full max-w-lg mx-auto bg-background p-1">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-electric-volt z-0" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-hyper-pink z-0" />
                    
                    <div className="relative z-10 w-full h-full bg-background flex flex-col items-center justify-center p-12 border-4 border-foreground">
                       <div className="w-full h-px bg-foreground/20 mb-8" />
                       <div className="text-hyper-pink font-mono text-[10px] self-start mb-2">RUNNING_PLAYGROUND_CORE...</div>
                       <div className="text-foreground font-black italic text-4xl text-center leading-tight mb-8">
                         DESIGNED FOR PLAY. <br/> BUILT FOR CREATION.
                       </div>
                       <div className="w-full h-px bg-foreground/20 mt-auto mb-4" />
                       <div className="flex justify-between w-full text-[8px] font-mono text-dim">
                         <span>VER: PLAYGROUND-V1</span>
                         <span>STATUS: WELCOMING</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Extreme CTA */}
        <section className="py-40 bg-background text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-hyper-pink opacity-10 animate-pulse" />
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-7xl md:text-[12rem] font-black italic text-foreground uppercase tracking-tighter leading-none mb-16">
              START <span className="text-glitch">PLAYING.</span>
            </h2>
            <Link href="/playground" className="inline-block px-16 py-8 bg-electric-volt text-background font-black text-3xl uppercase italic hover:bg-foreground hover:scale-110 transition-all shadow-[15px_15px_0_0_#ff007a]">
              ENTER_LABS
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </FeatureGuard>
  );
}
