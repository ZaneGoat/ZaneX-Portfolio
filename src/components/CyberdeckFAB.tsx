import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Radio, Palette, Volume2, VolumeX, X, Cpu, Globe, ShieldAlert, Wind, UserCheck, Sparkles } from "lucide-react";
import { sound } from "@/lib/sound";
import { usePersona } from "@/context/PersonaContext";

interface CyberdeckFABProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenMatrixTakeover: () => void;
  onOpenCsi?: () => void;
  onOpenCtf?: () => void;
  onOpenThreatMap?: () => void;
  onOpenMegaCenter?: () => void;
  onOpenMaze?: () => void;
}

export const CyberdeckFAB = ({
  onOpenTerminal,
  onOpenBreach,
  onOpenMatrixTakeover,
  onOpenCsi,
  onOpenCtf,
  onOpenThreatMap,
  onOpenMegaCenter,
  onOpenMaze
}: CyberdeckFABProps) => {
  const { persona, cyclePersona, deviceChoice, spoofActive } = usePersona();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [activeTheme, setActiveTheme] = useState<string>("emerald");

  const forceShowOnDesktop = deviceChoice === "phone" && spoofActive;

  useEffect(() => {
    const saved = localStorage.getItem("zanex_theme") || "emerald";
    setActiveTheme(saved);
  }, []);

  const toggleOpen = () => {
    sound.playClick();
    sound.haptic(35);
    setIsOpen(prev => !prev);
  };

  const cycleTheme = () => {
    const themes = ["emerald", "amber", "cyan"];
    const nextIdx = (themes.indexOf(activeTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    setActiveTheme(nextTheme);
    localStorage.setItem("zanex_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    sound.playClick();
    sound.haptic([20, 30]);
  };

  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    sound.haptic(30);
  };

  return (
    <div className={`fixed bottom-5 right-5 z-40 font-mono select-none ${forceShowOnDesktop ? "" : "md:hidden"}`}>
      {/* Backdrop for easy dismiss */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm -z-10"
          />
        )}
      </AnimatePresence>

      {/* Expanded Cyberdeck Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-3 bg-black/95 border-2 border-primary/80 rounded-2xl p-3.5 shadow-[0_0_35px_hsl(var(--primary)/0.5)] backdrop-blur-xl w-60 space-y-2 relative"
          >
            <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>CYBERDECK // V4.2</span>
              </div>
              <span className="text-[9px] text-primary/60 border border-primary/30 px-1 rounded">HUD</span>
            </div>

            {/* Quick-Launch Nodes */}
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {/* ZaneOS Terminal */}
              <button
                onClick={() => {
                  sound.playBoot();
                  sound.haptic(40);
                  setIsOpen(false);
                  onOpenTerminal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary active:scale-95 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-bold">ZaneOS Shell</span>
                </div>
                <span className="text-[10px] text-primary/60 font-mono">CLI</span>
              </button>

              {/* Breach Protocol Minigame */}
              <button
                onClick={() => {
                  sound.playBoot();
                  sound.haptic(40);
                  setIsOpen(false);
                  onOpenBreach();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 text-secondary active:scale-95 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span className="font-bold">Breach ICE</span>
                </div>
                <span className="text-[10px] text-secondary/60 font-mono">GAME</span>
              </button>

              {/* 3D Arcane Maze Explorer */}
              {onOpenMaze && (
                <button
                  onClick={() => {
                    sound.playBoot();
                    sound.haptic(40);
                    setIsOpen(false);
                    onOpenMaze();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="font-bold">3D Arcane Realm</span>
                  </div>
                  <span className="text-[10px] text-amber-400/60 font-mono">3D RPG</span>
                </button>
              )}

              {/* CTF Bounty Board */}
              {onOpenCtf && (
                <button
                  onClick={() => {
                    sound.playBoot();
                    sound.haptic(40);
                    setIsOpen(false);
                    onOpenCtf();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400 active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold">CTF Bounty Board</span>
                  </div>
                  <span className="text-[10px] text-yellow-400/60 font-mono">QUEST</span>
                </button>
              )}

              {/* CSI Radar Doppler Sensor */}
              {onOpenCsi && (
                <button
                  onClick={() => {
                    sound.playBoot();
                    sound.haptic(40);
                    setIsOpen(false);
                    onOpenCsi();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold">CSI Wi-Fi Radar</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/60 font-mono">RADAR</span>
                </button>
              )}

              {/* Robin Threat Map */}
              {onOpenThreatMap && (
                <button
                  onClick={() => {
                    sound.playBoot();
                    sound.haptic(40);
                    setIsOpen(false);
                    onOpenThreatMap();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold">Robin Threat Map</span>
                  </div>
                  <span className="text-[10px] text-cyan-400/60 font-mono">OSINT</span>
                </button>
              )}

              {/* Zane Mega Center Live */}
              {onOpenMegaCenter && (
                <button
                  onClick={() => {
                    sound.playBoot();
                    sound.haptic(40);
                    setIsOpen(false);
                    onOpenMegaCenter();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-primary" />
                    <span className="font-bold">Mega Center Live</span>
                  </div>
                  <span className="text-[10px] text-primary/60 font-mono">EC</span>
                </button>
              )}

              {/* Matrix Construct Takeover */}
              <button
                onClick={() => {
                  sound.playMatrixDrop();
                  sound.haptic([80, 40, 100]);
                  setIsOpen(false);
                  onOpenMatrixTakeover();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary active:scale-95 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary" />
                  <span className="font-bold">Matrix Construct</span>
                </div>
                <span className="text-[10px] text-primary/60 font-mono">FX</span>
              </button>
            </div>

            {/* Quick Controls: Theme & Audio */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-primary/20">
              <button
                onClick={cycleTheme}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-[10px] font-bold active:scale-95 transition-transform"
                title="Cycle Cyber Theme"
              >
                <Palette className="w-3 h-3" />
                <span className="capitalize">{activeTheme}</span>
              </button>

              <button
                onClick={toggleAudio}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[10px] font-bold active:scale-95 transition-transform ${
                  isMuted
                    ? "border-primary/20 text-primary/40 bg-transparent"
                    : "border-primary text-primary bg-primary/10 shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                }`}
                title="Toggle Audio & Haptics"
              >
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isMuted ? "MUTED" : "SOUND ON"}</span>
              </button>
            </div>

            {/* Persona Switcher row */}
            <div className="pt-1">
              <button
                onClick={cyclePersona}
                className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold active:scale-95 transition-transform"
                title="Cycle Visitor Persona (Guest / Friend / Operator)"
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>VISITOR PROFILE:</span>
                </div>
                <span className="uppercase text-[9px] text-background bg-primary px-1.5 py-0.5 rounded font-black">
                  {persona}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cyberdeck Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleOpen}
        className="w-13 h-13 rounded-2xl bg-black/95 border-2 border-primary text-primary flex items-center justify-center shadow-[0_0_25px_hsl(var(--primary)/0.6)] cursor-pointer relative group overflow-hidden"
        title="Open Cyberdeck Mobile HUD"
        aria-label="Open Cyberdeck Mobile HUD"
      >
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
        <div className="absolute -inset-1 border border-primary/30 rounded-2xl animate-pulse pointer-events-none" />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-5 h-5 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="deck"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Cpu className="w-5 h-5 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
