import { Brain, Heart, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

const principles = [
  {
    icon: Brain,
    title: "Think Beyond the Code",
    body: "Code is a tool. The real job is understanding why we're typing in the first place, and solving the problem behind the ticket.",
  },
  {
    icon: Heart,
    title: "Humanity in Digital",
    body: "Automation handles the logic; people bring the ethics. Security isn't just firewalls. It's protecting people and their trust.",
  },
];

export const Philosophy = () => (
  <section id="philosophy" className="py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-4 md:px-6">
      <SectionHeader index="03" kicker="Mindset" title="Philosophy" subtitle="How I approach systems, security and the people who use them." />

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
        {principles.map(({ icon: Icon, title, body }) => (
          <div key={title} className="hud-card p-7">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
          </div>
        ))}

        <div className="hud-card p-7 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <Sparkles className="w-6 h-6 text-primary mb-4" />
          <p className="text-lg font-bold text-primary italic leading-snug">
            "Machines are built to follow rules. Humans are born to break them and create better ones."
          </p>
        </div>
      </div>
    </div>
  </section>
);
