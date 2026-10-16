import { Swords, Zap, Play, Trophy, Sparkles, Compass, ShieldAlert } from "lucide-react";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";

interface GamesProps {
  onOpenBreach?: () => void;
  onOpenMaze?: () => void;
}

export const Games = ({ onOpenBreach, onOpenMaze }: GamesProps) => (
  <section id="games" className="py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-4 md:px-6">
      <SectionHeader
        index="04"
        kicker="Arena"
        title="Cyber Arena"
        subtitle="Procrastinate productively. 3D WebGL dungeon crawling, hex intrusion puzzles, and open chess."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {/* 1 — 3D Arcane Maze Explorer (Headline Feature) */}
        <div
          className="hud-card md:col-span-3 p-7 md:p-9 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-[#0c101a] via-[#060913] to-[#0c101a] shadow-[0_0_40px_rgba(245,158,11,0.2)]"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-xs text-amber-300/80 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span>3D WebGL RPG</span>
                  <span>•</span>
                  <span>Three.js Engine</span>
                  <span>•</span>
                  <span>Real-Time Synthesizer</span>
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-amber-300 uppercase tracking-tight font-serif">
                  Elder Catalyzer: Arcane Realm
                </h3>
              </div>
            </div>

            <p className="text-muted-foreground text-sm font-mono leading-relaxed mb-4">
              Procedural Gothic labyrinth with mossy stone vaulted corridors, dynamic circular radar minimap, full combat spell deck (<span className="text-cyan-300">Blink</span>, <span className="text-orange-400">Flame</span>, <span className="text-sky-300">Freeze</span>, <span className="text-amber-300">Shield</span>), and ancient runic wall ciphers.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-200/70">
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">WASD / Touch Joystick</span>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">1-4 Spells</span>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">Wall Cipher [E]</span>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">Cipher: 'ZANE' or 'OPERATOR'</span>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
            <button
              onClick={() => {
                sound.playBoot();
                onOpenMaze?.();
              }}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-mono font-black text-sm px-8 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer"
            >
              <Compass className="w-5 h-5" />
              ENTER ARCANE REALM (3D)
            </button>
            <span className="text-[11px] font-mono text-center text-muted-foreground">
              Runs in 60+ FPS hardware acceleration
            </span>
          </div>
        </div>

        {/* 2 — Breach Protocol */}
        <div className="hud-card p-7 md:p-9 flex flex-col justify-between gap-8 md:col-span-2" style={{ borderColor: "hsl(var(--secondary) / 0.35)" }}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-mono text-[11px] text-secondary/70 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" />35s · 6-slot buffer</span>
            </div>
            <h3 className="text-3xl font-black text-secondary uppercase tracking-tight mb-2">Breach Protocol</h3>
            <p className="text-muted-foreground text-sm font-mono leading-relaxed">
              Alternate rows and columns through a 5×5 hex matrix to inject the target sequence before the ICE resets.
            </p>
          </div>
          <button
            onClick={() => { sound.playBoot(); onOpenBreach?.(); }}
            className="w-full flex items-center justify-center gap-2 bg-secondary text-background font-mono font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" /> LAUNCH INTRUSION
          </button>
        </div>

        {/* 3 — Chess */}
        <div className="hud-card p-7 md:p-9 flex flex-col justify-between gap-8 md:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Swords className="w-6 h-6" />
              </div>
              <span className="font-mono text-[11px] text-primary/70">chess.com/AzizXe</span>
            </div>
            <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-2">The Mind Arena</h3>
            <p className="text-muted-foreground text-xs font-mono leading-relaxed">
              Tactics, pawn structure and positional pressure. Challenge me to an open game.
            </p>
          </div>
          <a
            href="https://www.chess.com/member/AzizXe"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-background font-mono font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-transform text-xs"
          >
            <Swords className="w-4 h-4" /> CHESS.COM
          </a>
        </div>
      </div>
    </div>
  </section>
);
