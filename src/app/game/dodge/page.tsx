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

export default function DodgeGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(undefined);
  const lastTimeRef = useRef<number>(undefined);
  
  const playerPosRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const enemiesRef = useRef<{ x: number; y: number; id: number; speed: number }[]>([]);
  const scoreRef = useRef(0);
  const [, setRenderTrigger] = useState(0);

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
      enemiesRef.current = enemiesRef.current.map(e => {
        const dx = playerPosRef.current.x - e.x;
        const dy = playerPosRef.current.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pursuitSpeed = e.speed + (scoreRef.current / 5000);
        return { ...e, x: e.x + (dx / dist) * pursuitSpeed, y: e.y + (dy / dist) * pursuitSpeed };
      });

      const playerBox = {
        left: playerPosRef.current.x - PLAYER_SIZE/2,
        right: playerPosRef.current.x + PLAYER_SIZE/2,
        top: playerPosRef.current.y - PLAYER_SIZE/2,
        bottom: playerPosRef.current.y + PLAYER_SIZE/2
      };

      if (enemiesRef.current.some(e => e.x < playerBox.right && e.x + ENEMY_SIZE > playerBox.left && e.y < playerBox.bottom && e.y + ENEMY_SIZE > playerBox.top)) {
        setGameState("GAMEOVER");
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
      }

      if (Math.random() < Math.min(0.1, 0.03 + (scoreRef.current / 10000))) {
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
          <h1 className="text-6xl md:text-[8rem] font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-hyper-pink">DODGE</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.5em] text-sm mt-4">EVADE_OR_BE_DELETED</p>
        </div>

        <div ref={containerRef} className="relative glass-panel border-8 border-white/5 overflow-hidden cursor-none" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
              <button onClick={startGame} className="px-16 py-8 bg-white text-black font-black text-3xl uppercase italic hover:bg-electric-volt transition-all shadow-[15px_15px_0_0_#ff007a]">BOOT_DODGE</button>
              <div className="mt-12 grid grid-cols-2 gap-8 max-w-md">
                 <div className="text-center p-4 border border-white/10 glass-panel">
                    <div className="text-[10px] text-electric-volt font-black tracking-widest uppercase mb-2">CONTROLS</div>
                    <div className="text-white font-bold text-xs uppercase">MOUSE: MOVE_CORE</div>
                 </div>
                 <div className="text-center p-4 border border-white/10 glass-panel">
                    <div className="text-[10px] text-hyper-pink font-black tracking-widest uppercase mb-2">OBJECTIVE</div>
                    <div className="text-white font-bold text-xs uppercase">EVADE_PINK_VOID<br/>SURVIVE_OVERLOAD</div>
                 </div>
              </div>
            </div>
          )}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-600/20 backdrop-blur-xl">
              <Skull className="w-24 h-24 text-white mb-6" />
              <div className="text-white text-5xl font-black italic mb-10">SCORE: {score}</div>
              <button onClick={startGame} className="px-12 py-6 bg-white text-black font-black text-2xl uppercase italic">RETRY</button>
            </div>
          )}
          {gameState === "PLAYING" && (
            <>
              <div className="absolute bg-electric-volt rounded-full shadow-[0_0_30px_#ccff00]" style={{ width: PLAYER_SIZE, height: PLAYER_SIZE, left: playerPosRef.current.x - PLAYER_SIZE/2, top: playerPosRef.current.y - PLAYER_SIZE/2 }} />
              {enemiesRef.current.map(e => (
                <div key={e.id} className="absolute bg-hyper-pink rounded-sm shadow-[0_0_20px_#ff007a]" style={{ width: ENEMY_SIZE, height: ENEMY_SIZE, left: e.x, top: e.y }} />
              ))}
              <div className="absolute top-8 left-8 text-white text-5xl font-black italic">{score}</div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
