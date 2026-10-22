import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, CornerDownLeft, ExternalLink } from "lucide-react";
import { systemSpecsByPersona, projectsData, skillsData, terminalCommandsHelp } from "@/data/portfolio";
import { ZANE_YOUTUBE_PLAYLIST_URL, ZANE_JAZZ_PLAYLIST_URL, MOODS, ZanophyMood } from "@/data/playlist";
import { usePersona } from "@/context/PersonaContext";
import { useMusic } from "@/context/MusicContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { sound } from "@/lib/sound";

interface TerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBreach?: () => void;
  onOpenMatrixTakeover?: () => void;
  onOpenCsi?: () => void;
  onOpenCtf?: () => void;
  onOpenMegaCenter?: () => void;
}

interface LogEntry {
  type: "input" | "output" | "error" | "system";
  content: string | JSX.Element;
}

export interface DeckModule {
  id: string;
  label: string;
  category: "flagship" | "ops" | "system" | "tool";
  command: string;
  icon: string;
  badge: string;
  desc: string;
}

export const DECK_CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "flagship", label: "FLAGSHIPS" },
  { id: "ops", label: "OPERATIONS" },
  { id: "system", label: "SYSTEM" },
  { id: "tool", label: "TOOLS" }
] as const;

export const DECK_MODULES: DeckModule[] = [
  // Flagships (Zane's 3 Signature Projects)
  { id: "megacenter", label: "ZaneMegaCenter", category: "flagship", command: "hardware", icon: "⚡", badge: "EC", desc: "MSI EC Fan Governor" },
  { id: "csi", label: "CSI Radar", category: "flagship", command: "csi", icon: "📡", badge: "RF", desc: "Wi-Fi Doppler Sensor" },
  { id: "controler", label: "Controler-space", category: "flagship", command: "controler", icon: "🎮", badge: "HID", desc: "DualSense Latency Suite" },

  // Operations & Security
  { id: "breach", label: "Breach ICE", category: "ops", command: "breach", icon: "🔓", badge: "HEX", desc: "ICE Breaker Minigame" },
  { id: "ctf", label: "CTF Bounties", category: "ops", command: "ctf", icon: "🛡️", badge: "QUEST", desc: "Cyber Bounties & Flags" },
  { id: "clearance", label: "Clearance", category: "ops", command: "clearance", icon: "🔒", badge: "LVL", desc: "Operator Security Vault" },
  { id: "matrix", label: "Matrix Construct", category: "ops", command: "matrix", icon: "🟢", badge: "FX", desc: "Rain & Particle Takeover" },
  { id: "shinigami", label: "Shinigami Deal", category: "ops", command: "shinigami", icon: "👁️", badge: "RYUK", desc: "Death Note Eye Deal" },

  // System & Intel
  { id: "neofetch", label: "Neofetch", category: "system", command: "neofetch", icon: "📊", badge: "SYS", desc: "Kali Dragon Dashboard" },
  { id: "whoami", label: "Whoami", category: "system", command: "whoami", icon: "👤", badge: "BIO", desc: "Active Identity Dossier" },
  { id: "projects", label: "Git Repos", category: "system", command: "projects", icon: "💻", badge: "GIT", desc: "Live GitHub API Repos" },
  { id: "device", label: "Telemetry", category: "system", command: "device", icon: "📱", badge: "HW", desc: "Hardware & Monitor Audit" },

  // Tools & Audio
  { id: "music", label: "Zanophy Audio", category: "tool", command: "music", icon: "🎵", badge: "3AM", desc: "Music Player Deck" },
  { id: "mood", label: "Audio Mood", category: "tool", command: "mood", icon: "🎭", badge: "VIBE", desc: "Random vs They are Jazz Mood Matrix" },
  { id: "playlist", label: "YT Playlist", category: "tool", command: "playlist", icon: "▶️", badge: "YT", desc: "Zane's 3 AM YouTube Playlist" },
  { id: "help", label: "Help", category: "tool", command: "help", icon: "❓", badge: "CLI", desc: "Commands Manual" },
  { id: "clear", label: "Clear", category: "tool", command: "clear", icon: "🧹", badge: "CLS", desc: "Wipe Console History" },
];

const FORTUNES = [
  "\"There is no spoon.\" – The Matrix",
  "\"The quieter you become, the more you are able to hear.\" – Kali Linux Motto",
  "\"Control is an illusion. We are just steering the chaos.\" – Mr. Robot",
  "\"Hardware doesn't lie. Exit code 0 is the only truth.\" – Zane Goat",
  "\"Automate the repetitive. Engineer the creative. Protect the architecture.\"",
  "\"Talk is cheap. Show me the code.\" – Linus Torvalds"
];

