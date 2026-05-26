"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Zap, Ghost, ShieldAlert } from "lucide-react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;

export default function PongGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const playerY = useRef(200);
  const aiY = useRef(200);
  const ballRef = useRef({ x: 400, y: 250, vx: 5, vy: 5 });
  const scoreRef = useRef(0);

  const initGame = () => {
    ballRef.current = { x: 400, y: 250, vx: 6, vy: (Math.random() - 0.5) * 10 };
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Center Line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player Paddle
    ctx.fillStyle = "#00f0ff";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00f0ff";
    ctx.fillRect(20, playerY.current, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI Paddle
    ctx.fillStyle = "#ff007a";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff007a";
    ctx.fillRect(CANVAS_WIDTH - 20 - PADDLE_WIDTH, aiY.current, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    const b = ballRef.current;
    b.x += b.vx;
    b.y += b.vy;

    // AI Logic
    const aiTarget = b.y - PADDLE_HEIGHT / 2;
    aiY.current += (aiTarget - aiY.current) * 0.1;

    // Wall Bounce
    if (b.y < 0 || b.y > CANVAS_HEIGHT) b.vy *= -1;

    // Paddle Collision
    if (b.x < 35 && b.y > playerY.current && b.y < playerY.current + PADDLE_HEIGHT) {
      b.vx *= -1.1;
      scoreRef.current += 10;
      setScore(scoreRef.current);
    }
    if (b.x > CANVAS_WIDTH - 35 && b.y > aiY.current && b.y < aiY.current + PADDLE_HEIGHT) {
      b.vx *= -1.1;
    }

    // Death
    if (b.x < 0) setGameState("GAMEOVER");
    if (b.x > CANVAS_WIDTH) {
       b.x = CANVAS_WIDTH / 2;
       b.vx = -6;
    }

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    playerY.current = e.clientY - rect.top - PADDLE_HEIGHT / 2;
  };

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />
      <BackToArcade />
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter text-glitch">VOID_<span className="text-cyber-blue">PONG</span></h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px]">PADDLE_LINK_STABLE</p>
        </div>
        <div className="relative glass-panel border-4 border-white/10 overflow-hidden cursor-none" style={{ width: 800, height: 500 }} onMouseMove={handleMouseMove} onClick={() => gameState !== "PLAYING" && initGame()}>
          <canvas ref={canvasRef} width={800} height={500} />
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90">
              <button className="px-10 py-5 bg-cyber-blue text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a]">INITIALIZE_PADDLE</button>
            </div>
          )}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase mb-2 text-center">
                {score <= 50 ? "NPC_BEHAVIOR" : 
                 score <= 150 ? "SKILL_ISSUE" : 
                 score <= 300 ? "KINDA_MID" : 
                 score <= 600 ? "COOKING_RN" : 
                 score <= 1000 ? "W_RIZZ" : 
                 "MAIN_CHARACTER"}
              </h2>
              <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mb-6 text-center">
                {score <= 50 ? "BRO MISSED THE SLOWEST BALL EVER 💀" : 
                 score <= 150 ? "LITERALLY ZERO REFLEXES." : 
                 score <= 300 ? "MID RALLIES NGGL." : 
                 score <= 600 ? "COOKING THE AI. NOT BAD." : 
                 score <= 1000 ? "BRO IS ROGER FEDERER." : 
                 "CERTIFIED PONG GOD. TOUCH GRASS."}
              </p>
              <button className="px-10 py-5 bg-white text-black font-black text-xl uppercase shadow-[8px_8px_0_0_#ff007a]" onClick={() => initGame()}>RE-LINK</button>
            </div>
          )}
          {gameState === "PLAYING" && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/20 font-black italic text-8xl select-none">{score}</div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
