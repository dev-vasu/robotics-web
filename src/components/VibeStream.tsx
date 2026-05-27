"use client";

import { useState, useEffect } from "react";
import { Activity, Users, Shield, Zap } from "lucide-react";

const SQUAD_NAMES = ["V4SU", "X_DR1FTER", "NEON_K1D", "CYBER_GHOST", "B1T_LORD", "VOID_WALKER", "PROTO_TYPE", "GL1TCH_CAT", "DATA_MINER", "R0B0_SQUAD"];
const ACTIONS = [
  "BREACHED THE DARK_MAZE",
  "UPLOADED NEW NEON_CANVAS",
  "CRACKED BIT_CRUSH CORE",
  "JOINED THE SQUAD",
  "SYNCED WITH ROBO_BEATS",
  "DECRYPTED DATA_VAULT LORE",
  "ESTABLISHED NEW HIGH SCORE",
  "NEUTRALIZED VOID_PONG AI"
];

export default function VibeStream() {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    // 1. Initial News Data
    const initial = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      text: `${SQUAD_NAMES[Math.floor(Math.random() * SQUAD_NAMES.length)]} // ${ACTIONS[Math.floor(Math.random() * ACTIONS.length)]}`
    }));
    setItems(initial);

    // 2. Generate a local Session ID if not exists
    let sid = localStorage.getItem('robo-sid');
    if (!sid) {
      sid = Math.random().toString(36).substring(7);
      localStorage.setItem('robo-sid', sid);
    }

    // 3. Heartbeat Function (Fetch real users)
    const syncHeartbeat = async () => {
      try {
        const res = await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid })
        });
        if (res.ok) {
          const data = await res.json();
          setOnlineCount(data.count || 1);
        }
      } catch (e) { console.error(e); }
    };

    syncHeartbeat();
    const heartbeatInterval = setInterval(syncHeartbeat, 30000); // Every 30s

    // 5. Global Accent Sync
    const savedUser = localStorage.getItem("robo-user");
    if (savedUser) {
      const { active_accent } = JSON.parse(savedUser);
      if (active_accent) {
        document.documentElement.style.setProperty('--hyper-pink', active_accent);
      }
    }

    // 4. Dynamic News Ticker updates
    const tickerInterval = setInterval(() => {
      setItems(prev => {
        const newItem = {
          id: Date.now(),
          text: `${SQUAD_NAMES[Math.floor(Math.random() * SQUAD_NAMES.length)]} // ${ACTIONS[Math.floor(Math.random() * ACTIONS.length)]}`
        };
        return [newItem, ...prev.slice(0, 4)];
      });
    }, 4000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(tickerInterval);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-10 bg-background/80 backdrop-blur-xl border-t border-hyper-pink/20 flex items-center overflow-hidden">
      <div className="flex items-center gap-2 px-6 bg-hyper-pink text-background h-full shrink-0">
        <Activity className="w-4 h-4 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">LIVE_INTEL</span>
      </div>
      
      <div className="flex-1 flex gap-10 items-center px-10 overflow-hidden whitespace-nowrap group">
        <div className="flex gap-20 animate-marquee-fast">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 text-[10px] font-black italic tracking-widest text-foreground group-hover:text-hyper-pink transition-colors">
              <Zap className="w-3 h-3 text-electric-volt" />
              {item.text}
            </div>
          ))}
          {items.map(item => (
            <div key={`clone-${item.id}`} className="flex items-center gap-4 text-[10px] font-black italic tracking-widest text-foreground group-hover:text-hyper-pink transition-colors">
              <Zap className="w-3 h-3 text-electric-volt" />
              {item.text}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 px-10 h-full border-l border-foreground/10 shrink-0">
        <div className="flex items-center gap-2 text-cyber-blue">
          <Users className="w-3 h-3" />
          <span className="text-[8px] font-black tabular-nums">{onlineCount}_NODES_ACTIVE</span>
        </div>
        <div className="flex items-center gap-2 text-electric-volt">
          <Shield className="w-3 h-3" />
          <span className="text-[8px] font-black uppercase">CORE_STABLE</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-fast {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 20s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
