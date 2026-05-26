"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Music, RefreshCcw, Activity, Ghost } from "lucide-react";

const KEYS = ["A", "S", "D", "F"];
const FALL_SPEED = 5;
const SPAWN_RATE = 0.03;

export default function BeatGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missed, setMissed] = useState(0);
  
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

    // Draw Lanes
    KEYS.forEach((_, i) => {
      const x = (width / KEYS.length) * i;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeRect(x, 0, width / KEYS.length, height);
      
      // Target Zone
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.fillRect(x, height - 100, width / KEYS.length, 80);
    });

    // Update & Draw Notes
    notesRef.current.forEach((note, index) => {
      note.y += FALL_SPEED + (scoreRef.current / 1000);
      
      const laneWidth = width / KEYS.length;
      const x = (KEYS.indexOf(note.key) * laneWidth) + (laneWidth / 2);
      
      ctx.beginPath();
      ctx.arc(x, note.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = note.key === "A" ? "#ff007a" : note.key === "S" ? "#00f0ff" : note.key === "D" ? "#ccff00" : "#ffffff";
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.closePath();

      // Missed Note
      if (note.y > height) {
        notesRef.current.splice(index, 1);
        missedRef.current += 1;
        comboRef.current = 0;
      }
    });

    if (missedRef.current >= 10) {
      setGameState("GAMEOVER");
    }

    // Spawn Logic
    if (Math.random() < SPAWN_RATE + (scoreRef.current / 10000)) {
      const key = KEYS[Math.floor(Math.random() * KEYS.length)];
      notesRef.current.push({ x: 0, y: -20, key, id: Math.random() });
    }

    // Sync State
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    setMissed(missedRef.current);
  }, []);

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

      const hitIndex = notesRef.current.findIndex(note => 
        note.key === pressedKey && note.y > 400 && note.y < 480
      );

      if (hitIndex !== -1) {
        notesRef.current.splice(hitIndex, 1);
        comboRef.current += 1;
        scoreRef.current += 10 * Math.min(5, Math.floor(comboRef.current / 10) + 1);
      } else {
        comboRef.current = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-12">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-cyber-blue">BEAT</span>
          </h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-xs mt-4">
            HIT_ THE_ DATA_ STREAMS_ IN_ SYNC
          </p>
        </div>

        <div className="relative glass-panel border-4 border-white/10 overflow-hidden" style={{ width: 600, height: 600 }}>
          <canvas ref={canvasRef} width={600} height={600} />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
              <Music className="w-20 h-20 text-cyber-blue mb-8 animate-bounce" />
              <button 
                onClick={initGame}
                className="px-16 py-8 bg-white text-black font-black text-3xl uppercase italic hover:bg-hyper-pink transition-all shadow-[15px_15px_0_0_#00f0ff]"
              >
                START_SYNC
              </button>
              <div className="mt-12 grid grid-cols-4 gap-4">
                 {KEYS.map(k => (
                   <div key={k} className="w-12 h-12 border-2 border-white/20 flex items-center justify-center font-black text-white">{k}</div>
                 ))}
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <Ghost className="w-24 h-24 text-red-500 mb-6" />
              <h2 className="text-6xl font-black text-white italic uppercase mb-2">SYNC_LOST</h2>
              <div className="text-cyber-blue text-4xl font-black mb-10 italic uppercase">SCORE: {score}</div>
              <button onClick={initGame} className="px-10 py-5 bg-electric-volt text-black font-black text-xl uppercase italic">RE-SYNC</button>
            </div>
          )}

          {/* HUD Overlay */}
          {gameState === "PLAYING" && (
            <>
              <div className="absolute top-6 left-6">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">COMBO</div>
                <div className="text-5xl font-black italic text-white animate-pulse">{combo}x</div>
              </div>
              <div className="absolute top-6 right-6 text-right">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">STABILITY</div>
                <div className="text-xl font-black italic text-red-500">{10 - missed} / 10</div>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[600px]">
           <div className="bg-white/5 p-6 border-l-4 border-cyber-blue flex justify-between items-center">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">TOTAL_SYNC</span>
              <span className="text-2xl font-black italic text-white">{score}</span>
           </div>
           <div className="bg-white/5 p-6 border-l-4 border-hyper-pink flex justify-between items-center">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">THREAT_LVL</span>
              <span className="text-2xl font-black italic text-white">{(FALL_SPEED + score / 1000).toFixed(1)}</span>
           </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
