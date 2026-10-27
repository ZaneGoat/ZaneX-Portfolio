import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Cpu, ExternalLink, Zap, Clock, MapPin, Monitor, Play, Github, Keyboard,
  Radio, ShieldAlert, Lock, Key
} from "lucide-react";
import { systemSpecsByPersona } from "@/data/portfolio";
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
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export const BentoGrid = ({
  onOpenTerminal,
  onOpenBreach,
  onOpenCsi,
  onOpenCtf,
  onOpenMegaCenter,
  onOpenInfiltration
}: BentoGridProps) => {
  const { persona } = usePersona();
  const { clearance, clearanceLevel } = useOperatorClearance();
  const activeSpecs = systemSpecsByPersona[persona] || systemSpecsByPersona.operator;

  const isOperator = persona === "operator";

  // Operator Redactions based on clearance
  const displayName = isOperator && !clearance.identityUnlocked ? "████████ ████████" : activeSpecs.realName;
  const displayHandle = isOperator && !clearance.identityUnlocked ? "OPERATOR_UNKNOWN" : activeSpecs.handle;
  const displayRole = isOperator && !clearance.identityUnlocked ? "RESTRICTED PROFILE // CLEARANCE REQUIRED" : activeSpecs.role;
  const displayBio = isOperator && !clearance.identityUnlocked
    ? "[RESTRICTED PROFILE: Identity and engineering background are locked behind Node 01. Complete the security challenges below or unlock via ZaneOS to view full profile.]"
    : activeSpecs.bio;
  const displayStatus = isOperator && !clearance.identityUnlocked
    ? `RESTRICTED // CLEARANCE ${clearanceLevel}/3`
    : activeSpecs.status;
  const displayLocation = isOperator && !clearance.hardwareUnlocked ? "Casablanca (Redacted)" : activeSpecs.location;
  const displayRig = isOperator && !clearance.hardwareUnlocked ? "Linux x86_64 (Locked)" : activeSpecs.os;
  const displayStats = isOperator && !clearance.identityUnlocked
    ? [
        { value: "--", label: "Subcarriers" },
        { value: "--", label: "Linux Systems" },
        { value: "0x??", label: "EC Control" }
      ]
    : activeSpecs.stats;

  return (
    <section id="overview" className="relative z-10 px-3.5 sm:px-6 md:px-8 pt-3 sm:pt-6 pb-12 sm:pb-20 max-w-7xl mx-auto">
      {/* Compact Visitor Bar: Mode & Hardware Check */}
      <motion.div {...fadeUp(0)} className="mb-4 sm:mb-6 flex flex-col items-center gap-2">
        <PersonaSwitcher variant="hero" />
        <DeviceQuestion />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">

        {/* 1 — Identity (Hero) */}
        <motion.div {...fadeUp(0.04)} className="hud-card md:col-span-2 lg:row-span-2 p-5 sm:p-8 md:p-10 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono mb-4 sm:mb-6 border ${
              isOperator && !clearance.identityUnlocked
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-primary/10 border-primary/25 text-primary"
            }`}>
              <span className={`inline-flex rounded-full w-1.5 h-1.5 ${
                isOperator && !clearance.identityUnlocked ? "bg-red-500" : "bg-primary"
              }`} />
              <span className="truncate">{displayStatus}</span>
            </div>

            <p className="font-mono text-xs text-muted-foreground mb-1.5">$ whoami</p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.98] uppercase select-none">
              <span className="text-primary">{displayName.split(" ")[0]}</span>
              <br />
              <span className="text-foreground">{displayName.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="mt-3 sm:mt-4 font-mono text-xs sm:text-sm md:text-base text-foreground/85">
              <span className="text-primary font-bold">{displayHandle}</span> — {displayRole}
            </p>
            <p className="mt-3 text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
              {displayBio}
            </p>
          </div>

          <div>
            {/* Compact Stats Strip */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-5 sm:my-7 max-w-md pt-4 border-t border-white/[0.07]">
              {displayStats.map(s => (
                <div key={s.label} className="border-l-2 border-primary/40 pl-2.5 sm:pl-3">
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground font-mono leading-tight">{s.value}</div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-mono mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons: Clean 2-col grid on phones, inline flex on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                onClick={() => { sound.playBoot(); onOpenTerminal(); }}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-primary text-background font-mono font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all text-xs cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                OPEN TERMINAL
              </button>

              {isOperator && (
                <button
                  onClick={() => { sound.playBoot(); onOpenInfiltration?.(); }}
                  className={`flex items-center justify-center gap-1.5 font-mono font-bold px-3.5 py-2.5 sm:py-3 rounded-lg text-xs transition-all cursor-pointer ${
                    clearance.identityUnlocked
                      ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {clearance.identityUnlocked ? `LVL ${clearanceLevel}/3` : `UNLOCK (${clearanceLevel}/3)`}
                  </span>
                </button>
              )}

              {onOpenCtf && (
                <button
                  onClick={() => { sound.playBoot(); onOpenCtf(); }}
                  className="flex items-center justify-center gap-1.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono font-bold px-3.5 py-2.5 sm:py-3 rounded-lg hover:bg-amber-500/20 active:scale-[0.98] transition-all text-xs cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>CTF BOARD</span>
                </button>
              )}

              {persona === "friend" ? (
                <button
                  onClick={() => { sound.playBoot(); onOpenBreach(); }}
                  className="flex items-center justify-center gap-1.5 border border-secondary/40 bg-secondary/10 text-secondary font-mono font-bold px-3.5 py-2.5 sm:py-3 rounded-lg hover:bg-secondary/20 active:scale-[0.98] transition-all cursor-pointer text-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>PLAY BREACH</span>
                </button>
              ) : (
                <a
                  href="#pricing"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-center gap-1.5 border border-white/15 bg-white/[0.03] text-foreground font-mono font-bold px-3.5 py-2.5 sm:py-3 rounded-lg hover:border-primary/40 hover:text-primary transition-colors text-xs"
                >
                  <span>PLANS</span>
                </a>
              )}

              <a
                href="https://github.com/ZaneGoat"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="flex items-center justify-center gap-1.5 border border-white/10 sm:border-transparent text-muted-foreground hover:text-foreground font-mono font-bold px-3 py-2.5 sm:py-3 rounded-lg transition-colors text-xs"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* 2 — Live Status Strip (Clean stacked rows on phone, 3 columns on tablet/desktop) */}
        <motion.div
          {...fadeUp(0.08)}
          className="hud-card md:col-span-2 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 divide-y sm:divide-y-0 divide-white/[0.07] font-mono"
        >
          <div className="flex items-center justify-between sm:block">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase sm:mb-1">
              <Clock className="w-3.5 h-3.5 text-primary/70" />
              <span>Local time</span>
            </div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-foreground">
              <LiveClock />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2.5 sm:pt-0 sm:block">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase shrink-0 sm:mb-1">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              <span>Base</span>
            </div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-foreground text-right sm:text-left truncate">
              {displayLocation}
            </div>
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
            className="flex items-center justify-between gap-3 pt-2.5 sm:pt-0 sm:block cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase shrink-0 sm:mb-1">
              <Monitor className="w-3.5 h-3.5 text-primary/70" />
              <span>System</span>
              {onOpenMegaCenter && (!isOperator || clearance.hardwareUnlocked) && (
                <span className="text-[9px] text-primary border border-primary/30 px-1 py-0.2 rounded font-bold">
                  EC
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors text-right sm:text-left truncate">
              {displayRig}
            </div>
          </div>
        </motion.div>

        {/* 3 — Terminal Peek */}
        <motion.button
          {...fadeUp(0.14)}
          onClick={() => { sound.playBoot(); onOpenTerminal(); }}
          className="hud-card p-5 sm:p-6 text-left font-mono group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3.5">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
              <Terminal className="w-4 h-4" /> Shell
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[11px]">
              <Keyboard className="w-3.5 h-3.5" /> press{" "}
              <kbd className="px-1.5 py-0.5 border border-white/20 rounded text-foreground">`</kbd>
            </span>
          </div>
          <div className="text-xs space-y-1 text-foreground/85 bg-black/50 border border-white/[0.06] rounded-lg p-3">
            <p>
              <span className="text-primary">
                {persona === "friend" ? "friend@zane" : clearance.identityUnlocked ? "zane@kali" : "guest@node"}
              </span>
              :~$ csi --scan
            </p>
            <p className="text-muted-foreground">Doppler +3.8Hz · 64 subcarriers</p>
            <p>
              <span className="text-primary">
                {persona === "friend" ? "friend@zane" : clearance.identityUnlocked ? "zane@kali" : "guest@node"}
              </span>
              :~$ <span className="inline-block w-1.5 h-3.5 bg-primary align-middle animate-pulse" />
            </p>
          </div>
          {onOpenCsi && (!isOperator || clearance.projectsUnlocked) && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                sound.playBoot();
                onOpenCsi();
              }}
              className="mt-3 py-1.5 px-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/25 rounded-lg text-[10px] text-primary font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Radio className="w-3 h-3 text-primary" />
              <span>OPEN CSI RADAR</span>
            </div>
          )}
          <p className="mt-2.5 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
            Launch interactive CLI →
          </p>
        </motion.button>

        {/* 4 — Breach Protocol */}
        <motion.div {...fadeUp(0.2)} className="hud-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-secondary font-mono text-xs font-bold uppercase tracking-wider mb-2.5">
              <Zap className="w-4 h-4" /> Minigame
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground uppercase mb-1">Breach Protocol</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Hex-buffer sequence puzzle with a 35-second timer.
            </p>
          </div>
          <button
            onClick={() => { sound.playBoot(); onOpenBreach(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-secondary font-mono font-bold py-2.5 rounded-lg text-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> PLAY PUZZLE
          </button>
        </motion.div>

        {/* Exclusive Friend Lounge Card */}
        <AnimatePresence>
          {persona === "friend" && <FriendLoungeCard />}
        </AnimatePresence>

        {/* 5 & 6 — Repositories & Systems Stack (Operator mode) */}
        {persona !== "friend" && (
          <>
            {isOperator && !clearance.projectsUnlocked ? (
              <motion.div
                {...fadeUp(0.26)}
                className="hud-card md:col-span-2 lg:col-span-4 p-5 sm:p-8 border border-red-500/35 bg-[#0d070b]/95"
              >
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Node 03 // Repository Index Locked</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase font-mono mb-2">
                  Project Archives Restricted
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-2xl mb-5 font-mono">
                  Production ERP modules, 802.11 Wi-Fi CSI radar tools, DualSense HID drivers, and MSI EC fan controllers are locked in Operator mode. Complete the security challenges to unlock.
                </p>
                {onOpenInfiltration && (
                  <button
                    onClick={() => { sound.playBoot(); onOpenInfiltration(); }}
                    className="inline-flex items-center gap-2 border border-primary/40 bg-primary/15 text-primary font-mono font-bold px-4 py-2.5 rounded-lg hover:bg-primary/25 active:scale-[0.98] transition-all text-xs cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    UNLOCK CHALLENGES
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <motion.div {...fadeUp(0.26)} className="hud-card md:col-span-2 lg:col-span-3 p-5 sm:p-7 flex flex-col justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5 mb-4">
                    <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
                      <Github className="w-4 h-4" /> Source Code & Flagships
                    </div>
                    <a
                      href="https://github.com/ZaneGoat"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playClick()}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-white/[0.04] text-foreground/85 hover:text-primary border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <span>github.com/ZaneGoat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid md:grid-cols-5 gap-5">
                    <div className="md:col-span-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Open-Source & Production Work</h3>
                      <p className="text-primary text-xs font-mono mb-2.5">
                        ZaneMegaCenter · csi_project · Controler-space
                      </p>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        From Linux Embedded Controller (EC) thermal governors and 802.11 Wi-Fi CSI motion sensing to low-latency USB HID calibration and custom business ERP software.
                      </p>
                    </div>
                    <div className="md:col-span-2 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5 text-xs font-mono text-muted-foreground">
                        <div className="flex items-center gap-2"><span className="text-primary">▸</span> GitHub: @ZaneGoat</div>
                        <div className="flex items-center gap-2"><span className="text-primary">▸</span> Focus: Python, TypeScript, C, Linux</div>
                        <div className="flex items-center gap-2"><span className="text-primary">▸</span> Live API repository index below</div>
                      </div>
                      <a
                        href="#repositories"
                        onClick={() => sound.playClick()}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-background rounded-lg font-mono text-xs font-bold transition-colors hover:bg-primary/90 active:scale-[0.98]"
                      >
                        <Github className="w-4 h-4" />
                        <span>BROWSE REPOSITORIES</span>
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* 6 — Low-Level Systems Stack (Replaces generic AI tool list) */}
                <motion.div {...fadeUp(0.32)} className="hud-card md:col-span-2 lg:col-span-1 p-5 sm:p-6 font-mono">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                    <Cpu className="w-4 h-4" /> Systems Focus
                  </div>
                  <ul className="space-y-3 text-xs">
                    {[
                      ["Linux EC / Kernel", "Register & fan curve control"],
                      ["802.11 Wi-Fi CSI", "64-subcarrier Doppler radar"],
                      ["USB HID / Evdev", "1000Hz gamepad calibration"],
                    ].map(([name, desc]) => (
                      <li key={name} className="border-l-2 border-primary/40 pl-3">
                        <span className="block text-foreground font-bold">{name}</span>
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
