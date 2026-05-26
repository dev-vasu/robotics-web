"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Smartphone, Ghost, Timer } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 30;
const GRAVITY = 0.25; // EXTREME SLOW: reduced from 0.45
const JUMP_FORCE = -6.5; // EXTREME SLOW: reduced from -9
const START_SPEED = 1.2; // EXTREME SLOW: reduced from 2.5
const GAP_SIZE = 240; // EXTREME EASY: increased from 200

export default function JumpGame() {
  const [gameState, setGameState] = useState<"IDLE" | "COUNTDOWN" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  
  const playerRef = useRef({ y: 300, vy: 0, x: 100 });
  const obstaclesRef = useRef<{ x: number; height: number; passed: boolean }[]>([]);
  const scoreRef = useRef(0);

  const initGame = () => {
    playerRef.current = { y: 300, vy: 0, x: 100 };
    obstaclesRef.current = [
      { x: 700, height: 180, passed: false },
      { x: 1100, height: 280, passed: false }
    ];
    scoreRef.current = 0;
    setScore(0);
    setCountdown(3);
    setGameState("COUNTDOWN");
  };

  useEffect(() => {
    if (gameState === "COUNTDOWN") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState("PLAYING");
      }
    }
  }, [gameState, countdown]);

  const jump = useCallback(() => {
    if (gameState === "PLAYING") {
      playerRef.current.vy = JUMP_FORCE;
    } else if (gameState === "IDLE" || gameState === "GAMEOVER") {
      initGame();
    }
  }, [gameState]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Static Player during Countdown
    if (gameState === "COUNTDOWN") {
      ctx.beginPath();
      ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#00f0ff";
      ctx.fill();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00f0ff";
      ctx.closePath();
      return;
    }

    // Player Physics
    playerRef.current.vy += GRAVITY;
    playerRef.current.y += playerRef.current.vy;

    // Draw Player
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#00f0ff";
    ctx.fill();
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#00f0ff";
    ctx.closePath();

    // Obstacles
    const currentSpeed = START_SPEED + (scoreRef.current * 0.05);
    
    obstaclesRef.current.forEach((obs, index) => {
      obs.x -= currentSpeed;

      ctx.fillStyle = "#ff007a";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff007a";
      ctx.fillRect(obs.x, 0, 45, obs.height);
      ctx.fillRect(obs.x, obs.height + GAP_SIZE, 45, CANVAS_HEIGHT);

      // Collision
      const p = playerRef.current;
      if (
        p.x + 10 > obs.x && 
        p.x - 10 < obs.x + 45 && 
        (p.y - 10 < obs.height || p.y + 10 > obs.height + GAP_SIZE)
      ) {
        setGameState("GAMEOVER");
      }

      if (!obs.passed && obs.x < p.x) {
        obs.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      if (obs.x < -100) {
        obstaclesRef.current.splice(index, 1);
        obstaclesRef.current.push({
          x: CANVAS_WIDTH + 200,
          height: Math.random() * (CANVAS_HEIGHT - GAP_SIZE - 100) + 50,
          passed: false
        });
      }
    });

    if (playerRef.current.y < 0 || playerRef.current.y > CANVAS_HEIGHT) {
      setGameState("GAMEOVER");
    }
  }, [gameState]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || (gameState !== "PLAYING" && gameState !== "COUNTDOWN")) return;

    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState === "PLAYING" || gameState === "COUNTDOWN") {
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
      <MinimalFeedback featureName="CYBER_JUMP" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-cyber-blue">JUMP</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            MODE_EXTREME_SLOW_ENABLED
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
              <button className="px-10 py-5 bg-white text-black font-black text-xl uppercase italic shadow-[10px_10px_0_0_#00f0ff] mb-6">
                START_MISSION
              </button>
              <div className="p-4 border-2 border-cyber-blue bg-cyber-blue/5 rounded-lg">
                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-relaxed">
                  SYSTEM_RE-BALANCED<br/>
                  VELOCITY: MINIMAL<br/>
                  GRAVITY: LIGHT<br/>
                  3S_PRE-LOAD_ACTIVE
                </p>
              </div>
            </div>
          )}

          {gameState === "COUNTDOWN" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-white text-[12rem] font-black italic animate-ping opacity-50 tabular-nums">
                {countdown}
              </div>
              <div className="text-cyber-blue font-black uppercase tracking-[0.4em] text-xs">UPLINKING...</div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-600/20 backdrop-blur-xl border-4 border-red-500/30 text-center px-4">
              <Ghost className="w-16 h-16 text-white mb-4 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase mb-2">
                {score <= 2 ? "NPC_BEHAVIOR" : 
                 score <= 10 ? "SKILL_ISSUE" : 
                 score <= 20 ? "KINDA_MID" : 
                 score <= 40 ? "COOKING_RN" : 
                 score <= 70 ? "W_RIZZ" : 
                 "MAIN_CHARACTER"}
              </h2>
              <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mb-6">
                {score <= 2 ? "BRO FELL OFF BEFORE IT EVEN STARTED 💀" : 
                 score <= 10 ? "NOT VERY DEMURE OF YOU TO CRASH SO SOON." : 
                 score <= 20 ? "YOU AIN'T BUILT FOR THE VOID YET." : 
                 score <= 40 ? "OKAY WE SEE YOU, BUT YOU STILL CRASHED." : 
                 score <= 70 ? "LOWKEY A GOATED RUN. NO CAP." : 
                 "CERTIFIED SWEAT. TOUCH GRASS IMMEDIATELY."}
              </p>
              <div className="bg-black px-8 py-3 border-2 border-cyber-blue mb-8">
                <span className="text-cyber-blue text-3xl font-black italic tabular-nums">SCORE: {score}</span>
              </div>
              <button className="px-10 py-5 bg-white text-black font-black text-xl uppercase shadow-[8px_8px_0_0_#ff007a] hover:bg-electric-volt transition-all">
                RE-LINK
              </button>
            </div>
          )}

          {(gameState === "PLAYING" || gameState === "COUNTDOWN") && (
            <div className="absolute top-10 left-0 w-full text-center pointer-events-none">
              <div className="text-white text-9xl font-black italic tracking-tighter opacity-10 tabular-nums select-none">{score}</div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[400px]">
           <div className="bg-white/5 p-4 border-l-4 border-cyber-blue flex justify-between items-center">
              <span className="text-[8px] font-black text-white/40 uppercase">RECORD</span>
              <span className="text-xl font-black italic text-white tabular-nums">{highScore}</span>
           </div>
           <div className="bg-white/5 p-4 border-l-4 border-hyper-pink flex justify-between items-center">
              <span className="text-[8px] font-black text-white/40 uppercase">V_INDEX</span>
              <span className="text-xl font-black italic text-white tabular-nums">{(START_SPEED + score * 0.05).toFixed(1)}x</span>
           </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
