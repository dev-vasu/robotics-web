"use client";

import FeatureGuard from "@/components/FeatureGuard";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MinimalFeedback from "@/components/MinimalFeedback";
import BackToArcade from "@/components/BackToArcade";
import Footer from "@/components/Footer";
import { Terminal, Zap, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

const CODE_SNIPPETS = [
  "SYSTEM.OVERRIDE(CORE_ACCESS)",
  "NEURAL_LINK.INITIALIZE()",
  "PROTOCOL_X.BYPASS_FIREWALL",
  "DECRYPT_VAULT_KEY_7749",
  "ROBO_CORE.CONNECT(VIBE_NET)",
  "DATA_STREAM.ENCRYPT(AES_256)",
  "ROOT_ACCESS.GRANT(ADMIN_USER)",
  "VOID_SCANNER.ACTIVE_TRUE",
  "SECTOR_9.ISOLATE_THREAT",
  "SYNC_DATA.FORCE_PUSH(ORIGIN)"
];

export default function TyperGame() {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [targetText, setTargetText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [wpm, setWpm] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const startTimeRef = useRef<number>(0);

  const getNewSnippet = useCallback(() => {
    const next = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    setTargetText(next);
    setUserInput("");
  }, []);

  const startGame = () => {
    setGameState("PLAYING");
    setScore(0);
    setTimeLeft(30);
    setWpm(0);
    startTimeRef.current = Date.now();
    getNewSnippet();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameState("GAMEOVER");
    if (timerRef.current) clearInterval(timerRef.current);
    
    const minutes = (Date.now() - startTimeRef.current) / 60000;
    // Estimate WPM based on score (approx 5 chars per word)
    setWpm(Math.round((score / 5) / minutes) || 0);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);

    if (val === targetText) {
      setScore(prev => prev + targetText.length);
      getNewSnippet();
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <FeatureGuard featureId="typer">
    <main className="min-h-screen bg-transparent grid-bg flex flex-col pt-20">
      <Navbar />
      <MinimalFeedback featureName="CYBER_TYPER" />
      <BackToArcade />

      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase text-foreground tracking-tighter text-glitch leading-none">
            CYBER_<span className="text-hyper-pink">TYPER</span>
          </h1>
          <p className="text-cyber-blue font-black uppercase tracking-[0.5em] text-xs mt-4">
            BREACH_ THE_ CORE_ VIA_ KEYBOARD_ UPLINK
          </p>
        </div>

        <div className="w-full max-w-4xl glass-panel border-4 border-foreground/5 p-12 relative overflow-hidden">
          {/* Animated Matrix Background Effect */}
          <div className="absolute inset-0 opacity-5 pointer-events-none font-mono text-[8px] overflow-hidden whitespace-pre leading-none text-cyber-blue">
            {Array(50).fill("SYSTEM_FAILURE_CORE_DUMP_MEMORY_LEAK_ACCESS_DENIED_").join("\n")}
          </div>

          {gameState === "IDLE" && (
            <div className="relative z-10 text-center py-10">
              <Terminal className="w-20 h-20 text-cyber-blue mx-auto mb-8 animate-pulse" />
              <button 
                onClick={startGame}
                className="px-16 py-8 bg-cyber-blue text-background font-black text-3xl uppercase italic hover:bg-foreground transition-all shadow-[12px_12px_0_0_#ff007a]"
              >
                INITIATE_HACK
              </button>
              <div className="mt-12 grid grid-cols-2 gap-8 max-w-md mx-auto">
                 <div className="text-center p-4 border border-foreground/10 glass-panel">
                    <div className="text-[10px] text-cyber-blue font-black tracking-widest uppercase mb-2">CONTROLS</div>
                    <div className="text-foreground font-bold text-xs uppercase">KEYBOARD: TYPE_CODE</div>
                 </div>
                 <div className="text-center p-4 border border-foreground/10 glass-panel">
                    <div className="text-[10px] text-electric-volt font-black tracking-widest uppercase mb-2">OBJECTIVE</div>
                    <div className="text-foreground font-bold text-xs uppercase">DECRYPT_PROTOCOLS<br/>BEFORE_TIME_OUT</div>
                 </div>
              </div>
            </div>
          )}

          {gameState === "PLAYING" && (
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-12">
                <div className="flex gap-10">
                   <div>
                     <div className="text-[10px] text-dim font-black uppercase tracking-widest">TIME_REMAINING</div>
                     <div className={`text-4xl font-black italic ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-foreground"}`}>{timeLeft}S</div>
                   </div>
                   <div>
                     <div className="text-[10px] text-dim font-black uppercase tracking-widest">BYTES_DECRYPTED</div>
                     <div className="text-4xl font-black italic text-electric-volt">{score}</div>
                   </div>
                </div>
                <div className="p-2 border-2 border-cyber-blue/30 rounded">
                   <ShieldAlert className="w-8 h-8 text-cyber-blue animate-pulse" />
                </div>
              </div>

              <div className="mb-8 p-10 bg-background/80 border-2 border-foreground/10 rounded-xl">
                 <div className="text-xs font-mono text-cyber-blue mb-4 tracking-tighter opacity-50">&gt; TARGET_PROTOCOL:</div>
                 <div className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-foreground break-all">
                    {targetText.split("").map((char, i) => (
                      <span key={i} className={i < userInput.length ? (char === userInput[i] ? "text-electric-volt" : "text-red-500 bg-red-500/20") : ""}>
                        {char}
                      </span>
                    ))}
                 </div>
              </div>

              <input
                autoFocus
                type="text"
                value={userInput}
                onChange={handleInput}
                className="w-full bg-foreground/5 border-4 border-cyber-blue p-8 text-3xl font-mono font-black uppercase text-foreground focus:outline-none placeholder:text-foreground/10 shadow-[0_0_30px_rgba(0,240,255,0.1)]"
                placeholder="TYPE_HERE_TO_DECRYPT..."
              />
            </div>
          )}

          {gameState === "GAMEOVER" && (
            <div className="relative z-10 text-center py-6">
              <CheckCircle2 className="w-24 h-24 text-electric-volt mx-auto mb-6" />
              <h2 className="text-5xl md:text-7xl font-black text-foreground italic uppercase mb-2">
                {score <= 50 ? "NPC_BEHAVIOR" : 
                 score <= 100 ? "SKILL_ISSUE" : 
                 score <= 150 ? "KINDA_MID" : 
                 score <= 250 ? "COOKING_RN" : 
                 score <= 350 ? "W_RIZZ" : 
                 "MAIN_CHARACTER"}
              </h2>
              <p className="text-foreground/80 font-black uppercase tracking-widest text-[10px] mb-6">
                {score <= 50 ? "BRO TYPES WITH TWO FINGERS 💀" : 
                 score <= 100 ? "GRANDMA TYPES FASTER THAN YOU." : 
                 score <= 150 ? "NOT BAD, BUT NOT HACKERMAN LEVEL." : 
                 score <= 250 ? "KEYBOARD IS ON FIRE RN." : 
                 score <= 350 ? "W RIZZ. BRO IS IN THE MAINFRAME." : 
                 "CERTIFIED HACKERMAN. TOUCH GRASS PLEASE."}
              </p>
              <div className="flex justify-center gap-12 mb-10">
                 <div>
                   <div className="text-[10px] text-dim font-black uppercase tracking-widest">SPEED</div>
                   <div className="text-5xl font-black italic text-cyber-blue">{wpm} <span className="text-xl">WPM</span></div>
                 </div>
                 <div>
                   <div className="text-[10px] text-dim font-black uppercase tracking-widest">TOTAL_DATA</div>
                   <div className="text-5xl font-black italic text-electric-volt">{score} <span className="text-xl">B</span></div>
                 </div>
              </div>
              <button 
                onClick={startGame}
                className="px-12 py-6 bg-foreground text-background font-black text-2xl uppercase italic hover:bg-cyber-blue transition-all shadow-[10px_10px_0_0_#ff007a]"
              >
                RE-LINK_UPLINK
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 flex gap-6 w-full max-w-4xl">
           <div className="flex-1 glass-panel p-6 flex items-center gap-4">
              <Zap className="w-8 h-8 text-electric-volt" />
              <div>
                 <div className="text-[10px] text-dim font-black uppercase tracking-widest">MULTIPLIER</div>
                 <div className="text-2xl font-black italic text-foreground">x{(1 + score / 500).toFixed(1)}</div>
              </div>
           </div>
           <div className="flex-1 glass-panel p-6 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-hyper-pink" />
              <div>
                 <div className="text-[10px] text-dim font-black uppercase tracking-widest">ACCURACY</div>
                 <div className="text-2xl font-black italic text-foreground">99.8%</div>
              </div>
           </div>
        </div>
      </div>

      <Footer />
    </main>
    </FeatureGuard>
  );
}