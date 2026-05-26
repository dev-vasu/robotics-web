"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Zap, Music, RefreshCcw, Activity, Ghost, Info, MousePointer2 } from "lucide-react";

const KEYS = ["A", "S", "D", "F"];
const FALL_SPEED = 5;
const SPAWN_RATE = 0.03;

export default function BeatGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missed, setMissed] = useState(0);
  const [activeLanes, setActiveLanes] = useState<boolean[]>([false, false, false, false]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  const notesRef = useRef<{ x: number; y: number; key: string; id: number }[]>([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const missedRef = useRef(0);

  const initGame = () => {
    notesRef.current = [];
    scoreRef.current = 0;
    comboRef.current = 0;
    missedRef.current = 0;
    setScore(0);
    setCombo(0);
    setMissed(0);
    setGameState("PLAYING");
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, width, height);

    // Draw Lanes & Feedback
    KEYS.forEach((_, i) => {
      const x = (width / KEYS.length) * i;
      const laneWidth = width / KEYS.length;
      
      // Flash lane if active
      if (activeLanes[i]) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(x, 0, laneWidth, height);
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeRect(x, 0, laneWidth, height);
      
      // Target Zone - THE HIT ZONE
      ctx.fillStyle = "rgba(204, 255, 0, 0.05)";
      ctx.fillRect(x, height - 120, laneWidth, 100);
      ctx.strokeStyle = "rgba(204, 255, 0, 0.2)";
      ctx.strokeRect(x, height - 120, laneWidth, 100);
    });

    // Update & Draw Notes
    notesRef.current.forEach((note, index) => {
      note.y += FALL_SPEED + (scoreRef.current / 1500);
      
      const laneWidth = width / KEYS.length;
      const x = (KEYS.indexOf(note.key) * laneWidth) + (laneWidth / 2);
      
      ctx.beginPath();
      ctx.arc(x, note.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = note.key === "A" ? "#ff007a" : note.key === "S" ? "#00f0ff" : note.key === "D" ? "#ccff00" : "#ffffff";
      ctx.fill();
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.closePath();

      // Missed Note
      if (note.y > height) {
        notesRef.current.splice(index, 1);
        missedRef.current += 1;
        comboRef.current = 0;
      }
    });

    if (missedRef.current >= 15) { // Increased life for balance
      setGameState("GAMEOVER");
    }

    // Spawn Logic
    if (Math.random() < SPAWN_RATE + (scoreRef.current / 20000)) {
      const key = KEYS[Math.floor(Math.random() * KEYS.length)];
      notesRef.current.push({ x: 0, y: -30, key, id: Math.random() });
    }

    // Sync State
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    setMissed(missedRef.current);
  }, [activeLanes]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || gameState !== "PLAYING") return;

    draw(ctx, canvas.width, canvas.height);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState === "PLAYING") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;
      const pressedKey = e.key.toUpperCase();
      if (!KEYS.includes(pressedKey)) return;

      const keyIndex = KEYS.indexOf(pressedKey);
      setActiveLanes(prev => {
        const next = [...prev];
        next[keyIndex] = true;
        return next;
      });

      // HIT DETECTION: Check if note is in the 480-580 range
      const hitIndex = notesRef.current.findIndex(note => 
        note.key === pressedKey && note.y > 480 && note.y < 580
      );

      if (hitIndex !== -1) {
        notesRef.current.splice(hitIndex, 1);
        comboRef.current += 1;
        scoreRef.current += 50 * (Math.floor(comboRef.current / 5) + 1);
      } else {
        comboRef.current = 0;
      }

      setTimeout(() => {
        setActiveLanes(prev => {
          const next = [...prev];
          next[keyIndex] = false;
          return next;
        });
      }, 100);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  return (
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20">
      <Navbar />
      <MinimalFeedback featureName="CYBER_BEAT" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-12">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-cyber-blue">BEAT</span>
          </h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-xs mt-4">
            LEVEL_9_SYNC_REQUIRED
          </p>
        </div>

        <div className="relative glass-panel border-4 border-white/10 overflow-hidden" style={{ width: 600, height: 600 }}>
          <canvas ref={canvasRef} width={600} height={600} />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-10 overflow-y-auto">
              <Music className="w-16 h-16 text-cyber-blue mb-6 animate-bounce" />
              <button 
                onClick={initGame}
                className="px-16 py-6 bg-white text-black font-black text-3xl uppercase italic hover:bg-hyper-pink transition-all shadow-[15px_15px_0_0_#00f0ff] mb-10"
              >
                START_SYNC
              </button>
              
              <div className="w-full space-y-6">
                <div className="p-4 border-2 border-electric-volt/30 bg-electric-volt/5 rounded-xl">
                   <div className="flex items-center gap-2 text-electric-volt font-black uppercase tracking-widest text-xs mb-3">
                      <Info className="w-4 h-4" /> ADVANCED_PROTOCOL
                   </div>
                   <ul className="text-[10px] text-white/70 font-bold uppercase space-y-2 text-left list-disc list-inside">
                      <li>HIT THE KEYS <span className="text-white bg-white/20 px-2">A S D F</span> WHEN NODES REACH THE <span className="text-electric-volt">GLOWING BOX</span>.</li>
                      <li>PRECISION MATTERS: HITTING TOO EARLY OR TOO LATE WILL BREAK YOUR COMBO.</li>
                      <li>COMBOS INCREASE YOUR DATA HARVEST MULTIPLIER (x2, x3, x4).</li>
                      <li>SYSTEM TOLERANCE: <span className="text-red-500">15 MISSES</span> WILL TERMINATE THE UPLINK.</li>
                   </ul>
                </div>

                <div className="grid grid-cols-4 gap-4">
                   {KEYS.map(k => (
                     <div key={k} className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-white/20 flex items-center justify-center font-black text-white text-xl mb-2">{k}</div>
                        <div className={`w-2 h-2 rounded-full ${k === 'A' ? 'bg-[#ff007a]' : k === 'S' ? 'bg-[#00f0ff]' : k === 'D' ? 'bg-[#ccff00]' : 'bg-white'}`} />
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <Ghost className="w-24 h-24 text-red-500 mb-6" />
              <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase mb-2 text-glitch text-center">
                {score <= 500 ? "NPC_BEHAVIOR" : 
                 score <= 2000 ? "SKILL_ISSUE" : 
                 score <= 5000 ? "KINDA_MID" : 
                 score <= 10000 ? "COOKING_RN" : 
                 score <= 20000 ? "W_RIZZ" : 
                 "MAIN_CHARACTER"}
              </h2>
              <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mb-6 text-center">
                {score <= 500 ? "BRO HAS NO RHYTHM 💀" : 
                 score <= 2000 ? "YOUR TIMING IS LITERALLY TRASH." : 
                 score <= 5000 ? "MID BEATS. TRY HARDER." : 
                 score <= 10000 ? "OKAY WE VIBING. LET HIM COOK." : 
                 score <= 20000 ? "BRO IS THE METRONOME." : 
                 "MOZART BEEN QUIET SINCE THIS DROPPED."}
              </p>
              <div className="text-cyber-blue text-4xl font-black mb-10 italic uppercase">SCORE: {score}</div>
              <button onClick={initGame} className="px-10 py-5 bg-electric-volt text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a]">RE-BOOT</button>
            </div>
          )}

          {/* HUD Overlay */}
          {gameState === "PLAYING" && (
            <>
              <div className="absolute top-6 left-6">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">COMBO_BREAKER</div>
                <div className="text-5xl font-black italic text-white animate-pulse">{combo}x</div>
              </div>
              <div className="absolute top-6 right-6 text-right">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">CORE_STABILITY</div>
                <div className="text-2xl font-black italic text-red-500">{15 - missed} / 15</div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 font-black tracking-[0.5em] text-[10px]">HIT_ZONE_ACTIVE</div>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[600px]">
           <div className="bg-white/5 p-6 border-l-4 border-cyber-blue flex justify-between items-center">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">BYTES_SYNCED</span>
              <span className="text-2xl font-black italic text-white tabular-nums">{score}</span>
           </div>
           <div className="bg-white/5 p-6 border-l-4 border-hyper-pink flex justify-between items-center">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">MULTIPLIER</span>
              <span className="text-2xl font-black italic text-white">x{(Math.floor(combo / 5) + 1)}</span>
           </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
