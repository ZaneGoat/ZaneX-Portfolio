import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Volume2, VolumeX, Zap, Menu, X, ShieldAlert, Eye, Smartphone } from "lucide-react";
import { navLinks } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/context/PersonaContext";

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
        <div className="container mx-auto px-4 md:px-6 py-2.5 sm:py-3 flex justify-between items-center">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#overview"
              onClick={() => sound.playClick()}
              className="flex items-center gap-2 group font-mono shrink-0"
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
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Replay Procedural ASCII Intro Button */}
            {onReplayIntro && (
              <button
                onClick={() => {
                  sound.playBoot();
                  onReplayIntro();
                }}
                className="p-2 bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 rounded-lg transition-all flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer"
                title="Replay Procedural RGB ASCII Art Intro"
              >
                <Eye className="w-4 h-4 text-rose-400" />
                <span className="hidden xl:inline">ASCII INTRO</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${
                isMuted
                  ? "border-primary/20 text-primary/40 hover:text-primary"
                  : "border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              }`}
              title={isMuted ? "Enable Cyber Sound FX" : "Mute Sound FX"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
              <span className="hidden sm:inline text-[11px] font-bold">{isMuted ? "MUTED" : "AUDIO ON"}</span>
            </button>

            {/* Quick Terminal Trigger */}
            <button
              onClick={() => {
                sound.playBoot();
                onOpenTerminal();
              }}
              className="p-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-lg transition-all"
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
              className="md:hidden p-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/10"
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
