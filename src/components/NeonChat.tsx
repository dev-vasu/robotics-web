"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Terminal, MessageSquare, Loader2, Trash2 } from "lucide-react";

type ChatMessage = {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
};

export default function NeonChat({ user }: { user: { id: number; username: string } }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          content: input.trim()
        }),
      });
      if (res.ok) {
        setInput("");
        fetchMessages();
      }
    } catch (e) { console.error(e); }
    setSending(false);
  };

  return (
    <div className="glass-panel border-4 border-foreground/10 bg-background/80 flex flex-col h-[600px] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue shadow-[0_0_20px_#00f0ff] animate-scan opacity-0 group-hover:opacity-100" />
      
      {/* Chat Header */}
      <div className="p-6 border-b border-foreground/10 flex items-center justify-between bg-foreground/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-blue rounded-full text-background animate-pulse">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-black italic text-foreground uppercase tracking-wider leading-none">GLOBAL_UPLINK</h3>
            <p className="text-[8px] text-cyber-blue font-black uppercase tracking-[0.4em] mt-1">REAL-TIME_COMM_CHANNEL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-electric-volt rounded-full animate-pulse" />
           <span className="text-[8px] font-black text-dim uppercase tracking-widest">ENCRYPTED_LINE</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-background/20">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
             <MessageSquare className="w-12 h-12 mb-4" />
             <p className="text-xs font-black uppercase tracking-widest">NO_SIGNALS_DETECTED_IN_THE_VOID</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? "items-end" : "items-start animate-in slide-in-from-left-2 duration-300"}`}>
              <div className="flex items-center gap-2 mb-1">
                 <span className={`text-[8px] font-black uppercase tracking-widest ${msg.user_id === user.id ? "text-hyper-pink" : "text-cyber-blue"}`}>
                   {msg.username}
                 </span>
                 <span className="text-[6px] text-dim font-mono">
                   [{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                 </span>
              </div>
              <div className={`px-4 py-2 text-sm font-bold border-l-2 max-w-[80%] break-words transition-all ${
                msg.user_id === user.id 
                  ? "bg-foreground/5 border-hyper-pink text-foreground text-right" 
                  : "bg-background/60 border-cyber-blue text-foreground"
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-foreground/10 bg-foreground/5">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="ENTER_DATA_PAYLOAD..." 
            className="flex-1 bg-background border-2 border-foreground/10 p-4 font-black uppercase text-xs focus:outline-none focus:border-cyber-blue text-foreground transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button 
            type="submit"
            disabled={sending || !input.trim()}
            className="px-6 bg-cyber-blue text-background hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center group"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          </button>
        </div>
      </form>
    </div>
  );
}
