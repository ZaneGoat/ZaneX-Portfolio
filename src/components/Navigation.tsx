import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Volume2, VolumeX, Zap, Menu, X, ShieldAlert, Eye, Smartphone, Palette } from "lucide-react";
import { navLinks } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/context/PersonaContext";

type CyberTheme = "emerald" | "amber" | "cyan";

const THEME_OPTIONS: { id: CyberTheme; label: string; dotClass: string }[] = [
  { id: "emerald", label: "EMERALD", dotClass: "bg-[#00ff9e] shadow-[0_0_8px_#00ff9e]" },
  { id: "amber", label: "AMBER", dotClass: "bg-[#ffb703] shadow-[0_0_8px_#ffb703]" },
  { id: "cyan", label: "CYAN", dotClass: "bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" }
];

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [activeTheme, setActiveTheme] = useState<CyberTheme>(() => {
    if (typeof window === "undefined") return "emerald";
    const saved = localStorage.getItem("zanex_theme");
    return saved === "amber" || saved === "cyan" ? saved : "emerald";
  });

  useEffect(() => {
    const syncFromDom = () => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "amber" || attr === "cyan") {
        setActiveTheme(attr);
      } else {
        setActiveTheme("emerald");
      }
    };
    syncFromDom();

    const observer = new MutationObserver(syncFromDom);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const applyTheme = (nextTheme: CyberTheme) => {
    setActiveTheme(nextTheme);
    localStorage.setItem("zanex_theme", nextTheme);
    if (nextTheme === "emerald") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", nextTheme);
    }
    sound.playClick();
    sound.haptic([20, 30]);
  };

  const cycleTheme = () => {
    const order: CyberTheme[] = ["emerald", "amber", "cyan"];
    const nextTheme = order[(order.indexOf(activeTheme) + 1) % order.length];
    applyTheme(nextTheme);
  };

  const activeNavLinks = persona === "friend"
    ? [
        { name: "Overview", href: "#overview" },
        { name: "Homie Lounge", href: "#friend-lounge" },
        { name: "Breach Protocol", href: "#games" },
        { name: "Philosophy", href: "#philosophy" },
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
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/85 border-b border-primary/20"
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex justify-between items-center">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#overview"
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 sm:gap-2 group font-mono shrink-0"
            >
              <span className="text-lg sm:text-xl md:text-2xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform">
                ZANE<span className="text-secondary">X</span>
              </span>
              <span className="text-[9px] sm:text-[10px] bg-primary/10 text-primary border border-primary/30 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                v4.2
              </span>
            </a>

            {/* Desktop Compact Persona Switcher */}
            <PersonaSwitcher variant="compact" className="hidden xl:inline-flex" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6 font-mono text-sm">
            {activeNavLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => sound.playClick()}
                className="text-foreground/80 hover:text-primary transition-colors relative py-1 text-xs lg:text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Header Controls: Clean & uncluttered on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
            {/* Replay Procedural ASCII Intro Button */}
            {onReplayIntro && (
              <button
                onClick={() => {
                  sound.playBoot();
                  onReplayIntro();
                }}
                className="p-1.5 sm:p-2 bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 rounded-lg transition-all flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer active:scale-95"
                title="Replay Procedural RGB ASCII Art Intro"
              >
                <Eye className="w-4 h-4 text-rose-400" />
                <span className="hidden xl:inline">ASCII INTRO</span>
              </button>
            )}

            {/* Theme Changer Button in Top Bar */}
            <button
              type="button"
              onClick={cycleTheme}
              className="relative p-1.5 sm:p-2 bg-primary/10 border border-primary/35 text-primary hover:bg-primary/20 rounded-lg transition-all flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer active:scale-90"
              title={`Switch Theme (Current: ${activeTheme.toUpperCase()})`}
              aria-label={`Switch Theme (Current: ${activeTheme})`}
            >
              <Palette className="w-4 h-4 text-primary" />
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  THEME_OPTIONS.find(t => t.id === activeTheme)?.dotClass || "bg-[#00ff9e]"
                }`}
              />
              <span className="hidden xl:inline uppercase text-[11px]">{activeTheme}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-1.5 sm:p-2 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                isMuted
                  ? "border-primary/20 text-primary/40 hover:text-primary"
                  : "border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              }`}
              title={isMuted ? "Enable Cyber Sound FX" : "Mute Sound FX"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
              <span className="hidden lg:inline text-[11px] font-bold">{isMuted ? "MUTED" : "AUDIO ON"}</span>
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
              className="hidden sm:flex p-2 bg-secondary/10 border border-secondary/30 text-secondary hover:bg-secondary/20 rounded-lg transition-all"
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
                className="hidden sm:flex px-2.5 py-1.5 bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 rounded-lg transition-all font-mono text-xs font-bold items-center gap-1.5"
                title="Open Hack My Portfolio CTF Bounty Board"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>CTF</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/10 active:scale-95"
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
            className="fixed inset-x-0 top-[52px] sm:top-14 z-40 bg-[#050816]/98 border-b border-primary/25 backdrop-blur-2xl p-5 md:hidden font-mono shadow-2xl max-h-[calc(100vh-55px)] overflow-y-auto"
          >
            <div className="flex flex-col gap-3">
              {/* Persona Switcher in Mobile Drawer */}
              <div className="py-2 border-y border-primary/15 flex justify-center">
                <PersonaSwitcher variant="compact" />
              </div>

              {/* Cyber Theme Picker in Mobile Drawer */}
              <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-primary/80 font-bold tracking-wider px-0.5">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    CYBER THEME
                  </span>
                  <span className="uppercase text-primary">{activeTheme}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {THEME_OPTIONS.map(opt => {
                    const isSelected = activeTheme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => applyTheme(opt.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.35)]"
                            : "border-primary/20 bg-black/50 text-foreground/60 hover:text-foreground"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Page Links */}
              <div className="flex flex-col">
                {activeNavLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => {
                      sound.playClick();
                      setIsMenuOpen(false);
                    }}
                    className="text-foreground/90 hover:text-primary text-base font-bold py-2.5 border-b border-primary/10 flex items-center justify-between"
                  >
                    <span>{link.name}</span>
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
                    className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-yellow-500/40 bg-yellow-500/15 text-yellow-400 font-bold text-xs"
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
