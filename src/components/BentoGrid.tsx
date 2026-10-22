import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Cpu, Database, ExternalLink, Zap, Clock, MapPin, Monitor, Play, Github, Keyboard,
  Radio, Globe, Wind, ShieldAlert, Lock, Unlock, Sparkles, Key, Compass
} from "lucide-react";
import { systemSpecsByPersona, projectsData, skillsData } from "@/data/portfolio";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { DeviceQuestion } from "@/components/DeviceQuestion";
import { FriendLoungeCard } from "@/components/FriendLoungeCard";
import { sound } from "@/lib/sound";

interface BentoGridProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenCsi?: () => void;
  onOpenCtf?: () => void;
  onOpenThreatMap?: () => void;
  onOpenMegaCenter?: () => void;
  onOpenInfiltration?: () => void;
}

/** Isolated so the 1s tick re-renders only this text node, not the whole grid. */
const LiveClock = memo(() => {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Casablanca", hour12: false })
  );
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setTime(new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Casablanca", hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
});
LiveClock.displayName = "LiveClock";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export const BentoGrid = ({
  onOpenTerminal,
  onOpenBreach,
  onOpenCsi,
  onOpenCtf,
  onOpenThreatMap,
  onOpenMegaCenter,
  onOpenInfiltration
}: BentoGridProps) => {
  const { persona } = usePersona();
  const { clearance, clearanceLevel } = useOperatorClearance();
  const activeSpecs = systemSpecsByPersona[persona] || systemSpecsByPersona.guest;
  const [activeTab, setActiveTab] = useState(0);
  const flagships = projectsData.slice(0, 4);
  const active = flagships[activeTab] ?? flagships[0];

  const isOperator = persona === "operator";

  // Operator Redactions based on clearance
  const displayName = isOperator && !clearance.identityUnlocked ? "████████ ████████" : activeSpecs.realName;
  const displayHandle = isOperator && !clearance.identityUnlocked ? "OPERATOR_UNKNOWN" : activeSpecs.handle;
  const displayRole = isOperator && !clearance.identityUnlocked ? "CLASSIFIED AGENT // CLEARANCE REQUIRED" : activeSpecs.role;
  const displayBio = isOperator && !clearance.identityUnlocked
    ? "[SECURITY AUDIT LOG: ACCESS RESTRICTED. Operative background & identity are encrypted behind Node 01. Infiltrate security nodes to declassify this dossier.]"
    : activeSpecs.bio;
  const displayStatus = isOperator && !clearance.identityUnlocked
    ? `[CLASSIFIED BLACK-SITE // LEVEL ${clearanceLevel}/3]`
    : activeSpecs.status;
  const displayLocation = isOperator && !clearance.hardwareUnlocked ? "GPS MASKED // TOR-HOP" : activeSpecs.location;
  const displayRig = isOperator && !clearance.hardwareUnlocked ? "[EC MEMORY LOCKED]" : activeSpecs.os;
  const displayStats = isOperator && !clearance.identityUnlocked
    ? [
        { value: "██", label: "OFDM CARRIERS" },
        { value: "██", label: "TOR ROUTING" },
        { value: "0x??", label: "EC REGISTER" }
      ]
    : activeSpecs.stats;

  return (
    <section id="overview" className="relative z-10 px-4 md:px-8 pt-6 pb-20 max-w-7xl mx-auto">
      {/* Visitor Onboarding HUD: Persona & Hardware Telemetry Check */}
      <motion.div {...fadeUp(0)} className="mb-6 flex flex-col items-center gap-3">
        <PersonaSwitcher variant="hero" />
        <DeviceQuestion />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* 1 — Identity (hero) */}
        <motion.div {...fadeUp(0.04)} className="hud-card md:col-span-2 lg:row-span-2 p-7 md:p-10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6 border ${
              isOperator && !clearance.identityUnlocked
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-primary/10 border-primary/30 text-primary"
            }`}>
              <span className="relative flex w-2 h-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                  isOperator && !clearance.identityUnlocked ? "bg-red-400" : "bg-primary"
                }`} />
                <span className={`relative inline-flex rounded-full w-2 h-2 ${
                  isOperator && !clearance.identityUnlocked ? "bg-red-500" : "bg-primary"
                }`} />
              </span>
              {displayStatus}
            </div>

            <p className="font-mono text-sm text-primary/60 mb-2">&gt; whoami</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-primary tracking-tight leading-[0.95] uppercase glow-text select-none">
              {displayName.split(" ")[0]}
              <br />
              <span className="text-foreground/90">{displayName.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="mt-4 font-mono text-sm md:text-base text-primary/80">
              aka <span className="text-primary font-bold">{displayHandle}</span> — {displayRole}
            </p>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl">
              {displayBio}
            </p>
          </div>

          <div>
            {/* Dynamic Stats strip */}
            <div className="grid grid-cols-3 gap-3 my-8 max-w-md">
              {displayStats.map(s => (
                <div key={s.label} className="border-l-2 border-primary/40 pl-3">
                  <div className="text-2xl md:text-3xl font-black text-primary font-mono">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2.5">
              <button
                onClick={() => { sound.playBoot(); onOpenTerminal(); }}
                className="flex items-center justify-center gap-2 bg-primary text-background font-mono font-bold px-4 sm:px-5 py-3 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_25px_hsl(var(--primary)/0.4)] text-xs sm:text-sm"
              >
                <Terminal className="w-4 h-4" />
                LAUNCH ZANE_OS
              </button>

              {/* Infiltration trigger in Operator mode */}
              {isOperator && (
                <button
                  onClick={() => { sound.playBoot(); onOpenInfiltration?.(); }}
                  className={`flex items-center justify-center gap-2 font-mono font-bold px-4 py-3 rounded-xl text-xs transition-all ${
                    clearance.identityUnlocked
                      ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "border border-red-500/60 bg-red-500/15 text-red-400 hover:bg-red-500/25 animate-pulse"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {clearance.identityUnlocked ? `CLEARANCE LVL ${clearanceLevel}/3` : `DECLASSIFY DOSSIER (${clearanceLevel}/3)`}
                </button>
              )}

              {onOpenCtf && (
                <button
                  onClick={() => { sound.playBoot(); onOpenCtf(); }}
                  className="flex items-center justify-center gap-1.5 border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 font-mono font-bold px-4 py-3 rounded-xl hover:bg-yellow-500/20 active:scale-95 transition-all text-xs"
                >
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                  CTF QUEST
                </button>
              )}

              {persona === "friend" ? (
                <button
                  onClick={() => { sound.playBoot(); onOpenBreach(); }}
                  className="flex items-center justify-center gap-2 border border-secondary/50 bg-secondary/15 text-secondary font-mono font-bold px-4 sm:px-5 py-3 rounded-xl hover:bg-secondary/25 active:scale-95 transition-all shadow-[0_0_20px_hsl(var(--secondary)/0.3)] cursor-pointer text-xs sm:text-sm"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  PLAY BREACH
                </button>
              ) : (
                <a
                  href="#projects"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-center gap-2 border border-primary/40 text-primary font-mono font-bold px-4 sm:px-5 py-3 rounded-xl hover:bg-primary/10 transition-colors text-xs sm:text-sm"
                >
                  VIEW PROJECTS
                </a>
              )}

              <a
                href="https://github.com/ZaneGoat"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="flex items-center justify-center gap-2 text-primary/80 hover:text-primary font-mono font-bold px-3 py-3 transition-colors text-xs sm:text-sm"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </motion.div>

        {/* 2 — Live status strip */}
        <motion.div {...fadeUp(0.08)} className="hud-card md:col-span-2 p-6 grid grid-cols-3 gap-4 font-mono">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-primary/60 uppercase mb-1"><Clock className="w-3.5 h-3.5" />Local time</div>
            <div className="text-lg md:text-xl font-bold text-primary"><LiveClock /></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-primary/60 uppercase mb-1"><MapPin className="w-3.5 h-3.5" />Base</div>
            <div className="text-sm md:text-base font-bold text-primary">{displayLocation}</div>
          </div>
          <div
            onClick={() => {
              if (onOpenMegaCenter && (!isOperator || clearance.hardwareUnlocked)) {
                sound.playBoot();
                onOpenMegaCenter();
              } else if (isOperator && !clearance.hardwareUnlocked && onOpenInfiltration) {
                sound.playBoot();
                onOpenInfiltration();
              }
            }}
            className="cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-primary/60 uppercase mb-1">
              <Monitor className="w-3.5 h-3.5" />Rig
              {onOpenMegaCenter && (!isOperator || clearance.hardwareUnlocked) && (
                <span className="text-[9px] text-primary/70 group-hover:text-primary font-bold ml-1 border border-primary/30 px-1 rounded">
                  EC GUI
                </span>
              )}
            </div>
            <div className="text-sm md:text-base font-bold text-primary group-hover:underline">{displayRig}</div>
          </div>
        </motion.div>

        {/* 3 — Terminal peek */}
        <motion.button
          {...fadeUp(0.14)}
          onClick={() => { sound.playBoot(); onOpenTerminal(); }}
          className="hud-card p-6 text-left font-mono group"
        >
          <div className="flex items-center justify-between text-xs text-primary/60 mb-4">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest"><Terminal className="w-4 h-4" />Shell</span>
            <span className="flex items-center gap-1"><Keyboard className="w-3.5 h-3.5" />press <kbd className="px-1.5 py-0.5 border border-primary/40 rounded text-primary">`</kbd></span>
          </div>
          <div className="text-xs space-y-1 text-primary/80">
            <p><span className="text-primary">{persona === "friend" ? "homie@lounge" : persona === "operator" ? (clearance.identityUnlocked ? "zane@kali" : "operator@classified") : "guest@portfolio"}</span>:~$ csi --scan</p>
            <p className="text-muted-foreground">Doppler +3.8Hz · motion detected</p>
            <p><span className="text-primary">{persona === "friend" ? "homie@lounge" : persona === "operator" ? (clearance.identityUnlocked ? "zane@kali" : "operator@classified") : "guest@portfolio"}</span>:~$ <span className="inline-block w-2 h-3.5 bg-primary align-middle animate-pulse" /></p>
          </div>
          {onOpenCsi && (!isOperator || clearance.projectsUnlocked) && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                sound.playBoot();
                onOpenCsi();
              }}
              className="mt-3 py-1.5 px-2 bg-primary/10 hover:bg-primary/25 border border-primary/30 rounded-lg text-[10px] text-primary font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span>LAUNCH CSI RADAR (GUI)</span>
            </div>
          )}
          <p className="mt-3 text-[11px] text-primary/50 group-hover:text-primary transition-colors">Click to open ZaneOS →</p>
        </motion.button>

        {/* 4 — Breach Protocol */}
        <motion.div {...fadeUp(0.2)} className="hud-card p-6 flex flex-col justify-between" style={{ borderColor: "hsl(var(--secondary) / 0.35)" }}>
          <div>
            <div className="flex items-center gap-1.5 text-secondary font-mono text-xs font-bold uppercase tracking-widest mb-3">
              <Zap className="w-4 h-4" /> Cyber Arena
            </div>
            <h3 className="text-xl font-black text-secondary uppercase mb-1">Breach Protocol</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">Hex-matrix intrusion puzzle. 35 seconds on the clock.</p>
          </div>
          <button
            onClick={() => { sound.playBoot(); onOpenBreach(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-secondary text-background font-mono font-bold py-2.5 rounded-xl hover:scale-[1.03] active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" /> START
          </button>
        </motion.div>

        {/* Exclusive Friend Lounge Card (Unlocks when Friend persona is active) */}
        <AnimatePresence>
          {persona === "friend" && <FriendLoungeCard />}
        </AnimatePresence>

        {/* 5 & 6 — Flagship architectures & AI Stack (Guest & Operator only) */}
        {persona !== "friend" && (
          <>
            {isOperator && !clearance.projectsUnlocked ? (
              /* Classified Vault Placeholder in Operator Mode */
              <motion.div {...fadeUp(0.26)} className="hud-card md:col-span-2 lg:col-span-4 p-7 md:p-9 border-2 border-red-500/40 bg-gradient-to-br from-[#13060a]/90 via-[#0a0712]/90 to-[#13060a]/90">
                <div className="flex items-center gap-3 text-red-400 font-mono text-xs font-bold uppercase tracking-widest mb-3">
                  <Lock className="w-4 h-4 animate-pulse" />
                  <span>Node 03: Black-Ops Project Archives [CLASSIFIED LEVEL 99]</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-red-400 uppercase font-mono mb-2">
                  Access Denied // Classified Weaponry Vault
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mb-6 font-mono">
                  All enterprise full-stack ERP architectures, Wi-Fi CSI Doppler subcarrier radars, Robin Tor OSINT scrapers, and MSI EC governors are encrypted.
                  Solve the <strong className="text-primary">Infiltration Challenges</strong> or evoke cipher <strong>'OPERATOR'</strong> to decrypt.
                </p>
                <div className="flex flex-wrap gap-3">
                  {onOpenInfiltration && (
                    <button
                      onClick={() => { sound.playBoot(); onOpenInfiltration(); }}
                      className="flex items-center gap-2 border border-primary/50 bg-primary/20 text-primary font-mono font-bold px-5 py-3 rounded-xl hover:bg-primary/30 active:scale-95 transition-all text-xs cursor-pointer shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                    >
                      <Key className="w-4 h-4" />
                      INFILTRATION CHALLENGES
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div {...fadeUp(0.26)} className="hud-card md:col-span-2 lg:col-span-3 p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/15 pb-4 mb-5">
                    <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest">
                      <Database className="w-4 h-4" /> Flagship architectures
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1" role="tablist">
                      {flagships.map((p, idx) => (
                        <button
                          key={p.id}
                          role="tab"
                          aria-selected={activeTab === idx}
                          onClick={() => { sound.playClick(); setActiveTab(idx); }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors shrink-0 ${
                            activeTab === idx ? "bg-primary text-background" : "bg-primary/10 text-primary/70 hover:text-primary"
                          }`}
                        >
                          {p.title.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-primary">{active.title}</h3>
                        <span className="px-2 py-0.5 bg-primary/15 text-primary rounded-full text-[10px] font-mono font-bold">{active.category}</span>
                      </div>
                      <p className="text-primary/70 text-xs font-mono mb-3">{active.subtitle}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{active.description}</p>
                    </div>
                    <div className="md:col-span-2 flex flex-col justify-between gap-4">
                      <ul className="space-y-1.5 text-xs font-mono text-muted-foreground">
                        {active.highlights.slice(0, 3).map(h => (
                          <li key={h} className="flex gap-2"><span className="text-primary">▸</span>{h}</li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {active.tags.slice(0, 3).map(t => (
                            <span key={t} className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono rounded">{t}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {active.id === "csi_project" && onOpenCsi && (
                            <button
                              onClick={() => { sound.playBoot(); onOpenCsi(); }}
                              className="shrink-0 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 rounded-lg hover:bg-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <Radio className="w-3 h-3 text-emerald-400" />
                              LIVE RADAR
                            </button>
                          )}
                          {active.id === "robin" && onOpenThreatMap && (
                            <button
                              onClick={() => { sound.playBoot(); onOpenThreatMap(); }}
                              className="shrink-0 text-xs font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/40 px-2.5 py-1 rounded-lg hover:bg-cyan-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <Globe className="w-3 h-3 text-cyan-400" />
                              THREAT MAP
                            </button>
                          )}
                          {active.id === "zanemegacenter" && onOpenMegaCenter && (
                            <button
                              onClick={() => { sound.playBoot(); onOpenMegaCenter(); }}
                              className="shrink-0 text-xs font-mono font-bold text-primary bg-primary/15 border border-primary/40 px-2.5 py-1 rounded-lg hover:bg-primary/25 flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <Wind className="w-3 h-3 text-primary" />
                              LIVE EC STATION
                            </button>
                          )}
                          {active.github && (
                            <a
                              href={active.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => sound.playClick()}
                              className="shrink-0 text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              REPO <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 6 — AI hub */}
                <motion.div {...fadeUp(0.32)} className="hud-card md:col-span-2 lg:col-span-1 p-6 font-mono">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                    <Cpu className="w-4 h-4" /> AI stack
                  </div>
                  <ul className="space-y-3 text-xs">
                    {[
                      ["DeepSeek CLI", "Local code audits"],
                      ["Ollama", "Offline inference agents"],
                      ["Gemini API", "High-context pipelines"],
                    ].map(([name, desc]) => (
                      <li key={name} className="border-l-2 border-primary/40 pl-3">
                        <span className="block text-primary font-bold">{name}</span>
                        <span className="text-muted-foreground text-[11px]">{desc}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </>
        )}

      </div>
    </section>
  );
};
