import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Radio, Disc3, ChevronUp } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { sound } from "@/lib/sound";

export const ZanophyMiniBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    togglePlay,
    nextTrack,
    prevTrack,
    isMuted,
    toggleMute,
    setIsFullPlayerOpen
  } = useMusic();

  const [isMinimized, setIsMinimized] = useState(false);

  const handleOpenFull = () => {
    sound.playBoot();
    sound.haptic(30);
    setIsFullPlayerOpen(true);
  };

  // If minimized into a floating cyber disc
  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={() => {
          sound.playClick();
          setIsMinimized(false);
        }}
        className="fixed bottom-4 left-4 z-40 p-2.5 rounded-full bg-black/90 border-2 border-emerald-500/60 shadow-[0_0_25px_rgba(29,185,84,0.4)] backdrop-blur-xl flex items-center gap-2 group cursor-pointer font-mono"
        title="Open Zanophy Player"
      >
        <Disc3 className={`w-5 h-5 text-emerald-400 ${isPlaying ? "animate-spin" : ""}`} />
        <span className="text-[10px] font-bold text-emerald-400 pr-1 group-hover:inline hidden">ZANOPHY</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-2.5 sm:left-5 z-40 max-w-[calc(100vw-5rem)] sm:max-w-md font-mono select-none"
    >
      <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-2xl bg-[#070b0e]/95 border-2 border-emerald-500/50 shadow-[0_0_35px_rgba(29,185,84,0.25)] backdrop-blur-2xl">
        {/* Album Artwork with Spinning Vinyl Ring */}
        <div
          onClick={handleOpenFull}
          className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 cursor-pointer group border border-emerald-500/40"
          title="Click to expand Zanophy"
        >
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? "scale-105" : "grayscale-[40%]"
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
            {isBuffering ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>

        {/* Track Title & Artist Marquee */}
        <div
          onClick={handleOpenFull}
          className="flex-1 min-w-0 pr-1 cursor-pointer overflow-hidden text-left"
          title="Click to view full playlist"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-400/80 font-bold truncate">
              ZANOPHY // {currentTrack.genre || "HI-FI"}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-black text-foreground truncate leading-tight hover:text-emerald-300 transition-colors max-w-[110px] xs:max-w-[150px] sm:max-w-[200px]">
            {currentTrack.title}
          </p>
          <p className="text-[10px] text-muted-foreground truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[200px]">
            {currentTrack.artist}
          </p>
        </div>

        {/* Animated Equalizer Bars (Large screens only) */}
        <div className="hidden sm:flex items-end gap-0.5 h-4 px-1 shrink-0" title="Audio Stream Active">
          {[
            "h-2", "h-4", "h-3", "h-1.5"
          ].map((h, i) => (
            <motion.span
              key={i}
              className={`w-0.5 bg-emerald-400 rounded-full ${h}`}
              animate={isPlaying ? { height: ["20%", "100%", "40%", "80%", "20%"] } : { height: "25%" }}
              transition={{
                duration: 0.8 + i * 0.15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Controls: Prev, Big Play/Pause, Next */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={prevTrack}
            className="hidden xs:inline-flex p-1 sm:p-1.5 text-foreground/70 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer"
            title="Previous Song"
          >
            <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-1.5 sm:p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-background font-bold shadow-[0_0_15px_rgba(29,185,84,0.6)] active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1 sm:p-1.5 text-foreground/70 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer"
            title="Next Song"
          >
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Mute & Minimize */}
        <div className="flex items-center gap-0.5 pl-1 border-l border-emerald-500/20 shrink-0">
          <button
            onClick={toggleMute}
            className="p-1.5 text-foreground/60 hover:text-emerald-400 transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsMinimized(true);
            }}
            className="p-1 text-foreground/40 hover:text-foreground/80 transition-colors cursor-pointer"
            title="Minimize"
          >
            <ChevronUp className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
