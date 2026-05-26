"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Trophy, RefreshCcw, Gamepad2, Ghost, Skull } from "lucide-react";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 25;
const INITIAL_SPEED = 2;
const SPEED_INCREMENT = 0.05;

export default function GamePage() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(undefined);
  const lastTimeRef = useRef<number>(undefined);
  
  // High-performance refs for the game loop
  const playerPosRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const enemiesRef = useRef<{ x: number; y: number; id: number; speed: number }[]>([]);
  const scoreRef = useRef(0);

  // Sync React state for rendering
  const [renderTrigger, setRenderTrigger] = useState(0);

  const startGame = () => {
    setGameState("PLAYING");
    setScore(0);
    scoreRef.current = 0;
    enemiesRef.current = [];
    playerPosRef.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnEnemy = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = Math.random() * GAME_WIDTH; y = -ENEMY_SIZE; }
    if (side === 1) { x = GAME_WIDTH + ENEMY_SIZE; y = Math.random() * GAME_HEIGHT; }
    if (side === 2) { x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT + ENEMY_SIZE; }
    if (side === 3) { x = -ENEMY_SIZE; y = Math.random() * GAME_HEIGHT; }

    const speed = INITIAL_SPEED + (scoreRef.current * 0.001);
    return { x, y, id: Math.random(), speed };
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (lastTimeRef.current === undefined) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;

    if (deltaTime > 1000 / 60) {
      // Move Enemies
      enemiesRef.current = enemiesRef.current.map(e => {
        const dx = playerPosRef.current.x - e.x;
        const dy = playerPosRef.current.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Enemies get more aggressive as score increases
        const pursuitSpeed = e.speed + (scoreRef.current / 5000);
        return {
          ...e,
          x: e.x + (dx / dist) * pursuitSpeed,
          y: e.y + (dy / dist) * pursuitSpeed,
        };
      });

      // Collision Check
      const playerBox = {
        left: playerPosRef.current.x - PLAYER_SIZE/2,
        right: playerPosRef.current.x + PLAYER_SIZE/2,
        top: playerPosRef.current.y - PLAYER_SIZE/2,
        bottom: playerPosRef.current.y + PLAYER_SIZE/2
      };

      const hasCollision = enemiesRef.current.some(e => {
        return e.x < playerBox.right && e.x + ENEMY_SIZE > playerBox.left &&
               e.y < playerBox.bottom && e.y + ENEMY_SIZE > playerBox.top;
      });

      if (hasCollision) {
        setGameState("GAMEOVER");
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
      }

      // Spawn Logic (Increases over time)
      const spawnChance = 0.03 + (scoreRef.current / 10000);
      if (Math.random() < Math.min(0.1, spawnChance)) {
        enemiesRef.current.push(spawnEnemy());
      }

      scoreRef.current += 1;
      setScore(scoreRef.current);
      setRenderTrigger(prev => prev + 1);
      lastTimeRef.current = time;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [spawnEnemy]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      playerPosRef.current = {
        x: Math.max(PLAYER_SIZE/2, Math.min(GAME_WIDTH - PLAYER_SIZE/2, e.clientX - rect.left)),
        y: Math.max(PLAYER_SIZE/2, Math.min(GAME_HEIGHT - PLAYER_SIZE/2, e.clientY - rect.top)),
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-12">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-hyper-pink">DODGE</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-sm mt-4">
            LEVEL_10_THREAT_DETECTED
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative glass-panel border-8 border-white/5 overflow-hidden cursor-none shadow-[0_0_100px_rgba(255,0,122,0.1)]"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Grid lines inside game */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
              <div className="w-24 h-24 bg-hyper-pink rounded-full flex items-center justify-center mb-8 animate-bounce shadow-[0_0_50px_#ff007a]">
                 <Gamepad2 className="w-12 h-12 text-black" />
              </div>
              <button 
                onClick={startGame}
                className="px-16 py-8 bg-white text-black font-black text-3xl uppercase italic hover:bg-electric-volt transition-all shadow-[15px_15px_0_0_#ff007a] hover:-translate-y-2 active:translate-y-0"
              >
                BOOT_SYSTEM
              </button>
              <div className="mt-12 flex gap-10">
                <div className="text-center">
                   <div className="text-[10px] text-white/40 font-black tracking-widest uppercase mb-1">CONTROLS</div>
                   <div className="text-electric-volt font-black text-xs uppercase italic">MOUSE_ONLY</div>
                </div>
                <div className="text-center">
                   <div className="text-[10px] text-white/40 font-black tracking-widest uppercase mb-1">OBJECTIVE</div>
                   <div className="text-hyper-pink font-black text-xs uppercase italic">AVOID_PINK_VOID</div>
                </div>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-600/20 backdrop-blur-xl border-4 border-red-500/50">
              <Skull className="w-24 h-24 text-white mb-6 animate-pulse" />
              <h2 className="text-8xl font-black text-white italic uppercase mb-4 tracking-tighter">TERMINATED</h2>
              <div className="bg-black px-10 py-4 border-2 border-hyper-pink mb-10">
                <span className="text-white/60 font-black uppercase tracking-widest text-sm mr-4">FINAL_SCORE:</span>
                <span className="text-hyper-pink text-5xl font-black italic">{score}</span>
              </div>
              <button 
                onClick={startGame}
                className="flex items-center gap-4 px-12 py-6 bg-white text-black font-black text-2xl uppercase italic hover:bg-electric-volt transition-all shadow-[10px_10px_0_0_#000]"
              >
                <RefreshCcw className="w-8 h-8" /> REBOOT_CORE
              </button>
            </div>
          )}

          {gameState === "PLAYING" && (
            <>
              {/* Player - High-Performance Motion */}
              <div 
                className="absolute bg-electric-volt rounded-full shadow-[0_0_30px_#ccff00] z-10 border-4 border-white pointer-events-none"
                style={{
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                  left: playerPosRef.current.x - PLAYER_SIZE/2,
                  top: playerPosRef.current.y - PLAYER_SIZE/2,
                }}
              >
                <div className="absolute inset-0 bg-white/50 rounded-full animate-ping" />
              </div>
              
              {/* Enemies */}
              {enemiesRef.current.map(e => (
                <div 
                  key={e.id}
                  className="absolute bg-hyper-pink rounded-sm shadow-[0_0_20px_#ff007a] border-2 border-black"
                  style={{
                    width: ENEMY_SIZE,
                    height: ENEMY_SIZE,
                    left: e.x,
                    top: e.y,
                    transform: `rotate(${score * 2}deg)`
                  }}
                />
              ))}

              {/* HUD */}
              <div className="absolute top-8 left-8 flex items-baseline gap-4">
                <span className="text-white/40 font-black italic text-xs uppercase tracking-widest">DATA_POINTS:</span>
                <span className="text-white text-5xl font-black italic tracking-tighter tabular-nums">{score}</span>
              </div>
              
              <div className="absolute bottom-8 right-8 text-right">
                <div className="text-electric-volt font-black italic text-xl uppercase tracking-tighter">HI_SCORE: {highScore}</div>
                <div className="text-white/20 font-mono text-[8px] uppercase">ROBOVIBE_GAME_ENGINE_V2.0</div>
              </div>
            </>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-16 grid md:grid-cols-4 gap-4 w-full max-w-[800px]">
          {[
            { label: "VELOCITY", val: (INITIAL_SPEED + score / 1000).toFixed(2) + "x", icon: Zap, color: "text-hyper-pink" },
            { label: "RECORD", val: highScore, icon: Trophy, color: "text-electric-volt" },
            { label: "THREATS", val: enemiesRef.current.length, icon: Ghost, color: "text-cyber-blue" },
            { label: "STATUS", val: gameState === "PLAYING" ? "ACTIVE" : "OFFLINE", icon: Activity, color: "text-white" }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 p-6 border-2 border-white/5 hover:border-white/10 transition-colors">
              <item.icon className={`w-5 h-5 ${item.color} mb-4`} />
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{item.label}</div>
              <div className="text-2xl font-black italic text-white uppercase">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/>
    </svg>
  );
}
