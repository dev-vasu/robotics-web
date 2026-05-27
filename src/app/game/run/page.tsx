"use client";

import FeatureGuard from "@/components/FeatureGuard";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Zap, Ghost, Timer, Activity } from "lucide-react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PLAYER_X = 50;
const PLAYER_SIZE = 40;
const GRAVITY = 0.6;
const JUMP_FORCE = -15;

export default function RunGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const playerRef = useRef({ y: 340, vy: 0, isJumping: false });
  const obstaclesRef = useRef<{ x: number; width: number; height: number }[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);

  const initGame = () => {
    playerRef.current = { y: 340, vy: 0, isJumping: false };
    obstaclesRef.current = [{ x: 900, width: 40, height: 60 }];
    scoreRef.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const jump = useCallback(() => {
    if (gameState === "PLAYING" && !playerRef.current.isJumping) {
      playerRef.current.vy = JUMP_FORCE;
      playerRef.current.isJumping = true;
    } else if (gameState !== "PLAYING") {
      initGame();
    }
  }, [gameState]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Floor
    ctx.strokeStyle = "#ff007a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(CANVAS_WIDTH, 380);
    ctx.stroke();

    // Player
    if (gameState === "PLAYING") {
      playerRef.current.vy += GRAVITY;
      playerRef.current.y += playerRef.current.vy;

      if (playerRef.current.y > 340) {
        playerRef.current.y = 340;
        playerRef.current.vy = 0;
        playerRef.current.isJumping = false;
      }
    }

    ctx.fillStyle = "#00f0ff";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00f0ff";
    ctx.fillRect(PLAYER_X, playerRef.current.y, PLAYER_SIZE, PLAYER_SIZE);

    // Obstacles
    const speed = 6 + Math.floor(scoreRef.current / 500);
    obstaclesRef.current.forEach((obs, index) => {
      obs.x -= speed;

      ctx.fillStyle = "#ff007a";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff007a";
      ctx.fillRect(obs.x, 380 - obs.height, obs.width, obs.height);

      // Collision
      if (
        PLAYER_X + PLAYER_SIZE > obs.x && 
        PLAYER_X < obs.x + obs.width && 
        playerRef.current.y + PLAYER_SIZE > 380 - obs.height
      ) {
        setGameState("GAMEOVER");
      }

      if (obs.x < -100) {
        obstaclesRef.current.splice(index, 1);
        scoreRef.current += 100;
        setScore(scoreRef.current);
      }
    });

    if (frameRef.current % 100 === 0 && gameState === "PLAYING") {
      obstaclesRef.current.push({
        x: CANVAS_WIDTH + Math.random() * 300,
        width: 30 + Math.random() * 40,
        height: 40 + Math.random() * 60
      });
    }
    frameRef.current++;
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "ArrowUp") jump(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [jump]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <FeatureGuard featureId="run">
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20">
      <Navbar />
      <MinimalFeedback featureName="CYBER_RUN" />
      <BackToArcade />
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic text-foreground uppercase tracking-tighter text-glitch">CYBER_<span className="text-hyper-pink">RUN</span></h1>
          <p className="text-cyber-blue font-black uppercase tracking-[0.3em] text-[10px]">SPEED_CORE_ACTIVE</p>
        </div>
        <div className="relative glass-panel border-4 border-foreground/10 overflow-hidden cursor-pointer" style={{ width: 800, height: 400 }} onClick={jump}>
          <canvas ref={canvasRef} width={800} height={400} />
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90">
              <button className="px-10 py-5 bg-hyper-pink text-background font-black text-xl uppercase italic shadow-[10px_10px_0_0_#00f0ff]">BOOT_RUNNER</button>
              <p className="mt-6 text-dim font-black uppercase text-[10px]">TAP_OR_SPACE_TO_JUMP</p>
            </div>
          )}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95">
              <Ghost className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-5xl md:text-6xl font-black text-foreground italic uppercase mb-2 text-center">
                {score <= 500 ? "NPC_BEHAVIOR" : 
                 score <= 1500 ? "SKILL_ISSUE" : 
                 score <= 3000 ? "KINDA_MID" : 
                 score <= 6000 ? "COOKING_RN" : 
                 score <= 10000 ? "W_RIZZ" : 
                 "MAIN_CHARACTER"}
              </h2>
              <p className="text-foreground/80 font-black uppercase tracking-widest text-[10px] mb-6 text-center">
                {score <= 500 ? "BRO TRIPPED ON AIR 💀" : 
                 score <= 1500 ? "NOT VERY DEMURE HURDLE SKILLS." : 
                 score <= 3000 ? "KINDA MID. NEED MORE AGILITY." : 
                 score <= 6000 ? "COOKING RN. KEEP JUMPING." : 
                 score <= 10000 ? "BRO IS A TRACK STAR." : 
                 "CERTIFIED SPEEDSTER. TOUCH GRASS NOW."}
              </p>
              <div className="text-hyper-pink text-3xl font-black mb-8 italic uppercase">INTEL: {score}</div>
              <button className="px-10 py-5 bg-foreground text-background font-black text-xl uppercase italic shadow-[8px_8px_0_0_#ff007a]" onClick={initGame}>RE-IGNITE</button>
            </div>
          )}
          {gameState === "PLAYING" && (
            <div className="absolute top-6 right-8 text-foreground font-black italic text-4xl tabular-nums select-none">{score}</div>
          )}
        </div>
      </div>
      <Footer />
    </main>
    </FeatureGuard>
  );
}