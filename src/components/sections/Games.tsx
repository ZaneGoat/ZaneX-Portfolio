import { Swords, Zap, Play, Trophy, Gamepad2, Clock } from "lucide-react";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";

interface GamesProps {
  onOpenBreach?: () => void;
}

export const Games = ({ onOpenBreach }: GamesProps) => (
  <section id="games" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-3.5 sm:px-6">
      <SectionHeader
        index="04"
        kicker="Interactive"
        title="Arena"
        subtitle="Play a quick puzzle, send a chess challenge, or check on the standalone game currently in the works."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {/* 1 — Breach Protocol */}
        <div className="hud-card p-5 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-secondary" /> 35s · 6-slot buffer
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight mb-2">
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
            <Play className="w-4 h-4 fill-current" /> START PUZZLE
          </button>
        </div>

        {/* 2 — Chess */}
        <div className="hud-card p-5 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Swords className="w-5 h-5" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">chess.com/AzizXe</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight mb-2">
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

        {/* 3 — Upcoming Standalone Game in Production */}
        <div className="hud-card md:col-span-2 p-5 sm:p-8 border border-amber-500/30 font-mono">
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
