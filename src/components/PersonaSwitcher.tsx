import React from "react";
import { motion } from "framer-motion";
import { Briefcase, HeartHandshake, Terminal } from "lucide-react";
import { usePersona, Persona } from "@/context/PersonaContext";

interface PersonaSwitcherProps {
  variant?: "hero" | "compact";
  className?: string;
}

const PERSONAS: { id: Persona; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  {
    id: "guest",
    label: "Guest",
    icon: Briefcase,
    desc: "Recruiter & Client Mode"
  },
  {
    id: "friend",
    label: "Friend",
    icon: HeartHandshake,
    desc: "Homie & Insider Mode"
  },
  {
    id: "operator",
    label: "Operator",
    icon: Terminal,
    desc: "CTF & Red Team Mode"
  }
];

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({ variant = "hero", className = "" }) => {
  const { persona, setPersona } = usePersona();

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-black/60 border border-primary/30 backdrop-blur-md font-mono text-xs ${className}`}>
        {PERSONAS.map(p => {
          const Icon = p.icon;
          const isActive = persona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={`relative px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-[11px] ${
                isActive
                  ? "text-background shadow-[0_0_15px_hsl(var(--primary)/0.6)]"
                  : "text-primary/60 hover:text-primary hover:bg-primary/5"
              }`}
              title={p.desc}
            >
              {isActive && (
                <motion.div
                  layoutId="activePersonaCompact"
                  className="absolute inset-0 bg-primary rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Hero Segmented HUD Banner
  return (
    <div className={`w-full max-w-xl p-2 rounded-2xl bg-black/60 border border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.15)] backdrop-blur-xl font-mono ${className}`}>
      <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] uppercase tracking-wider text-primary/70 border-b border-primary/15 mb-1.5">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          STEP 1 // VISITOR PROFILE:
        </span>
        <span className="text-primary/50 hidden sm:inline">
          {PERSONAS.find(p => p.id === persona)?.desc}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {PERSONAS.map(p => {
          const Icon = p.icon;
          const isActive = persona === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={`relative p-2 sm:p-2.5 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? "text-background font-black shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  : "text-primary/70 hover:text-primary hover:bg-primary/10 border border-primary/15"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePersonaHero"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-background" : "text-primary"}`} />
              <div className="text-center sm:text-left">
                <span className="text-xs sm:text-sm font-bold block leading-none">{p.label}</span>
                <span className={`text-[9px] hidden sm:block ${isActive ? "text-background/80" : "text-muted-foreground"}`}>
                  {p.id === "guest" ? "Recruiter" : p.id === "friend" ? "Homie" : "Hacker"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
