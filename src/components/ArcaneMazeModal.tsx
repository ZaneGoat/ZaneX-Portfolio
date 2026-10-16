import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Gamepad2,
  ShieldAlert,
  Volume2,
  VolumeX,
  ExternalLink,
  Tv
} from "lucide-react";
import { sound } from "@/lib/sound";
import { toast } from "sonner";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";

interface ArcaneMazeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArcaneMazeModal: React.FC<ArcaneMazeModalProps> = ({ isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScanlines, setShowScanlines] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { unlockNode } = useOperatorClearance();

  // Listen for postMessage from Arcane Maze game
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || e.data.source !== "ZANEX_ARCANE_MAZE") return;

      const { action, code, chapter, kills, flag } = e.data;

      if (action === "CLEARANCE_UNLOCKED") {
        unlockNode("projectsUnlocked");
        // Also award CTF flag if not already saved
        try {
          const savedFlags = JSON.parse(localStorage.getItem("zanex_ctf_solved") || "[]");
          if (!savedFlags.includes("flag_maze_root")) {
            savedFlags.push("flag_maze_root");
            localStorage.setItem("zanex_ctf_solved", JSON.stringify(savedFlags));
          }
        } catch {}

        toast.success("⚡ BLACK-OPS ARCHIVES UNLOCKED!", {
          description: `Cipher accepted: [${code || "OPERATOR"}]. Secret Flag captured: ${flag || "ZANEX{ARCANE_MAZE_OPERATOR_ROOT_99}"}`
        });
      } else if (action === "CHAPTER_CLEAR") {
        sound.playSuccess();
        toast.success(`✨ SANCTUM REALM CLEARED! (Chapter ${chapter})`, {
          description: `Vanquished ${kills} guardians. Rift Archway stabilized!`
        });
      } else if (action === "ZANE_OVERDRIVE") {
        sound.playZane();
        toast("⚡ ZANE OVERDRIVE ENGAGED", {
          description: "Astral rainbow dimension active. Infinite mana & zero cooldowns!"
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [unlockNode]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Close on ESC when not in fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6"
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-full max-w-7xl max-h-[94vh] bg-[#050811] border-2 border-amber-500/50 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden font-mono"
        >
          {/* Top Bar HUD */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border-b border-amber-500/30 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-amber-300 tracking-wider uppercase text-sm sm:text-base font-serif">
                    Elder Catalyzer — 3D Arcane Realm
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                    Three.js WebGL
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground hidden md:block">
                  Procedural Gothic Labyrinth · Arcane Spell Deck · Runic Wall Cipher [E]
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Scanlines Toggle */}
              <button
                onClick={() => setShowScanlines(v => !v)}
                className={`px-2 py-1.5 rounded border text-[11px] flex items-center gap-1 transition-colors ${
                  showScanlines
                    ? "border-amber-400/50 bg-amber-500/15 text-amber-300"
                    : "border-slate-700 bg-slate-900 text-slate-400"
                }`}
                title="Toggle Cyber CRT Scanlines"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CRT</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="px-2 py-1.5 rounded border border-amber-500/40 bg-slate-900 text-amber-200 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Full"}</span>
              </button>

              {/* Direct Tab Opener */}
              <a
                href="/games/arcane-maze/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                title="Open Standalone In New Window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Close Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-1.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-white transition cursor-pointer"
                title="Exit Game [ESC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Game Canvas Container (Iframe) */}
          <div className="relative flex-1 w-full h-full bg-[#050811] overflow-hidden">
            {showScanlines && (
              <div className="absolute inset-0 pointer-events-none z-10 opacity-20 scanlines" />
            )}
            <iframe
              ref={iframeRef}
              src="/games/arcane-maze/index.html"
              title="Elder Catalyzer 3D Arcane Maze"
              className="w-full h-full border-0 block"
              allow="autoplay; fullscreen; accelerometer; gyroscope"
            />
          </div>

          {/* Bottom Quick Help Bar */}
          <div className="px-4 py-2 bg-slate-950/90 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span><strong>Move:</strong> WASD / Touch Joystick</span>
              <span>•</span>
              <span><strong>Spells:</strong> 1-4 (Blink, Flame, Freeze, Shield)</span>
              <span>•</span>
              <span><strong>Staff Bolt:</strong> Space / Arc Attack</span>
              <span>•</span>
              <span><strong>Wall Cipher:</strong> [E]</span>
            </div>
            <div className="text-amber-300/80 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Type 'OPERATOR' in Wall Cipher for Black-Ops Dossier Declassification</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
