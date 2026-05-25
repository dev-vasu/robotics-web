"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Solutions from "@/components/Solutions";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-col bg-black">
      <Navbar />
      <Hero />
      <Solutions />
      
      {/* Aggressive Stats Section */}
      <section className="py-40 relative overflow-hidden bg-white text-black">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none grid-bg" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-24">
            <div className="flex-1 order-2 lg:order-1">
               <div className="text-[10rem] md:text-[18rem] font-black italic leading-none text-black/5 absolute -left-20 top-0 select-none">
                 VIBE_CHECK
               </div>
               
               <h2 className="text-6xl md:text-8xl font-black italic uppercase leading-none mb-12 tracking-tighter">
                 MAX <br/> <span className="text-hyper-pink">VELOCITY</span> <br/> ZERO LIES.
               </h2>
               
               <div className="grid grid-cols-2 gap-10">
                 {[
                   { l: "PRECISION", v: "±0.001" },
                   { l: "UPTIME", v: "100.0%" },
                   { l: "LATENCY", v: "0.2ms" },
                   { l: "ENERGY", v: "-40%" }
                 ].map((s) => (
                   <div key={s.l} className="border-l-8 border-black pl-6">
                     <div className="text-xs font-black tracking-widest text-black/40">{s.l}</div>
                     <div className="text-5xl font-black italic">{s.v}</div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex-1 order-1 lg:order-2 w-full">
               <div className="relative aspect-square w-full max-w-lg mx-auto bg-black p-1">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-electric-volt z-0" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-hyper-pink z-0" />
                  
                  <div className="relative z-10 w-full h-full bg-black flex flex-col items-center justify-center p-12 border-4 border-white">
                     <div className="w-full h-px bg-white/20 mb-8" />
                     <div className="text-hyper-pink font-mono text-[10px] self-start mb-2">RUNNING_NEURAL_OVERRIDE...</div>
                     <div className="text-white font-black italic text-4xl text-center leading-tight mb-8">
                       DO NOT COMPROMISE. <br/> AUTOMATE EVERYTHING.
                     </div>
                     <div className="w-full h-px bg-white/20 mt-auto mb-4" />
                     <div className="flex justify-between w-full text-[8px] font-mono text-white/40">
                       <span>VER: 9.0.4-GENZ</span>
                       <span>STATUS: AGGRESSIVE</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extreme CTA */}
      <section className="py-40 bg-black text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-hyper-pink opacity-10 animate-pulse" />
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-7xl md:text-[12rem] font-black italic text-white uppercase tracking-tighter leading-none mb-16">
            STOP <span className="text-glitch">WAITING.</span>
          </h2>
          <Link href="/contact" className="inline-block px-16 py-8 bg-electric-volt text-black font-black text-3xl uppercase italic hover:bg-white hover:scale-110 transition-all shadow-[15px_15px_0_0_#ff007a]">
            INITIATE_NOW
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
