"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Ghost, Eye } from "lucide-react";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 30;

export default function MazeGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "WIN">("IDLE");
  const [score, setScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerPos = useRef({ x: 1, y: 1 });
  const mazeRef = useRef<number[][]>([]);

  const generateMaze = () => {
    const rows = CANVAS_HEIGHT / GRID_SIZE;
    const cols = CANVAS_WIDTH / GRID_SIZE;
    const maze = Array(rows).fill(0).map(() => Array(cols).fill(1));

    const walk = (r: number, c: number) => {
      maze[r][c] = 0;
      const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === 1) {
          maze[r + dr / 2][c + dc / 2] = 0;
          walk(nr, nc);
        }
      }
    };
    walk(1, 1);
    maze[rows - 2][cols - 2] = 2; // Goal
    mazeRef.current = maze;
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    mazeRef.current.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) {
          ctx.fillStyle = "#111";
          ctx.fillRect(c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          ctx.strokeStyle = "#ff007a";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        } else if (cell === 2) {
          ctx.fillStyle = "#ccff00";
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#ccff00";
          ctx.fillRect(c * GRID_SIZE + 5, r * GRID_SIZE + 5, GRID_SIZE - 10, GRID_SIZE - 10);
        }
      });
    });

    // Player
    ctx.fillStyle = "#00f0ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f0ff";
    ctx.fillRect(playerPos.current.x * GRID_SIZE + 5, playerPos.current.y * GRID_SIZE + 5, GRID_SIZE - 10, GRID_SIZE - 10);
  }, []);

  const initGame = () => {
    generateMaze();
    playerPos.current = { x: 1, y: 1 };
    setGameState("PLAYING");
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) draw(ctx);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;
      const { x, y } = playerPos.current;
      let nx = x, ny = y;
      if (e.key === "ArrowUp") ny--;
      if (e.key === "ArrowDown") ny++;
      if (e.key === "ArrowLeft") nx--;
      if (e.key === "ArrowRight") nx++;

      if (mazeRef.current[ny][nx] !== 1) {
        playerPos.current = { x: nx, y: ny };
        if (mazeRef.current[ny][nx] === 2) {
          setGameState("WIN");
          setScore(s => s + 1000);
        }
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) draw(ctx);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, draw]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter text-glitch">DARK_<span className="text-cyber-blue">MAZE</span></h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px]">PATHFINDING_PROTOCOL_ACTIVE</p>
        </div>
        <div className="relative glass-panel border-4 border-white/10 overflow-hidden" style={{ width: 600, height: 600 }}>
          <canvas ref={canvasRef} width={600} height={600} />
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <Eye className="w-20 h-20 text-cyber-blue mb-8 animate-pulse" />
              <button onClick={initGame} className="px-10 py-5 bg-cyber-blue text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a]">BOOT_MAZE</button>
            </div>
          )}
          {gameState === "WIN" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-electric-volt/20 backdrop-blur-md">
              <Zap className="w-20 h-20 text-white mb-6 animate-ping" />
              <h2 className="text-6xl font-black text-white italic uppercase mb-2">MAZE_BREACHED</h2>
              <button onClick={initGame} className="px-10 py-5 bg-black text-white font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ccff00]">NEXT_LEVEL</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
