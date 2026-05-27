"use client";

import FeatureGuard from "@/components/FeatureGuard";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";
import { Zap, Trophy, RefreshCcw, Gamepad2, Crosshair, ShieldAlert } from "lucide-react";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Game Loop Variables
  const requestRef = useRef<number>(undefined);
  const playerRef = useRef({ x: 0, y: 0, radius: 15, color: "#ccff00", health: 100 });
  const bulletsRef = useRef<any[]>([]);
  const enemiesRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const shakeRef = useRef(0);

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    playerRef.current = { x: canvas.width / 2, y: canvas.height / 2, radius: 15, color: "#ccff00", health: 100 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setGameState("PLAYING");
  };

  const spawnParticle = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x, y,
        radius: Math.random() * 3,
        color,
        velocity: {
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 5
        },
        alpha: 1
      });
    }
  };

  const spawnEnemy = (canvas: HTMLCanvasElement) => {
    const radius = Math.random() * (30 - 10) + 10;
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(playerRef.current.y - y, playerRef.current.x - x);
    const velocity = {
      x: Math.cos(angle) * (1 + score / 1000),
      y: Math.sin(angle) * (1 + score / 1000)
    };
    enemiesRef.current.push({ x, y, radius, color, velocity });
  };

  const update = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    frameRef.current++;
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (shakeRef.current > 0) {
      const sx = (Math.random() - 0.5) * shakeRef.current;
      const sy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(sx, sy);
      shakeRef.current -= 0.5;
    }

    // Draw Player
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, playerRef.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = playerRef.current.color;
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = playerRef.current.color;
    ctx.closePath();

    // Spawn Enemies
    if (frameRef.current % Math.max(10, 60 - Math.floor(score / 100)) === 0) {
      spawnEnemy(canvas);
    }

    // Update Particles
    particlesRef.current.forEach((p, index) => {
      if (p.alpha <= 0) {
        particlesRef.current.splice(index, 1);
      } else {
        p.velocity.x *= 0.99;
        p.velocity.y *= 0.99;
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.alpha -= 0.01;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
      }
    });

    // Update Bullets
    bulletsRef.current.forEach((b, index) => {
      b.x += b.velocity.x;
      b.y += b.velocity.y;
      if (b.x + b.radius < 0 || b.x - b.radius > canvas.width || b.y + b.radius < 0 || b.y - b.radius > canvas.height) {
        bulletsRef.current.splice(index, 1);
      } else {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
      }
    });

    // Update Enemies
    enemiesRef.current.forEach((e, eIndex) => {
      e.x += e.velocity.x;
      e.y += e.velocity.y;

      // Enemy hit player
      const dist = Math.hypot(playerRef.current.x - e.x, playerRef.current.y - e.y);
      if (dist - e.radius - playerRef.current.radius < 1) {
        setGameState("GAMEOVER");
        spawnParticle(playerRef.current.x, playerRef.current.y, "#ff007a");
        shakeRef.current = 20;
      }

      // Bullets hit enemy
      bulletsRef.current.forEach((b, bIndex) => {
        const dist = Math.hypot(b.x - e.x, b.y - e.y);
        if (dist - e.radius - b.radius < 1) {
          spawnParticle(e.x, e.y, e.color);
          if (e.radius > 15) {
            e.radius -= 10;
            setScore(s => s + 50);
          } else {
            enemiesRef.current.splice(eIndex, 1);
            setScore(s => s + 100);
          }
          bulletsRef.current.splice(bIndex, 1);
          shakeRef.current = 5;
        }
      });

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = e.color;
      ctx.closePath();
    });

    if (shakeRef.current > 0) ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || gameState === "GAMEOVER") return;

    update(canvas, ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameState === "PLAYING") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    playerRef.current.x = mouseRef.current.x;
    playerRef.current.y = mouseRef.current.y;
  };

  const handleMouseDown = () => {
    if (gameState !== "PLAYING") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Automatic firing would be better, but let's do click for now
    // Actually, let's just make it shoot towards the center/cursor
    const angle = Math.atan2(mouseRef.current.y - playerRef.current.y, mouseRef.current.x - playerRef.current.x);
    // Bullet velocity is always away from player towards mouse? No, player IS mouse.
    // Let's make enemies come from edges and player shoot radially or towards nearest enemy.
    // BETTER: Player is at center, mouse aims. 
  };

  // RE-INIT MOUSE LOGIC: Player is centered, shoots towards mouse.
  useEffect(() => {
    const fire = (e: MouseEvent) => {
      if (gameState !== "PLAYING" || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const angle = Math.atan2(y - playerRef.current.y, x - playerRef.current.x);
      bulletsRef.current.push({
        x: playerRef.current.x,
        y: playerRef.current.y,
        radius: 5,
        velocity: {
          x: Math.cos(angle) * 10,
          y: Math.sin(angle) * 10
        }
      });
    };
    window.addEventListener("mousedown", fire);
    return () => window.removeEventListener("mousedown", fire);
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <FeatureGuard featureId="strike">
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 overflow-hidden">
      <Navbar />
      <MinimalFeedback featureName="CYBER_STRIKE" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10 relative">
        <div className="text-center mb-6 z-10">
          <h1 className="text-5xl md:text-8xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-electric-volt">STRIKE</span>
          </h1>
          <p className="text-hyper-pink font-black uppercase tracking-[0.5em] text-[10px] mt-2">
            ELIMINATE_ ROGUE_ AI_ CORES
          </p>
        </div>

        <div 
          className="relative bg-background border-4 border-white/10 shadow-[0_0_50px_rgba(204,255,0,0.1)] group"
          style={{ width: 800, height: 500 }}
        >
          <canvas 
            ref={canvasRef}
            width={800}
            height={500}
            onMouseMove={handleMouseMove}
            className="cursor-crosshair"
          />

          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
              <div className="w-20 h-20 border-4 border-electric-volt flex items-center justify-center mb-8 animate-spin">
                 <Crosshair className="w-10 h-10 text-electric-volt" />
              </div>
              <button 
                onClick={initGame}
                className="px-12 py-6 bg-electric-volt text-background font-black text-2xl uppercase italic hover:bg-foreground transition-all shadow-[10px_10px_0_0_#ff007a]"
              >
                START_MISSION
              </button>
              <div className="mt-8 grid grid-cols-2 gap-8 max-w-md">
                 <div className="text-center p-4 border border-white/10 glass-panel">
                    <div className="text-[10px] text-electric-volt font-black tracking-widest uppercase mb-2">CONTROLS</div>
                    <div className="text-foreground font-bold text-xs uppercase">MOUSE: MOVE_CORE<br/>LEFT_CLICK: FIRE_LASER</div>
                 </div>
                 <div className="text-center p-4 border border-white/10 glass-panel">
                    <div className="text-[10px] text-hyper-pink font-black tracking-widest uppercase mb-2">OBJECTIVE</div>
                    <div className="text-foreground font-bold text-xs uppercase">ELIMINATE_ENEMIES<br/>DODGE_COLLISIONS</div>
                 </div>
              </div>
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-xl px-4 py-8 overflow-y-auto">
              <ShieldAlert className="w-16 h-16 text-foreground mb-2 animate-pulse" />
              <h2 className="text-4xl md:text-6xl font-black text-foreground italic uppercase mb-2 text-center">
                {score <= 500 ? "NPC_BEHAVIOR" : 
                 score <= 1500 ? "SKILL_ISSUE" : 
                 score <= 3000 ? "KINDA_MID" : 
                 score <= 6000 ? "COOKING_RN" : 
                 score <= 10000 ? "W_RIZZ" : 
                 "MAIN_CHARACTER"}
              </h2>
              <p className="text-foreground/80 font-black uppercase tracking-widest text-[10px] mb-4 text-center">
                {score <= 500 ? "BRO GOT CLAPPED BY THE FIRST BOT 💀" : 
                 score <= 1500 ? "AIM ASSIST COULDN'T EVEN SAVE YOU." : 
                 score <= 3000 ? "NOT BAD, BUT NOT VERY DEMURE." : 
                 score <= 6000 ? "LET HIM COOK. SOLID AIM." : 
                 score <= 10000 ? "BRO IS JOHN WICK IN THE CYBERSPACE." : 
                 "CERTIFIED AIMBOT. TOUCH GRASS IMMEDIATELY."}
              </p>
              <div className="text-electric-volt text-3xl font-black mb-4 italic">FINAL_INTEL: {score}</div>
              
              <Leaderboard gameId="cyber_strike" currentScore={score} onRestart={initGame} />
            </div>
          )}

          {/* Real-time HUD */}
          {gameState === "PLAYING" && (
            <div className="absolute top-4 left-4 flex gap-8 pointer-events-none">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-foreground/40 uppercase">DATA_HARVESTED</span>
                  <span className="text-foreground text-4xl font-black italic tracking-tighter">{score}</span>
               </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 w-full max-w-[800px]">
           <div className="flex-1 p-4 glass-panel border-l-4 border-hyper-pink">
              <div className="text-[10px] font-black text-foreground/40 uppercase mb-1">HIGHSCORE_INTEL</div>
              <div className="text-2xl font-black italic text-foreground">{highScore}</div>
           </div>
           <div className="flex-1 p-4 glass-panel border-l-4 border-electric-volt">
              <div className="text-[10px] font-black text-foreground/40 uppercase mb-1">SYSTEM_LOAD</div>
              <div className="text-2xl font-black italic text-foreground">{enemiesRef.current.length} UNIT(S)</div>
           </div>
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}