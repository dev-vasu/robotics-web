"use client";

import FeatureGuard from "@/components/FeatureGuard";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft, Play, Square, Music, Activity, Volume2 } from "lucide-react";

const STEPS = 16;
const TRACKS = [
  { id: "kick", label: "INDUSTRIAL_KICK", color: "text-hyper-pink", bg: "bg-hyper-pink" },
  { id: "snare", label: "NEURAL_SNARE", color: "text-cyber-blue", bg: "bg-cyber-blue" },
  { id: "hihat", label: "CYBER_HAT", color: "text-electric-volt", bg: "bg-electric-volt" },
  { id: "perc", label: "GLITCH_CORE", color: "text-foreground", bg: "bg-foreground" }
];

export default function RoboBeats() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [grid, setGrid] = useState<boolean[][]>(
    Array(TRACKS.length).fill(null).map(() => Array(STEPS).fill(false))
  );

  const timerRef = useRef<NodeJS.Timeout>(undefined);

  const toggleStep = (trackIdx: number, stepIndex: number) => {
    const newGrid = [...grid];
    newGrid[trackIdx] = [...newGrid[trackIdx]];
    newGrid[trackIdx][stepIndex] = !newGrid[trackIdx][stepIndex];
    setGrid(newGrid);
  };

  const playStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % STEPS);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm / 4) * 1000;
      timerRef.current = setInterval(playStep, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, bpm, playStep]);

  return (
    <FeatureGuard featureId="beats">
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 overflow-hidden">
      <Navbar />
      
      <div className="fixed top-24 left-6 z-40 flex flex-col gap-4">
        <Link 
          href="/playground" 
          className="flex items-center gap-2 px-4 py-2 bg-background border border-foreground/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Exit_to_Lab</span>
        </Link>
      </div>

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10 relative">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-8xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            ROBO_<span className="text-electric-volt">BEATS</span>
          </h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            INDUSTRIAL_SEQUENCER_V4.4
          </p>
        </div>

        <div className="w-full max-w-5xl glass-panel border-4 border-foreground/10 p-10 relative overflow-hidden">
          {/* Controls */}
          <div className="flex justify-between items-center mb-12 border-b border-foreground/5 pb-8">
            <div className="flex gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-3 px-8 py-4 font-black uppercase italic transition-all ${isPlaying ? "bg-red-500 text-foreground shadow-[0_0_20px_red]" : "bg-electric-volt text-background shadow-[10px_10px_0_0_#ff007a]"}`}
              >
                {isPlaying ? <><Square className="w-6 h-6 fill-current" /> STOP_CORE</> : <><Play className="w-6 h-6 fill-current" /> BOOT_SEQUENCE</>}
              </button>
              
              <div className="flex items-center gap-4 px-6 bg-foreground/5 border border-foreground/10">
                 <span className="text-[10px] font-black text-dim uppercase tracking-widest">BPM</span>
                 <input 
                  type="range" min="60" max="180" value={bpm} 
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-32 accent-electric-volt"
                 />
                 <span className="text-xl font-black italic text-foreground tabular-nums">{bpm}</span>
              </div>
            </div>

            <div className="hidden md:flex gap-8">
               <div className="text-right">
                  <div className="text-[10px] font-black text-dim uppercase">STATUS</div>
                  <div className="text-electric-volt font-black italic">SYNC_ACTIVE</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-black text-dim uppercase">ENGINE</div>
                  <div className="text-hyper-pink font-black italic">industrial.vibe</div>
               </div>
            </div>
          </div>

          {/* Grid */}
          <div className="space-y-4">
            {TRACKS.map((track, tIdx) => (
              <div key={track.id} className="flex items-center gap-6">
                <div className={`w-32 text-[10px] font-black uppercase tracking-widest ${track.color}`}>
                  {track.label}
                </div>
                <div className="flex-1 grid grid-cols-16 gap-2">
                  {grid[tIdx].map((active, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => toggleStep(tIdx, sIdx)}
                      className={`h-12 border-2 transition-all transform hover:scale-105 ${
                        active 
                          ? `${track.bg} border-foreground shadow-[0_0_15px_rgba(255,255,255,0.3)]` 
                          : `bg-foreground/5 border-foreground/5`
                      } ${currentStep === sIdx && isPlaying ? "scale-110 border-foreground/40 ring-4 ring-white/10" : ""}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-foreground/5 flex justify-between items-center text-foreground/20">
             <div className="flex gap-2">
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${currentStep === i && isPlaying ? "bg-electric-volt shadow-[0_0_10px_#ccff00]" : "bg-foreground/10"}`} />
                ))}
             </div>
             <div className="text-[10px] font-black uppercase tracking-[0.4em]">ROBOVIBE_AUDIO_CORE_ENGAGED</div>
          </div>
        </div>

        <div className="mt-8 flex gap-6 w-full max-w-5xl">
           <div className="flex-1 glass-panel p-6 border-l-4 border-cyber-blue flex items-center gap-4">
              <Activity className="w-8 h-8 text-cyber-blue" />
              <div>
                 <div className="text-[10px] font-black text-dim uppercase tracking-widest">OSCILLATOR</div>
                 <div className="text-xl font-black italic text-foreground">RESONANT_WAVE_FORM</div>
              </div>
           </div>
           <div className="flex-1 glass-panel p-6 border-l-4 border-hyper-pink flex items-center gap-4">
              <Volume2 className="w-8 h-8 text-hyper-pink" />
              <div>
                 <div className="text-[10px] font-black text-dim uppercase tracking-widest">OUTPUT</div>
                 <div className="text-xl font-black italic text-foreground">LOW_LATENCY_DRIVE</div>
              </div>
           </div>
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}