export const TerminalOverlay = ({
  isOpen,
  onClose,
  onOpenBreach,
  onOpenMatrixTakeover,
  onOpenCsi,
  onOpenCtf,
  onOpenMegaCenter
}: TerminalOverlayProps) => {
  const { persona, setPersona, telemetry, deviceChoice, setDeviceChoice, spoofActive } = usePersona();
  const { currentTrack, isPlaying, togglePlay, play, pause, nextTrack, prevTrack, playlist, selectTrack, setIsFullPlayerOpen, mood, setMood, openMoodMenu } = useMusic();
  const { clearance, clearanceLevel } = useOperatorClearance();
  const activeSpecs = systemSpecsByPersona[persona] || systemSpecsByPersona.operator;
  const shellUser = persona === "friend" ? "homie@zane-lounge" : (clearance.identityUnlocked ? "zane@kali" : "operator@classified");

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [deckCategory, setDeckCategory] = useState<string>("all");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const renderNeofetch = () => {
    return (
      <div className="my-2 font-mono">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
          {/* Cyber Kali Dragon ASCII Emblem */}
          <pre className="text-cyan-400 font-bold text-[11px] leading-tight select-none shrink-0 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
{`
          .;'
         .;'
        .;'
       .:'
      .:'
     .:'
   .::'    ..
  .::'  .:::::
 .::' .:::::::::
.::' ::::::::::::
.::. :::::::::::::
.::. :::::::::::::
.::' ::::::::::::
 .::. ::::::::::
  .::.  '::::::
   .::.   ...
    .::.
     .::.
`}
          </pre>

          {/* System Specs & Telemetry */}
          <div className="space-y-1 text-xs">
            <div className="pb-1 border-b border-primary/30">
              <span className="text-cyan-400 font-bold text-sm">{shellUser}</span>
              <p className="text-muted-foreground text-[10px]">--------------------------------</p>
            </div>
            <p><span className="text-primary font-bold">OS:</span> Kali GNU/Linux Rolling [x86_64]</p>
            <p><span className="text-primary font-bold">Host:</span> MSI GF63 Thin (EC Hardware Governed)</p>
            <p><span className="text-primary font-bold">Kernel:</span> 6.8.11-kali1-amd64</p>
            <p><span className="text-primary font-bold">Uptime:</span> {activeSpecs.uptime}</p>
            <p><span className="text-primary font-bold">Shell:</span> {activeSpecs.shell}</p>
            <p><span className="text-primary font-bold">Display:</span> {telemetry.screenWidth}×{telemetry.screenHeight} Physical @ {telemetry.dpr}x ({telemetry.viewportWidth}×{telemetry.viewportHeight} Viewport)</p>
            <p><span className="text-primary font-bold">DE / WM:</span> Cyberdeck HUD v4.2 / Xfwm4</p>
            <p><span className="text-primary font-bold">Terminal:</span> ZaneOS Matrix VTY</p>
            <p><span className="text-primary font-bold">CPU:</span> 11th Gen Intel i7-11800H (16) @ 4.60GHz</p>
            <p><span className="text-primary font-bold">GPU:</span> NVIDIA GeForce GTX 1650 Mobile</p>
            <p><span className="text-primary font-bold">Memory:</span> 14.2 GiB / 32.0 GiB (Governed by ZaneMegaCenter)</p>
            <p><span className="text-primary font-bold">Flagships:</span> <span className="text-primary/90 font-semibold">ZaneMegaCenter</span> • <span className="text-primary/90 font-semibold">csi_project</span> • <span className="text-primary/90 font-semibold">Controler-space</span></p>
            <p><span className="text-primary font-bold">Clearance:</span> Level {clearanceLevel}/3 [{clearance.identityUnlocked ? "UNLOCKED // ROOT" : "OPERATOR // ENCRYPTED"}]</p>

            {/* Neofetch Palette Swatches */}
            <div className="flex gap-1.5 pt-2">
              <span className="w-3.5 h-3.5 bg-black border border-white/20 rounded-sm" />
              <span className="w-3.5 h-3.5 bg-red-500 rounded-sm" />
              <span className="w-3.5 h-3.5 bg-green-500 rounded-sm" />
              <span className="w-3.5 h-3.5 bg-yellow-500 rounded-sm" />
              <span className="w-3.5 h-3.5 bg-blue-500 rounded-sm" />
              <span className="w-3.5 h-3.5 bg-purple-500 rounded-sm" />
              <span className="w-3.5 h-3.5 bg-cyan-400 rounded-sm" />
              <span className="w-3.5 h-3.5 bg-zinc-100 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Quick Nav / Help Hint */}
        <div className="mt-3 pt-2 border-t border-primary/20 text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span>Type <span className="text-primary font-bold">help</span> for commands</span>
          <span>•</span>
          <span><span className="text-primary font-bold">projects</span> for live GitHub repos</span>
          <span>•</span>
          <span><span className="text-primary font-bold">clearance</span> for vault challenge</span>
          <span>•</span>
          <span><span className="text-primary font-bold">clear</span> to wipe screen</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isOpen) {
      sound.playBoot();
      if (logs.length === 0) {
        setLogs([
          {
            type: "system",
            content: renderNeofetch()
          }
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    try {
      sound.playClick();
      setHistory(prev => [...prev, trimmed]);
      setHistoryIdx(-1);

      const parts = trimmed.split(" ");
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(" ").trim().toLowerCase();

      const newLogs: LogEntry[] = [
        ...logs,
        { type: "input", content: `${shellUser}:~$ ${trimmed}` }
      ];

      switch (cmd) {
        case "persona":
        case "profile":
          if (arg === "friend" || arg === "operator") {
            setPersona(arg);
            sound.playSuccess();
            newLogs.push({
              type: "output",
              content: `Visitor persona switched to [${arg.toUpperCase()}]. Interface & bio re-calibrated.`
            });
          } else {
            newLogs.push({
              type: "output",
              content: `Current persona: [${persona.toUpperCase()}]. Usage: persona [operator | friend]`
            });
          }
          break;

        case "device":
        case "telemetry":
          if (arg === "phone" || arg === "desktop" || arg === "auto") {
            setDeviceChoice(arg);
            newLogs.push({
              type: "output",
              content: `Device emulation set to [${arg.toUpperCase()}]. (Raw physical hardware: ${telemetry.os} ${telemetry.deviceCategory}).`
            });
          } else {
            newLogs.push({
              type: "output",
              content: (
                <div className="space-y-1 font-mono text-xs my-2">
                  <p className="text-primary font-bold">=== CLIENT HARDWARE TELEMETRY ===</p>
                  <p className="text-muted-foreground italic">
                    &quot;Wait... why are you asking if phone or desktop? Zane already knows.&quot;
                  </p>
                  <div className="border border-primary/20 rounded p-2.5 bg-primary/5 space-y-1 mt-1 text-xs">
                    <p><span className="text-primary font-bold">Physical OS:</span> {telemetry.os}</p>
                    <p><span className="text-primary font-bold">Device Category:</span> {telemetry.deviceCategory.toUpperCase()}</p>
                    <p><span className="text-primary font-bold">Physical Display:</span> {telemetry.screenWidth}×{telemetry.screenHeight} px @ {telemetry.dpr}x ({telemetry.orientation})</p>
                    <p><span className="text-primary font-bold">Viewport Matrix:</span> {telemetry.viewportWidth}×{telemetry.viewportHeight} px</p>
                    <p><span className="text-primary font-bold">Input Modality:</span> {telemetry.pointerType} {telemetry.touchCapable ? "(Touchscreen active)" : "(Pointer only)"}</p>
                    <p><span className="text-primary font-bold">Declared Choice:</span> {deviceChoice.toUpperCase()}</p>
                    <p><span className="text-primary font-bold">Honesty Audit:</span> <span className={spoofActive ? "text-red-400 font-bold" : "text-green-400 font-bold"}>{spoofActive ? "SPOOFED (Emulation Active)" : "HONEST (100% Match)"}</span></p>
                  </div>
                  <p className="text-[11px] text-primary/60 mt-1">
                    Usage: <span className="text-primary font-bold">device [phone | desktop | auto]</span> to override emulation.
                  </p>
                </div>
              )
            });
          }
          break;

        case "music":
        case "zanophy":
        case "spotify":
          if (arg === "play") {
            play();
            newLogs.push({
              type: "output",
              content: `▶ Playing: ${currentTrack?.title || "Audio"} — ${currentTrack?.artist || "Zane"}`
            });
          } else if (arg === "pause" || arg === "stop") {
            pause();
            newLogs.push({
              type: "output",
              content: `⏸ Music paused.`
            });
          } else if (arg === "next") {
            nextTrack();
            newLogs.push({
              type: "output",
              content: `⏭ Skipped to next track.`
            });
          } else if (arg === "prev") {
            prevTrack();
            newLogs.push({
              type: "output",
              content: `⏮ Returned to previous track.`
            });
          } else if (arg === "list" || arg === "tracks") {
            newLogs.push({
              type: "output",
              content: (
                <div className="space-y-1 font-mono text-xs my-2">
                  <p className="text-emerald-400 font-bold">=== ZANOPHY // ZANE'S 3 AM PLAYLIST ===</p>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {playlist.map((t, idx) => (
                      <div key={t.id} className="flex gap-2 text-foreground/80 hover:text-emerald-300">
                        <span className="text-emerald-400 font-bold w-6 shrink-0">{idx + 1}.</span>
                        <span className="truncate">{t.title} — <span className="text-muted-foreground">{t.artist}</span></span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-primary/60 mt-1">
                    Type <span className="text-primary font-bold">music &lt;number&gt;</span> to play track or <span className="text-primary font-bold">music gui</span> to launch full player.
                  </p>
                </div>
              )
            });
          } else if (!isNaN(Number(arg)) && Number(arg) >= 1 && Number(arg) <= playlist.length) {
            const idx = Number(arg) - 1;
            selectTrack(idx);
            newLogs.push({
              type: "output",
              content: `▶ Selected Track #${Number(arg)}: ${playlist[idx].title} — ${playlist[idx].artist}`
            });
          } else if (arg === "gui" || arg === "open" || arg === "player") {
            setIsFullPlayerOpen(true);
            newLogs.push({
              type: "output",
              content: `Launching Zanophy Cyberpunk Music Deck... [Now Playing: ${currentTrack?.title || "3 AM Synthetics"} — ${currentTrack?.artist || "Zane"}]`
            });
          } else if (arg === "mood" || arg === "vibe") {
            handleCommand("mood");
            return;
          } else if (arg === "yt" || arg === "youtube" || arg === "playlist") {
            sound.playClick();
            const targetUrl = MOODS[mood].youtubeUrl;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
            newLogs.push({
              type: "output",
              content: `Dispatched ${MOODS[mood].name} YouTube Playlist in a new tab: ${targetUrl}`
            });
          } else {
            newLogs.push({
              type: "output",
              content: (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <p className="text-emerald-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      [ZANOPHY AUDIO DECK] {MOODS[mood].name.toUpperCase()} // {MOODS[mood].tagline}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openMoodMenu()}
                        className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold hover:bg-emerald-500/30"
                      >
                        MOOD: {mood.toUpperCase()}
                      </button>
                      <button
                        onClick={() => setIsFullPlayerOpen(true)}
                        className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold hover:bg-emerald-500/30"
                      >
                        EXPAND GUI
                      </button>
                    </div>
                  </div>
                  <div className="p-2 bg-black/60 rounded border border-emerald-500/20 text-[11px] space-y-1">
                    <p className="text-foreground/90 font-bold">Now Playing: <span className="text-emerald-400">{currentTrack?.title || "Nightcall"}</span></p>
                    <p className="text-muted-foreground">Artist: {currentTrack?.artist || "Kavinsky"}</p>
                    <p className="text-muted-foreground text-[10px]">Status: {isPlaying ? "▶ PLAYING" : "⏸ PAUSED"} · Mood: {MOODS[mood].name} ({playlist.length} tracks)</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => togglePlay()}
                      className="px-2.5 py-1 bg-emerald-500 text-black font-bold text-[10px] rounded hover:scale-105 active:scale-95 transition-transform"
                    >
                      {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
                    </button>
                    <button
                      onClick={() => nextTrack()}
                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] rounded hover:bg-emerald-500/30"
                    >
                      ⏭ NEXT
                    </button>
                    <button
                      onClick={() => openMoodMenu()}
                      className="px-2.5 py-1 bg-white/5 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] rounded hover:bg-white/10"
                    >
                      🎭 CHOOSE MOOD
                    </button>
                    <button
                      onClick={() => handleCommand("music list")}
                      className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 font-bold text-[10px] rounded hover:bg-emerald-500/20"
                    >
                      📜 TRACKS
                    </button>
                  </div>
                </div>
              )
            });
          }
          break;

        case "mood":
        case "vibes":
          if (arg === "random") {
            setMood("random");
            newLogs.push({
              type: "output",
              content: `🎲 Zanophy Mood switched to [RANDOM] — 3 AM Midnight Radio (13 Tracks loaded).`
            });
          } else if (arg === "jazz" || arg === "they are jazz" || arg === "theyarejazz") {
            setMood("jazz");
            newLogs.push({
              type: "output",
              content: `🎷 Zanophy Mood switched to [THEY ARE JAZZ] — Noir Sax & Midnight Smoke (6 Tracks loaded).`
            });
          } else if (arg === "gui" || arg === "open" || arg === "menu") {
            openMoodMenu();
            newLogs.push({
              type: "output",
              content: `Launching Zanophy Mood Selector Matrix...`
            });
          } else {
            openMoodMenu();
            newLogs.push({
              type: "output",
              content: (
                <div className="bg-black/60 border border-emerald-500/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
                  <pre className="text-[10px] text-emerald-400 font-bold leading-tight">
{`  ___  __   _  _  __  ____  _  _  _  _ 
 (__ \\/ _\\ ( \\( )/  \\(  _ \\( \\/ )/ )( \\
  / _/    \\/ /) (  O )) __/ )  / ) \\/ (
 (____\\_/\\_/\\_(_/ \\__/(__)  (__/  \\____/`}
                  </pre>
                  <p className="text-emerald-300 font-bold">=== ZANOPHY AUDIO FREQUENCY // CHOOSE MOOD ===</p>
                  <p className="text-muted-foreground text-[11px]">
                    Current active frequency: <span className="text-primary font-bold">{MOODS[mood].name.toUpperCase()}</span> ({MOODS[mood].tagline})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setMood("random");
                        handleCommand("mood random");
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        mood === "random"
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(29,185,84,0.3)]"
                          : "bg-white/5 border-emerald-500/20 hover:border-emerald-400/50 text-foreground"
                      }`}
                    >
                      <p className="font-bold flex items-center justify-between text-xs">
                        <span>🎲 1. RANDOM</span>
                        <span className="text-[10px] text-emerald-400 font-normal">13 Tracks</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">3 AM Midnight Radio (Phonk, Dream Pop, Sufi)</p>
                    </button>

                    <button
                      onClick={() => {
                        setMood("jazz");
                        handleCommand("mood jazz");
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        mood === "jazz"
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          : "bg-white/5 border-amber-500/20 hover:border-amber-400/50 text-foreground"
                      }`}
                    >
                      <p className="font-bold flex items-center justify-between text-xs">
                        <span>🎷 2. THEY ARE JAZZ</span>
                        <span className="text-[10px] text-amber-400 font-normal">6 Tracks</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Noir Sax & Midnight Smoke (We Are Jazz)</p>
                    </button>
                  </div>
                  <p className="text-[10px] text-primary/60 pt-1">
                    Usage: <span className="text-primary font-bold">mood [random | jazz | gui]</span> to switch audio frequency.
                  </p>
                </div>
              )
            });
          }
          break;

        case "playlist":
        case "ytplaylist":
        case "youtube": {
          const targetMood = (arg === "jazz" || arg === "they are jazz") ? "jazz" : (arg === "random" ? "random" : mood);
          const targetUrl = MOODS[targetMood].youtubeUrl;
          sound.playClick();
          window.open(targetUrl, "_blank", "noopener,noreferrer");
          newLogs.push({
            type: "output",
            content: (
              <div className={`border p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono ${
                targetMood === "jazz" ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`font-bold flex items-center gap-2 ${targetMood === "jazz" ? "text-amber-400" : "text-red-400"}`}>
                    <span className={`w-2 h-2 rounded-full animate-ping ${targetMood === "jazz" ? "bg-amber-400" : "bg-red-500"}`} />
                    [{targetMood === "jazz" ? "YOUTUBE MUSIC" : "YOUTUBE PLAYLIST"}] {MOODS[targetMood].name.toUpperCase()} // {MOODS[targetMood].tagline}
                  </p>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-2.5 py-1 text-white font-bold rounded text-[11px] flex items-center gap-1 transition-colors ${
                      targetMood === "jazz" ? "bg-amber-600 hover:bg-amber-500" : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    <span>OPEN PLAYLIST</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Direct stream link dispatched to browser: <span className="underline">{targetUrl}</span>
                </p>
                <div className="p-2 bg-black/60 rounded border border-white/10 text-[11px] text-foreground/80 flex flex-wrap items-center justify-between gap-2">
                  <p>{MOODS[targetMood].sub}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCommand("playlist random")}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                        targetMood === "random" ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" : "border-white/10 text-muted-foreground hover:text-white"
                      }`}
                    >
                      🎲 Random
                    </button>
                    <button
                      onClick={() => handleCommand("playlist jazz")}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                        targetMood === "jazz" ? "bg-amber-500/20 border-amber-400 text-amber-300" : "border-white/10 text-muted-foreground hover:text-white"
                      }`}
                    >
                      🎷 They are Jazz
                    </button>
                  </div>
                </div>
              </div>
            )
          });
          break;
        }

      case "help":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-1.5 my-2">
              <p className="text-primary font-bold mb-2">=== AVAILABLE ZANE_OS ROUTINES ===</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {terminalCommandsHelp.map(item => (
                  <div key={item.cmd} className="flex gap-2">
                    <span className="text-primary font-bold w-24 shrink-0">{item.cmd}</span>
                    <span className="text-muted-foreground text-[11px]">{item.desc}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <span className="text-primary font-bold w-24 shrink-0">persona</span>
                  <span className="text-muted-foreground text-[11px]">Switch persona: guest, friend, or operator</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold w-24 shrink-0">device</span>
                  <span className="text-muted-foreground text-[11px]">Query hardware telemetry (phone/desktop check)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold w-24 shrink-0">music</span>
                  <span className="text-muted-foreground text-[11px]">Zanophy player: play, pause, next, list, gui</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold w-24 shrink-0">playlist</span>
                  <span className="text-muted-foreground text-[11px]">Direct link to Zane's 3 AM YouTube playlist</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold w-24 shrink-0">clearance</span>
                  <span className="text-muted-foreground text-[11px]">Check Operator dossier declassification status</span>
                </div>
              </div>
            </div>
          )
        });
        break;

      case "whoami": {
        const isOp = persona === "operator";
        const opLocked = isOp && !clearance.identityUnlocked;
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl my-2 space-y-1 text-xs font-mono">
              <p><span className="text-primary font-bold">PROFILE:</span> [{persona.toUpperCase()}]</p>
              <p><span className="text-primary font-bold">OPERATOR:</span> {opLocked ? "████████ ████████ (OPERATOR_UNKNOWN)" : `${activeSpecs.realName} (${activeSpecs.handle})`}</p>
              <p><span className="text-primary font-bold">DESIGNATION:</span> {opLocked ? "[CLASSIFIED LEVEL 99 // ENCRYPTED]" : activeSpecs.role}</p>
              <p><span className="text-primary font-bold">STATUS:</span> {opLocked ? `CLASSIFIED BLACK-SITE // CLEARANCE LVL ${clearanceLevel}/3` : activeSpecs.status}</p>
              <p><span className="text-primary font-bold">BASE LOCATION:</span> {isOp && !clearance.hardwareUnlocked ? "GPS MASKED // TOR-HOP 3" : activeSpecs.location}</p>
              <p><span className="text-primary font-bold">MAINFRAME:</span> {isOp && !clearance.hardwareUnlocked ? "[EC MEMORY ENCRYPTED]" : activeSpecs.os}</p>
              {opLocked && (
                <p className="text-red-400 font-bold mt-2">&gt;&gt; IDENTITY REDACTED. Run 'clearance' or launch 'maze' to unmask dossier.</p>
              )}
            </div>
          )
        });
        break;
      }

      case "neofetch":
        newLogs.push({
          type: "output",
          content: renderNeofetch()
        });
        break;

      case "csi":
      case "radar":
        if (arg === "--gui" || arg === "gui" || cmd === "radar") {
          onClose();
          if (onOpenCsi) onOpenCsi();
          return;
        }
        sound.playBoot();
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  [CSI_RADAR v1.4] WI-FI SUBCARRIER PHASE SENSING
                </p>
                {onOpenCsi && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCsi();
                    }}
                    className="px-2.5 py-1 bg-primary text-background font-bold text-[10px] rounded hover:scale-105 active:scale-95 transition-transform"
                  >
                    LAUNCH RADAR GUI
                  </button>
                )}
              </div>
              <p className="text-muted-foreground text-[11px]">
                Extracting raw 802.11n/ac Channel State Information on <code>wlan0mon</code>...
              </p>
              <div className="p-2 bg-black/60 rounded border border-primary/20 text-primary/90 text-[11px] space-y-0.5">
                <p>• 64 OFDMA Subcarriers Normalized | SNR: 31.8 dB</p>
                <p>• Doppler Phase Velocity Shift: +3.8 Hz [MOTION DETECTED]</p>
                <p>• Presence Target Confidence: 99.1% (Single Subject at 2.1m)</p>
                <p>• Wall Penetration Attenuation: -4.2 dB [CLEAR SIGNAL]</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-primary/70">
                  Tip: run <code>csi --gui</code> to launch interactive oscilloscope CRT sweep
                </span>
                <a href="https://github.com/ZaneGoat/csi_project" target="_blank" rel="noopener noreferrer" className="underline font-bold text-primary text-[11px]">
                  [GITHUB REPO]
                </a>
              </div>
            </div>
          )
        });
        break;

      case "controler":
      case "gamepad":
        if (arg === "--investigate" || arg === "investigate") {
          sound.playSuccess();
          newLogs.push({
            type: "output",
            content: (
              <div className="bg-secondary/15 border-2 border-secondary/60 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-secondary font-bold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  [HID TELEMETRY DECRYPTED] CLASSIFIED SUBCARRIER EXPLOIT PAYLOAD
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Source: Controler-space Low-Latency USB/BT HID buffer dump
                </p>
                <div className="p-2.5 bg-black/80 rounded border border-secondary/40 text-secondary">
                  <span className="text-[10px] text-secondary/70 block uppercase font-bold">★ CTF FLAG #2 INTERCEPTED:</span>
                  <code className="text-secondary font-black text-sm select-all">ZANEX&#123;DARK_ONION_EXTRACTOR_99&#125;</code>
                </div>
                <p className="text-[10px] text-secondary/70">
                  Submit this flag in the CTF board via <code>ctf submit ZANEX&#123;...&#125;</code>
                </p>
              </div>
            )
          });
          break;
        }
        sound.playBoot();
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-secondary/10 border border-secondary/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <p className="text-secondary font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  [CONTROLER-SPACE v2.0] DUALSENSE & HID TELEMETRY SUITE
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleCommand("controler --investigate")}
                    className="px-2 py-1 bg-secondary/20 border border-secondary/40 text-secondary font-bold text-[10px] rounded hover:bg-secondary/30 transition-colors"
                  >
                    INVESTIGATE BUFFER
                  </button>
                </div>
              </div>
              <div className="p-2 bg-black/60 rounded border border-secondary/20 text-secondary/90 text-[11px] space-y-0.5">
                <p>• Polling Rate: 1000Hz (1.0ms sub-millisecond input lag)</p>
                <p>• Deadzone Matrix: Dynamic Exponential & S-Curve calibration</p>
                <p>• Trigger Haptics: DualSense L2/R2 adaptive resistance profiles</p>
                <p>• Driver Layer: Direct Linux evdev & raw HID report parser</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-secondary/70">
                  Tip: run <code>controler --investigate</code> or <code>cat .radio_secret</code>
                </span>
                <a href="https://github.com/ZaneGoat/Controler-space" target="_blank" rel="noopener noreferrer" className="underline font-bold text-secondary text-[11px]">
                  [GITHUB REPO]
                </a>
              </div>
            </div>
          )
        });
        break;

      case "threatmap":
      case "threats":
        newLogs.push({
          type: "output",
          content: "[i] ThreatMap module decommissioned. External threat data migrated to live GitHub repositories."
        });
        break;

      case "hardware":
      case "ec":
      case "megacenter":
        if (arg === "--gui" || arg === "gui" || arg === "--live" || cmd === "megacenter") {
          newLogs.push({
            type: "system",
            content: "[+] Launching ZaneMegaCenter Live EC Control Station..."
          });
          setTimeout(() => {
            onClose();
            if (onOpenMegaCenter) onOpenMegaCenter();
          }, 300);
          break;
        }
        sound.playBoot();
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  [ZANE_MEGA_CENTER] EMBEDDED CONTROLLER (EC) TELEMETRY
                </p>
                {onOpenMegaCenter && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMegaCenter();
                    }}
                    className="px-2.5 py-1 bg-primary text-background font-bold text-[10px] rounded hover:scale-105 active:scale-95 transition-transform"
                  >
                    LIVE EC STATION GUI
                  </button>
                )}
              </div>
              <div className="p-2 bg-black/60 rounded border border-primary/20 text-primary/90 text-[11px] space-y-0.5">
                <p>• Host Machine: MSI GF63 Thin (MS-16R5) [Dual-Boot Kali]</p>
                <p>• CPU Temp: 52°C | Fan 1: 4200 RPM (Custom Curve)</p>
                <p>• GPU Temp: 46°C | Fan 2: 3900 RPM (Active ISW Override)</p>
                <p>• EC Port 0x68/0x6C: Direct Register I/O Verified [NO STALLS]</p>
                <p>• Thermal Throttling: BYPASSED via Dynamic EC Governor</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-primary/70">
                  Tip: run <code>hardware --gui</code> to launch interactive fan tuner
                </span>
                <a href="https://github.com/ZaneGoat/ZaneMegaCenter" target="_blank" rel="noopener noreferrer" className="underline font-bold text-primary text-[11px]">
                  [GITHUB REPO]
                </a>
              </div>
            </div>
          )
        });
        break;

      case "ctf":
      case "bounty": {
        const flagCandidate = arg.startsWith("submit ") ? arg.replace("submit ", "").trim() : arg;
        if (["gui", "--gui", "board"].includes(flagCandidate)) {
          newLogs.push({
            type: "system",
            content: "[+] Launching Classified CTF Bounty Board..."
          });
          setTimeout(() => {
            onClose();
            if (onOpenCtf) onOpenCtf();
          }, 300);
          break;
        }
        if (flagCandidate) {
          const knownFlags: Record<string, string> = {
            "zanex{dom_inspector_root_42}": "Flag 1: Subtle Inspector (+100 pts)",
            "zanex{dark_onion_extractor_99}": "Flag 2: Subcarrier RF Leak Vault (+250 pts)",
            "zanex{hex_breach_buffer_master}": "Flag 3: ICE Breaker Protocol (+500 pts)"
          };
          const key = flagCandidate.toLowerCase();
          if (knownFlags[key]) {
            sound.playSuccess();
            try {
              const current = JSON.parse(localStorage.getItem("zanex_ctf_solved") || "[]");
              const flagId = key.includes("dom") ? "flag1" : key.includes("onion") ? "flag2" : "flag3";
              if (!current.includes(flagId)) {
                localStorage.setItem("zanex_ctf_solved", JSON.stringify([...current, flagId]));
              }
            } catch {}
            newLogs.push({
              type: "output",
              content: (
                <div className="bg-emerald-500/15 border border-emerald-500/40 p-3 rounded-xl text-emerald-400 font-mono text-xs my-1 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    [FLAG ACCEPTED // AUTHORIZATION GRANTED]
                  </p>
                  <p>{knownFlags[key]}</p>
                  <p className="text-[10px] text-emerald-400/70">Type 'ctf' to view bounty board status.</p>
                </div>
              )
            });
          } else {
            sound.playError();
            newLogs.push({
              type: "error",
              content: `CTF Error: Flag '${flagCandidate}' is INVALID. Access denied.`
            });
          }
        } else {
          sound.playBoot();
          let solvedFlags: string[] = [];
          try {
            solvedFlags = JSON.parse(localStorage.getItem("zanex_ctf_solved") || "[]");
          } catch {}
          newLogs.push({
            type: "output",
            content: (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <p className="text-yellow-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    [CLASSIFIED CTF BOUNTY MATRIX]
                  </p>
                  {onOpenCtf && (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenCtf) onOpenCtf();
                      }}
                      className="px-2.5 py-1 bg-yellow-500 text-black font-bold text-[10px] rounded hover:scale-105 active:scale-95 transition-transform"
                    >
                      OPEN FULL BOUNTY GUI
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-[11px] text-yellow-300/90 p-2 bg-black/60 rounded border border-yellow-500/20">
                  <p>• Challenge 01 (DOM Recon): {solvedFlags.includes("flag1") ? "✔ SOLVED (+100 pts)" : "🔒 LOCKED (inspect robots.txt / DOM)"}</p>
                  <p>• Challenge 02 (Subcarrier RF Leak): {solvedFlags.includes("flag2") ? "✔ SOLVED (+250 pts)" : "🔒 LOCKED (investigate Controler buffer)"}</p>
                  <p>• Challenge 03 (ICE Hex Breaker): {solvedFlags.includes("flag3") ? "✔ SOLVED (+500 pts)" : "🔒 LOCKED (breach Arasaka subnet)"}</p>
                </div>
                <p className="text-[10px] text-yellow-400/70">
                  Tip: submit flags via <code>ctf submit ZANEX&#123;...&#125;</code> or run <code>ctf gui</code>
                </p>
              </div>
            )
          });
        }
        break;
      }

      case "curl":
        if (arg.includes("robots") || arg.includes("robot")) {
          sound.playBoot();
          newLogs.push({
            type: "output",
            content: (
              <pre className="text-primary text-xs font-mono my-2 bg-black/60 p-3 rounded-lg border border-primary/20">
{`HTTP/2 200 OK
content-type: text/plain

User-agent: *
Allow: /

# [ZANEX CTF TARGET 01 // ROBOTS RECON]
# Disallow: /secret-classified-vault/
# FLAG_01: ZANEX{DOM_INSPECTOR_ROOT_42}`}
              </pre>
            )
          });
        } else {
          newLogs.push({
            type: "output",
            content: `curl: (28) Resolving host '${arg || "target"}'... Connection timed out or blocked by firewall.`
          });
        }
        break;

      case "fortune":
      case "quote":
        const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        newLogs.push({
          type: "output",
          content: <p className="italic text-primary/90 my-2">"{quote}"</p>
        });
        break;

      case "cowsay":
        const cowMsg = arg || "ZaneOS: Breaking Things & Fixing Them!";
        const borderLine = "-".repeat(cowMsg.length + 2);
        newLogs.push({
          type: "output",
          content: (
            <pre className="text-primary text-xs leading-none my-2 font-mono">
{`  ${borderLine}
< ${cowMsg} >
  ${borderLine}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
            </pre>
          )
        });
        break;

      case "ping":
        const targetHost = arg || "kali.box";
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-0.5 my-1 text-xs font-mono text-primary/90">
              <p>PING {targetHost} (127.0.0.1) 56(84) bytes of data.</p>
              <p>64 bytes from {targetHost}: icmp_seq=1 ttl=64 time=0.042 ms</p>
              <p>64 bytes from {targetHost}: icmp_seq=2 ttl=64 time=0.038 ms</p>
              <p>64 bytes from {targetHost}: icmp_seq=3 ttl=64 time=0.045 ms</p>
              <p>--- {targetHost} ping statistics: 3 packets transmitted, 0% packet loss ---</p>
            </div>
          )
        });
        break;

      case "skills":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-3 my-2">
              {skillsData.map(cat => (
                <div key={cat.title} className="border-l-2 border-primary/40 pl-3">
                  <p className="text-primary font-bold text-sm">{cat.title}</p>
                  <p className="text-muted-foreground text-xs mb-1">{cat.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map(s => (
                      <span key={s.name} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {s.name} ({s.tag})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        });
        break;

      case "projects":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-2 my-2">
              <p className="text-primary font-bold">=== DEPLOYED & ACTIVE REPOSITORIES ===</p>
              {projectsData.length === 0 ? (
                <div className="text-xs py-2 text-muted-foreground space-y-1">
                  <p>All production repositories are managed directly on Git:</p>
                  <a href="https://github.com/ZaneGoat" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold inline-block">
                    https://github.com/ZaneGoat
                  </a>
                </div>
              ) : (
                projectsData.map(p => (
                  <div key={p.id} className="text-xs py-1.5 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                      <span>
                        <span className="text-primary font-bold">[{p.category}]</span>{" "}
                        <span className="text-foreground font-bold">{p.title}</span>
                      </span>
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-[11px] font-bold">
                          [GITHUB REPO]
                        </a>
                      )}
                    </div>
                    <p className="text-muted-foreground text-[11px]">{p.subtitle}</p>
                    <div className="text-[10px] text-primary/60 mt-0.5">
                      ID: <code>{p.id}</code> | inspect: <code>cat {p.id}</code> | open: <code>repo {p.id}</code>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        });
        break;

      case "cat":
        if (arg === ".radio_secret" || arg === ".controler_secret" || arg === "secret" || arg === "secret.txt" || arg === ".secret" || arg === ".robin_secret") {
          handleCommand("controler --investigate");
          return;
        }
        if (arg === "robots.txt" || arg === "/robots.txt") {
          handleCommand("curl /robots.txt");
          return;
        }
        const target = projectsData.find(p => p.id === arg || p.title.toLowerCase().includes(arg));
        if (target) {
          newLogs.push({
            type: "output",
            content: (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 my-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-primary font-bold text-sm">ARCHITECTURAL INSPECT: {target.title}</p>
                  {target.github && (
                    <a href={target.github} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs font-bold flex items-center gap-1">
                      <span>GITHUB</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-muted-foreground">{target.description}</p>
                <p className="text-primary font-bold mt-2">TECHNICAL HIGHLIGHTS:</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  {target.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )
          });
        } else {
          newLogs.push({
            type: "error",
            content: `cat: ${arg || "file"}: No such project file. Type 'projects' to list valid IDs.`
          });
        }
        break;

      case "repo":
        const repoTarget = projectsData.find(p => p.id === arg || p.title.toLowerCase().includes(arg));
        if (repoTarget && repoTarget.github) {
          window.open(repoTarget.github, "_blank");
          newLogs.push({
            type: "output",
            content: `Opening repository: ${repoTarget.github}...`
          });
        } else {
          newLogs.push({
            type: "error",
            content: `repo: ${arg || "id"}: Repository not found. Type 'projects' to see list.`
          });
        }
        break;

      case "theme":
        if (arg === "amber" || arg === "cyan") {
          document.documentElement.setAttribute("data-theme", arg);
          localStorage.setItem("zanex_theme", arg);
          sound.playSuccess();
          newLogs.push({ type: "output", content: `Theme updated to Cyberpunk ${arg.toUpperCase()}.` });
        } else if (arg === "emerald" || arg === "matrix" || arg === "default") {
          document.documentElement.removeAttribute("data-theme");
          localStorage.setItem("zanex_theme", "emerald");
          sound.playSuccess();
          newLogs.push({ type: "output", content: `Theme updated to Matrix EMERALD.` });
        } else {
          newLogs.push({ type: "error", content: "Usage: theme [emerald | amber | cyan]" });
        }
        break;

      case "breach":
      case "ice":
        newLogs.push({
          type: "system",
          content: "[+] Engaging Arasaka ICE Breaker subroutine..."
        });
        setTimeout(() => {
          onClose();
          if (onOpenBreach) onOpenBreach();
        }, 300);
        break;

      case "maze":
      case "arcane":
        newLogs.push({
          type: "system",
          content: "[i] 3D Arcane Realm decommissioned. New classified cyber gaming construct incoming..."
        });
        break;

      case "clearance":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-1.5 text-xs font-mono my-2 border-l-2 border-primary/50 pl-3">
              <p className="text-primary font-bold">=== OPERATOR CLASSIFIED CLEARANCE MATRIX ===</p>
              <p>Current Clearance: <strong className="text-primary">LEVEL {clearanceLevel} / 3</strong></p>
              <p>Node 01 (Recon Identity): {clearance.identityUnlocked ? <span className="text-emerald-400 font-bold">[DECLASSIFIED]</span> : <span className="text-red-400 font-bold">[REDACTED // LOCKED]</span>}</p>
              <p>Node 02 (Hardware Rig): {clearance.hardwareUnlocked ? <span className="text-emerald-400 font-bold">[DECLASSIFIED]</span> : <span className="text-red-400 font-bold">[REDACTED // LOCKED]</span>}</p>
              <p>Node 03 (Black-Ops Projects): {clearance.projectsUnlocked ? <span className="text-emerald-400 font-bold">[DECLASSIFIED]</span> : <span className="text-red-400 font-bold">[REDACTED // LOCKED]</span>}</p>
              <p className="text-muted-foreground mt-2">
                &gt; To declassify Node 03, enter the cipher 'OPERATOR' in Challenge 03 or Infiltration Modal.
              </p>
            </div>
          )
        });
        break;

      case "matrix":
      case "construct":
        newLogs.push({
          type: "system",
          content: "[+] Initializing full Matrix Construct takeover..."
        });
        setTimeout(() => {
          onClose();
          if (onOpenMatrixTakeover) onOpenMatrixTakeover();
        }, 300);
        break;

      case "shinigami":
      case "ryuk":
      case "deal":
        newLogs.push({
          type: "system",
          content: "[!] Shinigami realm boundary breached. Summoning Ryuk Eye Deal..."
        });
        setTimeout(() => {
          onClose();
          window.dispatchEvent(new CustomEvent("zanex:open-ryuk-deal"));
        }, 300);
        break;

      case "time":
      case "date":
        newLogs.push({
          type: "output",
          content: `Local Time (Morocco GMT+1): ${new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" })}`
        });
        break;

      case "history":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-0.5 text-xs text-primary/80 font-mono my-1">
              {history.map((h, i) => (
                <div key={i}>{i + 1}  {h}</div>
              ))}
            </div>
          )
        });
        break;

      case "clear":
        setLogs([]);
        setInput("");
        return;

      case "sudo":
        sound.playError();
        newLogs.push({
          type: "error",
          content: "Permission Denied: Incident will be reported to santa."
        });
        break;

      case "exit":
        onClose();
        return;

      default:
        sound.playError();
        newLogs.push({
          type: "error",
          content: `Command not recognized: '${trimmed}'. Type 'help' for manual.`
        });
    }

    setLogs(newLogs);
    setInput("");
  } catch (err) {
    console.error("Terminal execution error:", err);
    sound.playError();
    setLogs(prev => [
      ...prev,
      {
        type: "error",
        content: `[!] TERMINAL RUNTIME FAULT: ${err instanceof Error ? err.message : "Execution error"}. Type 'help' to recover.`
      }
    ]);
    setInput("");
  }
};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sound.playKeypress();
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInput(history[history.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[history.length - 1 - nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  const filteredModules = deckCategory === "all"
    ? DECK_MODULES
    : DECK_MODULES.filter(m => m.category === deckCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-background/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overscroll-contain"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={`bg-[#050816] border-2 border-primary/50 rounded-2xl shadow-[0_0_80px_hsl(var(--primary)/0.25)] flex flex-col font-mono overflow-hidden transition-all duration-300 overscroll-contain ${
              isMaximized ? "w-full h-full rounded-none" : "w-full max-w-4xl h-[92vh] sm:h-[85vh] max-h-[820px]"
            }`}
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <TerminalIcon className="w-4 h-4" />
                <span>ZANE_OS Shell :: Root v4.2 [Kali Linux Edition]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 hover:text-primary transition-colors text-primary/60"
                  title="Maximize"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-red-400 transition-colors text-primary/60"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2 text-xs md:text-sm custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className={log.type === "error" ? "text-red-400" : log.type === "input" ? "text-primary/90 font-bold" : "text-foreground/90"}>
                  {log.content}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Reorganized & Categorized Cyberdeck Selection Toolbar */}
            <div className="px-3 py-2 bg-primary/5 border-t border-primary/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary tracking-wider shrink-0">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>DECK SELECTION</span>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {DECK_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sound.playClick();
                        setDeckCategory(cat.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                        deckCategory === cat.id
                          ? "bg-primary text-background shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                          : "bg-primary/10 text-primary/70 hover:bg-primary/20 hover:text-primary"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Chips Horizontal Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
                {filteredModules.map(mod => {
                  const colorClass =
                    mod.category === "flagship"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400"
                      : mod.category === "ops"
                      ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400"
                      : mod.category === "system"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400"
                      : "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/25 hover:border-purple-400";

                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        sound.haptic(25);
                        handleCommand(mod.command);
                        setInput("");
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 transition-all border active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm ${colorClass}`}
                      title={mod.desc}
                    >
                      <span className="text-xs">{mod.icon}</span>
                      <span>{mod.label}</span>
                      <span className="text-[9px] opacity-75 font-mono px-1 py-0.2 rounded bg-black/40 border border-current">
                        {mod.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-black/50 border-t border-primary/20 flex items-center gap-2">
              <span className="text-primary font-bold text-xs shrink-0">{shellUser}:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type command (e.g. 'csi', 'controler', 'hardware', 'whoami', 'fortune', 'help')..."
                className="flex-1 bg-transparent text-primary text-xs md:text-sm outline-none font-mono placeholder:text-primary/30"
                autoFocus
              />
              <button
                onClick={() => handleCommand(input)}
                className="p-1.5 bg-primary text-background rounded hover:scale-105 active:scale-95 transition-all text-xs font-bold cursor-pointer"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
