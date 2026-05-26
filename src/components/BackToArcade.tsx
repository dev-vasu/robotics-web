"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BackToArcade() {
  return (
    <div className="fixed top-24 left-6 z-40">
      <Link 
        href="/game" 
        className="flex items-center gap-2 px-4 py-2 bg-black border border-white/10 hover:border-hyper-pink hover:text-hyper-pink transition-all group glass-panel"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back_to_Arcade</span>
      </Link>
    </div>
  );
}
