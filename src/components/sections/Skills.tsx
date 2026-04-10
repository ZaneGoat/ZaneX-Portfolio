import { motion } from "framer-motion";
import { Card3D } from "@/components/3DCard";
import { skills } from "@/data/portfolio";

export const Skills = () => {
  return (
    <section id="dev-skills" className="py-32 relative z-10">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center mb-16 text-primary"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
        >
          Dev Skills
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {skills.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card3D>
                  <div className="bg-card border border-primary/20 rounded-lg p-6 h-full backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                    <div className="text-primary mb-4 animate-glow-pulse">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-primary">{skill.title}</h3>
                    <ul className="space-y-2">
                      {skill.items.map((item, j) => (
                        <li key={j} className="text-muted-foreground flex items-start">
                          <span className="text-primary mr-2 font-bold">▹</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card3D>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
