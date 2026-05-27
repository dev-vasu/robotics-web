"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";
import { Ghost, Move, Smartphone } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 40;
const GRAVITY = 0.5;

export default function BitBeyond() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const player = useRef({ x: 200, y: 300, vy: 0, gravityDir: 1 });
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);
  const obstacles = useRef<{ x: number; y: number; w: number; h: number }[]>([]);

  const initGame = () => {
    player.current = { x: 200, y: 300, vy: 0, gravityDir: 1 };
    particles.current = [];
    obstacles.current = [
      { x: 500, y: 0, w: 60, h: 200 },
      { x: 800, y: 400, w: 60, h: 200 }
    ];
    setScore(0);
    setGameState("PLAYING");
  };

  const flipGravity = () => {
    if (gameState === "PLAYING") {
      player.current.gravityDir *= -1;
      player.current.vy = 0;
      // Burst effect
      for (let i = 0; i < 10; i++) {
        particles.current.push({
          x: player.current.x,
          y: player.current.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.0
        });
      }
    } else if (gameState === "IDLE") {
      initGame();
    }
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Physics
    player.current.vy += GRAVITY * player.current.gravityDir;
    player.current.y += player.current.vy;

    // Boundary check
    if (player.current.y < 0 || player.current.y > CANVAS_HEIGHT) {
      setGameState("GAMEOVER");
    }

    // Draw Player
    ctx.fillStyle = "#ff007a";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff007a";
    ctx.fillRect(player.current.x - PLAYER_SIZE/2, player.current.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);

    // Update & Draw Obstacles
    const speed = 4 + (score / 1000);
    obstacles.current.forEach((obs, idx) => {
      obs.x -= speed;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffffff";
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      // Collision
      if (
        player.current.x + PLAYER_SIZE/2 > obs.x &&
        player.current.x - PLAYER_SIZE/2 < obs.x + obs.w &&
        player.current.y + PLAYER_SIZE/2 > obs.y &&
        player.current.y - PLAYER_SIZE/2 < obs.y + obs.h
      ) {
        setGameState("GAMEOVER");
      }

      // Recycle
      if (obs.x < -100) {
        obs.x = CANVAS_WIDTH + 200;
        obs.y = Math.random() < 0.5 ? 0 : CANVAS_HEIGHT - 200;
        setScore(prev => prev + 100);
      }
    });

    // Particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.life <= 0) { particles.current.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(255, 0, 122, ${p.life})`;
      ctx.fillRect(p.x, p.y, 4, 4);
    }
  }, [score]);

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
    <FeatureGuard featureId="beyond">
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20 touch-none">
      <Navbar />
      <MinimalFeedback featureName="BIT_BEYOND" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            BIT_<span className="text-hyper-pink">BEYOND</span>
          </h1>
          <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            GRAVITY_INVERSION_SYSTEMS_ONLINE
          </p>
        </div>

        <div 
          className="relative glass-panel border-4 border-foreground/10 overflow-hidden cursor-pointer touch-none"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onPointerDown={flipGravity}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-background/80 border border-hyper-pink/30 glass-panel">
             <span className="text-2xl font-black italic tabular-nums">{score}</span>
          </div>

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 p-8 text-center">
              <button className="px-10 py-5 bg-foreground text-background font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a] mb-6">
                START_RUN
              </button>
              <div className="p-4 border-2 border-hyper-pink bg-hyper-pink/5">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-relaxed">
                  TAP TO FLIP GRAVITY<br/>
                  AVOID THE WHITE FIREWALLS<br/>
                  DON'T EXIT THE FRAME
                </p>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl text-center px-4">
              <Ghost className="w-12 h-12 text-hyper-pink mb-4 animate-bounce" />
              <h2 className="text-5xl font-black italic uppercase mb-2">BEYOND_LIMIT</h2>
              <div className="bg-hyper-pink text-background px-8 py-4 mb-6">
                <span className="text-3xl font-black italic tracking-tighter">DATA_INDEX: {score}</span>
              </div>
              <Leaderboard gameId="bit_beyond" currentScore={score} onRestart={initGame} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}
