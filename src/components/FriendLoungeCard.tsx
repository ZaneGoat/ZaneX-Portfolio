import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Gamepad2,
  Coffee,
  Music,
  Send,
  CheckCircle2,
  Play,
  Pause,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Wifi,
  Radio,
  Loader2
} from "lucide-react";
import { friendLoungeData } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { useMusic } from "@/context/MusicContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
    message: "Welcome to the lounge, homie! Grab some Moroccan mint tea, throw on the beats, and make yourself at home.",
    timestamp: "Pinned"
  }
];

const QUICK_REACTIONS = ["Mint tea", "Game night", "Great beats", "Good vibes", "Hey Zane!"];

export const FriendLoungeCard: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, mood, openMoodMenu } = useMusic();
  const [shoutouts, setShoutouts] = useState<Shoutout[]>(DEFAULT_SHOUTOUTS);
  const [authorInput, setAuthorInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Format timestamp helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  // Fetch real entries from Supabase or fallback to local storage
  const loadGuestbook = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("guestbook")
          .select("id, author, message, created_at")
          .order("created_at", { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          const mapped: Shoutout[] = [
            DEFAULT_SHOUTOUTS[0],
            ...data.map((row) => ({
              id: row.id,
              author: row.author,
              message: row.message,
              timestamp: formatTime(row.created_at)
            }))
          ];
          setShoutouts(mapped);
          setIsLiveConnected(true);
          return;
        }
      } catch (e) {
        console.warn("Supabase fetch failed, falling back to local store:", e);
      }
    }

    // Fallback: local storage
    try {
      const saved = localStorage.getItem("zanex_friend_shoutouts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setShoutouts([DEFAULT_SHOUTOUTS[0], ...parsed.filter((p: Shoutout) => p.id !== "init-1")]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadGuestbook();

    // Subscribe to realtime postgres changes if Supabase is active
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("realtime-guestbook")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "guestbook" },
          (payload) => {
            const newRow = payload.new as { id: string; author: string; message: string; created_at: string };
            setShoutouts((prev) => {
              if (prev.some((item) => item.id === newRow.id)) return prev;
              return [
                DEFAULT_SHOUTOUTS[0],
                {
                  id: newRow.id,
                  author: newRow.author,
                  message: newRow.message,
                  timestamp: formatTime(newRow.created_at)
                },
                ...prev.filter((p) => p.id !== "init-1")
              ];
            });
            sound.playSuccess();
          }
        )
        .subscribe((status) => {
          setIsLiveConnected(status === "SUBSCRIBED");
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadGuestbook]);

  const handlePostShoutout = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = messageInput.trim();
    if (!cleanMsg || isSubmitting) return;

    const author = authorInput.trim() || "Friend";
    setIsSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("guestbook")
          .insert([{ author, message: cleanMsg }])
          .select("id, author, message, created_at")
          .single();

        if (error) throw error;

        if (data) {
          const entry: Shoutout = {
            id: data.id,
            author: data.author,
            message: data.message,
            timestamp: formatTime(data.created_at)
          };
          setShoutouts((prev) => [
            DEFAULT_SHOUTOUTS[0],
            entry,
            ...prev.filter((p) => p.id !== "init-1" && p.id !== entry.id)
          ]);
        }
        setStatusNotice("Broadcasted to live guestbook!");
      } catch (err: unknown) {
        console.error("Supabase insert error:", err);
        // Fallback to local
        const localEntry: Shoutout = {
          id: Date.now().toString(),
          author,
          message: cleanMsg,
          timestamp: formatTime()
        };
        setShoutouts((prev) => [DEFAULT_SHOUTOUTS[0], localEntry, ...prev.filter((p) => p.id !== "init-1")]);
        setStatusNotice("Saved locally (cloud sync offline).");
      }
    } else {
      // Local storage path
      const localEntry: Shoutout = {
        id: Date.now().toString(),
        author,
        message: cleanMsg,
        timestamp: formatTime()
      };
      const nonPinned = shoutouts.filter((p) => p.id !== "init-1");
      const updated = [localEntry, ...nonPinned.slice(0, 9)];
      setShoutouts([DEFAULT_SHOUTOUTS[0], ...updated]);
      try {
        localStorage.setItem("zanex_friend_shoutouts", JSON.stringify(updated));
      } catch {
        // ignore
      }
      setStatusNotice("Saved to browser session.");
    }

    setMessageInput("");
    setIsSubmitting(false);
    sound.playSuccess();
    sound.haptic([40, 20, 60]);

    setTimeout(() => setStatusNotice(null), 4000);
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
              Off-duty setup, Zanophy soundtrack, and live guestbook.
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

            {/* Official Discord Server Banner */}
            <a
              href="https://discord.gg/rVDZwx4XV"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="p-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/30 hover:border-indigo-400/60 flex items-center justify-between gap-2.5 transition-colors group cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-foreground group-hover:text-indigo-300 transition-colors block text-xs">
                    Official Discord Server
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate block font-mono">
                    discord.gg/rVDZwx4XV · Gaming, beats & chats
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
          </div>
        </div>

        {/* Right Column: Real Guestbook */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
              <span className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Guestbook Scratchpad
              </span>
              <span className="text-[10px] font-mono flex items-center gap-1">
                {isLiveConnected ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Radio className="w-3 h-3 animate-pulse" /> LIVE STREAM
                  </span>
                ) : isSupabaseConfigured ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <Wifi className="w-3 h-3" /> CLOUD SYNC
                  </span>
                ) : (
                  <span className="text-muted-foreground">LOCAL SESSION</span>
                )}
              </span>
            </div>

            <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {shoutouts.map((s) => (
                <div
                  key={s.id}
                  className={`p-2.5 rounded-lg text-xs space-y-0.5 border ${
                    s.timestamp === "Pinned"
                      ? "bg-emerald-500/10 border-emerald-500/35"
                      : "bg-white/[0.02] border-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-emerald-400">@{s.author}</span>
                    <span className="text-muted-foreground text-[9px]">{s.timestamp}</span>
                  </div>
                  <p className="text-foreground/90 break-words leading-relaxed">{s.message}</p>
                </div>
              ))}
            </div>

            {/* Form with Quick Reaction Chips */}
            <form onSubmit={handlePostShoutout} className="pt-2 space-y-2 border-t border-white/[0.07]">
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <span className="text-[10px] text-muted-foreground mr-1">Quick Vibe:</span>
                {QUICK_REACTIONS.map((reaction) => (
                  <button
                    key={reaction}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMessageInput((prev) => (prev ? `${prev} ${reaction}` : reaction));
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
                  onChange={(e) => setAuthorInput(e.target.value)}
                  placeholder="Your Name / Handle"
                  className="sm:w-32 bg-black/60 border border-white/15 focus:border-emerald-500/50 rounded-lg px-2.5 py-2 sm:py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                  maxLength={25}
                  disabled={isSubmitting}
                />
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Leave a message in Zane's guestbook..."
                    className="flex-1 min-w-0 bg-black/60 border border-white/15 focus:border-emerald-500/50 rounded-lg px-2.5 py-2 sm:py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                    maxLength={180}
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !messageInput.trim()}
                    className="px-3.5 py-2 sm:py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs rounded-lg active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>POST</span>
                  </button>
                </div>
              </div>

              {statusNotice && (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold animate-fade-in">
                  <CheckCircle2 className="w-3 h-3" /> {statusNotice}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
