import { Swords, Zap, Play, Trophy, Sparkles } from "lucide-react";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";

interface GamesProps {
  onOpenBreach?: () => void;
}

export const Games = ({ onOpenBreach }: GamesProps) => (
  <section id="games" className="py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-4 md:px-6">
      <SectionHeader
        index="04"
        kicker="Arena"
        title="Cyber Arena"
        subtitle="Procrastinate productively. Hex intrusion puzzles, open chess, and upcoming cyber constructs."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* 1 — Breach Protocol */}
        <div className="hud-card p-7 md:p-9 flex flex-col justify-between gap-8" style={{ borderColor: "hsl(var(--secondary) / 0.35)" }}>
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
            className="w-full flex items-center justify-center gap-2 bg-secondary text-background font-mono font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> LAUNCH INTRUSION
          </button>
        </div>

        {/* 2 — Chess */}
        <div className="hud-card p-7 md:p-9 flex flex-col justify-between gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Swords className="w-6 h-6" />
              </div>
              <span className="font-mono text-[11px] text-primary/70">chess.com/AzizXe</span>
            </div>
            <h3 className="text-3xl font-black text-primary uppercase tracking-tight mb-2">The Mind Arena</h3>
            <p className="text-muted-foreground text-sm font-mono leading-relaxed">
              Tactics, pawn structure and positional pressure. Challenge me to an open game.
            </p>
          </div>
          <a
            href="https://www.chess.com/member/AzizXe"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-background font-mono font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-transform text-sm cursor-pointer"
          >
            <Swords className="w-4 h-4" /> CHESS.COM
          </a>
        </div>
      </div>
    </div>
  </section>
);
