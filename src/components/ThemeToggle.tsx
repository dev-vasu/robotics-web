"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("vibe-theme", newTheme);
  };

  return (
    <button 
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-2 border-2 border-foreground/10 hover:border-hyper-pink transition-all group relative overflow-hidden"
    >
      <div className="relative z-10 flex items-center gap-2">
        {theme === "dark" ? (
          <>
            <Moon className="w-4 h-4 text-cyber-blue animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-hyper-pink transition-colors">
              VOID_VIBE
            </span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-[#ffaa00] animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-widest text-background">
              FLASHBANG
            </span>
          </>
        )}
      </div>
      
      {/* Dynamic background slide for Light mode */}
      <div className={`absolute inset-0 bg-foreground transition-transform duration-500 -z-0 ${theme === 'light' ? 'translate-y-0' : 'translate-y-full'}`} />
    </button>
  );
}
