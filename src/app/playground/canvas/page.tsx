"use client";

import FeatureGuard from "@/components/FeatureGuard";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft, Trash2, Download, Sparkles, Palette, Activity } from "lucide-react";

export default function NeonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#00f0ff");
  const [isDrawing, setIsDrawing] = useState(false);
  const particles = useRef<any[]>([]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    particles.current.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha *= 0.96;
      p.size *= 0.96;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();

      if (p.alpha < 0.01) particles.current.splice(i, 1);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const render = () => {
      draw(ctx);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 5; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: Math.random() * 10 + 5,
        color: color,
        alpha: 1
      });
    }
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    particles.current = [];
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
            GENERATIVE_ART_LAB_V1.0
          </p>
        </div>

        <div className="relative glass-panel border-4 border-white/10 shadow-[0_0_50px_rgba(255,0,122,0.1)] group">
          <canvas 
            ref={canvasRef}
            width={1000}
            height={600}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseMove={handleMouseMove}
            className="cursor-crosshair bg-black"
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
            <button className="p-4 bg-white text-black hover:bg-hyper-pink hover:text-white transition-all">
               <Download className="w-6 h-6" />
            </button>
          </div>

          {!isDrawing && particles.current.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                   <Palette className="w-16 h-16 text-white/10 mx-auto mb-4" />
                   <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs italic">CLICK_AND_DRAG_TO_CREATE_LIGHT</p>
                </div>
             </div>
          )}
        </div>

        <div className="mt-8 flex gap-6 w-full max-w-[1000px]">
           <div className="flex-1 glass-panel p-6 border-l-4 border-cyber-blue flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-cyber-blue" />
              <div>
                 <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">SYSTEM_RENDER</div>
                 <div className="text-xl font-black italic text-white">PHYSICS_BASED_PARTICLES</div>
              </div>
           </div>
           <div className="flex-1 glass-panel p-6 border-l-4 border-hyper-pink flex items-center gap-4">
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