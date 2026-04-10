import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D } from "@/components/3DCard";
import { projects } from "@/data/portfolio";
import { Button } from "@/components/ui/button";

export const Projects = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showJoke, setShowJoke] = useState(false);

  const handleSeeMore = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    
    if (nextCount >= 3) {
      setShowJoke(true);
      setTimeout(() => {
        setShowJoke(false);
        setClickCount(0);
      }, 3000);
    }
  };

  return (
    <section id="projects" className="py-32 relative z-10">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center mb-16 text-primary"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
        >
          Cool Stuff I've Done 
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card3D>
                <div className="bg-card border border-primary/20 rounded-lg overflow-hidden h-full backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3 text-primary">{project.title}</h3>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, j) => (
                        <span
                          key={j}
                          className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>

        <div className="text-center relative">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSeeMore}
            className="border-primary/50 text-primary hover:bg-primary/10 px-10 py-6 text-xl"
          >
            Click to see more...
          </Button>

          <AnimatePresence>
            {showJoke && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  // Centered on mobile viewport, but stays relative on desktop for better context
                  top: window.innerWidth < 768 ? "50%" : "-80px",
                  left: "50%",
                  x: "-50%",
                  position: window.innerWidth < 768 ? "fixed" : "absolute"
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-primary text-background px-8 py-4 rounded-full font-black shadow-[0_0_50px_hsl(var(--primary)/0.6)] z-[10002] whitespace-nowrap text-xl"
              >
                Just kidding! 😂 There's no more.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
