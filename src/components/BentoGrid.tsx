import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Cpu, ExternalLink, Zap, Clock, MapPin, Monitor, Play, Github, Keyboard,
  Radio, ShieldAlert, Lock, Key, ChevronDown, ChevronUp, FolderGit2, Music, Pause,
  SkipForward, Coffee, Sparkles, Mail
} from "lucide-react";
import { CelestialZenLogo } from "@/components/CelestialZenLogo";
import { systemSpecsByPersona } from "@/data/portfolio";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { useMusic } from "@/context/MusicContext";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { DeviceQuestion } from "@/components/DeviceQuestion";
import { FriendLoungeCard } from "@/components/FriendLoungeCard";
import { sound } from "@/lib/sound";

interface BentoGridProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenCelestial?: () => void;
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
  onOpenCelestial,
  onOpenCsi,
  onOpenCtf,
  onOpenMegaCenter,
  onOpenInfiltration
}: BentoGridProps) => {
  const { persona } = usePersona();
  const { clearance, clearanceLevel } = useOperatorClearance();
  const { currentTrack, isPlaying, togglePlay, mood, openMoodMenu, nextTrack } = useMusic();
  const [showMoreProjects, setShowMoreProjects] = useState(false);
  const activeSpecs = systemSpecsByPersona[persona] || systemSpecsByPersona.operator;

  const isOperator = persona === "operator";

  useEffect(() => {
    const onExpand = () => setShowMoreProjects(true);
    const onCollapse = () => setShowMoreProjects(false);
    window.addEventListener("zanex:expand-repos", onExpand);
    window.addEventListener("zanex:collapse-repos", onCollapse);
    return () => {
      window.removeEventListener("zanex:expand-repos", onExpand);
      window.removeEventListener("zanex:collapse-repos", onCollapse);
    };
  }, []);

  const isRedacted = isOperator && !clearance.identityUnlocked;

  // Operator Redactions based on clearance
  const displayName = isRedacted ? "██████ ██████" : activeSpecs.realName;
  const displayHandle = isRedacted ? "OPERATOR_UNKNOWN" : activeSpecs.handle;
  const displayRole = isRedacted ? "RESTRICTED // CLEARANCE REQUIRED" : activeSpecs.role;
  const displayBio = isRedacted
    ? "[RESTRICTED PROFILE: Identity & engineering background locked behind Node 01. Unlock via Security Challenges or ZaneOS.]"
    : activeSpecs.bio;
  const displayStatus = isRedacted
    ? `LOCKED · LVL ${clearanceLevel}/3`
    : activeSpecs.status;
  const displayLocation = isOperator && !clearance.hardwareUnlocked ? "Casablanca (Redacted)" : activeSpecs.location;
  const displayRig = isOperator && !clearance.hardwareUnlocked ? "Linux x86_64 (Locked)" : activeSpecs.os;
  const displayStats = isRedacted
    ? [
        { value: "--", label: "Subcarriers" },
        { value: "--", label: "Linux Systems" },
        { value: "0x??", label: "EC Control" }
      ]
    : activeSpecs.stats;

  return (
    <section id="overview" className="relative z-10 px-3 sm:px-6 md:px-8 pt-1.5 sm:pt-6 pb-8 sm:pb-20 max-w-7xl mx-auto">
      {/* Compact Visitor Bar: Mode & Hardware Check */}
      <motion.div {...fadeUp(0)} className="mb-2.5 sm:mb-6 flex flex-col items-center gap-1.5 sm:gap-2">
        <PersonaSwitcher variant="hero" />
        <DeviceQuestion />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

        {/* 1 — Identity (Hero) — Engineered to fit phone viewports cleanly above the fold */}
        <motion.div {...fadeUp(0.04)} className="hud-card md:col-span-2 lg:row-span-2 p-3.5 sm:p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-w-0 max-w-full">
          <div className="min-w-0">
            {/* Compact Single-Line Top Header on Mobile */}
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-5 min-w-0">
              <p className="font-mono text-[11px] sm:text-xs text-primary/90 font-semibold shrink-0">
                {isOperator ? "$ whoami" : "✨ HOMIE LOUNGE"}
              </p>
              <div className={`inline-flex max-w-[72%] items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[11px] font-mono border ${
                isRedacted
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : isOperator
                  ? "bg-primary/10 border-primary/25 text-primary"
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              }`}>
                <span className={`inline-flex rounded-full w-1.5 h-1.5 shrink-0 ${
                  isRedacted ? "bg-red-500" : isOperator ? "bg-primary" : "bg-emerald-400"
                }`} />
                <span className="truncate">{displayStatus}</span>
              </div>
            </div>

            <h1
              className={`font-black uppercase select-none max-w-full overflow-hidden ${
                isRedacted
                  ? "font-mono text-xl sm:text-4xl md:text-5xl tracking-tight leading-[1.08]"
                  : "text-2xl sm:text-5xl md:text-6xl tracking-tight leading-[1.02] sm:leading-[0.98] break-words"
              }`}
            >
              <span className="text-primary block truncate">{displayName.split(" ")[0]}</span>
              <span className="text-foreground block truncate">{displayName.split(" ").slice(1).join(" ")}</span>
            </h1>

            <p className="mt-1.5 sm:mt-4 font-mono text-[11px] sm:text-sm md:text-base text-foreground/85 leading-snug truncate sm:whitespace-normal">
              <span className="text-primary font-bold">{displayHandle}</span> — {displayRole}
            </p>
            <p className="mt-1.5 sm:mt-3 text-muted-foreground text-[11px] sm:text-sm md:text-base leading-snug sm:leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
              {displayBio}
            </p>
          </div>

          <div className="min-w-0">
            {/* Compact Stats Strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 my-2.5 sm:my-7 max-w-md pt-2.5 sm:pt-4 border-t border-white/[0.08]">
              {displayStats.map(s => (
                <div key={s.label} className="border-l-2 border-primary/40 pl-2 sm:pl-3 min-w-0">
                  <div className="text-base sm:text-2xl md:text-3xl font-black text-foreground font-mono leading-tight truncate">{s.value}</div>
                  <div className="text-[9px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-mono mt-0.5 truncate">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons: Clean 2-col grid on phones, inline flex on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
              {isOperator ? (
                <>
                  <button
                    onClick={() => { sound.playBoot(); onOpenTerminal(); }}
                    className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-primary text-background font-mono font-bold px-3 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all text-[11px] sm:text-xs cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>OPEN TERMINAL</span>
                  </button>

                  <button
                    onClick={() => { sound.playBoot(); onOpenInfiltration?.(); }}
                    className={`flex items-center justify-center gap-1.5 font-mono font-bold px-2 sm:px-3.5 py-1.5 sm:py-3 rounded-lg text-[10px] sm:text-xs transition-all cursor-pointer min-w-0 ${
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

                  {onOpenCtf && (
                    <button
                      onClick={() => { sound.playBoot(); onOpenCtf(); }}
                      className="flex items-center justify-center gap-1.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono font-bold px-2 sm:px-3.5 py-1.5 sm:py-3 rounded-lg hover:bg-amber-500/20 active:scale-[0.98] transition-all text-[10px] sm:text-xs cursor-pointer min-w-0"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">CTF BOARD</span>
                    </button>
                  )}

                  <a
                    href="#pricing"
                    onClick={() => sound.playClick()}
                    className="flex items-center justify-center gap-1.5 border border-white/15 bg-white/[0.03] text-foreground font-mono font-bold px-2 sm:px-3.5 py-1.5 sm:py-3 rounded-lg hover:border-primary/40 hover:text-primary transition-colors text-[10px] sm:text-xs"
                  >
                    <span>PLANS</span>
                  </a>

                  <a
                    href="https://github.com/ZaneGoat"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className="flex items-center justify-center gap-1.5 border border-white/10 sm:border-transparent text-muted-foreground hover:text-foreground font-mono font-bold px-2 sm:px-3 py-1.5 sm:py-3 rounded-lg transition-colors text-[10px] sm:text-xs"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="#friend-lounge"
                    onClick={() => sound.playClick()}
                    className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-500 text-black font-mono font-bold px-3 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-emerald-400 active:scale-[0.98] transition-all text-[11px] sm:text-xs cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  >
                    <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>CHILL IN LOUNGE</span>
                  </a>

                  {onOpenCelestial && (
                    <button
                      onClick={() => onOpenCelestial()}
                      className="flex items-center justify-center gap-1.5 border border-blue-300/35 bg-blue-400/10 text-blue-100 font-mono font-bold px-2 sm:px-3.5 py-1.5 sm:py-3 rounded-lg hover:bg-blue-400/20 active:scale-[0.98] transition-all cursor-pointer text-[10px] sm:text-xs min-w-0"
                    >
                      <CelestialZenLogo className="w-3.5 h-3.5 fill-white shrink-0" />
                      <span className="truncate">CELESTIAL ZEN</span>
                    </button>
                  )}

                  <button
                    onClick={() => { sound.playBoot(); onOpenBreach(); }}
                    className="flex items-center justify-center gap-1.5 border border-secondary/40 bg-secondary/10 text-secondary font-mono font-bold px-2 sm:px-3.5 py-1.5 sm:py-3 rounded-lg hover:bg-secondary/20 active:scale-[0.98] transition-all cursor-pointer text-[10px] sm:text-xs min-w-0"
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">PLAY BREACH</span>
                  </button>

                  <a
                    href="mailto:azizmaaizat@outlook.com?subject=Hey%20Zane!"
                    onClick={() => sound.playClick()}
                    className="flex items-center justify-center gap-1.5 border border-white/15 bg-white/[0.04] text-foreground font-mono font-bold px-2 sm:px-3.5 py-1.5 sm:py-3 rounded-lg hover:border-emerald-500/40 hover:text-emerald-300 transition-colors text-[10px] sm:text-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>SAY HI</span>
                  </a>

                  <button
                    onClick={() => { sound.playBoot(); onOpenTerminal(); }}
                    className="flex items-center justify-center gap-1 border border-white/10 hover:border-primary/40 text-muted-foreground hover:text-primary font-mono font-bold px-2 sm:px-2.5 py-1.5 sm:py-3 rounded-lg transition-colors text-[10px] sm:text-xs cursor-pointer"
                    title="Launch terminal shell"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>CLI</span>
                  </button>
                </>
              )}
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
              <span>{isOperator ? "Local time" : "Casablanca Time"}</span>
            </div>
            <div className="text-sm sm:text-lg md:text-xl font-bold text-foreground">
              <LiveClock />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2.5 sm:pt-0 sm:block">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase shrink-0 sm:mb-1">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              <span>{isOperator ? "Base" : "Hometown"}</span>
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
              <span>{isOperator ? "System" : "Setup"}</span>
              {isOperator && onOpenMegaCenter && (!isOperator || clearance.hardwareUnlocked) && (
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

        {/* 3 — Vibe Jukebox Deck (Friend) vs Terminal Peek (Operator) */}
        {persona === "friend" ? (
          <motion.div
            {...fadeUp(0.14)}
            className="hud-card p-5 sm:p-6 text-left font-mono border border-emerald-500/25 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400">
                  <Music className="w-4 h-4" /> Live Beats
                </span>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {isPlaying ? "NOW PLAYING 🎵" : "READY TO VIBE"}
                </span>
              </div>
              <div className="bg-black/50 border border-white/[0.06] rounded-lg p-3 space-y-1">
                <p className="text-xs font-bold text-foreground truncate">
                  {currentTrack.title}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
                <p className="text-[10px] text-emerald-400/80 pt-1">
                  Mood: {mood === "jazz" ? "They are Jazz 🎷" : "3 AM Vibes 🌙"}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                No dev commands needed—hit play and vibe with the soundtrack.
              </p>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  togglePlay();
                }}
                className="flex-1 py-2 px-3 bg-emerald-500 text-black font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer hover:bg-emerald-400"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                <span>{isPlaying ? "PAUSE" : "PLAY BEATS"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  nextTrack();
                }}
                className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-foreground active:scale-95 transition-transform cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playBoot();
                  openMoodMenu();
                }}
                className="px-2.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-lg text-[11px] font-bold text-emerald-300 active:scale-95 transition-transform cursor-pointer"
                title="Switch Vibe Mood"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
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
                  {clearance.identityUnlocked ? "zane@kali" : "operator@node"}
                </span>
                :~$ csi --scan
              </p>
              <p className="text-muted-foreground">Doppler +3.8Hz · 64 subcarriers</p>
              <p>
                <span className="text-primary">
                  {clearance.identityUnlocked ? "zane@kali" : "operator@node"}
                </span>
                :~$ <span className="inline-block w-1.5 h-3.5 bg-primary align-middle animate-pulse" />
              </p>
            </div>
            {onOpenCsi && clearance.projectsUnlocked && (
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
        )}

        {/* 4 — Breach Protocol, Celestial Zen & Upcoming Game */}
        <motion.div {...fadeUp(0.2)} className="hud-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="flex items-center gap-1.5 text-secondary font-mono text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" /> {persona === "friend" ? "Arcade & Chill" : "Arena"}
              </span>
              <a
                href="#games"
                onClick={() => sound.playClick()}
                className="text-[10px] font-mono text-amber-300/90 hover:text-amber-300 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded"
              >
                +1 Game WIP
              </a>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground uppercase mb-1">
              {persona === "friend" ? "Celestial Zen & Puzzles" : "Breach & Celestial Zen"}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {persona === "friend"
                ? "Relax under the Celestial Zen starry night sky or test your reflexes with a quick breach puzzle. Casual fun only!"
                : "5×5 hex puzzle (35s) or 3-mode night-sky arcade. Also building a full game—takes time, if I'm still alive."}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => { sound.playBoot(); onOpenBreach(); }}
              className="flex items-center justify-center gap-1.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-secondary font-mono font-bold py-2.5 px-2 rounded-lg text-[11px] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current shrink-0" />
              <span className="truncate">PLAY BREACH</span>
            </button>
            {onOpenCelestial && (
              <button
                onClick={() => onOpenCelestial()}
                className="flex items-center justify-center gap-1.5 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-300/35 text-blue-100 font-mono font-bold py-2.5 px-2 rounded-lg text-[11px] active:scale-[0.98] transition-all cursor-pointer"
              >
                <CelestialZenLogo className="w-3.5 h-3.5 fill-white shrink-0" />
                <span className="truncate">CELESTIAL ZEN</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Exclusive Friend Lounge Card */}
        <AnimatePresence>
          {persona === "friend" && <FriendLoungeCard />}
        </AnimatePresence>

        {/* 5 & 6 — Repositories & Systems Stack (Operator mode: hidden until user clicks "See More") */}
        {persona !== "friend" && (
          <>
            <motion.div
              {...fadeUp(0.26)}
              className="hud-card md:col-span-2 lg:col-span-4 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border border-primary/30 bg-primary/[0.03]"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Operator Project Index // Flagships & Repositories</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed font-mono">
                  {showMoreProjects
                    ? "Showing flagship builds (ZaneMegaCenter, csi_project, Controler-space) and live GitHub repositories."
                    : "Projects & repositories are hidden by default in Operator mode. Click See More to reveal flagship builds and live GitHub repos."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  sound.haptic(20);
                  const next = !showMoreProjects;
                  setShowMoreProjects(next);
                  if (next) {
                    window.dispatchEvent(new CustomEvent("zanex:expand-repos"));
                  } else {
                    window.dispatchEvent(new CustomEvent("zanex:collapse-repos"));
                  }
                }}
                aria-expanded={showMoreProjects}
                className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shrink-0 ${
                  showMoreProjects
                    ? "bg-white/[0.06] text-foreground border border-white/20 hover:border-white/35"
                    : "bg-primary text-background hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,158,0.2)]"
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                <span>{showMoreProjects ? "HIDE PROJECTS & REPOS" : "SEE MORE — SHOW PROJECTS & REPOS"}</span>
                {showMoreProjects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </motion.div>

            <AnimatePresence initial={false}>
              {showMoreProjects && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="hud-card md:col-span-2 lg:col-span-3 p-4 sm:p-7 flex flex-col justify-between"
                  >
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
                        <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-1">Open-Source & Production Work</h3>
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
                          onClick={() => {
                            sound.playClick();
                            window.dispatchEvent(new CustomEvent("zanex:expand-repos"));
                          }}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-background rounded-lg font-mono text-xs font-bold transition-colors hover:bg-primary/90 active:scale-[0.98]"
                        >
                          <Github className="w-4 h-4" />
                          <span>JUMP TO REPOSITORIES</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>

                  {/* 6 — Low-Level Systems Stack */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: 0.04 }}
                    className="hud-card md:col-span-2 lg:col-span-1 p-4 sm:p-6 font-mono"
                  >
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
            </AnimatePresence>
          </>
        )}

      </div>
    </section>
  );
};
