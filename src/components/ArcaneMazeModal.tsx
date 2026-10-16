import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldAlert,
  Tv,
  ExternalLink,
  X
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
      } else if (action === "TOGGLE_FULLSCREEN") {
        toggleFullscreen();
      } else if (action === "EXIT_FULLSCREEN") {
        const doc = document as any;
        const efs =
          doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.mozCancelFullScreen ||
          doc.msExitFullscreen;
        if (efs) efs.call(doc).catch(() => {});
        setIsFullscreen(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [unlockNode]);

  // Fullscreen toggle with cross-browser fallbacks
  const toggleFullscreen = () => {
    sound.playClick();
    const doc = document as any;
    const isFs = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFs) {
      const el = (containerRef.current || document.documentElement) as any;
      const rfs =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;

      if (rfs) {
        rfs.call(el).catch(() => {
          document.documentElement.requestFullscreen?.().catch(() => {});
        });
      }
      setIsFullscreen(true);
    } else {
      const efs =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;
      if (efs) efs.call(doc).catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      const doc = document as any;
      setIsFullscreen(
        Boolean(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  // Close on ESC
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
        className="fixed inset-0 z-50 w-screen h-screen bg-[#050811] text-foreground font-mono overflow-hidden select-none flex flex-col"
      >
        {/* Floating Top Header Overlay */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-gradient-to-b from-black/95 via-black/70 to-transparent backdrop-blur-md border-b border-amber-500/25 text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Exit to Portfolio */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 transition-all font-bold cursor-pointer text-xs"
              title="Exit Fullscreen Game to Portfolio [ESC]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
              <span className="text-[10px] text-red-400/70 font-mono hidden md:inline">[ESC]</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              </div>
              <div className="leading-tight">
                <h2 className="font-black text-amber-300 tracking-wider uppercase text-xs sm:text-sm font-serif">
                  Elder Catalyzer — 3D Arcane Realm
                </h2>
                <p className="text-[10px] text-muted-foreground hidden lg:block">
                  WebGL Three.js · Full-Screen Alone Mode
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Scanlines Toggle */}
            <button
              onClick={() => setShowScanlines(v => !v)}
              className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
                showScanlines
                  ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                  : "border-slate-800 bg-slate-900 text-slate-400"
              }`}
              title="Toggle Cyber CRT Scanlines"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CRT</span>
            </button>

            {/* Native Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-slate-900 text-amber-200 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
              title="Toggle Native Browser Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Full"}</span>
            </button>

            {/* Standalone Window Link */}
            <a
              href="/game"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
              title="Open Standalone URL /game"
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

        {/* 3D WebGL Canvas (100% viewport edge-to-edge) */}
        <div className="relative flex-1 w-full h-full bg-[#050811] overflow-hidden pt-10 sm:pt-12">
          {showScanlines && (
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20 scanlines" />
          )}
          <iframe
            ref={iframeRef}
            src="/games/arcane-maze/index.html"
            title="Elder Catalyzer 3D Arcane Maze"
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; accelerometer; gyroscope"
            allowFullScreen={true}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
