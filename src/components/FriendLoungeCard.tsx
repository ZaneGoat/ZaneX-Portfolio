import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Gamepad2,
  Coffee,
  Music,
  Send,
  Zap,
  CheckCircle2,
  Play,
  Pause,
  Sparkles
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
    author: "Zane (Aziz)",
    message: "Welcome to the lounge, homie! Grab some Moroccan mint tea, throw on the beats, and make yourself at home. ✨",
    timestamp: "Pinned"
  }
];

const QUICK_REACTIONS = ["🍵 Mint tea", "🎮 Game night", "🎧 Great beats", "✨ Pure vibes", "👋 Hey Zane!"];

export const FriendLoungeCard: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, mood, openMoodMenu } = useMusic();
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
    } catch { /* ignore */ }
  }, []);

  const saveShoutouts = (newShoutouts: Shoutout[]) => {
    setShoutouts(newShoutouts);
    try {
      localStorage.setItem("zanex_friend_shoutouts", JSON.stringify(newShoutouts));
    } catch { /* ignore */ }
  };

  const handlePostShoutout = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = messageInput.trim();
    if (!cleanMsg) return;

    const newShoutout: Shoutout = {
      id: Date.now().toString(),
      author: authorInput.trim() || "Friend",
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

  const triggerFriendPulse = () => {
    sound.playEmpPulse();
    sound.haptic([80, 40, 120]);
    const root = document.documentElement;
    root.classList.add("scanlines-fast");
    setTimeout(() => root.classList.remove("scanlines-fast"), 600);
  };

  return (
    <motion.div
      id="friend-lounge"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hud-card md:col-span-2 lg:col-span-4 p-5 sm:p-7 relative overflow-hidden font-mono border border-emerald-500/35"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight uppercase">
                Friend Lounge
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Off-duty setup, Zanophy soundtrack, and local guestbook.
            </p>
          </div>
        </div>

        <button
          onClick={triggerFriendPulse}
          className="px-3 py-1.5 bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/35 text-emerald-300 rounded-lg text-xs font-bold transition-colors active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>VIBE PULSE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="md:col-span-6 space-y-3">
          <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3.5 sm:p-4 space-y-3">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
              Off-Duty Setup
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.07] flex items-start gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">ROTATION</span>
                  <span className="font-bold text-foreground">Cyberpunk 2077, CS2, Elden Ring</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.07] flex items-start gap-2">
                <Coffee className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">DAILY FUEL</span>
                  <span className="font-bold text-foreground">{friendLoungeData.teaIntake}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.07] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:col-span-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="p-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-md text-emerald-400 shrink-0 mt-0.5">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-emerald-400 block text-[10px] font-bold">
                      ZANOPHY {isPlaying ? "· PLAYING" : "· READY"}
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
                    className="p-1.5 bg-emerald-500 text-background rounded-md font-bold active:scale-95 transition-transform cursor-pointer"
                    title={isPlaying ? "Pause Track" : "Play Track"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => {
                      sound.playBoot();
                      openMoodMenu();
                    }}
                    className={`px-2 py-1 border rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                      mood === "jazz"
                        ? "bg-amber-500/15 border-amber-500/35 text-amber-300"
                        : "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                    }`}
                  >
                    {mood === "jazz" ? "MOOD: JAZZ" : "MOOD: MIX"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/60 border border-white/[0.07] text-xs text-muted-foreground leading-relaxed">
              <p className="text-emerald-400 font-bold mb-1">Note:</p>
              <p>{friendLoungeData.homieNote}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Guestbook */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
              <span className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Guestbook Scratchpad
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">LOCAL SESSION</span>
            </div>

            <div className="space-y-2 flex-1 max-h-40 overflow-y-auto pr-1">
              {shoutouts.map(s => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.07] text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-emerald-400">@{s.author}</span>
                    <span className="text-muted-foreground">{s.timestamp}</span>
                  </div>
                  <p className="text-foreground/90 break-words">{s.message}</p>
                </div>
              ))}
            </div>

            {/* Responsive Mobile Form with Quick Reaction Chips */}
            <form onSubmit={handlePostShoutout} className="pt-2 space-y-2 border-t border-white/[0.07]">
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <span className="text-[10px] text-muted-foreground mr-1">Quick Vibe:</span>
                {QUICK_REACTIONS.map(reaction => (
                  <button
                    key={reaction}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMessageInput(prev => (prev ? `${prev} ${reaction}` : reaction));
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/35 text-foreground/80 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    {reaction}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={authorInput}
                  onChange={e => setAuthorInput(e.target.value)}
                  placeholder="Name"
                  className="sm:w-28 bg-black/60 border border-white/15 focus:border-emerald-500/50 rounded-lg px-2.5 py-2 sm:py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                  maxLength={15}
                />
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Write a note..."
                    className="flex-1 min-w-0 bg-black/60 border border-white/15 focus:border-emerald-500/50 rounded-lg px-2.5 py-2 sm:py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                    maxLength={120}
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 sm:py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-lg active:scale-95 transition-transform flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>POST</span>
                  </button>
                </div>
              </div>

              {isSent && (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Saved to your browser session.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
