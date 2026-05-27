"use client";

import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function FeatureToggle({ featureId, children, fallback }: { featureId: string, children: React.ReactNode, fallback?: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/features?id=${featureId}`)
      .then(res => res.json())
      .then(data => setIsEnabled(data.isEnabled !== false))
      .catch(() => setIsEnabled(true));
  }, [featureId]);

  if (isEnabled === null) return <div className="animate-pulse bg-foreground/5 h-40 w-full" />;

  if (!isEnabled) {
    return fallback ? <>{fallback}</> : (
      <div className="glass-panel p-8 border-l-4 border-[#ffaa00] bg-background/80 flex flex-col items-center text-center group overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(90deg,#ffaa00,#ffaa00_10px,#000_10px,#000_20px)] opacity-40" />
         <ShieldAlert className="w-8 h-8 text-[#ffaa00] mb-4 animate-pulse" />
         <h4 className="text-xl font-black italic text-foreground uppercase tracking-tight mb-2">SECTOR_OFFLINE</h4>
         <p className="text-[10px] text-dim font-bold uppercase leading-relaxed max-w-xs">
           THE {featureId.toUpperCase()} MODULE IS UNDERGOING RE-CALIBRATION. SIGNALS TEMPORARILY JAMMED.
         </p>
      </div>
    );
  }

  return <>{children}</>;
}
