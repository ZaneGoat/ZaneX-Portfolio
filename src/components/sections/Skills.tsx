import { skillsData } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";

export const Skills = () => (
  <section id="skills" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-3.5 sm:px-6">
      <SectionHeader
        index="02"
        kicker="Capabilities"
        title="Technical Stack"
        subtitle="Core tools and languages used across production backends, data pipelines, and Linux hardware utilities."
      />

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5 max-w-7xl mx-auto">
        {skillsData.map(category => {
          const Icon = category.icon;
          return (
            <div key={category.title} className="hud-card p-5 sm:p-7">
              <div className="flex items-start gap-3.5 mb-4 pb-4 border-b border-white/[0.07]">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">{category.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{category.description}</p>
                </div>
              </div>

              <ul className="divide-y divide-white/[0.06] font-mono">
                {category.skills.map(skill => (
                  <li key={skill.name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-1.5 h-1.5 bg-primary shrink-0" />
                      <span className="text-xs sm:text-sm text-foreground font-semibold truncate">{skill.name}</span>
                    </div>
                    <span className="text-muted-foreground text-[10px] sm:text-[11px] bg-white/[0.04] px-2 py-0.5 rounded border border-white/10 shrink-0">
                      {skill.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
