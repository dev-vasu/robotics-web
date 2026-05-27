"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";
import { Ghost, Zap, Triangle } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

export default function NeonDrift() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  // Game Objects
  const car = useRef({
    x: 200,
    y: 300,
    angle: 0,
    speed: 4,
    turnDir: 1, // 1 for right, -1 for left
    radius: 10
  });
  
  const trails = useRef<{ x: number; y: number; alpha: number }[]>([]);
  const scoreRef = useRef(0);

  const initGame = () => {
    car.current = { x: 200, y: 300, angle: 0, speed: 4, turnDir: 1, radius: 10 };
    trails.current = [];
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const handleInput = () => {
    if (gameState === "PLAYING") {
      car.current.turnDir *= -1;
    } else if (gameState === "IDLE") {
      initGame();
    }
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // 1. Clear with trail effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Grid Background (Subtle)
    ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
    }

    // 3. Update Car Physics
    const turnSpeed = 0.08 + (scoreRef.current / 10000);
    car.current.speed = 5 + (scoreRef.current / 5000);
    car.current.angle += turnSpeed * car.current.turnDir;
    
    car.current.x += Math.cos(car.current.angle) * car.current.speed;
    car.current.y += Math.sin(car.current.angle) * car.current.speed;

    // 4. Boundary Collision
    if (
      car.current.x < 10 || car.current.x > CANVAS_WIDTH - 10 ||
      car.current.y < 10 || car.current.y > CANVAS_HEIGHT - 10
    ) {
      setGameState("GAMEOVER");
    }

    // 5. Manage Trails
    trails.current.push({ x: car.current.x, y: car.current.y, alpha: 1.0 });
    if (trails.current.length > 50) trails.current.shift();

    trails.current.forEach((t, i) => {
      t.alpha *= 0.95;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 122, ${t.alpha})`;
      ctx.fill();
    });

    // 6. Draw Car (Arrow)
    ctx.save();
    ctx.translate(car.current.x, car.current.y);
    ctx.rotate(car.current.angle);
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fillStyle = "#00f0ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f0ff";
    ctx.fill();
    ctx.restore();

    // 7. Update Score
    scoreRef.current += 1;
    if (scoreRef.current % 10 === 0) setScore(scoreRef.current);

  }, []);

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

  return (
    <FeatureGuard featureId="drift">
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20 touch-none">
      <Navbar />
      <MinimalFeedback featureName="NEON_DRIFT" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            NEON_<span className="text-cyber-blue">DRIFT</span>
          </h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            SATISFYING_MOMENTUM_STABLE
          </p>
        </div>

        <div 
          className="relative glass-panel border-4 border-foreground/10 overflow-hidden cursor-crosshair touch-none bg-background/50"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onPointerDown={handleInput}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

          <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-background/80 border border-cyber-blue/30 glass-panel">
             <Zap className="w-4 h-4 text-cyber-blue" />
             <span className="text-2xl font-black italic tabular-nums">{score}</span>
          </div>

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 p-8 text-center">
              <button className="px-10 py-5 bg-foreground text-background font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a] mb-6 animate-pulse">
                INITIALIZE_ENGINE
              </button>
              <div className="p-4 border-2 border-cyber-blue bg-cyber-blue/5">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-relaxed">
                  TAP TO CHANGE TURN DIRECTION<br/>
                  STAY WITHIN THE GRID LIMITS<br/>
                  SPEED INCREASES EXPONENTIALLY
                </p>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl text-center px-4">
              <Ghost className="w-12 h-12 text-hyper-pink mb-4 animate-bounce" />
              <h2 className="text-5xl font-black italic uppercase mb-2">ENGINE_STALL</h2>
              <div className="bg-cyber-blue text-background px-8 py-4 mb-6 shadow-[8px_8px_0_0_#ff007a]">
                <span className="text-3xl font-black italic tracking-tighter">DRIFT_YIELD: {score}</span>
              </div>
              <Leaderboard gameId="neon_drift" currentScore={score} onRestart={initGame} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}
