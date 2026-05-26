"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Zap, Ghost, Eye, Trophy, ChevronRight } from "lucide-react";

const CANVAS_SIZE = 600;

export default function MazeGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "WIN">("IDLE");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerPos = useRef({ x: 1, y: 1 });
  const mazeRef = useRef<number[][]>([]);
  const gridCountRef = useRef(15); // Start with a 15x15 maze

  const generateMaze = (count: number) => {
    // Ensure count is odd for the recursive backtracker to work perfectly
    const rows = count % 2 === 0 ? count + 1 : count;
    const cols = rows;
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
    // Goal is always at the bottom-right reachable cell
    maze[rows - 2][cols - 2] = 2; 
    mazeRef.current = maze;
    gridCountRef.current = rows;
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const rows = gridCountRef.current;
    const cellSize = CANVAS_SIZE / rows;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    mazeRef.current.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) {
          ctx.fillStyle = "#111";
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          ctx.strokeStyle = "#ff007a";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
        } else if (cell === 2) {
          // Goal (The Exit)
          ctx.fillStyle = "#ccff00";
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#ccff00";
          ctx.fillRect(c * cellSize + cellSize*0.2, r * cellSize + cellSize*0.2, cellSize*0.6, cellSize*0.6);
        }
      });
    });

    // Player
    ctx.fillStyle = "#00f0ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f0ff";
    ctx.fillRect(playerPos.current.x * cellSize + cellSize*0.2, playerPos.current.y * cellSize + cellSize*0.2, cellSize*0.6, cellSize*0.6);
  }, []);

  const initGame = (lvl: number) => {
    // Level 1: 15x15, Level 2: 21x21, Level 3: 27x27...
    const count = 15 + (lvl - 1) * 6;
    generateMaze(count);
    playerPos.current = { x: 1, y: 1 };
    setGameState("PLAYING");
    
    // Use a small timeout to ensure canvas is ready
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) draw(ctx);
    }, 0);
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    initGame(nextLvl);
  };

  const startOver = () => {
    setLevel(1);
    setScore(0);
    initGame(1);
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

      if (mazeRef.current[ny] && mazeRef.current[ny][nx] !== 1) {
        playerPos.current = { x: nx, y: ny };
        if (mazeRef.current[ny][nx] === 2) {
          setGameState("WIN");
          setScore(s => s + (level * 1000));
        }
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) draw(ctx);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, level, draw]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />
      <MinimalFeedback featureName="DARK_MAZE" />
      <BackToArcade />
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter text-glitch">DARK_<span className="text-cyber-blue">MAZE</span></h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px]">LEVEL_{level}_PATH_CALCULATION</p>
        </div>

        <div className="relative glass-panel border-4 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(255,0,122,0.1)]" style={{ width: 600, height: 600 }}>
          <canvas ref={canvasRef} width={600} height={600} />
          
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
              <Eye className="w-20 h-20 text-cyber-blue mb-8 animate-pulse" />
              <button onClick={() => initGame(1)} className="px-16 py-8 bg-cyber-blue text-black font-black text-3xl uppercase italic shadow-[12px_12px_0_0_#ff007a]">BOOT_MAZE_V2</button>
              <div className="mt-8 text-white/40 font-black uppercase text-[10px] tracking-widest text-center">
                 USE_ARROWS_TO_NAVIGATE<br/>
                 FIND_THE_EXIT_PROTOCOL_
              </div>
            </div>
          )}

          {gameState === "WIN" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-electric-volt/20 backdrop-blur-md border-4 border-electric-volt">
              <Trophy className="w-20 h-20 text-white mb-6 animate-bounce" />
              <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase mb-2 text-center">
                 {level <= 1 ? "KINDA_MID" : 
                  level <= 3 ? "COOKING_RN" : 
                  level <= 5 ? "W_RIZZ" : 
                  "MAIN_CHARACTER"}
              </h2>
              <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mb-6 text-center">
                 {level <= 1 ? "IT WAS JUST LEVEL 1 BRO." : 
                  level <= 3 ? "WE SEE YOU NAVIGATING." : 
                  level <= 5 ? "BRO KNOWS THE WAY." : 
                  "CERTIFIED MINOTAUR. TOUCH GRASS."}
              </p>
              <div className="bg-black px-10 py-4 border-2 border-cyber-blue mb-8">
                <span className="text-cyber-blue text-4xl font-black italic">LEVEL {level} DONE</span>
              </div>
              <button onClick={nextLevel} className="flex items-center gap-4 px-12 py-6 bg-white text-black font-black text-2xl uppercase italic hover:bg-cyber-blue transition-all">
                NEXT_LEVEL <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 w-full max-w-[600px]">
           <div className="flex-1 glass-panel p-6 border-l-4 border-cyber-blue">
              <div className="text-[10px] font-black text-white/40 uppercase mb-1">INTEL_POINTS</div>
              <div className="text-3xl font-black italic text-white tabular-nums">{score}</div>
           </div>
           <div className="flex-1 glass-panel p-6 border-l-4 border-hyper-pink">
              <div className="text-[10px] font-black text-white/40 uppercase mb-1">MAZE_DENSITY</div>
              <div className="text-3xl font-black italic text-white">{gridCountRef.current}x{gridCountRef.current}</div>
           </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
