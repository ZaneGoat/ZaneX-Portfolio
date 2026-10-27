import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Volume2, VolumeX, Zap, Menu, X, ShieldAlert, Eye, Smartphone, Code2 } from "lucide-react";
import { navLinks } from "@/data/portfolio";
import { sound, AUDIO_MUTE_EVENT } from "@/lib/sound";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/context/PersonaContext";
import { useUniverseTheme } from "@/context/ThemeContext";

interface NavigationProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenCtf?: () => void;
  onReplayIntro?: () => void;
}

export const Navigation = ({
  onOpenTerminal,
  onOpenBreach,
  onOpenCtf,
  onReplayIntro
}: NavigationProps) => {
  const { persona } = usePersona();
  const { isExistence, setTheme, toggleTheme } = useUniverseTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  useEffect(() => {
    const syncMute = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setIsMuted(typeof custom.detail === "boolean" ? custom.detail : sound.isMuted());
    };
    window.addEventListener(AUDIO_MUTE_EVENT, syncMute);
    return () => window.removeEventListener(AUDIO_MUTE_EVENT, syncMute);
  }, []);

  const activeNavLinks = persona === "friend"
    ? [
        { name: "Overview", href: "#overview" },
        { name: "Lounge", href: "#friend-lounge" },
        { name: "Pricing", href: "#pricing" },
        { name: "Arena", href: "#games" },
        { name: "Notes", href: "#philosophy" },
        { name: "Contact", href: "#contact" }
      ]
    : navLinks;

  const handleToggleSound = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={
          isExistence
            ? "fixed top-0 w-full z-50 bg-black/95 border-b border-white/35 font-mono"
            : "fixed top-0 w-full z-50 backdrop-blur-xl bg-background/85 border-b border-primary/20"
        }
      >
        {/* Top micro-telemetry hairline in EXISTENCE universe */}
        {isExistence && (
          <div className="hidden sm:flex items-center justify-between px-6 py-0.5 border-b border-white/15 bg-white/[0.03] text-[9px] tracking-[0.22em] text-white/55 uppercase select-none">
            <span>SYS // OBSERVATORY_TUI :: BRAILLE_SUBPIXEL_8X</span>
            <span>Ψ(r,θ,t) · SINGULARITY FIELD ACTIVE · Ω</span>
          </div>
        )}

        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex justify-between items-center">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#overview"
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 sm:gap-2 group font-mono shrink-0"
            >
              {isExistence ? (
                <span className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight border border-white/50 px-2 py-0.5 bg-black group-hover:bg-white group-hover:text-black transition-colors">
                  [ZANEX<span className="hidden sm:inline">::Ω-EXISTENCE</span><span className="sm:hidden">::Ω</span>]
                </span>
              ) : (
                <>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform">
                    ZANE<span className="text-secondary">X</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-primary/10 text-primary border border-primary/30 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                    v6.0
                  </span>
                </>
              )}
            </a>

            {/* Desktop Compact Persona Switcher */}
            <PersonaSwitcher variant="compact" className="hidden xl:inline-flex" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5 font-mono text-sm">
            {activeNavLinks.map((link, idx) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => {
                  sound.playClick();
                  if (link.href === "#repositories") {
                    window.dispatchEvent(new CustomEvent("zanex:expand-repos"));
                  }
                }}
                className={
                  isExistence
                    ? "text-white/75 hover:text-black hover:bg-white px-2 py-0.5 transition-colors text-[11px] lg:text-xs uppercase tracking-wider border border-transparent hover:border-white"
                    : "text-foreground/80 hover:text-primary transition-colors relative py-1 text-xs lg:text-sm"
                }
              >
                {isExistence ? `0${idx + 1}/${link.name}` : link.name}
              </a>
            ))}
          </div>

          {/* Header Controls: Clean & uncluttered on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Total-Conversion Universe Theme Button (Phone & Desktop Top Bar) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={
                isExistence
                  ? "px-2 sm:px-2.5 py-1.5 bg-white text-black hover:bg-white/85 border border-white font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                  : "px-2 sm:px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/40 text-white rounded-lg font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              }
              title={
                isExistence
                  ? "Return to Matrix Emerald Cyber-HUD"
                  : "Transform Entire Site into EXISTENCE Monochrome ASCII Universe"
              }
              aria-label="Toggle Total-Conversion Universe Theme"
            >
              {isExistence ? (
                <>
                  <span>◈</span>
                  <span className="sm:hidden">GREEN</span>
                  <span className="hidden sm:inline">MATRIX HUD</span>
                </>
              ) : (
                <>
                  <Code2 className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="sm:hidden">ASCII</span>
                  <span className="hidden sm:inline">EXISTENCE</span>
                </>
              )}
            </button>

            {/* Replay Procedural ASCII Intro Button */}
            {onReplayIntro && (
              <button
                onClick={() => {
                  sound.playBoot();
                  onReplayIntro();
                }}
                className={
                  isExistence
                    ? "p-1.5 sm:p-2 bg-black border border-white/35 text-white hover:bg-white hover:text-black transition-all flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer active:scale-95"
                    : "p-1.5 sm:p-2 bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 rounded-lg transition-all flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer active:scale-95"
                }
                title="Replay Procedural RGB ASCII Art Intro"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden xl:inline">INTRO</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-1.5 sm:p-2 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                isMuted
                  ? "border-white/15 text-muted-foreground hover:text-foreground"
                  : "border-primary/40 bg-primary/10 text-primary"
              }`}
              title={isMuted ? "Enable Sound FX" : "Mute Sound FX"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary" />}
              <span className="hidden xl:inline text-[11px] font-bold">{isMuted ? "MUTED" : "AUDIO"}</span>
            </button>

            {/* Quick Terminal Trigger */}
            <button
              onClick={() => {
                sound.playBoot();
                onOpenTerminal();
              }}
              className="p-1.5 sm:p-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-lg transition-all active:scale-95"
              title="Launch ZaneOS Shell"
            >
              <Terminal className="w-4 h-4" />
            </button>

            {/* Quick Breach Trigger (Hidden on small mobile to avoid cramped navbar wrap) */}
            <button
              onClick={() => {
                sound.playBoot();
                onOpenBreach();
              }}
              className="hidden sm:flex p-2 bg-secondary/10 border border-secondary/25 text-secondary hover:bg-secondary/20 rounded-lg transition-all"
              title="Launch Breach Protocol Minigame"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Quick CTF Bounty Trigger (Hidden on small mobile to avoid cramped navbar wrap) */}
            {onOpenCtf && (
              <button
                onClick={() => {
                  sound.playBoot();
                  onOpenCtf();
                }}
                className="hidden sm:flex px-2.5 py-1.5 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-lg transition-all font-mono text-xs font-bold items-center gap-1.5"
                title="Open Security CTF Board"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                <span>CTF</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-foreground border border-white/20 rounded-lg hover:bg-white/5 active:scale-95"
              title="Toggle Mobile Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-x-0 top-[52px] sm:top-16 z-40 border-b backdrop-blur-2xl p-5 md:hidden font-mono shadow-2xl max-h-[calc(100vh-55px)] overflow-y-auto ${
              isExistence
                ? "bg-black/98 border-white/35"
                : "bg-[#050816]/98 border-primary/25"
            }`}
          >
            <div className="flex flex-col gap-3">
              {/* Total-Conversion Universe Switcher in Mobile Drawer */}
              <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/25 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-primary/80 font-bold tracking-wider px-0.5">
                  <span>UNIVERSE ARCHITECTURE</span>
                  <span>{isExistence ? "Ω-EXISTENCE" : "MATRIX GREEN"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("matrix")}
                    className={`py-2 px-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      !isExistence
                        ? "border-[#00ff9e] bg-[#00ff9e]/20 text-[#00ff9e]"
                        : "border-white/20 bg-black text-white/60 hover:text-white"
                    }`}
                  >
                    <span>◈</span>
                    <span>MATRIX GREEN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("existence")}
                    className={`py-2 px-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isExistence
                        ? "border-white bg-white text-black"
                        : "border-white/30 bg-white/5 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    <span>Ω</span>
                    <span>EXISTENCE ASCII</span>
                  </button>
                </div>
              </div>

              {/* Persona Switcher in Mobile Drawer */}
              <div className="py-2 border-y border-primary/15 flex justify-center">
                <PersonaSwitcher variant="compact" />
              </div>

              {/* Page Links */}
              <div className="flex flex-col">
                {activeNavLinks.map((link, idx) => (
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
                    className="text-foreground/90 hover:text-primary text-base font-bold py-2.5 border-b border-primary/10 flex items-center justify-between"
                  >
                    <span>{isExistence ? `[0${idx + 1}] ${link.name.toUpperCase()}` : link.name}</span>
                    <span className="text-primary/40 text-xs">→</span>
                  </a>
                ))}
              </div>

              {/* Quick Minigame & CTF Triggers in Mobile Drawer */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    sound.playBoot();
                    setIsMenuOpen(false);
                    onOpenBreach();
                  }}
                  className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-secondary/40 bg-secondary/15 text-secondary font-bold text-xs"
                >
                  <Zap className="w-4 h-4" />
                  <span>BREACH ICE</span>
                </button>

                {onOpenCtf && (
                  <button
                    onClick={() => {
                      sound.playBoot();
                      setIsMenuOpen(false);
                      onOpenCtf();
                    }}
                    className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border font-bold text-xs ${
                      isExistence
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-yellow-500/40 bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>CTF QUEST</span>
                  </button>
                )}
              </div>

              {/* Allow Motion Sensors inside Mobile Menu Drawer */}
              <button
                onClick={() => {
                  sound.playClick();
                  window.dispatchEvent(new CustomEvent("zanex:request-motion-sensors"));
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold text-xs"
              >
                <Smartphone className="w-4 h-4 text-primary" />
                <span>ALLOW MOTION SENSORS</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
