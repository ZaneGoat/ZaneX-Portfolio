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
  Overview: "Overview",
  Repositories: "Repos",
  Principles: "Principles",
  Lounge: "Lounge",
  Notes: "Notes",
  Pricing: "Plans",
  Arena: "Arena",
  Contact: "Contact",
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
  const { isExistence, setTheme } = useUniverseTheme();
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

  // Strict physical top-to-bottom DOM section order matching Index.tsx
  const activeNavLinks =
    persona === "friend"
      ? [
          { name: "Overview", href: "#overview" },
          { name: "Lounge", href: "#friend-lounge" },
          { name: "Notes", href: "#philosophy" },
          { name: "Pricing", href: "#pricing" },
          { name: "Arena", href: "#games" },
          { name: "Contact", href: "#contact" },
        ]
      : [
          { name: "Overview", href: "#overview" },
          { name: "Repositories", href: "#repositories" },
          { name: "Principles", href: "#philosophy" },
          { name: "Pricing", href: "#pricing" },
          { name: "Arena", href: "#games" },
          { name: "Contact", href: "#contact" },
        ];

  // Robust scroll spy: selects section closest to probe line, never falsely overridden
  useEffect(() => {
    const updateScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      const pct = docH > 10 ? Math.min(1, Math.max(0, scrollY / docH)) : 0;
      setScrollProgress(pct);

      // Bottom-of-page snap for Contact
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 70) {
        setActiveHref(activeNavLinks[activeNavLinks.length - 1].href);
        return;
      }

      // Probe Y line positioned around 30% of viewport (capped for large monitors)
      const probeY = scrollY + Math.min(window.innerHeight * 0.3, 260);
      let bestLink = activeNavLinks[0]?.href || "#overview";
      let bestOffset = -Infinity;

      for (const link of activeNavLinks) {
        const id = link.href.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (top <= probeY && top > bestOffset) {
            bestOffset = top;
            bestLink = link.href;
          }
        }
      }

      setActiveHref(bestLink);
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

  const handleToggleUniverse = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setTheme(isExistence ? "matrix" : "existence");
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
        className={`relative px-2 xl:px-2.5 py-1 rounded-md font-mono text-[11px] xl:text-xs font-bold tracking-tight transition-all whitespace-nowrap shrink-0 group ${
          isActive
            ? "text-primary drop-shadow-[0_0_8px_rgba(0,255,158,0.45)]"
            : "text-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="visorActiveSector"
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="absolute inset-0 rounded-md bg-primary/12 border border-primary/45 -z-10 shadow-[inset_0_0_10px_rgba(0,255,158,0.15)]"
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
        className="fixed top-1 sm:top-2.5 inset-x-2 sm:inset-x-4 lg:inset-x-6 z-50 max-w-[1520px] 2xl:max-w-[1680px] mx-auto pointer-events-none font-mono"
      >
        <div className="pointer-events-auto relative visor-chamfer visor-hull-border shadow-[0_16px_45px_rgba(0,0,0,0.88),0_0_24px_rgba(0,255,158,0.08)]">
          <div className="relative visor-chamfer visor-hull backdrop-blur-xl px-3 sm:px-6 xl:px-8 py-2 sm:py-2.5">
            {/* Top Scanning Visor Laser Beam */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 inset-x-8 h-[1.5px] overflow-hidden opacity-75"
            >
              <div className="w-56 h-full visor-sweep" />
            </div>

            {/* Chamfer Corner Tech Accents */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 left-2.5 w-2 h-2 border-t border-l border-primary/70"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 right-2.5 w-2 h-2 border-t border-r border-primary/70"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 left-2.5 w-2 h-2 border-b border-l border-primary/50"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 right-2.5 w-2 h-2 border-b border-r border-primary/50"
            />

            {/* Bidirectional Scroll-Progress Laser Filaments Radiating Outward from Center Eye */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-3 right-1/2 mr-14 sm:mr-18 xl:mr-22 h-[1.5px] overflow-hidden"
            >
              <div
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                className="ml-auto h-full bg-gradient-to-l from-primary via-primary/80 to-secondary shadow-[0_0_8px_#00ff9e] transition-[width] duration-150"
              />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/2 right-3 ml-14 sm:mr-18 xl:mr-22 h-[1.5px] overflow-hidden"
            >
              <div
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                className="mr-auto h-full bg-gradient-to-r from-primary via-primary/80 to-secondary shadow-[0_0_8px_#00ff9e] transition-[width] duration-150"
              />
            </div>

            {/* Split-Wing Cyber-Visor: Equal-Width 3-Bay Enforced Architecture */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 w-full">
              {/* LEFT WING: Clean Picture Logo + Left Sector Nodes (01, 02, 03) */}
              <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 min-w-0">
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
                  <span className="text-sm sm:text-base xl:text-lg font-black text-primary tracking-tighter group-hover:scale-105 transition-transform">
                    ZANE<span className="text-secondary">X</span>
                  </span>
                </a>

                <span className="hidden lg:block h-3.5 w-px bg-primary/25 shrink-0 mx-0.5" />

                <nav
                  aria-label="Primary Left Sectors"
                  className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0"
                >
                  {leftWingLinks.map((link, idx) => renderVisorSectorLink(link, idx + 1))}
                </nav>
              </div>

              {/* CENTER KEYSTONE: Cybernetic Overwatch Oculus Pod (In-flow auto bay, physically separates wings) */}
              <div className="flex items-center justify-center shrink-0 px-2 sm:px-4 xl:px-6 select-none z-10">
                <div className="relative p-0.5 rounded-xl visor-cradle">
                  <MatrixWatchingEye />
                </div>
              </div>

              {/* RIGHT WING: Right Sector Nodes (04, 05, 06) + Tactical Instruments + Existence Switch */}
              <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-0">
                <nav
                  aria-label="Primary Right Sectors"
                  className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0"
                >
                  {rightWingLinks.map((link, idx) =>
                    renderVisorSectorLink(link, leftWingLinks.length + idx + 1)
                  )}
                </nav>

                <span className="hidden lg:block h-3.5 w-px bg-primary/25 shrink-0 mx-0.5" />

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
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden 2xl:inline">CLI</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 shrink-0 ${
                      isMuted
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-primary bg-primary/10"
                    }`}
                    title={isMuted ? "Enable Sound FX" : "Mute Sound FX"}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  {onOpenCtf && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBoot();
                        onOpenCtf();
                      }}
                      className="hidden 2xl:flex px-2 py-1 rounded-lg text-amber-300 hover:bg-amber-500/15 transition-colors items-center gap-1 text-[11px] font-bold cursor-pointer active:scale-95 shrink-0"
                      title="Open Security CTF Board"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{clearanceLevel}/3</span>
                    </button>
                  )}

                  {onReplayIntro && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBoot();
                        onReplayIntro();
                      }}
                      className="hidden 2xl:flex p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer active:scale-95 shrink-0"
                      title="Replay Procedural RGB ASCII Art Intro"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Total-Conversion Universe Theme Button (Instant & 100% Functional) */}
                <button
                  type="button"
                  onClick={handleToggleUniverse}
                  className="px-2 sm:px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/40 text-white rounded-lg font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0 ml-0.5"
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
                  className="lg:hidden p-1.5 text-foreground border border-primary/30 bg-primary/10 rounded-lg hover:bg-primary/20 active:scale-95 cursor-pointer shrink-0 ml-0.5"
                  title="Toggle Visor Command Matrix"
                  aria-label="Toggle Visor Command Matrix"
                >
                  {isMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4 text-primary" />}
                </button>
              </div>
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
              {/* Top Quick Utility Strip (Persona + Audio + Theme + Replay Intro) */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-primary/15">
                <PersonaSwitcher variant="compact" />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleUniverse}
                    className="px-2.5 py-1.5 rounded-lg border border-white/30 bg-white/10 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Toggle Interface Mode"
                  >
                    <Code2 className="w-3.5 h-3.5 text-white" />
                    <span>{isExistence ? "MATRIX" : "EXISTENCE"}</span>
                  </button>
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
