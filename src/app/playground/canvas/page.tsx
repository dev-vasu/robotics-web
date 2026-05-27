"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft, Trash2, Download, Sparkles, Palette, Activity } from "lucide-react";

export default function NeonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState("#00f0ff");
  const [unitCount, setUnitCount] = useState(0);
  
  const isDrawingRef = useRef(false);
  const particles = useRef<any[]>([]);

  // 1. Robust Canvas Sizing & Context Management
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // 2. High-Performance Game Loop
    let animationId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const loop = () => {
      if (!ctx || !canvas) return;

      // TRAIL EFFECT: Instead of clearing, we paint a semi-transparent black layer
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particle update & draw
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.95;
        p.size *= 0.98;

        // Death check
        if (p.alpha < 0.05 || p.size < 1) {
          particles.current.splice(i, 1);
          continue;
        }

        // Draw
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Sync Unit Count every 10 frames for UI performance
      if (animationId % 10 === 0) {
        setUnitCount(particles.current.length);
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // 3. Drawing Input Handlers
  const addParticles = (x: number, y: number) => {
    for (let i = 0; i < 5; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 15 + 5,
        color: color,
        alpha: 1
      });
    }
  };

  const handlePointerAction = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.type === "pointerdown") {
      isDrawingRef.current = true;
      addParticles(x, y);
    } else if (e.type === "pointermove" && isDrawingRef.current) {
      addParticles(x, y);
    } else if (e.type === "pointerup" || e.type === "pointerleave") {
      isDrawingRef.current = false;
    }
  };

  const clearCanvas = () => {
    particles.current = [];
    setUnitCount(0);
  };

  const downloadArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ROBOVIBE_LAB_ART_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <FeatureGuard featureId="canvas">
      <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 overflow-hidden">
        <Navbar />
        
        <div className="fixed top-24 left-6 z-40">
          <Link href="/playground" className="flex items-center gap-2 px-4 py-2 bg-black border border-white/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Exit_to_Lab</span>
          </Link>
        </div>

        <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10 relative">
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-8xl font-black italic uppercase text-white tracking-tighter text-glitch leading-none">
              NEON_<span className="text-hyper-pink">CANVAS</span>
            </h1>
            <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-[10px] mt-2">
              GENERATIVE_ART_LAB_V3.0_STABLE
            </p>
          </div>

          <div ref={containerRef} className="relative w-full max-w-5xl aspect-video glass-panel border-4 border-white/10 shadow-[0_0_50px_rgba(255,0,122,0.1)] group">
            <canvas 
              ref={canvasRef}
              onPointerDown={handlePointerAction}
              onPointerMove={handlePointerAction}
              onPointerUp={handlePointerAction}
              onPointerLeave={handlePointerAction}
              className="w-full h-full cursor-crosshair bg-black touch-none"
            />

            <div className="absolute bottom-6 left-6 flex gap-4 z-20">
               {["#00f0ff", "#ff007a", "#ccff00", "#ffffff"].map(c => (
                 <button 
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${color === c ? "border-white scale-125 shadow-[0_0_15px_white]" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                 />
               ))}
            </div>

            <div className="absolute bottom-6 right-6 flex gap-4 z-20">
              <button onClick={clearCanvas} className="p-4 bg-black border border-white/10 text-white hover:text-red-500 hover:border-red-500 transition-all glass-panel">
                 <Trash2 className="w-6 h-6" />
              </button>
              <button onClick={downloadArt} className="p-4 bg-white text-black hover:bg-hyper-pink hover:text-white transition-all">
                 <Download className="w-6 h-6" />
              </button>
            </div>

            {unitCount === 0 && !isDrawingRef.current && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                     <Palette className="w-16 h-16 text-white/10 mx-auto mb-4" />
                     <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs italic">DRAW_WITH_LIGHT</p>
                  </div>
               </div>
            )}
          </div>

          <div className="mt-8 flex gap-6 w-full max-w-5xl">
             <div className="flex-1 glass-panel p-6 border-l-4 border-cyber-blue flex items-center gap-4 bg-black/80 hq-panel">
                <Sparkles className="w-8 h-8 text-cyber-blue" />
                <div>
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">SYSTEM_RENDER</div>
                   <div className="text-xl font-black italic text-white">VIBE_FLOW_V3</div>
                </div>
             </div>
             <div className="flex-1 glass-panel p-6 border-l-4 border-hyper-pink flex items-center gap-4 bg-black/80 hq-panel">
                <Activity className="w-8 h-8 text-hyper-pink" />
                <div>
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">ACTIVE_NODES</div>
                   <div className="text-xl font-black italic text-white tabular-nums">{unitCount} UNIT(S)</div>
                </div>
             </div>
          </div>
        </div>

        <Footer />
      </main>
    </FeatureGuard>
  );
}
