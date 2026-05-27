"use client";

import FeatureGuard from "@/components/FeatureGuard";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft, Trash2, Download, Sparkles, Activity, MousePointer2 } from "lucide-react";

export default function NeonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState("#00f0ff");
  const [activeUnits, setActiveUnits] = useState(0);
  
  const particles = useRef<any[]>([]);
  const isDrawing = useRef(false);

  // 1. RE-CALIBRATE: Set canvas dimensions correctly
  useEffect(() => {
    const calibrate = () => {
      if (canvasRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };
    
    calibrate();
    window.addEventListener("resize", calibrate);
    return () => window.removeEventListener("resize", calibrate);
  }, []);

  // 2. ULTRASONIC ENGINE: High-speed drawing loop
  useEffect(() => {
    let frameId: number;
    
    const loop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      
      if (!canvas || !ctx) {
        frameId = requestAnimationFrame(loop);
        return;
      }

      // Trail effect (semi-transparent black)
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particle update & draw
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.96;
        p.size *= 0.97;

        if (p.alpha < 0.05 || p.size < 0.5) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        
        // Performance-friendly glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.restore();
      }

      // Performance: Only update React state count occasionally
      if (Math.random() < 0.1) {
        setActiveUnits(particles.current.length);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 3. FAIL-SAFE INPUTS
  const addNode = (e: React.PointerEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 6; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 20 + 5,
        color: color,
        alpha: 1
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    addNode(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDrawing.current) addNode(e);
  };

  const clearLab = () => {
    particles.current = [];
    setActiveUnits(0);
  };

  const exportData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ROBOVIBE_LAB_DATA_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <FeatureGuard featureId="canvas">
      <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20 overflow-hidden">
        <Navbar />
        
        <div className="fixed top-24 left-6 z-40">
          <Link href="/playground" className="flex items-center gap-2 px-4 py-2 bg-background border border-white/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground">Exit_to_Lab</span>
          </Link>
        </div>

        <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-10 relative">
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-8xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
              NEON_<span className="text-hyper-pink">CANVAS</span>
            </h1>
            <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-[10px] mt-2 italic">
              GENERATIVE_ART_LAB_V4.0_ULTRASONIC
            </p>
          </div>

          <div ref={containerRef} className="relative w-full max-w-5xl aspect-video glass-panel border-4 border-white/10 shadow-[0_0_80px_rgba(255,0,122,0.15)] group bg-background overflow-hidden">
            <canvas 
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={() => isDrawing.current = false}
              onPointerLeave={() => isDrawing.current = false}
              className="w-full h-full cursor-crosshair touch-none"
            />

            <div className="absolute bottom-6 left-6 flex gap-4 z-20">
               {["#00f0ff", "#ff007a", "#ccff00", "#ffffff"].map(c => (
                 <button 
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-125 ${color === c ? "border-white scale-125 shadow-[0_0_20px_white]" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                 />
               ))}
            </div>

            <div className="absolute bottom-6 right-6 flex gap-4 z-20">
              <button onClick={clearLab} className="p-4 bg-background border border-white/10 text-foreground/60 hover:text-red-500 hover:border-red-500 transition-all glass-panel group">
                 <Trash2 className="w-6 h-6 group-active:scale-90" />
              </button>
              <button onClick={exportData} className="p-4 bg-foreground text-background hover:bg-hyper-pink hover:text-foreground transition-all shadow-[6px_6px_0_0_#ff007a] group">
                 <Download className="w-6 h-6 group-active:scale-90" />
              </button>
            </div>

            {activeUnits === 0 && !isDrawing.current && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center animate-pulse">
                     <MousePointer2 className="w-16 h-16 text-foreground/10 mx-auto mb-4" />
                     <p className="text-foreground/20 font-black uppercase tracking-[0.6em] text-xs italic">INITIATE_TOUCH_TO_DRAW</p>
                  </div>
               </div>
            )}
          </div>

          <div className="mt-8 flex gap-6 w-full max-w-5xl hq-panel">
             <div className="flex-1 glass-panel p-6 border-l-4 border-cyber-blue flex items-center gap-4 bg-background/80">
                <Sparkles className="w-8 h-8 text-cyber-blue animate-spin-slow" />
                <div>
                   <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">SYSTEM_STATUS</div>
                   <div className="text-xl font-black italic text-foreground uppercase">ULTRA_SYNC_READY</div>
                </div>
             </div>
             <div className="flex-1 glass-panel p-6 border-l-4 border-hyper-pink flex items-center gap-4 bg-background/80">
                <ActivityIcon className="w-8 h-8 text-hyper-pink" />
                <div>
                   <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">ACTIVE_UNITS</div>
                   <div className="text-2xl font-black italic text-foreground tabular-nums">{activeUnits}</div>
                </div>
             </div>
          </div>
        </div>

        <Footer />
      </main>
    </FeatureGuard>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/>
    </svg>
  );
}
