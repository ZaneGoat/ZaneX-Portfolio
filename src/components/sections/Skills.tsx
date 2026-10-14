import { motion } from "framer-motion";
import { skillsData } from "@/data/portfolio";
import { sound } from "@/lib/sound";

export const Skills = () => {
  return (
    <section id="skills" className="py-24 relative z-10 bg-primary/[0.02]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight mb-4"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
          >
            Technical Matrix
          </motion.h2>
          <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
            Categorized proficiencies across software architecture, local AI engineering, and systems security.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {skillsData.map((category, i) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => sound.playClick()}
                className="bg-[#050816]/90 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-primary/50 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.08)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{category.title}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{category.description}</p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {category.skills.map(skill => (
                    <div key={skill.name} className="space-y-1.5 font-mono">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-foreground font-bold">{skill.name}</span>
                        <span className="text-primary/70 text-[11px] bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {skill.tag}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
