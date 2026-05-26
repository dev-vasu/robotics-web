"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Smartphone, RefreshCcw, Activity, Ghost, Info } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 40;
const GRAVITY = 0.45; // Reduced from 0.6 for floatier feel
const JUMP_FORCE = -9; // Adjusted for new gravity
const START_SPEED = 2.5; // Reduced from 4 for slow start

export default function JumpGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  // Game state refs for loop
  const playerRef = useRef({ y: 300, vy: 0, x: 100 });
  const obstaclesRef = useRef<{ x: number; height: number; passed: boolean }[]>([]);
  const scoreRef = useRef(0);

  const initGame = () => {
    // Reset player to safe center position with 0 velocity
    playerRef.current = { y: 300, vy: 0, x: 100 };
    // Spawn first obstacles further away to give player time to react
    obstaclesRef.current = [
      { x: 600, height: 200, passed: false },
      { x: 950, height: 300, passed: false }
    ];
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const jump = useCallback(() => {
    if (gameState === "PLAYING") {
      playerRef.current.vy = JUMP_FORCE;
    } else if (gameState === "IDLE" || gameState === "GAMEOVER") {
      initGame();
    }
  }, [gameState]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ground & Ceiling Warning Zones
    ctx.fillStyle = "rgba(255, 0, 122, 0.1)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, 20);
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Player Physics
    playerRef.current.vy += GRAVITY;
    playerRef.current.y += playerRef.current.vy;

    // Draw Player
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#00f0ff";
    ctx.fill();
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#00f0ff";
    ctx.closePath();

    // Obstacles (Lasers)
    // Dynamic Speed: Starts slow, gets faster as you score
    const currentSpeed = START_SPEED + (scoreRef.current * 0.15);
    
    obstaclesRef.current.forEach((obs, index) => {
      obs.x -= currentSpeed;

      // Draw Laser Beam
      ctx.fillStyle = "#ff007a";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff007a";
      
      // Top laser
      ctx.fillRect(obs.x, 0, 40, obs.height);
      // Bottom laser
      const gap = 200; // Increased gap for fairness
      ctx.fillRect(obs.x, obs.height + gap, 40, CANVAS_HEIGHT);

      // Collision Detection
      const p = playerRef.current;
      // Precision hit box
      if (
        p.x + 12 > obs.x && 
        p.x - 12 < obs.x + 40 && 
        (p.y - 12 < obs.height || p.y + 12 > obs.height + gap)
      ) {
        setGameState("GAMEOVER");
      }

      // Score Tracking
      if (!obs.passed && obs.x < p.x) {
        obs.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      // Cleanup & Respawn
      if (obs.x < -60) {
        obstaclesRef.current.splice(index, 1);
        obstaclesRef.current.push({
          x: CANVAS_WIDTH + 150,
          height: Math.random() * (CANVAS_HEIGHT - 350) + 75,
          passed: false
        });
      }
    });

    // Boundary death (Floor or Ceiling)
    if (playerRef.current.y < 15 || playerRef.current.y > CANVAS_HEIGHT - 15) {
      setGameState("GAMEOVER");
    }
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || gameState !== "PLAYING") return;

    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState === "PLAYING") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.code === "Space") jump(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [jump]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20 touch-none">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-cyber-blue">JUMP</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.3em] text-[10px] mt-2">
            STABILITY_RE-CALIBRATED
          </p>
        </div>

        <div 
          className="relative glass-panel border-4 border-white/10 overflow-hidden cursor-pointer shadow-[0_0_50px_rgba(0,240,255,0.1)]"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onClick={jump}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-8 text-center">
              <div className="w-20 h-20 bg-cyber-blue rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_30px_#00f0ff]">
                <Smartphone className="w-10 h-10 text-black" />
              </div>
              <button 
                className="px-10 py-5 bg-white text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a] mb-8 hover:bg-cyber-blue transition-all"
              >
                BOOT_SYSTEM
              </button>
              <div className="space-y-4">
                <div className="p-3 border border-white/10 glass-panel bg-white/5">
                  <div className="text-[8px] text-cyber-blue font-black uppercase mb-1">STABILITY_CHECK</div>
                  <div className="text-white font-bold text-[10px]">PHYSICS_NORMALIZED // START_SLOW</div>
                </div>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                  TAP_OR_SPACE_TO_JUMP
                </p>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-600/20 backdrop-blur-xl border-4 border-red-500/30">
              <Ghost className="w-20 h-20 text-white mb-6 animate-pulse" />
              <h2 className="text-5xl font-black text-white italic uppercase mb-2">TERMINATED</h2>
              <div className="bg-black px-8 py-3 border-2 border-cyber-blue mb-8">
                <span className="text-cyber-blue text-3xl font-black italic tabular-nums">SCORE: {score}</span>
              </div>
              <button className="px-10 py-5 bg-white text-black font-black text-xl uppercase italic hover:bg-electric-volt transition-all shadow-[8px_8px_0_0_#000]">
                RE-BOOT_CORE
              </button>
            </div>
          )}

          {gameState === "PLAYING" && (
            <div className="absolute top-10 left-0 w-full text-center pointer-events-none">
              <div className="text-white text-8xl font-black italic tracking-tighter opacity-20 tabular-nums select-none">{score}</div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 w-full max-w-[400px]">
           <div className="flex-1 p-4 glass-panel border-l-4 border-cyber-blue">
              <div className="text-[8px] font-black text-white/40 uppercase mb-1">HI_SCORE</div>
              <div className="text-xl font-black italic text-white">{highScore}</div>
           </div>
           <div className="flex-1 p-4 glass-panel border-l-4 border-hyper-pink">
              <div className="text-[8px] font-black text-white/40 uppercase mb-1">VELOCITY</div>
              <div className="text-xl font-black italic text-white">{(START_SPEED + score * 0.15).toFixed(1)}x</div>
           </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
