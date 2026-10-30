import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  X,
  Search,
  Plus,
  Radio,
  Trash2,
  Disc3,
  Music2,
  Check
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { MOODS } from "@/data/playlist";
import { sound } from "@/lib/sound";

export const ZanophyModal: React.FC = () => {
  const {
    playlist,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isLoop,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    mood,
    openMoodMenu,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleLoop,
    addCustomTrack,
    removeCustomTrack
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customError, setCustomError] = useState("");
  const [customSuccess, setCustomSuccess] = useState(false);
  const [showMobilePlaylist, setShowMobilePlaylist] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const isDraggingVolumeRef = useRef<boolean>(false);

  const effectiveVolume = isMuted ? 0 : volume;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleProgressPointer = (clientX: number) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(Math.round(ratio * (duration || 100)));
  };

  const handleVolumePointer = (clientX: number) => {
    const rect = volumeBarRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(Math.round(ratio * 100));
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Real-time canvas audio visualizer wave
  useEffect(() => {
    if (!isFullPlayerOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const bars = 32;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const factor = isPlaying
          ? Math.sin(phase + i * 0.3) * 0.4 + Math.cos(phase * 0.7 + i * 0.2) * 0.3 + 0.3
          : 0.1;
        const barHeight = Math.max(4, factor * height * 0.85);
        const x = i * barWidth;
        const y = height - barHeight;

        // Emerald gradient
        const grad = ctx.createLinearGradient(0, y, 0, height);
        grad.addColorStop(0, "rgba(29, 185, 84, 0.9)");
        grad.addColorStop(1, "rgba(29, 185, 84, 0.15)");

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1.5, y, barWidth - 3, barHeight);
      }

      if (isPlaying) {
        phase += 0.08;
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isFullPlayerOpen, isPlaying]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError("");
    setCustomSuccess(false);

    if (!customUrl.trim()) return;

    const ok = addCustomTrack(customUrl);
    if (ok) {
      setCustomUrl("");
      setCustomSuccess(true);
      setTimeout(() => setCustomSuccess(false), 3000);
    } else {
      setCustomError("Invalid YouTube URL. Please provide a valid video link.");
      sound.playError();
    }
  };

  const filteredPlaylist = playlist.filter(
    t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.genre && t.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isFullPlayerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10002] bg-background/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 md:p-6 font-mono"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-[365px] sm:max-w-md lg:max-w-5xl h-auto max-h-[92vh] lg:h-[85vh] lg:max-h-[820px] bg-[#070b0e] border-2 border-emerald-500/50 rounded-3xl shadow-[0_0_80px_rgba(29,185,84,0.35)] flex flex-col overflow-hidden text-foreground relative"
          >
            {/* Top Navigation Bar */}
            <div className="bg-[#0b1217] border-b border-emerald-500/20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                  <Disc3 className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlaying ? "animate-spin" : ""}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-lg font-black tracking-tight text-emerald-400">
                    ZANOPHY<span className="text-foreground hidden xs:inline"> // PLAYER</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold hidden md:inline">
                    SPOTIFY FOR CYBERPUNKS
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Mood Selector Button */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    openMoodMenu();
                  }}
                  className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 sm:px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                    mood === "jazz"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30"
                  }`}
                  title="Switch Mood (Random / They are Jazz)"
                >
                  <span>{mood === "jazz" ? "JAZZ" : "RANDOM"}</span>
                </button>

                <span className="text-[11px] text-emerald-400/80 font-mono hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>AUTORELOAD ACTIVE</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsFullPlayerOpen(false);
                  }}
                  className="p-1.5 text-foreground/60 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                  title="Close Zanophy"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Main Content: Split Grid (Compact Single Card on Phone, Split on Desktop) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
              {/* Left Column: Now Playing & Audio Controls */}
              <div className="flex w-full lg:col-span-5 p-4 sm:p-5 lg:p-6 lg:border-r border-emerald-500/20 flex-col lg:justify-between overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#090f14] to-[#05080b]">
                <div className="flex flex-col">
                  {/* Top Row on Mobile: Artwork + Track Metadata nicely proportioned */}
                  <div className="relative w-44 sm:w-52 lg:w-60 aspect-square mx-auto mb-3 sm:mb-4 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(29,185,84,0.28)] border-2 border-emerald-500/40 group shrink-0">
                    <img
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isPlaying ? "scale-105" : "grayscale-[30%]"
                      }`}
                    />
                    {isBuffering && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="w-8 h-8 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
                      </div>
                    )}
                    {currentTrack.genre && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/85 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                        {currentTrack.genre}
                      </span>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="text-center mb-3 px-1">
                    <h2 className="text-sm sm:text-lg font-black text-foreground truncate leading-tight">
                      {currentTrack.title}
                    </h2>
                    <p className="text-xs text-emerald-400/90 truncate font-bold mt-0.5">
                      {currentTrack.artist}
                    </p>
                  </div>

                  {/* Interactive Custom Scrubber / Progress Bar */}
                  <div className="space-y-1.5 mb-3.5 px-1">
                    <div
                      ref={progressBarRef}
                      onClick={e => handleProgressPointer(e.clientX)}
                      onPointerDown={e => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        handleProgressPointer(e.clientX);
                      }}
                      onPointerMove={e => {
                        if (e.buttons === 1) handleProgressPointer(e.clientX);
                      }}
                      className="w-full py-2 cursor-pointer select-none group"
                      role="slider"
                      aria-label="Track Progress"
                      aria-valuemin={0}
                      aria-valuemax={duration || 100}
                      aria-valuenow={currentTime}
                    >
                      <div className="w-full h-2 bg-emerald-950/90 border border-emerald-500/25 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-150"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-[11px] text-muted-foreground font-mono select-none">
                      <span>{formatTime(currentTime)}</span>
                      <span>{duration > 0 ? formatTime(duration) : currentTrack.duration || "--:--"}</span>
                    </div>
                  </div>

                  {/* Controls: Shuffle, Prev, Big Play/Pause, Next, Loop */}
                  <div className="flex items-center justify-center gap-3.5 sm:gap-5 mb-3.5">
                    <button
                      type="button"
                      onClick={toggleShuffle}
                      className={`p-2 rounded-full transition-colors cursor-pointer active:scale-90 ${
                        isShuffle ? "text-emerald-400 bg-emerald-500/20" : "text-foreground/50 hover:text-foreground"
                      }`}
                      title={isShuffle ? "Shuffle On" : "Shuffle Off"}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={prevTrack}
                      className="p-2 text-foreground/80 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer"
                      title="Previous"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-background font-black shadow-[0_0_25px_rgba(29,185,84,0.7)] active:scale-95 transition-all cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={nextTrack}
                      className="p-2 text-foreground/80 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer"
                      title="Next"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleLoop}
                      className={`p-2 rounded-full transition-colors cursor-pointer active:scale-90 ${
                        isLoop ? "text-emerald-400 bg-emerald-500/20" : "text-foreground/50 hover:text-foreground"
                      }`}
                      title={isLoop ? "Loop Single Song On" : "Loop Off"}
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Custom Cyberpunk Segmented Volume Deck (Replaces native range input) */}
                  <div className="w-full bg-[#05090c] border border-emerald-500/25 p-2.5 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-foreground/70 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer shrink-0"
                        title={isMuted ? "Unmute" : "Mute"}
                        aria-label="Toggle Mute"
                      >
                        {effectiveVolume === 0 ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : effectiveVolume < 50 ? (
                          <Volume1 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setVolume(Math.max(0, effectiveVolume - 10));
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-sm font-black active:scale-90 transition-all cursor-pointer shrink-0 select-none"
                        title="Decrease Volume 10%"
                        aria-label="Decrease Volume"
                      >
                        -
                      </button>

                      {/* 10-Segment Interactive LED Volume Meter */}
                      <div
                        ref={volumeBarRef}
                        onClick={e => handleVolumePointer(e.clientX)}
                        onPointerDown={e => {
                          isDraggingVolumeRef.current = true;
                          e.currentTarget.setPointerCapture(e.pointerId);
                          handleVolumePointer(e.clientX);
                        }}
                        onPointerMove={e => {
                          if (isDraggingVolumeRef.current || e.buttons === 1) {
                            handleVolumePointer(e.clientX);
                          }
                        }}
                        onPointerUp={() => {
                          isDraggingVolumeRef.current = false;
                        }}
                        className="flex-1 grid grid-cols-10 gap-1 items-center h-7 px-1.5 bg-black/70 border border-emerald-500/20 rounded-lg cursor-pointer select-none"
                        role="slider"
                        aria-label="Volume Level"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={effectiveVolume}
                      >
                        {Array.from({ length: 10 }, (_, idx) => {
                          const threshold = (idx + 1) * 10;
                          const isActive = effectiveVolume >= threshold - 5;
                          return (
                            <div
                              key={threshold}
                              onClick={e => {
                                e.stopPropagation();
                                sound.playClick();
                                setVolume(threshold);
                              }}
                              className={`h-3.5 rounded-sm transition-all ${
                                isActive
                                  ? idx >= 8
                                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                  : "bg-emerald-950/70 hover:bg-emerald-800/50"
                              }`}
                            />
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setVolume(Math.min(100, effectiveVolume + 10));
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-sm font-black active:scale-90 transition-all cursor-pointer shrink-0 select-none"
                        title="Increase Volume 10%"
                        aria-label="Increase Volume"
                      >
                        +
                      </button>

                      <span className="text-[11px] text-emerald-400 font-mono w-9 text-right select-none font-black shrink-0">
                        {effectiveVolume}%
                      </span>
                    </div>

                    {/* Quick Tap Volume Preset Chips */}
                    <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                      {[0, 25, 50, 75, 100].map(preset => {
                        const isSelected =
                          (preset === 0 && effectiveVolume === 0) ||
                          (preset > 0 && Math.abs(effectiveVolume - preset) <= 5);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setVolume(preset);
                            }}
                            className={`py-1 rounded-md text-[10px] font-mono font-bold border transition-all cursor-pointer active:scale-95 ${
                              isSelected
                                ? "bg-emerald-500 text-background border-emerald-400 shadow-[0_0_10px_rgba(29,185,84,0.4)]"
                                : "bg-emerald-950/40 text-emerald-400/75 border-emerald-500/20 hover:bg-emerald-500/15 hover:text-emerald-300"
                            }`}
                          >
                            {preset === 0 ? "MUTE" : `${preset}%`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Animated Canvas Visualizer */}
                <div className="mt-3 lg:mt-auto pt-2.5 border-t border-emerald-500/15">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400/70 mb-1 font-mono">
                    <span>AUDIO SPECTRUM // 32 BANDS</span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-ping" : "bg-muted-foreground"}`} />
                      {isPlaying ? "LIVE" : "STANDBY"}
                    </span>
                  </div>
                  <canvas ref={canvasRef} width={280} height={36} className="w-full h-8 sm:h-9 rounded-lg bg-black/40 border border-emerald-500/20" />
                </div>
              </div>

              {/* Right Column: Playlist Tracklist & Custom Stream Injection (Desktop only) */}
              <div className="hidden lg:flex w-full lg:col-span-7 p-4 sm:p-6 flex-col overflow-hidden bg-[#070b0e]">
                {/* Playlist Header & Search */}
                <div className="border-b border-emerald-500/20 pb-4 mb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-foreground">
                        {MOODS[mood].name.toUpperCase()} // {MOODS[mood].tagline}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {playlist.length} Tracks · {MOODS[mood].sub}
                      </p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/60" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search track, artist, or genre..."
                      className="w-full pl-9 pr-4 py-2 bg-black/60 border border-emerald-500/30 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-emerald-400 transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Tracklist Rows */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredPlaylist.map((track, idx) => {
                    const originalIndex = playlist.findIndex(t => t.id === track.id);
                    const isCurrent = originalIndex === currentTrackIndex;

                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          selectTrack(originalIndex);
                          setShowMobilePlaylist(false);
                        }}
                        className={`flex items-center gap-3 p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all group ${
                          isCurrent
                            ? "bg-emerald-500/15 border border-emerald-500/40 shadow-[0_0_15px_rgba(29,185,84,0.15)]"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        {/* Index / Play icon */}
                        <div className="w-7 text-center shrink-0 font-bold text-xs">
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end justify-center gap-0.5 h-3">
                              <span className="w-0.5 h-3 bg-emerald-400 animate-pulse" />
                              <span className="w-0.5 h-2 bg-emerald-400 animate-ping" />
                              <span className="w-0.5 h-3 bg-emerald-400 animate-pulse" />
                            </div>
                          ) : (
                            <span className={`group-hover:hidden ${isCurrent ? "text-emerald-400" : "text-muted-foreground"}`}>
                              {originalIndex + 1}
                            </span>
                          )}
                          <Play className="w-3.5 h-3.5 fill-current text-emerald-400 hidden group-hover:inline mx-auto" />
                        </div>

                        {/* Thumbnail */}
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-emerald-500/30"
                          loading="lazy"
                        />

                        {/* Title & Artist */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                              isCurrent ? "text-emerald-300 font-black" : "text-foreground group-hover:text-emerald-300"
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{track.artist}</p>
                        </div>

                        {/* Genre Tag */}
                        {track.genre && (
                          <span className="hidden md:inline px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/80 shrink-0">
                            {track.genre}
                          </span>
                        )}

                        {/* Duration */}
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0 pl-1">
                          {track.duration || "3:00"}
                        </span>

                        {/* Delete Track Action (Autoreload) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomTrack(track.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-400 transition-all rounded hover:bg-red-500/10 shrink-0 cursor-pointer"
                          title="Delete song from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Custom YouTube Song Injector */}
                <form
                  onSubmit={handleAddCustom}
                  className="mt-3 pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row gap-2 shrink-0"
                >
                  <div className="flex-1 relative">
                    <Plus className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/70" />
                    <input
                      type="text"
                      value={customUrl}
                      onChange={e => setCustomUrl(e.target.value)}
                      placeholder="Paste any YouTube video or music link to inject..."
                      className="w-full pl-9 pr-3 py-2 bg-black/60 border border-emerald-500/30 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-background font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(29,185,84,0.4)] active:scale-95 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>INJECT SONG</span>
                  </button>
                </form>

                {customSuccess && (
                  <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Track added to queue and playing!
                  </p>
                )}
                {customError && (
                  <p className="text-[11px] text-red-400 font-bold mt-1">{customError}</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
