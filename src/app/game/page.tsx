"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Trophy, RefreshCcw, Gamepad2, Ghost } from "lucide-react";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 40;
const ENEMY_SIZE = 30;
const INITIAL_SPEED = 3;
const SPEED_INCREMENT = 0.1;

export default function GamePage() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [enemies, setEnemies] = useState<{ x: number; y: number; id: number; speed: number }[]>([]);
  
  const requestRef = useRef<number>(undefined);
  const lastTimeRef = useRef<number>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const enemiesRef = useRef(enemies);
  const scoreRef = useRef(score);

  // Sync refs for the game loop
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const startGame = () => {
    setGameState("PLAYING");
    setScore(0);
    setEnemies([]);
    setPlayerPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
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

    const speed = INITIAL_SPEED + (scoreRef.current * SPEED_INCREMENT);
    return { x, y, id: Math.random(), speed };
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (lastTimeRef.current === undefined) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;

    if (deltaTime > 1000 / 60) {
      setEnemies(prev => {
        let newEnemies = prev.map(e => {
          const dx = playerPos.x - e.x;
          const dy = playerPos.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return {
            ...e,
            x: e.x + (dx / dist) * e.speed,
            y: e.y + (dy / dist) * e.speed,
          };
        });

        // Collision Check
        const playerBox = {
          left: playerPos.x - PLAYER_SIZE/2,
          right: playerPos.x + PLAYER_SIZE/2,
          top: playerPos.y - PLAYER_SIZE/2,
          bottom: playerPos.y + PLAYER_SIZE/2
        };

        const hasCollision = newEnemies.some(e => {
          return e.x < playerBox.right && e.x + ENEMY_SIZE > playerBox.left &&
                 e.y < playerBox.bottom && e.y + ENEMY_SIZE > playerBox.top;
        });

        if (hasCollision) {
          setGameState("GAMEOVER");
          cancelAnimationFrame(requestRef.current!);
          return prev;
        }

        // Add enemies over time
        if (Math.random() < 0.02) {
          newEnemies.push(spawnEnemy());
        }

        return newEnemies;
      });

      setScore(prev => prev + 1);
      lastTimeRef.current = time;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [playerPos, spawnEnemy]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== "PLAYING" || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPlayerPos({
        x: Math.max(PLAYER_SIZE/2, Math.min(GAME_WIDTH - PLAYER_SIZE/2, e.clientX - rect.left)),
        y: Math.max(PLAYER_SIZE/2, Math.min(GAME_HEIGHT - PLAYER_SIZE/2, e.clientY - rect.top)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <main className="min-h-screen bg-black grid-bg flex flex-col pt-20">
      <Navbar />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter text-glitch">
            CYBER_<span className="text-hyper-pink">DODGE</span>
          </h1>
          <p className="text-electric-volt font-black uppercase tracking-[0.3em] text-xs">
            SURVIVE_ THE_ OVERLOAD_ OR_ DIE_ TRYING
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative glass-panel border-4 border-white/10 overflow-hidden cursor-none"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <Gamepad2 className="w-20 h-20 text-hyper-pink mb-6 animate-pulse" />
              <button 
                onClick={startGame}
                className="px-12 py-6 bg-hyper-pink text-black font-black text-2xl uppercase italic hover:bg-white hover:scale-110 transition-all shadow-[10px_10px_0_0_#ccff00]"
              >
                INITIALIZE_START
              </button>
              <p className="mt-8 text-white/40 font-bold uppercase text-[10px] tracking-widest">
                USE_MOUSE_TO_AVOID_THE_PINK_VOID
              </p>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
              <Ghost className="w-20 h-20 text-red-500 mb-6" />
              <h2 className="text-6xl font-black text-white italic uppercase mb-2">SYSTEM_CRASHED</h2>
              <div className="text-hyper-pink text-4xl font-black mb-8 italic uppercase">SCORE: {score}</div>
              <button 
                onClick={startGame}
                className="flex items-center gap-3 px-10 py-5 bg-electric-volt text-black font-black text-xl uppercase italic hover:bg-white transition-all shadow-[8px_8px_0_0_#ff007a]"
              >
                <RefreshCcw className="w-6 h-6" /> REBOOT_SESSION
              </button>
            </div>
          )}

          {gameState === "PLAYING" && (
            <>
              {/* Player */}
              <div 
                className="absolute bg-electric-volt rounded-full shadow-[0_0_20px_#ccff00] transition-all duration-75"
                style={{
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                  left: playerPos.x - PLAYER_SIZE/2,
                  top: playerPos.y - PLAYER_SIZE/2,
                }}
              />
              
              {/* Enemies */}
              {enemies.map(e => (
                <div 
                  key={e.id}
                  className="absolute bg-hyper-pink rounded-lg shadow-[0_0_15px_#ff007a] animate-pulse"
                  style={{
                    width: ENEMY_SIZE,
                    height: ENEMY_SIZE,
                    left: e.x,
                    top: e.y,
                  }}
                />
              ))}

              {/* HUD */}
              <div className="absolute top-6 left-6 text-white font-black italic text-2xl uppercase tracking-tighter">
                PTS: <span className="text-electric-volt">{score}</span>
              </div>
              <div className="absolute top-6 right-6 text-white/40 font-black italic text-sm uppercase tracking-widest">
                HI: {highScore}
              </div>
            </>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-[800px]">
          <div className="p-6 glass-panel text-center">
            <Zap className="w-6 h-6 text-hyper-pink mx-auto mb-2" />
            <div className="text-[10px] font-black text-white/40 uppercase">VELOCITY</div>
            <div className="text-xl font-black text-white">{(INITIAL_SPEED + score * SPEED_INCREMENT).toFixed(1)}x</div>
          </div>
          <div className="p-6 glass-panel text-center">
            <Trophy className="w-6 h-6 text-electric-volt mx-auto mb-2" />
            <div className="text-[10px] font-black text-white/40 uppercase">SESSION_HI</div>
            <div className="text-xl font-black text-white">{highScore}</div>
          </div>
          <div className="p-6 glass-panel text-center">
            <Ghost className="w-6 h-6 text-cyber-blue mx-auto mb-2" />
            <div className="text-[10px] font-black text-white/40 uppercase">THREAT_LEVEL</div>
            <div className="text-xl font-black text-white">{enemies.length}</div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
