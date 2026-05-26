"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Smartphone, RefreshCcw, Activity, Ghost, Info } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 40;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const BASE_SPEED = 4;

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
    playerRef.current = { y: 300, vy: 0, x: 100 };
    obstaclesRef.current = [
      { x: 500, height: 200, passed: false },
      { x: 800, height: 300, passed: false }
    ];
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const jump = useCallback(() => {
    if (gameState === "PLAYING") {
      playerRef.current.vy = JUMP_FORCE;
    } else if (gameState !== "LOADING") {
      initGame();
    }
  }, [gameState]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ground & Ceiling
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, 20);
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Player
    playerRef.current.vy += GRAVITY;
    playerRef.current.y += playerRef.current.vy;

    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#00f0ff";
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00f0ff";
    ctx.closePath();

    // Obstacles (Lasers)
    const speed = BASE_SPEED + (scoreRef.current / 10);
    obstaclesRef.current.forEach((obs, index) => {
      obs.x -= speed;

      // Draw Laser Beam
      ctx.fillStyle = "#ff007a";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff007a";
      
      // Top laser
      ctx.fillRect(obs.x, 0, 40, obs.height);
      // Bottom laser
      const gap = 180;
      ctx.fillRect(obs.x, obs.height + gap, 40, CANVAS_HEIGHT);

      // Collision
      const p = playerRef.current;
      if (
        p.x + 15 > obs.x && 
        p.x - 15 < obs.x + 40 && 
        (p.y - 15 < obs.height || p.y + 15 > obs.height + gap)
      ) {
        setGameState("GAMEOVER");
      }

      // Point
      if (!obs.passed && obs.x < p.x) {
        obs.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      // Cleanup & Respawn
      if (obs.x < -50) {
        obstaclesRef.current.splice(index, 1);
        obstaclesRef.current.push({
          x: CANVAS_WIDTH + 100,
          height: Math.random() * (CANVAS_HEIGHT - 300) + 50,
          passed: false
        });
      }
    });

    // Boundary death
    if (playerRef.current.y < 0 || playerRef.current.y > CANVAS_HEIGHT) {
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
          <p className="text-hyper-pink font-black uppercase tracking-[0.3em] text-[10px] mt-2">
            MOBILE_OPTIMIZED_UPLINK
          </p>
        </div>

        <div 
          className="relative glass-panel border-4 border-white/10 overflow-hidden cursor-pointer"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onClick={jump}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-8 text-center">
              <Smartphone className="w-16 h-16 text-cyber-blue mb-6 animate-pulse" />
              <button 
                className="px-10 py-5 bg-cyber-blue text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a] mb-8"
              >
                TOUCH_TO_START
              </button>
              <div className="space-y-4">
                <div className="p-3 border border-white/10 glass-panel">
                  <div className="text-[8px] text-cyber-blue font-black uppercase mb-1">CONTROLS</div>
                  <div className="text-white font-bold text-[10px]">TOUCH / SPACE: JUMP</div>
                </div>
                <div className="p-3 border border-white/10 glass-panel">
                  <div className="text-[8px] text-hyper-pink font-black uppercase mb-1">OBJECTIVE</div>
                  <div className="text-white font-bold text-[10px]">DODGE_LASER_BEAMS</div>
                </div>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <Ghost className="w-20 h-20 text-red-500 mb-6" />
              <h2 className="text-5xl font-black text-white italic uppercase mb-2">CRASHED</h2>
              <div className="text-cyber-blue text-3xl font-black mb-8 italic">SCORE: {score}</div>
              <button className="px-10 py-5 bg-white text-black font-black text-xl uppercase shadow-[8px_8px_0_0_#ff007a]">RE-LINK</button>
            </div>
          )}

          {gameState === "PLAYING" && (
            <div className="absolute top-6 left-0 w-full text-center pointer-events-none">
              <div className="text-white text-6xl font-black italic tracking-tighter opacity-50 tabular-nums">{score}</div>
            </div>
          )}
        </div>

        <div className="mt-6 text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">
          TAP_SCREEN_TO_JUMP_
        </div>
      </div>

      <Footer />
    </main>
  );
}
