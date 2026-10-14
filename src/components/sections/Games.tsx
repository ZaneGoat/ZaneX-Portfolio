import { motion } from "framer-motion";
import { Gamepad2, Trophy, Swords, Zap, Play } from "lucide-react";
import { sound } from "@/lib/sound";

interface GamesProps {
  onOpenBreach?: () => void;
}

export const Games = ({ onOpenBreach }: GamesProps) => {
  return (
    <section id="games" className="py-24 relative z-10 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block p-4 bg-primary/20 rounded-2xl mb-6 animate-bounce">
            <Gamepad2 className="w-12 h-12 text-primary" />
          </div>
          
          <h2 
            className="text-4xl md:text-6xl font-black mb-4 text-primary uppercase tracking-tight"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.5)" }}
          >
            Cyber Arena & Minigames
          </h2>

          <p className="text-base text-muted-foreground mb-12 max-w-xl mx-auto font-mono">
            Procrastinate productively with custom security challenges and mind games.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* 1. Breach Protocol 2077 Minigame */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="bg-[#050816]/95 border-2 border-secondary/40 p-6 md:p-8 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-between gap-6 shadow-[0_0_30px_hsl(var(--secondary)/0.15)]"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                  <Zap className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-secondary tracking-tight uppercase">
                  BREACH PROTOCOL 2077
                </h3>
                <p className="text-muted-foreground text-xs font-mono leading-relaxed">
                  Cyberpunk-inspired hex buffer injection game. Match target memory sequences within 35 seconds to bypass ICE and unlock secret system badges.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playBoot();
                  if (onOpenBreach) onOpenBreach();
                }}
                className="w-full flex items-center justify-center gap-2 bg-secondary text-background font-mono font-bold text-base py-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_hsl(var(--secondary)/0.4)]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH INTRUSION</span>
              </button>
            </motion.div>

            {/* 2. Chess Arena */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="bg-[#050816]/95 border-2 border-primary/30 p-6 md:p-8 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-between gap-6 shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                  <Swords className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-primary tracking-tight uppercase">
                  THE MIND ARENA
                </h3>
                <p className="text-muted-foreground text-xs font-mono leading-relaxed">
                  Challenge me directly to an open game of Chess on Chess.com. Test tactical calculation, pawn structure defense, and positional strategy.
                </p>
              </div>

              <a
                href="https://www.chess.com/member/AzizXe"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-background font-mono font-bold text-base py-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
              >
                <Swords className="w-4 h-4" />
                <span>CHALLENGE ON CHESS.COM</span>
              </a>
            </motion.div>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-primary/40 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Full In-Browser Interactive Puzzles</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Zero Latency Play</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
