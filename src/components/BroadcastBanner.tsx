"use client";

import { useState, useEffect } from "react";
import { Radio } from "lucide-react";

export default function BroadcastBanner() {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const res = await fetch("/api/broadcast");
        const data = await res.json();
        if (data.broadcast) {
          setContent(data.broadcast);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchBroadcast();
    // Refresh every 2 minutes
    const interval = setInterval(fetchBroadcast, 120000);
    return () => clearInterval(interval);
  }, []);

  if (!content) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] bg-hyper-pink text-black overflow-hidden h-8 flex items-center border-b-2 border-white/20">
      <div className="flex items-center gap-2 px-4 bg-black text-hyper-pink h-full border-r border-white/10 shrink-0">
        <Radio className="w-3 h-3 animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-widest">LIVE_UPLINK</span>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <div className="whitespace-nowrap animate-marquee flex items-center h-full">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4">
             {content} • {content} • {content} • {content} • {content} • {content}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
