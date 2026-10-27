import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Volume2,
  VolumeX,
  Zap,
  Menu,
  X,
  ShieldAlert,
  Eye,
  Smartphone,
  Code2,
} from "lucide-react";
import { CelestialZenLogo } from "@/components/CelestialZenLogo";
import { MatrixWatchingEye } from "@/components/MatrixWatchingEye";
import { navLinks } from "@/data/portfolio";
import { sound, AUDIO_MUTE_EVENT } from "@/lib/sound";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { useUniverseTheme } from "@/context/ThemeContext";

interface NavigationProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenCelestial?: () => void;
  onOpenCtf?: () => void;
  onReplayIntro?: () => void;
}

const SHORT_LABELS: Record<string, string> = {
  Repositories: "Repos",
  Overview: "Overview",
  Pricing: "Plans",
  Arena: "Arena",
  Contact: "Contact",
  Lounge: "Lounge",
  Notes: "Notes",
};

export const Navigation = ({
  onOpenTerminal,
  onOpenBreach,
  onOpenCelestial,
  onOpenCtf,
  onReplayIntro,
}: NavigationProps) => {
  const { persona } = usePersona();
  const { clearanceLevel } = useOperatorClearance();
  const { isExistence, setTheme, triggerLogoThemeShift } = useUniverseTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [activeHref, setActiveHref] = useState<string>("#overview");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const syncMute = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setIsMuted(typeof custom.detail === "boolean" ? custom.detail : sound.isMuted());
    };
    window.addEventListener(AUDIO_MUTE_EVENT, syncMute);
    return () => window.removeEventListener(AUDIO_MUTE_EVENT, syncMute);
  }, []);

  const activeNavLinks =
    persona === "friend"
      ? [
          { name: "Overview", href: "#overview" },
          { name: "Lounge", href: "#friend-lounge" },
          { name: "Pricing", href: "#pricing" },
          { name: "Arena", href: "#games" },
          { name: "Notes", href: "#philosophy" },
          { name: "Contact", href: "#contact" },
        ]
      : navLinks;

  // Scroll-progress laser & active section spy
  useEffect(() => {
    const updateScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 10 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      setScrollProgress(pct);

      const probeY = window.scrollY + window.innerHeight * 0.28;
      let current = activeNavLinks[0]?.href || "#overview";
      for (const link of activeNavLinks) {
        const id = link.href.replace("#", "");
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probeY) {
          current = link.href;
        }
      }
      setActiveHref(current);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [activeNavLinks]);

  const handleToggleSound = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
  };

  const leftWingLinks = activeNavLinks.slice(0, 3);
  const rightWingLinks = activeNavLinks.slice(3);

  const renderVisorSectorLink = (link: { name: string; href: string }, indexNum: number) => {
    const isActive = activeHref === link.href;
    const shortName = SHORT_LABELS[link.name] || link.name;

    return (
      <a
        key={link.name}
        href={link.href}
        onClick={() => {
          sound.playClick();
          setActiveHref(link.href);
          if (link.href === "#repositories") {
            window.dispatchEvent(new CustomEvent("zanex:expand-repos"));
          }
        }}
        className={`relative px-2 xl:px-2.5 py-1 rounded-lg font-mono text-[11px] xl:text-xs font-bold tracking-tight transition-colors whitespace-nowrap ${
          isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="visorActiveSector"
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="absolute inset-0 rounded-lg bg-primary/12 border border-primary/40 -z-10"
          />
        )}
        <span className="text-[9px] text-primary/55 mr-0.5">0{indexNum}/</span>
        <span>{shortName}</span>
      </a>
    );
  };

  // EXISTENCE Universe Brutalist Monochrome Top Bar
  if (isExistence) {
    return (
      <>
        <motion.nav
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          className="fixed top-0 w-full z-50 bg-black/95 border-b border-white/35 font-mono"
        >
          <div className="hidden sm:flex items-center justify-between px-6 py-0.5 border-b border-white/15 bg-white/[0.03] text-[9px] tracking-[0.22em] text-white/55 uppercase select-none">
            <span>SYS // OBSERVATORY_TUI :: MONOCHROME_GRID</span>
            <span>Ψ(r,θ,t) · SINGULARITY FIELD ACTIVE · Ω</span>
          </div>

          <div className="container mx-auto px-3 sm:px-6 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <a
                href="#overview"
                onClick={() => sound.playClick()}
                className="flex items-center gap-2 group shrink-0"
                aria-label="ZaneX Home"
              >
                <span className="w-7 h-7 sm:w-8 sm:h-8 border border-white/60 bg-black flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                  <CelestialZenLogo className="w-4 h-4 sm:w-5 sm:h-5 fill-white group-hover:fill-black transition-colors" />
                </span>
                <span className="text-xs sm:text-base font-bold text-white tracking-tight border border-white/50 px-2 py-0.5 bg-black group-hover:bg-white group-hover:text-black transition-colors">
                  [ZANEX<span className="hidden sm:inline">::Ω-EXISTENCE</span>
                  <span className="sm:hidden">::Ω</span>]
                </span>
              </a>
            </div>

            <div className="px-2.5 py-1 border border-white/40 bg-white/[0.04] text-[10px] sm:text-xs font-bold tracking-widest text-white select-none">
              [ Ω // SINGULARITY ]
            </div>

            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setTheme("matrix");
                }}
                className="px-2 sm:px-2.5 py-1.5 bg-white text-black hover:bg-white/85 border border-white font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="Return to Matrix Emerald Cyber-HUD"
              >
                <span>◈</span>
                <span className="sm:hidden">GREEN</span>
                <span className="hidden sm:inline">MATRIX HUD</span>
              </button>

              <button
                onClick={() => {
                  sound.playBoot();
                  onOpenTerminal();
                }}
                className="p-1.5 sm:p-2 bg-black border border-white/40 text-white hover:bg-white hover:text-black transition-all cursor-pointer active:scale-95"
                title="Launch ZaneOS Shell"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.nav>
      </>
    );
  }

  // MATRIX HUD: Floating Split-Wing Cyber-Visor with Fixed Dead-Center ASCII Watching Eye
  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        className="fixed top-1.5 sm:top-2.5 inset-x-2 sm:inset-x-4 lg:inset-x-6 z-50 max-w-7xl mx-auto pointer-events-none font-mono"
      >
        <div className="pointer-events-auto relative rounded-2xl bg-[#050914]/92 backdrop-blur-xl border border-primary/30 shadow-[0_12px_38px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(0,255,158,0.18)] px-2.5 sm:px-4 py-1.5">
          {/* Outer Sculpted Cyber-Visor Corner Ticks */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px w-2.5 h-2.5 border-t-2 border-l-2 border-primary rounded-tl-md"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px w-2.5 h-2.5 border-t-2 border-r-2 border-primary rounded-tr-md"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px w-2.5 h-2.5 border-b-2 border-l-2 border-primary/65 rounded-bl-md"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -right-px w-2.5 h-2.5 border-b-2 border-r-2 border-primary/65 rounded-br-md"
          />

          {/* Bidirectional Scroll-Progress Laser Filaments Radiating Outward from the Center Eye */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-3 right-1/2 mr-12 sm:mr-20 h-[1.5px] overflow-hidden"
          >
            <div
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              className="ml-auto h-full bg-gradient-to-l from-primary via-primary/80 to-secondary shadow-[0_0_8px_#00ff9e] transition-[width] duration-150"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 right-3 ml-12 sm:ml-20 h-[1.5px] overflow-hidden"
          >
            <div
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              className="mr-auto h-full bg-gradient-to-r from-primary via-primary/80 to-secondary shadow-[0_0_8px_#00ff9e] transition-[width] duration-150"
            />
          </div>

          {/* 3-Zone Symmetric Visor Grid: [Left Wing 1fr] — [Center Eye Keystone auto] — [Right Wing 1fr] */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3">
            {/* LEFT WING: Clean Picture Logo + Left Sector Nodes */}
            <div className="flex items-center justify-start gap-2 xl:gap-3 min-w-0">
              <a
                href="#overview"
                onClick={() => sound.playClick()}
                className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
                aria-label="ZaneX Home"
              >
                <img
                  src="/logo.svg"
                  alt="ZaneX Emblem"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/30 group-hover:border-primary/85 shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-all shrink-0 object-contain bg-[#050816]"
                />
                <span className="text-sm sm:text-lg xl:text-xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform">
                  ZANE<span className="text-secondary">X</span>
                </span>
              </a>

              <span className="hidden lg:block h-4 w-px bg-primary/20 shrink-0" />

              <nav
                aria-label="Primary Left Sectors"
                className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0"
              >
                {leftWingLinks.map((link, idx) => renderVisorSectorLink(link, idx + 1))}
              </nav>
            </div>

            {/* CENTER KEYSTONE: Fixed Cursor-Following & Click-Blinking ASCII Watching Eye Pod */}
            <div className="relative flex items-center justify-center gap-1 sm:gap-1.5 -my-1 translate-y-[2px] sm:translate-y-[4px] z-10">
              <span
                aria-hidden="true"
                className="hidden sm:inline text-[11px] font-bold text-primary/45 select-none"
              >
                ‹
              </span>
              <MatrixWatchingEye />
              <span
                aria-hidden="true"
                className="hidden sm:inline text-[11px] font-bold text-primary/45 select-none"
              >
                ›
              </span>
            </div>

            {/* RIGHT WING: Right Sector Nodes + Unified Tactical Instrument Dock + Existence Shift */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-0">
              <nav
                aria-label="Primary Right Sectors"
                className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0"
              >
                {rightWingLinks.map((link, idx) =>
                  renderVisorSectorLink(link, leftWingLinks.length + idx + 1)
                )}
              </nav>

              <span className="hidden lg:block h-4 w-px bg-primary/20 shrink-0" />

              {/* Unified Tactical Command Capsule (Tablet & Desktop) */}
              <div className="hidden sm:inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-black/65 border border-white/12 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBoot();
                    onOpenTerminal();
                  }}
                  className="px-2 py-1 rounded-lg text-primary hover:bg-primary/15 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer active:scale-95"
                  title="Launch ZaneOS Shell (`)"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">CLI</span>
                </button>

                {onOpenCtf && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBoot();
                      onOpenCtf();
                    }}
                    className="hidden xl:flex px-2 py-1 rounded-lg text-amber-300 hover:bg-amber-500/15 transition-colors items-center gap-1 text-[11px] font-bold cursor-pointer active:scale-95"
                    title="Open Security CTF Board"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{clearanceLevel}/3</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 ${
                    isMuted
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-primary bg-primary/10"
                  }`}
                  title={isMuted ? "Enable Sound FX" : "Mute Sound FX"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {onReplayIntro && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBoot();
                      onReplayIntro();
                    }}
                    className="hidden xl:flex p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer active:scale-95"
                    title="Replay Procedural RGB ASCII Art Intro"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Total-Conversion Universe Theme Button (Triggers Fullscreen ASCII ONLY when entering EXISTENCE) */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  triggerLogoThemeShift("existence");
                }}
                className="px-2 sm:px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/40 text-white rounded-lg font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0"
                title="Transform Entire Site into EXISTENCE Monochrome ASCII Universe"
                aria-label="Toggle Total-Conversion Universe Theme"
              >
                <Code2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="sm:hidden">ASCII</span>
                <span className="hidden sm:inline">EXISTENCE</span>
              </button>

              {/* Mobile / Tablet Visor Drawer Trigger */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsMenuOpen(prev => !prev);
                }}
                className="lg:hidden p-1.5 text-foreground border border-primary/30 bg-primary/10 rounded-lg hover:bg-primary/20 active:scale-95 cursor-pointer shrink-0"
                title="Toggle Visor Command Matrix"
                aria-label="Toggle Visor Command Matrix"
              >
                {isMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4 text-primary" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Floating Tactical Visor Drawer (Mobile & Tablet < lg) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-2 sm:inset-x-4 top-[60px] sm:top-[68px] z-40 rounded-2xl border border-primary/35 bg-[#050914]/96 backdrop-blur-2xl p-4 lg:hidden font-mono shadow-[0_24px_60px_rgba(0,0,0,0.9)] max-h-[calc(100vh-76px)] overflow-y-auto"
          >
            <div className="flex flex-col gap-3">
              {/* Top Quick Utility Strip (Persona + Audio + Replay Intro) */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-primary/15">
                <PersonaSwitcher variant="compact" />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1 cursor-pointer ${
                      isMuted
                        ? "border-white/15 text-muted-foreground"
                        : "border-primary/40 bg-primary/10 text-primary"
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  {onReplayIntro && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBoot();
                        setIsMenuOpen(false);
                        onReplayIntro();
                      }}
                      className="px-2.5 py-2 rounded-lg border border-rose-500/40 bg-rose-500/15 text-rose-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>INTRO</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2-Column Indexed Sector Matrix */}
              <div className="grid grid-cols-2 gap-1.5">
                {activeNavLinks.map((link, idx) => {
                  const isActive = activeHref === link.href;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => {
                        sound.playClick();
                        if (link.href === "#repositories") {
                          window.dispatchEvent(new CustomEvent("zanex:expand-repos"));
                        }
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                        isActive
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-white/10 bg-white/[0.03] text-foreground/90 hover:border-primary/35"
                      }`}
                    >
                      <span>
                        <span className="text-[10px] text-primary/60 mr-1">0{idx + 1}/</span>
                        {link.name}
                      </span>
                      <span className="text-primary/50 text-[10px]">→</span>
                    </a>
                  );
                })}
              </div>

              {/* Quick Construct Launchers */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBoot();
                    setIsMenuOpen(false);
                    onOpenTerminal();
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-primary/40 bg-primary/15 text-primary font-bold text-xs cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>ZANEOS SHELL</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playBoot();
                    setIsMenuOpen(false);
                    onOpenBreach();
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-secondary/40 bg-secondary/15 text-secondary font-bold text-xs cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>BREACH ICE</span>
                </button>

                {onOpenCelestial && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenCelestial();
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-blue-300/35 bg-blue-400/15 text-blue-100 font-bold text-xs cursor-pointer"
                  >
                    <CelestialZenLogo className="w-4 h-4 fill-white shrink-0" />
                    <span>CELESTIAL ZEN</span>
                  </button>
                )}

                {onOpenCtf && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBoot();
                      setIsMenuOpen(false);
                      onOpenCtf();
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300 font-bold text-xs cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>CTF ({clearanceLevel}/3)</span>
                  </button>
                )}
              </div>

              {/* Motion Sensors Trigger */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  window.dispatchEvent(new CustomEvent("zanex:request-motion-sensors"));
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-xl border border-primary/25 bg-primary/5 text-primary/90 font-bold text-[11px] cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                <span>ALLOW MOTION SENSORS</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
