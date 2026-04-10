import { motion } from "framer-motion";
import { Gamepad2, Trophy, Swords, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Games = () => {
  return (
    <section id="games" className="py-32 relative z-10 bg-primary/5">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block p-4 bg-primary/20 rounded-2xl mb-8 animate-bounce">
            <Gamepad2 className="w-16 h-16 text-primary" />
          </div>
          
          <h2 
            className="text-5xl md:text-6xl font-bold mb-8 text-primary uppercase tracking-tighter"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.5)" }}
          >
            if u want to play some games <br/> 
            <span className="text-destructive animate-pulse">WASTE UR TIME !!</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Why be productive when you can lose a game of chess? Click below to enter the arena and prove your intellectual superiority (or lack thereof).
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Chess Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-card border-2 border-primary/20 p-8 rounded-2xl backdrop-blur-sm flex flex-col items-center gap-6"
            >
              <Swords className="w-16 h-16 text-primary" />
              <h3 className="text-3xl font-black text-primary tracking-tighter uppercase">THE MIND ARENA</h3>
              <p className="text-muted-foreground flex-1">
                Why be productive when you can lose a game of chess? Challenge me directly and prove your intellectual superiority (or lack thereof).
              </p>
              <Button
                size="lg"
                asChild
                className="w-full bg-primary text-background font-black text-xl py-8 rounded-xl shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
              >
                <a href="https://www.chess.com/member/AzizXe" target="_blank" rel="noopener noreferrer">
                  PLAY CHESS NOW
                </a>
              </Button>
            </motion.div>

            {/* Maze Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-card border-2 border-destructive/20 p-8 rounded-2xl backdrop-blur-sm flex flex-col items-center gap-6"
            >
              <Zap className="w-16 h-16 text-destructive" />
              <h3 className="text-3xl font-black text-destructive tracking-tighter uppercase">CYBER LABYRINTH</h3>
              <p className="text-muted-foreground flex-1">
                Warning: Entering this digital maze may result in severe sanity loss and extreme frustration. It's built to break you. Don't say I didn't warn you.
              </p>
              <Button
                size="lg"
                asChild
                className="w-full bg-destructive text-background font-black text-xl py-8 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.4)]"
              >
                <a href="https://pranx.com/maze/" target="_blank" rel="noopener noreferrer">
                  ENTER AT OWN RISK
                </a>
              </Button>
            </motion.div>
          </div>

          <div className="mt-16 flex justify-center gap-12 text-primary/40">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-8 h-8" />
              <span className="text-xs font-bold uppercase tracking-widest">No Rewards</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Gamepad2 className="w-8 h-8" />
              <span className="text-xs font-bold uppercase tracking-widest">Pure Procrastination</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
    </section>
  );
};
