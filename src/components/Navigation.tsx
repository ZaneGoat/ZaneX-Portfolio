import { motion } from "framer-motion";
import { navLinks } from "@/data/portfolio";

export const Navigation = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-primary/20"
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          className="text-2xl font-bold text-primary"
          style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.6)" }}
          animate={{ textShadow: ["0 0 20px hsl(var(--primary) / 0.4)", "0 0 30px hsl(var(--primary) / 0.8)", "0 0 20px hsl(var(--primary) / 0.4)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Zane
        </motion.div>
        <div className="hidden md:flex gap-8">
          {navLinks.map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-foreground/80 hover:text-primary transition-colors relative group"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};
