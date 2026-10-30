import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Check } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { MOODS, ZanophyMood } from "@/data/playlist";
import { sound } from "@/lib/sound";

const ZANOPHY_ASCII_LOGO = [
  "███████╗ █████╗ ███╗   ██╗ ██████╗ ██████╗ ██╗  ██╗██╗   ██╗",
  "╚══███╔╝██╔══██╗████╗  ██║██╔═══██╗██╔══██╗██║  ██║╚██╗ ██╔╝",
  "  ███╔╝ ███████║██╔██╗ ██║██║   ██║██████╔╝███████║ ╚████╔╝ ",
  " ███╔╝  ██╔══██║██║╚██╗██║██║   ██║██╔═══╝ ██╔══██║  ╚██╔╝  ",
  "███████╗██║  ██║██║ ╚████║╚██████╔╝██║     ██║  ██║   ██║   ",
  "╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝   ╚═╝   "
].join("\n");

export const ZanophyMoodModal: React.FC = () => {
  const { mood, setMood, isMoodMenuOpen, setIsMoodMenuOpen, setIsFullPlayerOpen, play } = useMusic();

  if (!isMoodMenuOpen) return null;

  const handleChooseMood = (selectedMood: ZanophyMood) => {
    setMood(selectedMood);
    play();
    setIsMoodMenuOpen(false);
    setIsFullPlayerOpen(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10003] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 font-mono select-none"
        onClick={() => setIsMoodMenuOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#070b0e] border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.25)] overflow-hidden flex flex-col max-h-[90vh] text-foreground"
        >
          {/* Window Title Bar */}
          <div className="bg-[#0b1217] border-b border-emerald-500/20 px-4 sm:px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-wider text-emerald-400">
                ZANOPHY // SELECT MOOD
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsMoodMenuOpen(false);
              }}
              className="p-1 text-foreground/60 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
            {/* Readable Block ASCII Banner */}
            <div className="bg-black/70 border border-emerald-500/25 rounded-xl py-3.5 px-2 text-center">
              <pre className="text-[6.5px] xs:text-[8px] sm:text-[10px] leading-[1.15] font-mono font-bold text-emerald-400 inline-block text-left whitespace-pre">
                {ZANOPHY_ASCII_LOGO}
              </pre>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 tracking-widest uppercase">
                CHOOSE YOUR AUDIO MOOD TO LAUNCH PLAYER
              </p>
            </div>

            {/* 2-Column Mood Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Random */}
              <div
                onClick={() => handleChooseMood("random")}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  mood === "random"
                    ? "bg-emerald-500/10 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    : "bg-[#0a1015] border-emerald-500/25 hover:border-emerald-400/70 hover:bg-emerald-500/5"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      38 TRACKS
                    </span>
                    {mood === "random" && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Block ASCII Emblem */}
                  <div className="bg-black/60 border border-emerald-500/20 rounded-lg py-3 px-2 mb-3 text-center overflow-hidden">
                    <pre className="text-[5.5px] xs:text-[6px] sm:text-[6.5px] leading-[1.15] font-mono text-emerald-400 inline-block text-left whitespace-pre">
                      {MOODS.random.asciiArt}
                    </pre>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-foreground">
                    Random
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                    3 AM Midnight Radio
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Phonk, Dream Pop, Desert Blues, Sufi &amp; Neo-Classical Piano.
                  </p>
                </div>

                {/* Direct Action */}
                <div className="mt-5 pt-3 border-t border-emerald-500/15">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChooseMood("random");
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Random</span>
                  </button>
                </div>
              </div>

              {/* Option 2: They are Jazz */}
              <div
                onClick={() => handleChooseMood("jazz")}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  mood === "jazz"
                    ? "bg-amber-500/10 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                    : "bg-[#110d08] border-amber-500/25 hover:border-amber-400/70 hover:bg-amber-500/5"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      6 TRACKS
                    </span>
                    {mood === "jazz" && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Block ASCII Emblem */}
                  <div className="bg-black/60 border border-amber-500/20 rounded-lg py-3 px-2 mb-3 text-center overflow-hidden">
                    <pre className="text-[5.5px] xs:text-[6px] sm:text-[6.5px] leading-[1.15] font-mono text-amber-400 inline-block text-left whitespace-pre">
                      {MOODS.jazz.asciiArt}
                    </pre>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-foreground">
                    They are Jazz
                  </h3>
                  <p className="text-[11px] font-bold text-amber-400 mt-0.5">
                    Noir Sax &amp; Midnight Smoke
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Velvet brass, moody piano &amp; smooth smoky lounge jazz.
                  </p>
                </div>

                {/* Direct Action */}
                <div className="mt-5 pt-3 border-t border-amber-500/15">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChooseMood("jazz");
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Jazz</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
