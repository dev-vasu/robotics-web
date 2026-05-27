"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";
import { Circle, ShieldAlert, Ghost } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_RADIUS = 15;

export default function NeonOrb() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const playerRef = useRef({ x: 200, y: 500 });
  const enemiesRef = useRef<{ x: number; y: number; r: number; speed: number; color: string }[]>([]);
  const scoreRef = useRef(0);

  const initGame = () => {
    playerRef.current = { x: 200, y: 500 };
    enemiesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const spawnEnemy = useCallback(() => {
    const r = Math.random() * 20 + 10;
    const colors = ["#ff007a", "#ccff00", "#00f0ff", "#ffffff"];
    enemiesRef.current.push({
      x: Math.random() * (CANVAS_WIDTH - r * 2) + r,
      y: -r,
      r,
      speed: Math.random() * 3 + 2 + (scoreRef.current / 10),
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Player
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#00f0ff";
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00f0ff";
    ctx.closePath();

    // Spawn and update enemies
    if (Math.random() < 0.03) spawnEnemy();

    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const e = enemiesRef.current[i];
      e.y += e.speed;

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = e.color;
      ctx.fill();
      ctx.closePath();

      // Collision
      const dx = playerRef.current.x - e.x;
      const dy = playerRef.current.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PLAYER_RADIUS + e.r) {
        setGameState("GAMEOVER");
      }

      // Cleanup
      if (e.y > CANVAS_HEIGHT + e.r) {
        enemiesRef.current.splice(i, 1);
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
    }
  }, [spawnEnemy]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || gameState !== "PLAYING") return;

    draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState === "PLAYING") {
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, loop]);

  const handlePointer = (e: React.PointerEvent) => {
    if (gameState !== "PLAYING") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Smooth follow logic
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    
    playerRef.current.x = targetX;
    playerRef.current.y = targetY;
  };

  return (
    <FeatureGuard featureId="orb">
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20 touch-none">
      <Navbar />
      <MinimalFeedback featureName="NEON_ORB" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            NEON_<span className="text-hyper-pink">ORB</span>
          </h1>
          <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            EVASION_PROTOCOL_ACTIVE
          </p>
        </div>

        <div 
          className="relative glass-panel border-4 border-foreground/10 overflow-hidden cursor-none touch-none"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onPointerMove={handlePointer}
          onPointerDown={(e) => {
             if (gameState === "IDLE") initGame();
             handlePointer(e);
          }}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 p-8 text-center">
              <button className="px-10 py-5 bg-foreground text-background font-black text-xl uppercase italic shadow-[10px_10px_0_0_#00f0ff] mb-6">
                START_SESSION
              </button>
              <div className="p-4 border-2 border-cyber-blue bg-cyber-blue/5 rounded-lg">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-relaxed">
                  OBJECTIVE: SURVIVE THE FALL<br/>
                  CONTROL: DRAG OR TOUCH<br/>
                  DIFFICULTY: RAMPING
                </p>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-600/20 backdrop-blur-xl border-4 border-red-500/30 text-center px-4 overflow-y-auto py-8">
              <Ghost className="w-12 h-12 text-foreground mb-2 animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-black text-foreground italic uppercase mb-1">VOXEL_CRASH</h2>
              <p className="text-dim font-black uppercase tracking-widest text-[10px] mb-4">SYSTEMS NEUTRALIZED. NO CAP.</p>
              <div className="bg-background px-6 py-2 border-2 border-cyber-blue mb-4">
                <span className="text-cyber-blue text-2xl font-black italic tabular-nums">DATA: {score}</span>
              </div>
              <Leaderboard gameId="neon_orb" currentScore={score} onRestart={initGame} />
            </div>
          )}

          {gameState === "PLAYING" && (
            <div className="absolute top-10 left-0 w-full text-center pointer-events-none">
              <div className="text-foreground text-9xl font-black italic tracking-tighter opacity-10 tabular-nums select-none">{score}</div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}
