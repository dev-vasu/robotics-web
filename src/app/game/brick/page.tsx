"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Zap, Ghost, ShieldAlert } from "lucide-react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 30;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 45;

export default function BrickGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER" | "WIN">("IDLE");
  const [score, setScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const paddleX = useRef(350);
  const ballRef = useRef({ x: 400, y: 500, vx: 4, vy: -4 });
  const bricksRef = useRef<any[]>([]);

  const initGame = () => {
    bricksRef.current = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        bricksRef.current.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          status: 1,
          color: r % 2 === 0 ? "#ff007a" : "#00f0ff"
        });
      }
    }
    ballRef.current = { x: 400, y: 500, vx: 4, vy: -4 };
    setScore(0);
    setGameState("PLAYING");
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Paddle
    ctx.fillStyle = "#ccff00";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ccff00";
    ctx.fillRect(paddleX.current, CANVAS_HEIGHT - 40, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    const b = ballRef.current;
    b.x += b.vx;
    b.y += b.vy;

    if (b.x < 0 || b.x > CANVAS_WIDTH) b.vx *= -1;
    if (b.y < 0) b.vy *= -1;

    // Paddle hit
    if (b.y > CANVAS_HEIGHT - 55 && b.x > paddleX.current && b.x < paddleX.current + PADDLE_WIDTH) {
      b.vy *= -1;
      b.y = CANVAS_HEIGHT - 56;
    }

    // Death
    if (b.y > CANVAS_HEIGHT) setGameState("GAMEOVER");

    // Bricks
    let activeBricks = 0;
    bricksRef.current.forEach(brick => {
      if (brick.status === 1) {
        activeBricks++;
        ctx.fillStyle = brick.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = brick.color;
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);

        // Collision
        if (b.x > brick.x && b.x < brick.x + BRICK_WIDTH && b.y > brick.y && b.y < brick.y + BRICK_HEIGHT) {
          b.vy *= -1;
          brick.status = 0;
          setScore(s => s + 50);
        }
      }
    });

    if (activeBricks === 0 && gameState === "PLAYING") setGameState("WIN");

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }, [gameState]);

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
    paddleX.current = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, e.clientX - rect.left - PADDLE_WIDTH / 2));
  };

  return (
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20">
      <Navbar />
      <MinimalFeedback featureName="BIT_CRUSH" />
      <BackToArcade />
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter text-glitch">BIT_<span className="text-cyber-blue">CRUSH</span></h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px]">DECONSTRUCTION_MODE_ON</p>
        </div>
        <div className="relative glass-panel border-4 border-white/10 overflow-hidden cursor-none" style={{ width: 800, height: 600 }} onMouseMove={handleMouseMove} onClick={() => gameState !== "PLAYING" && initGame()}>
          <canvas ref={canvasRef} width={800} height={600} />
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90">
              <button className="px-10 py-5 bg-cyber-blue text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a]">BOOT_DESTRUCTOR</button>
            </div>
          )}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-5xl font-black text-white italic uppercase mb-2">SYSTEM_CRASH</h2>
              <button className="px-10 py-5 bg-white text-black font-black text-xl uppercase shadow-[8px_8px_0_0_#ff007a]">RE-LINK</button>
            </div>
          )}
          {gameState === "WIN" && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-electric-volt/20 backdrop-blur-md">
               <Zap className="w-20 h-20 text-white mb-6 animate-ping" />
               <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase mb-2 text-center">
                 {score >= 2000 ? "MAIN_CHARACTER" : "W_RIZZ"}
               </h2>
               <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mb-6 text-center">
                 {score >= 2000 ? "PERFECT CLEAR. NO CAP." : "YOU COOKED BRO."}
               </p>
               <button className="px-10 py-5 bg-black text-white font-black text-xl uppercase" onClick={() => initGame()}>NEXT_STAGE</button>
             </div>
          )}
          {gameState === "PLAYING" && (
            <div className="absolute top-6 right-8 text-white font-black italic text-4xl tabular-nums opacity-20">{score}</div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
