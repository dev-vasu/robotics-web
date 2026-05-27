"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/constants";

export default function ArcadeHub() {
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/features")
      .then(res => res.json())
      .then(data => {
        if (data.features) setFeatures(data.features);
      })
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 py-20">
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            ARCADE_<span className="text-hyper-pink">HUB</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-sm mt-4">
            SELECT_YOUR_SIMULATION_ [VER_10.0_ULTIMATE]
          </p>
        </div>

        <div className="space-y-32 max-w-7xl mx-auto">
          {CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-6 mb-12 border-b-4 border-border-main pb-6">
                <cat.icon className={`w-12 h-12 ${cat.color}`} />
                <h2 className={`text-4xl md:text-6xl font-black italic uppercase text-foreground`}>
                  {cat.title}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cat.games.map((game) => {
                  const feat = features.find(f => f.id === game.id);
                  const isNew = feat ? feat.is_new : false;
                  const isEnabled = feat ? feat.is_enabled : true;

                  if (!isEnabled) return null;

                  return (
                    <Link 
                      key={game.id}
                      href={game.href} 
                      className={`group relative block p-1 bg-foreground/10 hover:bg-foreground transition-all`}
                    >
                      {isNew && (
                        <div className="absolute -top-4 -right-4 z-30 bg-hyper-pink text-background font-black italic px-4 py-1 text-[10px] uppercase tracking-widest shadow-[0_0_20px_#ff007a] animate-bounce">
                          NEW_SIM
                        </div>
                      )}
                      <div className="arcade-card-inner bg-background group-hover:bg-foreground p-10 h-full relative overflow-hidden transition-colors duration-300">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity ${game.textClass}`}>
                          <game.icon className="w-40 h-40" />
                        </div>
                        <div className="relative z-10 transition-colors duration-300 group-hover:text-background">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 ${game.colorClass} text-background text-[10px] font-black uppercase mb-6`}>
                            <Zap className="w-3 h-3" /> {game.tag}
                          </div>
                          <h2 className="text-4xl font-black italic text-foreground group-hover:text-background uppercase mb-4 transition-colors">
                            {game.title.split("_")[0]}_<span className={`${game.textClass} group-hover:text-background`}>{game.title.split("_")[1]}</span>
                          </h2>
                          <p className="text-dim group-hover:text-background/70 font-bold mb-8 text-sm leading-relaxed transition-colors">
                            {game.desc}
                          </p>
                          <div className={`${game.textClass} group-hover:text-background font-black italic tracking-widest text-xs group-hover:translate-x-4 transition-all`}>
                            INITIALIZE_LINK_ &gt;&gt;
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
