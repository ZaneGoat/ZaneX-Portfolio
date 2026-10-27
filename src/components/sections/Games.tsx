import { Swords, Zap, Play, Trophy, Gamepad2, Clock, Moon } from "lucide-react";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";

const MEDITATING_LOGO_SVG_PATH =
  "M 0,-75 C 16,-75 18,-62 16,-47 C 14,-35 6,-32 6,-27 C 6,-21 15,-22 24,-29 C 33,-36 44,-26 42,-14 C 40,-3 36,3 42,12 C 48,21 52,24 62,31 C 72,38 88,37 92,50 C 96,63 82,70 78,78 C 74,86 64,89 52,82 C 40,75 32,76 23,87 C 14,98 2,94 -1,84 C -4,74 3,66 12,62 C 21,58 34,66 38,60 C 42,54 27,48 16,44 C 8,40 4,32 0,32 C -4,32 -8,40 -16,44 C -27,48 -42,54 -38,60 C -34,66 -21,58 -12,62 C -3,66 4,74 1,84 C -2,94 -14,98 -23,87 C -32,76 -40,75 -52,82 C -64,89 -74,86 -78,78 C -82,70 -96,63 -92,50 C -88,37 -72,38 -62,31 C -52,24 -48,21 -42,12 C -36,3 -40,-3 -42,-14 C -44,-26 -33,-36 -24,-29 C -15,-22 -6,-21 -6,-27 C -6,-32 -14,-35 -16,-47 C -18,-62 -16,-75 0,-75 Z M 7,-8 C 7,-17 19,-18 25,-8 C 31,2 25,15 28,24 C 31,33 48,37 56,44 C 64,51 62,61 52,58 C 42,55 31,46 21,37 C 11,28 7,17 7,-8 Z M -7,-8 C -7,-17 -19,-18 -25,-8 C -31,2 -25,15 -28,24 C -31,33 -48,37 -56,44 C -64,51 -62,61 -52,58 C -42,55 -31,46 -21,37 C -11,28 -7,17 -7,-8 Z";

interface GamesProps {
  onOpenBreach?: () => void;
  onOpenCelestial?: () => void;
}

export const Games = ({ onOpenBreach, onOpenCelestial }: GamesProps) => (
  <section id="games" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-3.5 sm:px-6">
      <SectionHeader
        index="04"
        kicker="Interactive"
        title="Arena"
        subtitle="Play Breach Protocol, unwind in Celestial Zen night arcade, send a chess challenge, or check on the standalone game in production."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {/* 1 — Breach Protocol */}
        <div className="hud-card p-5 sm:p-7 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-secondary" /> 35s · 6-slot buffer
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight mb-2">
              Breach Protocol
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm font-mono leading-relaxed">
              Alternate rows and columns across a 5×5 hex matrix to match the target byte sequence before time runs out.
            </p>
          </div>
          <button
            onClick={() => { sound.playBoot(); onOpenBreach?.(); }}
            className="w-full flex items-center justify-center gap-2 bg-secondary text-background font-mono font-bold py-3 sm:py-3.5 rounded-lg hover:bg-secondary/90 active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> PLAY BREACH
          </button>
        </div>

        {/* 2 — Celestial Zen Night Mode Arcade */}
        <div className="hud-card p-5 sm:p-7 flex flex-col justify-between gap-6 border border-blue-300/20">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-blue-400/10 border border-blue-300/30 flex items-center justify-center">
                <svg viewBox="-100 -100 200 200" className="w-5 h-5 fill-blue-100">
                  <path fillRule="evenodd" d={MEDITATING_LOGO_SVG_PATH} />
                </svg>
              </div>
              <span className="font-mono text-[11px] text-blue-200/80 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-amber-200" /> 3 Modes · Night Sky
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight mb-2">
              Celestial Zen
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm font-mono leading-relaxed">
              Night-mode arcade with serene cosmic chimes: climb in Starlight Ascent, clear constellations in Lunar Breaker, or drift in Zero-G Flow.
            </p>
          </div>
          <button
            onClick={() => onOpenCelestial?.()}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-950 font-mono font-bold py-3 sm:py-3.5 rounded-lg hover:bg-blue-50 active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> PLAY CELESTIAL ZEN
          </button>
        </div>

        {/* 3 — Chess */}
        <div className="hud-card md:col-span-2 lg:col-span-1 p-5 sm:p-7 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Swords className="w-5 h-5" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">chess.com/AzizXe</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight mb-2">
              Rapid & Blitz Chess
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm font-mono leading-relaxed">
              Tactics, endgame calculation, and positional play. Send a correspondence or rapid challenge on Chess.com.
            </p>
          </div>
          <a
            href="https://www.chess.com/member/AzizXe"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-background font-mono font-bold py-3 sm:py-3.5 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Swords className="w-4 h-4" /> CHALLENGE ON CHESS.COM
          </a>
        </div>

        {/* 4 — Upcoming Standalone Game in Production */}
        <div className="hud-card md:col-span-2 lg:col-span-3 p-5 sm:p-8 border border-amber-500/30 font-mono">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/35 text-amber-300 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  In Production
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Long-term solo build
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 shrink-0" />
                <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
                  Standalone Game — Work in Progress
                </h3>
              </div>

              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                There is a full game currently in production behind the scenes. Building it properly from scratch will take real time—it will drop when it's ready, if I'm still alive by then.
              </p>
            </div>

            <div className="shrink-0 bg-black/55 border border-white/10 rounded-xl p-3.5 sm:p-4 space-y-1.5 text-xs md:min-w-[220px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="text-amber-300 font-bold">Active Dev</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Scope</span>
                <span className="text-foreground font-semibold">Full Standalone</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">ETA</span>
                <span className="text-foreground font-semibold">Takes time (if alive)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
