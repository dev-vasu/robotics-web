"use client";
import { useEffect, useRef } from "react";

export default function SynthwaveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Draw grid horizon fade
      const grad = ctx.createLinearGradient(0, h/2, 0, h);
      grad.addColorStop(0, "rgba(255, 0, 122, 0)");
      grad.addColorStop(0.2, "rgba(255, 0, 122, 0.05)");
      grad.addColorStop(1, "rgba(255, 0, 122, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, h/2, w, h/2);

      ctx.save();
      ctx.translate(w / 2, h / 2 + 50); // Move origin to center horizon
      
      const gridSpacing = 40;
      const fov = 250;
      
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)"; // Cyber Blue
      ctx.lineWidth = 1;

      // Draw horizontal lines moving forward towards viewer
      const speed = 1.5;
      time = (time + speed) % gridSpacing;

      ctx.beginPath();
      for (let z = 10; z < 600; z += gridSpacing) {
        const pz = z - time;
        if (pz <= 0) continue;
        const scale = fov / pz;
        const y = 80 * scale; // camera height
        
        ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 0.6 - pz/600)})`;
        ctx.moveTo(-w * scale, y);
        ctx.lineTo(w * scale, y);
      }
      ctx.stroke();

      // Draw vertical lines vanishing to center
      ctx.beginPath();
      for (let x = -w*2; x <= w*2; x += gridSpacing * 2) {
        let first = true;
        for (let z = 10; z < 600; z += gridSpacing) {
          const pz = z - time;
          if (pz <= 0) continue;
          const scale = fov / pz;
          const px = x * scale;
          const py = 80 * scale;
          
          ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 0.6 - pz/600)})`;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      ctx.restore();
      animationId = requestAnimationFrame(draw);
    };

    let animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30 mix-blend-screen"
    />
  );
}
