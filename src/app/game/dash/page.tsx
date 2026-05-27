"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";
import { Ghost, Zap, Activity } from "lucide-react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PLAYER_SIZE = 30;
const GRAVITY = 0.8;
const JUMP_FORCE = -12;

export default function GlitchDash() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const player = useRef({ x: 100, y: 300, vy: 0, isGrounded: false });
  const obstacles = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const scoreRef = useRef(0);
  const gameSpeed = useRef(5);

  const initGame = () => {
    player.current = { x: 100, y: 300, vy: 0, isGrounded: false };
    obstacles.current = [
      { x: 600, y: 350, w: 30, h: 50 },
      { x: 900, y: 350, w: 30, h: 50 }
    ];
    scoreRef.current = 0;
    gameSpeed.current = 5;
    setScore(0);
    setGameState("PLAYING");
  };

  const jump = () => {
    if (gameState === "PLAYING" && player.current.isGrounded) {
      player.current.vy = JUMP_FORCE;
      player.current.isGrounded = false;
    } else if (gameState === "IDLE") {
      initGame();
    }
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Physics
    player.current.vy += GRAVITY;
    player.current.y += player.current.vy;

    if (player.current.y > 350 - PLAYER_SIZE) {
      player.current.y = 350 - PLAYER_SIZE;
      player.current.vy = 0;
      player.current.isGrounded = true;
    }

    // Ground
    ctx.strokeStyle = "rgba(255, 0, 122, 0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(CANVAS_WIDTH, 350);
    ctx.stroke();

    // Draw Player
    ctx.fillStyle = "#ccff00";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ccff00";
    ctx.fillRect(player.current.x, player.current.y, PLAYER_SIZE, PLAYER_SIZE);

    // Update & Draw Obstacles
    gameSpeed.current = 5 + (scoreRef.current / 1000);
    obstacles.current.forEach((obs, idx) => {
      obs.x -= gameSpeed.current;
      
      // Draw Spike (Triangle)
      ctx.fillStyle = "#ff007a";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff007a";
      ctx.beginPath();
      ctx.moveTo(obs.x, 350);
      ctx.lineTo(obs.x + obs.w/2, 350 - obs.h);
      ctx.lineTo(obs.x + obs.w, 350);
      ctx.closePath();
      ctx.fill();

      // Collision
      if (
        player.current.x + PLAYER_SIZE > obs.x + 5 &&
        player.current.x < obs.x + obs.w - 5 &&
        player.current.y + PLAYER_SIZE > 350 - obs.h + 5
      ) {
        setGameState("GAMEOVER");
      }

      // Recycle
      if (obs.x < -50) {
        obs.x = CANVAS_WIDTH + Math.random() * 300 + 200;
        scoreRef.current += 100;
        setScore(scoreRef.current);
      }
    });

    // Glitch Effect logic (visual only)
    if (scoreRef.current > 0 && scoreRef.current % 500 === 0) {
       ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
       ctx.fillRect(Math.random() * CANVAS_WIDTH, 0, 20, CANVAS_HEIGHT);
    }

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
    <FeatureGuard featureId="dash">
    <main className="min-h-screen bg-background grid-bg flex flex-col pt-20 touch-none">
      <Navbar />
      <MinimalFeedback featureName="GLITCH_DASH" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            GLITCH_<span className="text-hyper-pink">DASH</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            NEURAL_REFLEX_TRAINING_ACTIVE
          </p>
        </div>

        <div 
          className="relative glass-panel border-4 border-foreground/10 overflow-hidden cursor-pointer touch-none bg-background/50 w-full max-w-4xl aspect-video md:aspect-[2/1]"
          onPointerDown={jump}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full" />

          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-background/80 border border-electric-volt/30 glass-panel">
             <Activity className="w-4 h-4 text-electric-volt" />
             <span className="text-2xl font-black italic tabular-nums">{score}</span>
          </div>

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 p-8 text-center">
              <button className="px-10 py-5 bg-foreground text-background font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ccff00] mb-6">
                START_SYNC
              </button>
              <div className="p-4 border-2 border-hyper-pink bg-hyper-pink/5">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-relaxed">
                  TAP TO JUMP<br/>
                  AVOID THE RED SPIKES<br/>
                  STAY IN THE RHYTHM
                </p>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl text-center px-4">
              <Ghost className="w-12 h-12 text-hyper-pink mb-4 animate-bounce" />
              <h2 className="text-5xl font-black italic uppercase mb-2">SYNC_LOST</h2>
              <div className="bg-electric-volt text-background px-8 py-4 mb-6 shadow-[8px_8px_0_0_#ff007a]">
                <span className="text-3xl font-black italic tracking-tighter">SCORE_INDEX: {score}</span>
              </div>
              <Leaderboard gameId="glitch_dash" currentScore={score} onRestart={initGame} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}
