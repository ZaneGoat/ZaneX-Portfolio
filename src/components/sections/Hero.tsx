import { motion } from "framer-motion";
import { Shield, Code, Bug, Cpu, Lock, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingIcons = [Shield, Code, Bug, Cpu, Lock, Terminal];

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative pt-20">
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="animate-tilt"
        >
          <motion.h1
            className="text-7xl md:text-9xl font-bold mb-6 text-primary"
            style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.6)" }}
            animate={{ textShadow: ["0 0 30px hsl(var(--primary) / 0.5)", "0 0 50px hsl(var(--primary) / 0.9)", "0 0 30px hsl(var(--primary) / 0.5)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Zane Goat
          </motion.h1>
          <motion.p
            className="text-2xl md:text-3xl mb-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Just a normal creature living life and wasting it 🔐
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.8)] transition-all duration-300 hover:scale-110"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Let's Connect
            </Button>
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 pointer-events-none">
          {floatingIcons.map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/20"
              style={{ left: `${20 + (i * 15)}%`, top: `${30 + (i % 2) * 30}%` }}
              animate={{ y: [0, -30, 0], rotate: [0, 360], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
            >
              <Icon className="w-12 h-12 md:w-20 md:h-20" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
