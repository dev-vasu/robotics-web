"use client";

import { useEffect, useRef } from "react";
import { useCyberAudio } from "@/hooks/useCyberAudio";

export default function GlobalAudio() {
  const { playHover, playClick } = useCyberAudio();
  const lastHoverTime = useRef(0);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a") || target.closest(".arcade-card") || target.closest("input")) {
        const now = performance.now();
        if (now - lastHoverTime.current > 50) { // debounce to prevent spam
          playHover();
          lastHoverTime.current = now;
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a") || target.closest(".arcade-card") || target.closest("input")) {
        playClick();
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick);
    };
  }, [playHover, playClick]);

  return null;
}
