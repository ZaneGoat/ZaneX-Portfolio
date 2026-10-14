import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Terminal, Shield, Cpu, Database, Server, ExternalLink, 
  Layers, Zap, Clock, Activity, Download, ChevronRight, CheckCircle2, Play
} from "lucide-react";
import { systemSpecs, projectsData, skillsData } from "@/data/portfolio";
import { sound } from "@/lib/sound";

interface BentoGridProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
}

export const BentoGrid = ({ onOpenTerminal, onOpenBreach }: BentoGridProps) => {
  const [time, setTime] = useState("");
  const [activeProjectTab, setActiveProjectTab] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="overview" className="py-24 relative z-10 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {/* 1. Main Telemetry & Bio Card (Spans 2 cols on tablet, 2 cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 lg:col-span-2 bg-[#050816]/90 border border-primary/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden group shadow-[0_0_40px_hsl(var(--primary)/0.15)] hover:border-primary/60 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full text-xs font-mono text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>{systemSpecs.status}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary/70">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>LOCAL TIME: {time || "00:00:00"}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight mb-2 uppercase">
            {systemSpecs.realName}
          </h1>
          <p className="text-primary/70 font-mono text-sm md:text-base font-semibold mb-4">
            aka <span className="text-primary underline decoration-primary/40 underline-offset-4">{systemSpecs.handle}</span> • {systemSpecs.role}
          </p>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8">
            {systemSpecs.bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                sound.playBoot();
                onOpenTerminal();
              }}
              className="flex items-center gap-2 bg-primary text-background font-mono font-bold px-5 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
            >
              <Terminal className="w-4 h-4" />
              <span>LAUNCH ZANE_OS</span>
            </button>
            <a
              href="https://github.com/ZaneGoat"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="flex items-center gap-2 bg-primary/10 border border-primary/40 text-primary font-mono font-bold px-5 py-3 rounded-xl hover:bg-primary/20 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>GITHUB PROFILE</span>
            </a>
          </div>
        </motion.div>

        {/* 2. System Architecture & Workstation Telemetry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-[#050816]/90 border border-primary/30 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between hover:border-primary/60 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
        >
          <div>
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-4 border-b border-primary/20 pb-2">
              <Activity className="w-4 h-4" />
              <span>WORKSTATION SPECS</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-primary/50 block">OS PLATFORM:</span>
                <span className="text-primary font-bold">{systemSpecs.os}</span>
              </div>
              <div>
                <span className="text-primary/50 block">SHELL AUTOMATION:</span>
                <span className="text-primary font-bold">{systemSpecs.shell}</span>
              </div>
              <div>
                <span className="text-primary/50 block">SYSTEM AVAILABILITY:</span>
                <span className="text-primary font-bold">{systemSpecs.uptime}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-primary/20 flex items-center justify-between">
            <span className="text-xs font-mono text-primary/60">KERNEL: AUDITED</span>
            <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-mono font-bold">READY</span>
          </div>
        </motion.div>

        {/* 3. Minigame Quick-Launcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[#050816]/95 to-[#150a21]/90 border border-secondary/40 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between hover:border-secondary transition-all shadow-[0_0_30px_hsl(var(--secondary)/0.15)]"
        >
          <div>
            <div className="flex items-center gap-2 text-secondary font-mono text-xs font-bold uppercase tracking-widest mb-4 border-b border-secondary/20 pb-2">
              <Zap className="w-4 h-4 text-secondary" />
              <span>CYBER ARENA</span>
            </div>
            <h3 className="text-2xl font-black text-secondary uppercase tracking-tight mb-2">
              BREACH PROTOCOL
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4">
              Test your memory and cyber infiltration speed in a simulated 2077 hex puzzle.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playBoot();
              onOpenBreach();
            }}
            className="w-full flex items-center justify-center gap-2 bg-secondary text-background font-mono font-bold py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_hsl(var(--secondary)/0.4)]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START BREACH</span>
          </button>
        </motion.div>

        {/* 4. AI & Local Agent Pipelines Showcase (Spans 2 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 bg-[#050816]/90 border border-primary/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-primary/60 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
        >
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-4 border-b border-primary/20 pb-2">
            <Cpu className="w-4 h-4" />
            <span>AI AGENT & LOCAL INFERENCE HUB</span>
          </div>
          <h3 className="text-2xl font-black text-primary uppercase mb-2">
            Autonomous Local Pipelines
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Engineering private, latency-free developer workflows combining local models (DeepSeek CLI & Ollama) with Google Gemini API for automated documentation, refactoring, and file synthesis.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl">
              <span className="text-primary font-bold block mb-1">DeepSeek CLI</span>
              <span className="text-muted-foreground text-[11px]">Local code audits & bash automation</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl">
              <span className="text-primary font-bold block mb-1">Ollama Engine</span>
              <span className="text-muted-foreground text-[11px]">Private offline inference agents</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl">
              <span className="text-primary font-bold block mb-1">Gemini Pro API</span>
              <span className="text-muted-foreground text-[11px]">High-context structured payloads</span>
            </div>
          </div>
        </motion.div>

        {/* 5. Enterprise ERP Systems Preview (Spans 2 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="md:col-span-2 bg-[#050816]/90 border border-primary/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-primary/60 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-primary/20 pb-3 mb-4">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest">
              <Database className="w-4 h-4" />
              <span>ENTERPRISE ERP SYSTEMS</span>
            </div>
            <div className="flex gap-2">
              {projectsData.slice(0, 3).map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveProjectTab(idx);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeProjectTab === idx 
                      ? "bg-primary text-background" 
                      : "bg-primary/10 text-primary/70 hover:text-primary"
                  }`}
                >
                  {p.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Active ERP Details */}
          {(() => {
            const p = projectsData[activeProjectTab];
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-primary">{p.title}</h4>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[11px] font-mono font-semibold">
                    {p.status}
                  </span>
                </div>
                <p className="text-primary/70 text-xs font-mono mb-2">{p.subtitle}</p>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </motion.div>

      </div>
    </section>
  );
};
