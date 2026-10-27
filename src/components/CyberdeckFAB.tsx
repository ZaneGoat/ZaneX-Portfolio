import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Radio, Volume2, VolumeX, X, Cpu, ShieldAlert, Wind, UserCheck, Smartphone, Eye, Code2 } from "lucide-react";
import { CelestialZenLogo } from "@/components/CelestialZenLogo";
import { sound, AUDIO_MUTE_EVENT } from "@/lib/sound";
import { usePersona } from "@/context/PersonaContext";
import { useUniverseTheme } from "@/context/ThemeContext";

interface CyberdeckFABProps {
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenCelestial?: () => void;
  onOpenMatrixTakeover: () => void;
  onOpenCsi?: () => void;
  onOpenCtf?: () => void;
  onOpenMegaCenter?: () => void;
}

export const CyberdeckFAB = ({
  onOpenTerminal,
  onOpenBreach,
  onOpenCelestial,
  onOpenMatrixTakeover,
  onOpenCsi,
  onOpenCtf,
  onOpenMegaCenter
}: CyberdeckFABProps) => {
  const { persona, cyclePersona } = usePersona();
  const { isExistence, toggleTheme } = useUniverseTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [sensorsEnabled, setSensorsEnabled] = useState(false);

  useEffect(() => {
    const syncMute = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setIsMuted(typeof custom.detail === "boolean" ? custom.detail : sound.isMuted());
    };
    window.addEventListener(AUDIO_MUTE_EVENT, syncMute);
    return () => window.removeEventListener(AUDIO_MUTE_EVENT, syncMute);
  }, []);

  const handleEnableMotionSensors = () => {
    sound.playClick();
    sound.haptic(35);
    window.dispatchEvent(new CustomEvent("zanex:request-motion-sensors"));
    setSensorsEnabled(true);
  };

  const toggleOpen = () => {
    sound.playClick();
    sound.haptic(35);
    setIsOpen(prev => !prev);
  };

  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    sound.haptic(30);
  };

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 font-mono select-none"
    >
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
                <span>CYBERDECK // V6.0</span>
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

              {/* Celestial Zen Night Arcade */}
              {onOpenCelestial && (
                <button
                  onClick={() => {
                    sound.haptic(30);
                    setIsOpen(false);
                    onOpenCelestial();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-blue-400/10 border border-blue-300/30 hover:bg-blue-400/20 text-blue-100 active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <CelestialZenLogo className="w-4 h-4 fill-white shrink-0" />
                    <span className="font-bold">Celestial Zen</span>
                  </div>
                  <span className="text-[10px] text-blue-200/70 font-mono">ARCADE</span>
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

              {/* Crimson ASCII FX */}
              <button
                onClick={() => {
                  sound.playBoot();
                  sound.haptic([60, 40, 80]);
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent("zanex:open-ryuk-deal"));
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#ff112b]/15 border border-[#ff112b]/50 hover:bg-[#ff112b]/25 text-[#ff4d6d] active:scale-95 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#ff112b]" />
                  <span className="font-bold">Crimson ASCII</span>
                </div>
                <span className="text-[10px] text-[#ff112b] font-mono">FX</span>
              </button>
            </div>

            {/* Quick Controls: Universe Theme & Audio */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10">
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[10px] font-bold active:scale-95 transition-transform cursor-pointer ${
                  isExistence
                    ? "border-white bg-white text-black"
                    : "border-primary/40 bg-primary/10 text-primary"
                }`}
                title="Toggle Interface Mode (Standard / ASCII Map)"
              >
                <Code2 className="w-3 h-3" />
                <span>{isExistence ? "STANDARD" : "ASCII MAP"}</span>
              </button>

              <button
                onClick={toggleAudio}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[10px] font-bold active:scale-95 transition-transform cursor-pointer ${
                  isMuted
                    ? "border-white/15 text-muted-foreground bg-transparent"
                    : "border-primary/50 text-primary bg-primary/10"
                }`}
                title="Toggle Audio & Haptics"
              >
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isMuted ? "MUTED" : "SOUND ON"}</span>
              </button>
            </div>

            {/* Persona Switcher & Motion Sensors inside FAB */}
            <div className="pt-1 space-y-1.5">
              <button
                onClick={cyclePersona}
                className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold active:scale-95 transition-transform"
                title="Toggle Visitor Persona (Operator / Friend)"
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>VISITOR PROFILE:</span>
                </div>
                <span className="uppercase text-[9px] text-background bg-primary px-1.5 py-0.5 rounded font-black">
                  {persona}
                </span>
              </button>

              <button
                onClick={handleEnableMotionSensors}
                className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg border text-[10px] font-bold active:scale-95 transition-transform ${
                  sensorsEnabled
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    : "border-primary/30 bg-primary/5 text-primary/80 hover:text-primary"
                }`}
                title="Allow Device Motion Sensors (Shake Gesture)"
              >
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>MOTION SENSORS:</span>
                </div>
                <span className="uppercase text-[9px] px-1.5 py-0.5 rounded font-black border border-current/30">
                  {sensorsEnabled ? "ACTIVE" : "ALLOW"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cyberdeck Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleOpen}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#070b14]/95 border border-primary/50 hover:border-primary text-primary flex items-center justify-center shadow-xl cursor-pointer relative group overflow-hidden"
        title="Open Quick Tools"
        aria-label="Open Quick Tools"
      >
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/15 transition-colors" />

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
