"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Ghost, Skull } from "lucide-react";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;

export default function SnakeGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const snake = useRef<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
  const food = useRef({ x: 15, y: 15 });
  const direction = useRef({ x: 0, y: 0 });
  const lastDir = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  const initGame = () => {
    snake.current = [{ x: 10, y: 10 }];
    direction.current = { x: 1, y: 0 };
    lastDir.current = { x: 1, y: 0 };
    spawnFood();
    setScore(0);
    setGameState("PLAYING");
  };

  const spawnFood = () => {
    food.current = {
      x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
    };
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    frameRef.current++;
    // Speed control: update every 5 frames
    if (frameRef.current % 6 !== 0) return;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Move Snake
    const head = { x: snake.current[0].x + direction.current.x, y: snake.current[0].y + direction.current.y };
    lastDir.current = direction.current;

    // Collision
    if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
      setGameState("GAMEOVER");
      return;
    }
    if (snake.current.some(s => s.x === head.x && s.y === head.y)) {
      setGameState("GAMEOVER");
      return;
    }

    snake.current.unshift(head);

    // Eat Food
    if (head.x === food.current.x && head.y === food.current.y) {
      setScore(s => s + 100);
      spawnFood();
    } else {
      snake.current.pop();
    }

    // Draw Food
    ctx.fillStyle = "#ff007a";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff007a";
    ctx.fillRect(food.current.x * GRID_SIZE, food.current.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

    // Draw Snake
    snake.current.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#00f0ff" : "#ccff00";
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.fillRect(s.x * GRID_SIZE, s.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });
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
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;
      const { x, y } = lastDir.current;
      if (e.key === "ArrowUp" && y === 0) direction.current = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && y === 0) direction.current = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && x === 0) direction.current = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && x === 0) direction.current = { x: 1, y: 0 };
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter text-glitch">NEON_<span className="text-hyper-pink">SNAKE</span></h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-[10px]">ORGANIC_LINK_ACTIVE</p>
        </div>
        <div className="relative glass-panel border-4 border-white/10 overflow-hidden" style={{ width: 600, height: 600 }}>
          <canvas ref={canvasRef} width={600} height={600} />
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90">
              <button onClick={initGame} className="px-10 py-5 bg-hyper-pink text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#00f0ff]">START_GROWTH</button>
              <p className="mt-6 text-white/40 font-black uppercase text-[10px]">USE_ARROWS_TO_GUIDE</p>
            </div>
          )}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <Skull className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-5xl font-black text-white italic uppercase mb-2">METABOLISM_FAIL</h2>
              <div className="text-hyper-pink text-3xl font-black mb-8 italic uppercase">SCORE: {score}</div>
              <button onClick={initGame} className="px-10 py-5 bg-white text-black font-black text-xl uppercase shadow-[8px_8px_0_0_#ff007a]">RE-LINK</button>
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
