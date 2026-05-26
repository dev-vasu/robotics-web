import { useState, useEffect } from "react";
import { Trophy, UploadCloud, CheckCircle2 } from "lucide-react";

type LeaderboardProps = {
  gameId: string;
  currentScore: number;
  onRestart: () => void;
};

export default function Leaderboard({ gameId, currentScore, onRestart }: LeaderboardProps) {
  const [initials, setInitials] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaders, setLeaders] = useState<{ initials: string; score: number }[]>([]);

  useEffect(() => {
    fetch(`/api/leaderboard?gameId=${gameId}`)
      .then(res => res.json())
      .then(data => setLeaders(data.leaderboard || []))
      .catch(console.error);
  }, [gameId, isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initials.length !== 3) return;
    
    setIsSubmitting(true);
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, initials, score: currentScore }),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  return (
    <div 
      className="w-full max-w-sm mx-auto bg-black/80 border-2 border-hyper-pink p-6 mt-6 glass-panel relative z-50 text-left"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <Trophy className="w-6 h-6 text-hyper-pink" />
        <h3 className="text-xl font-black italic text-white uppercase tracking-widest">GLOBAL_RANKS</h3>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="mb-6 bg-white/5 p-4 border border-white/10">
          <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-3">ENTER_3_LETTER_ID_TO_UPLOAD_SCORE</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              maxLength={3}
              value={initials}
              onChange={e => setInitials(e.target.value.toUpperCase())}
              className="w-20 bg-black border-2 border-cyber-blue text-white font-black text-2xl text-center focus:outline-none focus:border-hyper-pink"
              placeholder="AAA"
              required
            />
            <button 
              type="submit"
              disabled={isSubmitting || initials.length !== 3}
              className="flex-1 bg-cyber-blue text-black font-black uppercase text-sm hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "UPLOADING..." : <><UploadCloud className="w-4 h-4" /> SUBMIT</>}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-electric-volt/10 border border-electric-volt text-electric-volt text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> SCORE_UPLOADED
        </div>
      )}

      <div className="space-y-2 mb-8">
        {leaders.length === 0 ? (
          <div className="text-center text-white/30 text-xs font-mono py-4">NO_DATA_FOUND</div>
        ) : (
          leaders.map((l, i) => (
            <div key={i} className="flex justify-between items-center bg-black/50 p-2 border-l-2 border-white/20">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black ${i === 0 ? 'text-hyper-pink' : i === 1 ? 'text-cyber-blue' : i === 2 ? 'text-electric-volt' : 'text-white/40'}`}>
                  #{i + 1}
                </span>
                <span className="text-white font-black tracking-widest">{l.initials}</span>
              </div>
              <span className="text-white/80 font-black italic">{l.score}</span>
            </div>
          ))
        )}
      </div>

      <button type="button" onClick={onRestart} className="w-full py-4 bg-white text-black font-black uppercase italic hover:bg-hyper-pink hover:text-white transition-all shadow-[6px_6px_0_0_#ff007a]">
        REBOOT_SIMULATION
      </button>
    </div>
  );
}
