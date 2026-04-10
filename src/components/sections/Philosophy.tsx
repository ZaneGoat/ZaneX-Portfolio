import { motion } from "framer-motion";
import { Brain, Heart, Zap, Sparkles } from "lucide-react";

export const Philosophy = () => {
  return (
    <section id="philosophy" className="py-32 relative z-10 bg-primary/5">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center mb-16 text-primary"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
        >
          My Philosophy
        </motion.h2>
        
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="p-4 bg-primary/20 rounded-full">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Think Beyond the Code</h3>
              <p className="text-muted-foreground text-lg">
                Coding is just a tool. Humans shouldn't just be "resource processors"—we should be problem solvers. 
                Our greatest strength isn't our ability to type, but our ability to understand *why* we are typing in the first place.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row-reverse gap-8 items-center text-right"
          >
            <div className="p-4 bg-primary/20 rounded-full text-right">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Humanity in Digital</h3>
              <p className="text-muted-foreground text-lg">
                In a world of automation and cold logic, humans should provide the empathy and ethics that machines can't. 
                Security isn't just about firewalls; it's about protecting people and their trust.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 border border-primary/20 rounded-2xl bg-card/50 backdrop-blur-sm text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-6 animate-pulse" />
            <p className="text-2xl font-bold text-primary italic">
              "Machines are built to follow rules. Humans are born to break them and create better ones."
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
