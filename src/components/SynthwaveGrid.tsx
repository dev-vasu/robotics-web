"use client";
import { useEffect, useRef, useState } from "react";

export default function SynthwaveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // 0. Check Grid Status
    fetch("/api/features?id=vibe_grid")
      .then(res => res.json())
      .then(data => setIsEnabled(data.isEnabled !== false))
      .catch(() => setIsEnabled(true));

    // 1. Theme Detection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute("data-theme") as "dark" | "light";
          setTheme(newTheme || "dark");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    setTheme((document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark");

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const mainColor = "#ff007a"; // Hyper Pink remains the same
      const gridOpacity = isLight ? 0.4 : 0.6;
      const sunOpacity = isLight ? 0.3 : 1;

      // 1. Draw the Neon Sun
      const sunY = h / 2 - 50;
      const sunRadius = 200;
      const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
      sunGrad.addColorStop(0, mainColor);
      sunGrad.addColorStop(0.5, mainColor);
      sunGrad.addColorStop(1, "transparent");
      
      ctx.save();
      ctx.globalAlpha = sunOpacity;
      ctx.beginPath();
      ctx.arc(w / 2, sunY, sunRadius, 0, Math.PI, true);
      ctx.fillStyle = sunGrad;
      ctx.shadowBlur = isLight ? 40 : 100;
      ctx.shadowColor = mainColor;
      ctx.fill();
      
      // Sun stripes
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 15; i++) {
        const sy = sunY - sunRadius + (i * 25);
        ctx.fillRect(w/2 - sunRadius, sy, sunRadius * 2, 5 + i);
      }
      ctx.restore();

      // 2. Draw moving grid horizon fade
      const grad = ctx.createLinearGradient(0, h/2, 0, h);
      grad.addColorStop(0, "rgba(255, 0, 122, 0)");
      grad.addColorStop(0.2, isLight ? "rgba(255, 0, 122, 0.1)" : "rgba(255, 0, 122, 0.2)");
      grad.addColorStop(1, "rgba(255, 0, 122, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, h/2, w, h/2);

      ctx.save();
      ctx.translate(w / 2, h / 2 + 50);
      
      const gridSpacing = 40;
      const fov = 250;
      ctx.lineWidth = 1;

      // 3. Draw horizontal lines
      const speed = 2.0;
      time = (time + speed) % gridSpacing;

      for (let z = 10; z < 600; z += gridSpacing) {
        const pz = z - time;
        if (pz <= 0) continue;
        const scale = fov / pz;
        const y = 80 * scale;
        
        ctx.strokeStyle = isLight 
          ? `rgba(255, 0, 122, ${Math.max(0, 0.4 - pz/600)})` 
          : `rgba(255, 0, 122, ${Math.max(0, 0.6 - pz/600)})`;
        ctx.beginPath();
        ctx.moveTo(-w * scale, y);
        ctx.lineTo(w * scale, y);
        ctx.stroke();
      }

      // 4. Draw vertical lines
      for (let x = -w*2; x <= w*2; x += gridSpacing * 2) {
        ctx.beginPath();
        let first = true;
        for (let z = 10; z < 600; z += gridSpacing) {
          const pz = z - time;
          if (pz <= 0) continue;
          const scale = fov / pz;
          const px = x * scale;
          const py = 80 * scale;
          
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.strokeStyle = isLight ? `rgba(255, 0, 122, 0.15)` : `rgba(255, 0, 122, 0.3)`;
        ctx.stroke();
      }

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
      observer.disconnect();
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <canvas 
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none -z-10 transition-opacity duration-500 ${theme === 'light' ? 'opacity-40 mix-blend-multiply' : 'opacity-60 mix-blend-screen'}`}
    />
  );
}
