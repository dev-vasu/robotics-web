"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Zap, Ghost, Timer } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const STACK_HEIGHT = 40;

export default function StacksGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const blocks = useRef<{ x: number; y: number; width: number }[]>([]);
  const currentBlock = useRef({ x: 0, width: 200, speed: 4, direction: 1 });
  const scoreRef = useRef(0);

  const initGame = () => {
    blocks.current = [{ x: 100, y: CANVAS_HEIGHT - STACK_HEIGHT, width: 200 }];
    currentBlock.current = { x: 0, width: 200, speed: 4, direction: 1 };
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const placeBlock = useCallback(() => {
    if (gameState !== "PLAYING") {
      initGame();
      return;
    }

    const lastBlock = blocks.current[blocks.current.length - 1];
    const b = currentBlock.current;
    
    // Calculate Overlap
    const left = Math.max(b.x, lastBlock.x);
    const right = Math.min(b.x + b.width, lastBlock.x + lastBlock.width);
    const newWidth = right - left;

    if (newWidth <= 0) {
      setGameState("GAMEOVER");
      return;
    }

    blocks.current.push({ x: left, y: lastBlock.y - STACK_HEIGHT, width: newWidth });
    currentBlock.current = { 
      x: 0, 
      width: newWidth, 
      speed: 4 + scoreRef.current / 5, 
      direction: 1 
    };
    scoreRef.current += 1;
    setScore(scoreRef.current);

    // Scroll if too high
    if (blocks.current.length > 5) {
      blocks.current.forEach(bl => bl.y += STACK_HEIGHT);
    }
  }, [gameState]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Stacked Blocks
    blocks.current.forEach((bl, i) => {
      ctx.fillStyle = i % 2 === 0 ? "#00f0ff" : "#ff007a";
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.fillRect(bl.x, bl.y, bl.width, STACK_HEIGHT - 2);
    });

    // Current Moving Block
    const b = currentBlock.current;
    b.x += b.speed * b.direction;
    if (b.x + b.width > CANVAS_WIDTH || b.x < 0) b.direction *= -1;

    ctx.fillStyle = "#ccff00";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ccff00";
    const lastY = blocks.current[blocks.current.length - 1]?.y || CANVAS_HEIGHT;
    ctx.fillRect(b.x, lastY - STACK_HEIGHT, b.width, STACK_HEIGHT - 2);
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

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />
      <MinimalFeedback featureName="CYBER_STACKS" />
      <BackToArcade />
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter text-glitch">CYBER_<span className="text-hyper-pink">STACKS</span></h1>
          <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-[10px]">STRUCTURAL_INTEGRITY_REQUIRED</p>
        </div>
        <div className="relative glass-panel border-4 border-white/10 overflow-hidden cursor-pointer" style={{ width: 400, height: 600 }} onClick={placeBlock}>
          <canvas ref={canvasRef} width={400} height={600} />
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90">
              <button className="px-10 py-5 bg-cyber-blue text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#ff007a]">BOOT_STACKER</button>
              <p className="mt-6 text-white/40 font-black uppercase text-[10px]">TAP_TO_STACK</p>
            </div>
          )}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 text-center">
              <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase mb-2">
                {score <= 3 ? "NPC_BEHAVIOR" : 
                 score <= 8 ? "SKILL_ISSUE" : 
                 score <= 15 ? "KINDA_MID" : 
                 score <= 25 ? "COOKING_RN" : 
                 score <= 40 ? "W_RIZZ" : 
                 "MAIN_CHARACTER"}
              </h2>
              <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mb-6">
                {score <= 3 ? "BRO CAN'T EVEN STACK 3 BLOCKS 💀" : 
                 score <= 8 ? "YOUR TIMING IS LITERALLY TRASH." : 
                 score <= 15 ? "MID STACKS. TRY HARDER." : 
                 score <= 25 ? "WE VIBING. LET HIM COOK." : 
                 score <= 40 ? "BRO IS AN ARCHITECT." : 
                 "CERTIFIED BUILDER. TOUCH GRASS NOW."}
              </p>
              <div className="text-cyber-blue text-3xl font-black mb-8 italic">STACKS: {score}</div>
              <button className="px-10 py-5 bg-white text-black font-black text-xl uppercase shadow-[8px_8px_0_0_#ff007a]" onClick={initGame}>RE-BUILD</button>
            </div>
          )}
          {gameState === "PLAYING" && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-black italic text-6xl tabular-nums opacity-20 select-none">{score}</div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
