"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";
import { Timer, Smartphone, Zap } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

export default function CyberTap() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targets = useRef<{ x: number; y: number; r: number; life: number; id: number }[]>([]);
  const nextId = useRef(0);
  const requestRef = useRef<number>(undefined);

  const initGame = () => {
    targets.current = [];
    setScore(0);
    setTimeLeft(30);
    setGameState("PLAYING");
  };

  const spawnTarget = useCallback(() => {
    const r = Math.random() * 30 + 20;
    targets.current.push({
      id: nextId.current++,
      x: Math.random() * (CANVAS_WIDTH - r * 2) + r,
      y: Math.random() * (CANVAS_HEIGHT - r * 2) + r,
      r,
      life: 1.0
    });
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid Background for context
    ctx.strokeStyle = "rgba(255, 0, 122, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
    }

    // Update & Draw targets
    for (let i = targets.current.length - 1; i >= 0; i--) {
      const t = targets.current[i];
      t.life -= 0.015; // Target shrinks/fades

      if (t.life <= 0) {
        targets.current.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * t.life, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(204, 255, 0, 0.3)";
      ctx.fill();
      ctx.strokeStyle = "#ccff00";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(204, 255, 0, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || gameState !== "PLAYING") return;

    if (Math.random() < 0.05) spawnTarget();
    draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, draw, spawnTarget]);

  useEffect(() => {
    if (gameState === "PLAYING") {
      requestRef.current = requestAnimationFrame(loop);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState("GAMEOVER");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(timer);
      };
    }
  }, [gameState, loop]);

  const handleTap = (e: React.PointerEvent) => {
    if (gameState !== "PLAYING") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = targets.current.length - 1; i >= 0; i--) {
      const t = targets.current[i];
      const dist = Math.sqrt((x - t.x) ** 2 + (y - t.y) ** 2);
      if (dist < t.r) {
        targets.current.splice(i, 1);
        setScore(prev => prev + 100);
        // Visual feedback would go here
        break;
      }
    }
  };

  return (
    <FeatureGuard featureId="tap">
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20 touch-none">
      <Navbar />
      <MinimalFeedback featureName="CYBER_TAP" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-electric-volt">TAP</span>
          </h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            REFLEX_CALIBRATION_INITIATED
          </p>
        </div>

        <div className="flex gap-4 mb-6 w-full max-w-[400px]">
           <div className="flex-1 glass-panel p-4 flex items-center justify-between border-l-4 border-cyber-blue">
              <Timer className="w-4 h-4 text-cyber-blue" />
              <span className="text-2xl font-black tabular-nums">{timeLeft}S</span>
           </div>
           <div className="flex-1 glass-panel p-4 flex items-center justify-between border-l-4 border-electric-volt">
              <Zap className="w-4 h-4 text-electric-volt" />
              <span className="text-2xl font-black tabular-nums">{score}</span>
           </div>
        </div>

        <div 
          className="relative glass-panel border-4 border-foreground/10 overflow-hidden cursor-crosshair touch-none bg-background/50"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onPointerDown={handleTap}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 p-8 text-center">
              <button onClick={initGame} className="px-10 py-5 bg-foreground text-background font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ccff00] mb-6">
                BOOT_CORE
              </button>
              <p className="text-[10px] font-black text-dim uppercase tracking-widest">
                TAP THE GLOWING NODES BEFORE THEY DISSIPATE. <br/> SPEED IS EVERYTHING.
              </p>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl border-4 border-electric-volt/30 text-center px-4">
              <h2 className="text-5xl font-black text-foreground italic uppercase mb-2">TIME_EXPIRED</h2>
              <div className="bg-foreground text-background px-8 py-4 mb-6">
                <span className="text-3xl font-black italic">FINAL_YIELD: {score}</span>
              </div>
              <Leaderboard gameId="cyber_tap" currentScore={score} onRestart={initGame} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}
