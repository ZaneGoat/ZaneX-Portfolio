import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Disc3, Radio, CheckCircle2, Music2, Sparkles } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { MOODS, ZanophyMood } from "@/data/playlist";
import { sound } from "@/lib/sound";

export const ZanophyMoodModal: React.FC = () => {
  const { mood, setMood, isMoodMenuOpen, setIsMoodMenuOpen, setIsFullPlayerOpen } = useMusic();

  if (!isMoodMenuOpen) return null;

  const handleSelectMood = (selectedMood: ZanophyMood) => {
    setMood(selectedMood);
    setIsMoodMenuOpen(false);
  };

  const handleSelectAndOpen = (selectedMood: ZanophyMood) => {
    setMood(selectedMood);
    setIsMoodMenuOpen(false);
    setIsFullPlayerOpen(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10003] bg-background/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 font-mono select-none"
        onClick={() => setIsMoodMenuOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-3xl bg-[#070b0e] border-2 border-emerald-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_80px_rgba(29,185,84,0.35)] overflow-hidden flex flex-col max-h-[92vh] text-foreground relative"
        >
          {/* Top Window Bar */}
          <div className="bg-[#0b1217] border-b border-emerald-500/25 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-400">
                ZANE_OS<span className="text-foreground"> // MOOD SELECTOR MATRIX</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsMoodMenuOpen(false);
              }}
              className="p-1.5 text-foreground/60 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              title="Close Mood Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-6">
            {/* Cyberpunk ASCII Art Header */}
            <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-3 sm:p-4 text-center overflow-x-auto shadow-inner">
              <pre className="text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold text-emerald-400 leading-tight inline-block text-left">
{`  ___  __   _  _  __  ____  _  _  _  _ 
 (__ \\/ _\\ ( \\( )/  \\(  _ \\( \\/ )/ )( \\
  / _/    \\/ /) (  O )) __/ )  / ) \\/ (
 (____\\_/\\_/\\_(_/ \\__/(__)  (__/  \\____/`}
              </pre>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-mono tracking-widest uppercase">
                [ TUNE AUDIO FREQUENCY // CHOOSE YOUR ACTIVE VIBE ]
              </p>
            </div>

            {/* Mood Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Card 1: Random */}
              <div
                onClick={() => handleSelectMood("random")}
                className={`relative group rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  mood === "random"
                    ? "bg-emerald-500/10 border-emerald-400 shadow-[0_0_35px_rgba(29,185,84,0.35)] ring-1 ring-emerald-400/50"
                    : "bg-[#090f14]/80 border-emerald-500/25 hover:border-emerald-500/60 hover:bg-[#0c141a]"
                }`}
              >
                <div>
                  {/* Top Bar with Badge & Active Indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span>🎲</span>
                      <span>13 TRACKS</span>
                    </span>

                    {mood === "random" ? (
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground group-hover:text-emerald-400 transition-colors">
                        Click to Tune
                      </span>
                    )}
                  </div>

                  {/* ASCII Mini Art */}
                  <div className="bg-black/50 border border-emerald-500/20 rounded-lg p-2 mb-3 text-center">
                    <pre className="text-[9px] font-mono text-emerald-400/90 leading-tight inline-block text-left">
{` [~ MOOD: RANDOM ~]
 .---.  .-. .-..-..---.
/   __\\ | | | || || | |
\\_____/ \`---' \`-' \`---'`}
                    </pre>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-emerald-300 transition-colors">
                    RANDOM
                  </h3>
                  <p className="text-xs font-bold text-emerald-400 mb-1">
                    3 AM Midnight Radio
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Phonk, Dream Pop, Desert Blues, Acoustic Sufi & Neo-Classical Piano.
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-2 italic">
                    Podval Capella, Cigarettes After Sex, Gibran Alcocer, Bo9al...
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAndOpen("random");
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(29,185,84,0.5)] active:scale-95 transition-all text-center cursor-pointer"
                  >
                    TUNE & OPEN DECK
                  </button>

                  <a
                    href={MOODS.random.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-colors shrink-0"
                    title="Open YouTube Playlist"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 2: They are Jazz */}
              <div
                onClick={() => handleSelectMood("jazz")}
                className={`relative group rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  mood === "jazz"
                    ? "bg-amber-500/10 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50"
                    : "bg-[#100d07]/80 border-amber-500/25 hover:border-amber-500/60 hover:bg-[#161209]"
                }`}
              >
                <div>
                  {/* Top Bar with Badge & Active Indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <span>🎷</span>
                      <span>6 TRACKS</span>
                    </span>

                    {mood === "jazz" ? (
                      <span className="text-[10px] font-black text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground group-hover:text-amber-400 transition-colors">
                        Click to Tune
                      </span>
                    )}
                  </div>

                  {/* ASCII Mini Art */}
                  <div className="bg-black/50 border border-amber-500/20 rounded-lg p-2 mb-3 text-center">
                    <pre className="text-[9px] font-mono text-amber-400/90 leading-tight inline-block text-left">
{` [~ MOOD: THEY ARE JAZZ ~]
    _    _ _____   ___ 
   | |  | |  ___| / _ \\
| |_| |__| |  __| |  _  |
 \\___/ \\__/|_|    |_| |_|`}
                    </pre>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-amber-300 transition-colors">
                    THEY ARE JAZZ
                  </h3>
                  <p className="text-xs font-bold text-amber-400 mb-1">
                    Noir Sax & Midnight Smoke
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Smooth piano, velvet horns, and smoky late-night bar lounge jazz.
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-2 italic">
                    We Are Jazz: Empty Heart, Final Gaze, Accidental Peace, Bad Timing...
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAndOpen("jazz");
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 transition-all text-center cursor-pointer"
                  >
                    TUNE & OPEN DECK
                  </button>

                  <a
                    href={MOODS.jazz.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-colors shrink-0"
                    title="Open YouTube Music Playlist"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-xs">
              <span className="text-[11px] text-muted-foreground">
                Currently Tuned: <strong className={mood === "jazz" ? "text-amber-400" : "text-emerald-400"}>{MOODS[mood].name}</strong> ({MOODS[mood].badge})
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoodMenuOpen(false);
                    setIsFullPlayerOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Music2 className="w-3.5 h-3.5" />
                  <span>Launch Player GUI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMoodMenuOpen(false)}
                  className="px-3 py-1.5 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
