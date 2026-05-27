"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft, Trash2, Download, Sparkles, Palette, Activity } from "lucide-react";

export default function NeonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState("#00f0ff");
  const [isDrawing, setIsDrawing] = useState(false);
  const particles = useRef<any[]>([]);

  // Adjust canvas size to fit container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Trail effect
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Update and draw particles in reverse order to avoid splice skip bug
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha *= 0.95;
      p.size *= 0.95;

      if (p.alpha < 0.01 || p.size < 0.5) {
        particles.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    const render = () => {
      draw(ctx);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [draw]);

  const addParticles = (x: number, y: number) => {
    for (let i = 0; i < 6; i++) {
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

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    addParticles(e.clientX - rect.left, e.clientY - rect.top);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    particles.current = [];
  };

  const downloadArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ROBOVIBE_ART_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <FeatureGuard featureId="canvas">
      <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 overflow-hidden">
        <Navbar />
        
        <div className="fixed top-24 left-6 z-40 flex flex-col gap-4">
          <Link 
            href="/playground" 
            className="flex items-center gap-2 px-4 py-2 bg-black border border-white/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel"
          >
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
              GENERATIVE_ART_LAB_V2.0_STABLE
            </p>
          </div>

          <div ref={containerRef} className="relative w-full max-w-5xl aspect-video glass-panel border-4 border-white/10 shadow-[0_0_50px_rgba(255,0,122,0.1)] group">
            <canvas 
              ref={canvasRef}
              onPointerDown={() => setIsDrawing(true)}
              onPointerUp={() => setIsDrawing(false)}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setIsDrawing(false)}
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

            {!isDrawing && particles.current.length === 0 && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                     <Palette className="w-16 h-16 text-white/10 mx-auto mb-4" />
                     <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs italic">DRAW_WITH_LIGHT</p>
                  </div>
               </div>
            )}
          </div>

          <div className="mt-8 flex gap-6 w-full max-w-5xl">
             <div className="flex-1 glass-panel p-6 border-l-4 border-cyber-blue flex items-center gap-4 bg-black/80">
                <Sparkles className="w-8 h-8 text-cyber-blue" />
                <div>
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">SYSTEM_RENDER</div>
                   <div className="text-xl font-black italic text-white">VIBE_FLOW_ENGINE</div>
                </div>
             </div>
             <div className="flex-1 glass-panel p-6 border-l-4 border-hyper-pink flex items-center gap-4 bg-black/80">
                <Activity className="w-8 h-8 text-hyper-pink" />
                <div>
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">ACTIVE_NODES</div>
                   <div className="text-xl font-black italic text-white">{particles.current.length} UNIT(S)</div>
                </div>
             </div>
          </div>
        </div>

        <Footer />
      </main>
    </FeatureGuard>
  );
}
