import { Swords, Zap, Play, Trophy } from "lucide-react";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";

interface GamesProps {
  onOpenBreach?: () => void;
}

export const Games = ({ onOpenBreach }: GamesProps) => (
  <section id="games" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-3.5 sm:px-6">
      <SectionHeader
        index="05"
        kicker="Interactive"
        title="Arena"
        subtitle="Take a quick break—solve a timed hex-buffer puzzle or send a chess challenge."
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
      </div>
    </div>
  </section>
);
