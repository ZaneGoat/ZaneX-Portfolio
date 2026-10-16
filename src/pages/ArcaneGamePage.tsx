import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Tv,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { sound } from "@/lib/sound";
import { toast } from "sonner";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";

export const ArcaneGamePage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScanlines, setShowScanlines] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen bg-[#050811] text-foreground font-mono overflow-hidden select-none flex flex-col"
    >
      {/* Top Floating Glass HUD */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm border-b border-amber-500/20 text-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Return to Portfolio Button */}
          <Link
            to="/"
            onClick={() => sound.playClick()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 transition-all font-bold cursor-pointer"
            title="Return to ZaneX Portfolio Overview"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            </div>
            <div className="leading-tight">
              <h1 className="font-black text-amber-300 tracking-wider uppercase text-xs sm:text-sm font-serif">
                Elder Catalyzer — 3D Arcane Realm
              </h1>
              <p className="text-[10px] text-muted-foreground hidden md:block">
                Standalone WebGL RPG · Three.js Procedural Dungeon Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* CRT Scanlines Toggle */}
          <button
            onClick={() => setShowScanlines(v => !v)}
            className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
              showScanlines
                ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
            title="Toggle CRT Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-slate-900/80 text-amber-200 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
            title="Toggle Native Browser Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="relative flex-1 w-full h-full bg-[#050811] overflow-hidden pt-10 sm:pt-12">
        {showScanlines && (
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20 scanlines" />
        )}
        <iframe
          src="/games/arcane-maze/index.html"
          title="Elder Catalyzer 3D Arcane Realm Standalone"
          className="w-full h-full border-0 block"
          allow="autoplay; fullscreen; accelerometer; gyroscope; pointer-lock"
          allowFullScreen={true}
        />
      </div>
    </div>
  );
};

export default ArcaneGamePage;
