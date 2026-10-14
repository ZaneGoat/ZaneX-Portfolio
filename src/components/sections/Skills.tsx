import { skillsData } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";

export const Skills = () => (
  <section id="skills" className="py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-4 md:px-6">
      <SectionHeader
        index="02"
        kicker="Capabilities"
        title="Technical Matrix"
        subtitle="Proficiencies across software architecture, local AI engineering and low-level systems work."
      />

      <div className="grid md:grid-cols-2 gap-5 max-w-7xl mx-auto">
        {skillsData.map(category => {
          const Icon = category.icon;
          return (
            <div key={category.title} className="hud-card p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{category.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{category.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {category.skills.map(skill => (
                  <div key={skill.name} className="font-mono">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-foreground font-bold">{skill.name}</span>
                      <span className="text-primary/70 text-[10px] bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {skill.tag}
                      </span>
                    </div>
                    {/* Static width + CSS transform: no per-bar JS animation observers */}
                    <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
