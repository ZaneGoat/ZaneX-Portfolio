import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartHandshake,
  Gamepad2,
  Coffee,
  Music,
  Send,
  Sparkles,
  CheckCircle2,
  Trash2,
  Play,
  Pause
} from "lucide-react";
import { friendLoungeData } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { useMusic } from "@/context/MusicContext";

interface Shoutout {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

const DEFAULT_SHOUTOUTS: Shoutout[] = [
  {
    id: "init-1",
    author: "Zane Goat",
    message: "Welcome to the homie lounge! Grab some mint tea and enjoy the builds.",
    timestamp: "Pinned"
  }
];

export const FriendLoungeCard: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, setIsFullPlayerOpen, mood, openMoodMenu } = useMusic();
  const [shoutouts, setShoutouts] = useState<Shoutout[]>(DEFAULT_SHOUTOUTS);
  const [authorInput, setAuthorInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zanex_friend_shoutouts");
      if (saved) {
        setShoutouts(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveShoutouts = (newShoutouts: Shoutout[]) => {
    setShoutouts(newShoutouts);
    try {
      localStorage.setItem("zanex_friend_shoutouts", JSON.stringify(newShoutouts));
    } catch {}
  };

  const handlePostShoutout = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = messageInput.trim();
    if (!cleanMsg) return;

    const newShoutout: Shoutout = {
      id: Date.now().toString(),
      author: authorInput.trim() || "Homie",
      message: cleanMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updated = [newShoutout, ...shoutouts.slice(0, 5)];
    saveShoutouts(updated);
    setMessageInput("");
    setAuthorInput("");
    setIsSent(true);
    sound.playSuccess();
    sound.haptic([40, 20, 60]);

    setTimeout(() => setIsSent(false), 3000);
  };

  const triggerFriendConfetti = () => {
    sound.playEmpPulse();
    sound.haptic([80, 40, 120]);
    // Small celebration visual
    const root = document.documentElement;
    root.classList.add("scanlines-fast");
    setTimeout(() => root.classList.remove("scanlines-fast"), 600);
  };

  return (
    <motion.div
      id="friend-lounge"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hud-card md:col-span-2 lg:col-span-4 p-6 md:p-8 relative overflow-hidden font-mono border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(0,255,102,0.15)] bg-gradient-to-br from-[#040a08]/95 via-[#030611]/95 to-[#040a08]/95"
    >
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
            <HeartHandshake className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-black text-emerald-400 tracking-tight uppercase">
                FRIEND LOUNGE // INNER CIRCLE
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                UNLOCKED
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Authentic behind-the-scenes vibes, real gamer specs, and homie guestbook.
            </p>
          </div>
        </div>

        <button
          onClick={triggerFriendConfetti}
          className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>CYBER PULSE FX</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Zane's Real Telemetry (6 cols) */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <span className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider block">
              ★ REAL HARDWARE &amp; GAMER SPEC SHEET:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-400/60 block text-[10px]">FAVORITE GAMES</span>
                  <span className="font-bold text-foreground">Cyberpunk 2077, CS2, Elden Ring</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2">
                <Coffee className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-400/60 block text-[10px]">DAILY FUEL</span>
                  <span className="font-bold text-foreground">{friendLoungeData.teaIntake}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-2 sm:col-span-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="p-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-emerald-400/80 block text-[10px] font-bold">
                      ZANOPHY // CODING SOUNDTRACK {isPlaying ? "· PLAYING" : ""}
                    </span>
                    <span className="font-bold text-foreground truncate block">
                      {currentTrack.title} — {currentTrack.artist}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      sound.playClick();
                      togglePlay();
                    }}
                    className="p-1.5 bg-emerald-500 text-background rounded-lg font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title={isPlaying ? "Pause Track" : "Play Track"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => {
                      sound.playBoot();
                      openMoodMenu();
                    }}
                    className={`px-2 py-1 border rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mood === "jazz"
                        ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300"
                        : "bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300"
                    }`}
                    title="Click to Choose Mood (Random / They are Jazz)"
                  >
                    {mood === "jazz" ? "MOOD: JAZZ 🎷" : "MOOD: RANDOM 🎲"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/20 text-xs text-muted-foreground leading-relaxed">
              <p className="text-emerald-300 font-bold mb-1">Zane's Note to Friends:</p>
              <p>{friendLoungeData.homieNote}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Homie Scratchpad / Guestbook (6 cols) */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-4">
          <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-4 space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
              <span className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Homie Shoutout Scratchpad
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">LOCAL STORAGE ONLY</span>
            </div>

            {/* Shoutout List */}
            <div className="space-y-2 flex-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {shoutouts.map(s => (
                <div
                  key={s.id}
                  className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-emerald-400">@{s.author}</span>
                    <span className="text-muted-foreground">{s.timestamp}</span>
                  </div>
                  <p className="text-foreground/90">{s.message}</p>
                </div>
              ))}
            </div>

            {/* Shoutout Form */}
            <form onSubmit={handlePostShoutout} className="pt-2 space-y-2 border-t border-emerald-500/15">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={authorInput}
                  onChange={e => setAuthorInput(e.target.value)}
                  placeholder="Your nickname"
                  className="w-1/3 bg-black/60 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 outline-none placeholder:text-muted-foreground/50"
                  maxLength={15}
                />
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Leave a message or quote..."
                  className="flex-1 bg-black/60 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 outline-none placeholder:text-muted-foreground/50"
                  maxLength={120}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  POST
                </button>
              </div>

              {isSent && (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Shoutout saved to your browser session!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
