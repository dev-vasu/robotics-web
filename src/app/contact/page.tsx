"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Send, CheckCircle2, AlertCircle, Terminal } from "lucide-react";
import gsap from "gsap";
import FeatureGuard from "@/components/FeatureGuard";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.from(formRef.current, {
        scale: 0.9,
        rotateX: 45,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <FeatureGuard featureId="contact_portal">
      <main className="min-h-screen pt-32 pb-20 grid-bg flex flex-col">
        <Navbar />
        
        <div className="flex-1 container mx-auto px-6 max-w-4xl">
          <div className="text-left mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-hyper-pink text-background text-[10px] font-black uppercase tracking-widest mb-6">
              <Terminal className="w-3 h-3" />
              Establish_Protocol
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic text-foreground uppercase leading-none mb-6">
              SEND IT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-hyper-pink to-cyber-blue text-glitch">
                WITHOUT_DELAY
              </span>
            </h1>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-1 md:p-1 bg-gradient-to-br from-hyper-pink via-transparent to-electric-volt relative group"
          >
            <div className="bg-background p-8 md:p-12 relative overflow-hidden">
               {/* Scanning Line Animation */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-electric-volt shadow-[0_0_20px_#ccff00] -translate-y-full animate-scan z-10" />
              
              <div className="space-y-10 relative z-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="NAME_OR_ALIAS"
                    required
                    className="w-full bg-transparent border-b-2 border-foreground/20 pb-4 text-2xl font-black uppercase text-foreground focus:outline-none focus:border-hyper-pink transition-colors placeholder:text-foreground/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <input
                    type="email"
                    placeholder="DIGITAL_ADDRESS"
                    required
                    className="w-full bg-transparent border-b-2 border-foreground/20 pb-4 text-2xl font-black uppercase text-foreground focus:outline-none focus:border-cyber-blue transition-colors placeholder:text-foreground/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <textarea
                    placeholder="DATA_STREAM_CONTENT"
                    required
                    rows={4}
                    className="w-full bg-transparent border-b-2 border-foreground/20 pb-4 text-2xl font-black uppercase text-foreground focus:outline-none focus:border-electric-volt transition-colors placeholder:text-foreground/20 resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-8 bg-foreground text-background font-black text-2xl uppercase italic tracking-widest hover:bg-hyper-pink hover:text-foreground transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {status === "loading" ? (
                    "UPLOADING..."
                  ) : (
                    "TRANSMIT_NOW"
                  )}
                </button>

                {status === "success" && (
                  <div className="flex items-center gap-4 text-electric-volt bg-electric-volt/10 p-6 border-l-4 border-electric-volt">
                    <CheckCircle2 className="w-8 h-8" />
                    <span className="font-black uppercase tracking-widest text-lg">Transmission_OK. Auto_Reply_Sent.</span>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex items-center gap-4 text-hyper-pink bg-hyper-pink/10 p-6 border-l-4 border-hyper-pink">
                    <AlertCircle className="w-8 h-8" />
                    <span className="font-black uppercase tracking-widest text-lg">System_Failure. Try_Again.</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="mt-40">
          <Footer />
        </div>
      </main>
    </FeatureGuard>
  );
}
