import React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Terminal } from "lucide-react";
import { usePersona, Persona } from "@/context/PersonaContext";

interface PersonaSwitcherProps {
  variant?: "hero" | "compact";
  className?: string;
}

const PERSONAS: { id: Persona; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  {
    id: "operator",
    label: "Operator",
    icon: Terminal,
    desc: "CTF & Red Team Mode"
  },
  {
    id: "friend",
    label: "Friend",
    icon: HeartHandshake,
    desc: "Homie & Insider Mode"
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

  // Hero Segmented Banner (Compact & sleek on phone screens)
  return (
    <div className={`w-full max-w-xl p-1.5 sm:p-2 rounded-xl bg-[#070b14]/90 border border-white/10 font-mono ${className}`}>
      <div className="hidden sm:flex items-center justify-between px-2 pb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/[0.06] mb-1.5">
        <span className="font-semibold text-foreground/80">View Mode</span>
        <span>{PERSONAS.find(p => p.id === persona)?.desc}</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {PERSONAS.map(p => {
          const Icon = p.icon;
          const isActive = persona === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={`relative py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "text-background font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePersonaHero"
                  className="absolute inset-0 bg-primary rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-background" : "text-primary"}`} />
              <div className="text-left flex items-baseline gap-1.5">
                <span className="text-xs font-bold leading-none">{p.label}</span>
                <span className={`text-[10px] hidden sm:inline ${isActive ? "text-background/75" : "text-muted-foreground/70"}`}>
                  {p.id === "operator" ? "Technical" : "Casual"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
