import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/portfolio";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-primary/20"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center relative">
          {/* Zane - Centered on mobile, left on desktop */}
          <motion.div
            className="text-2xl font-bold text-primary md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0"
            style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.6)" }}
            animate={{ textShadow: ["0 0 20px hsl(var(--primary) / 0.4)", "0 0 30px hsl(var(--primary) / 0.8)", "0 0 20px hsl(var(--primary) / 0.4)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Zane
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 ml-auto">
            {navLinks.map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
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

      {/* Floating Mobile Menu Button - Bottom Left */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="md:hidden fixed bottom-8 left-8 z-[60] bg-primary text-background p-4 rounded-full shadow-[0_0_30px_hsl(var(--primary)/0.5)] border-2 border-primary/20"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex items-center justify-start p-12"
          >
            <div className="flex flex-col gap-8">
              <div className="text-primary/20 text-xs font-mono uppercase tracking-[0.5em] mb-4">Navigation_Menu</div>
              {navLinks.map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-4xl font-black text-primary hover:text-primary/70 transition-colors flex items-center gap-4 group"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-sm font-mono text-primary/30 group-hover:text-primary transition-colors">0{i+1}</span>
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
