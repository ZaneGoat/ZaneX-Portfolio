import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Volume2, VolumeX, Zap, Menu, X, ShieldAlert } from "lucide-react";
import { navLinks } from "@/data/portfolio";
import { sound } from "@/lib/sound";

interface NavigationProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenCtf?: () => void;
}

export const Navigation = ({ onOpenTerminal, onOpenBreach, onOpenCtf }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-primary/20"
      >
        <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          {/* Logo / Brand */}
          <a
            href="#overview"
            onClick={() => sound.playClick()}
            className="flex items-center gap-2 group font-mono"
          >
            <span className="text-xl md:text-2xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform">
              ZANE<span className="text-secondary">X</span>
            </span>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">
              v4.2
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 font-mono text-sm">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => sound.playClick()}
                className="text-foreground/80 hover:text-primary transition-colors relative py-1"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Controls: Audio Toggle, Terminal Trigger, Minigame Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
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

            {/* Quick Breach Trigger */}
            <button
              onClick={() => {
                sound.playBoot();
                onOpenBreach();
              }}
              className="p-2 bg-secondary/10 border border-secondary/30 text-secondary hover:bg-secondary/20 rounded-lg transition-all"
              title="Launch Breach Protocol Minigame"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Quick CTF Bounty Trigger */}
            {onOpenCtf && (
              <button
                onClick={() => {
                  sound.playBoot();
                  onOpenCtf();
                }}
                className="px-2.5 py-1.5 bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 rounded-lg transition-all font-mono text-xs font-bold flex items-center gap-1.5"
                title="Open Hack My Portfolio CTF Bounty Board"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="hidden sm:inline">CTF</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-primary border border-primary/30 rounded-lg"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-14 z-40 bg-[#050816]/95 border-b border-primary/20 backdrop-blur-2xl p-6 md:hidden font-mono"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    sound.playClick();
                    setIsMenuOpen(false);
                  }}
                  className="text-primary text-base font-bold py-2 border-b border-primary/10"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
