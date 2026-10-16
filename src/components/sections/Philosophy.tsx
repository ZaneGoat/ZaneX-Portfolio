import { Brain, Heart, Sparkles, Zap, Coffee, ShieldAlert } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";

const guestPrinciples = [
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

const friendPrinciples = [
  {
    icon: Zap,
    title: "The Breach Protocol Mindset",
    body: "Life is just a hex puzzle. You don't solve it by panicking or brute-forcing; you map the buffer, step sideways through the matrix, and slip past the ICE with patience.",
  },
  {
    icon: Coffee,
    title: "Moroccan Mint Tea > Energy Drinks",
    body: "Caffeine jitters ruin deep flow state. Slow-brewed Moroccan mint tea at 3 AM keeps the mind laser-focused for hours of low-level kernel tracing and arcade hacking.",
  },
];

export const Philosophy = () => {
  const { persona } = usePersona();
  const { clearance, clearanceLevel } = useOperatorClearance();

  if (persona === "friend") {
    return (
      <section id="philosophy" className="py-24 relative z-10 cv-auto">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            index="03"
            kicker="Homie Wisdom"
            title="Breach Protocol Philosophy"
            subtitle="The 3 AM hacker mindset, mint tea rituals, and why rules were made to be rewritten."
          />

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5 font-mono">
            {friendPrinciples.map(({ icon: Icon, title, body }) => (
              <div key={title} className="hud-card p-7 border-emerald-500/30 bg-emerald-950/10">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-emerald-400 mb-2">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
              </div>
            ))}

            <div className="hud-card p-7 relative overflow-hidden flex flex-col justify-center border-secondary/40 bg-secondary/10">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
              <Sparkles className="w-6 h-6 text-secondary mb-4 animate-pulse" />
              <p className="text-base font-bold text-secondary italic leading-snug">
                "Code breaks. Kernels panic. But with good friends, mint tea, and heavy beats on Zanophy, we build it ten times stronger."
              </p>
              <span className="text-[11px] text-muted-foreground mt-3">— 3 AM Lab Doctrine</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (persona === "operator") {
    return (
      <section id="philosophy" className="py-24 relative z-10 cv-auto">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            index="03"
            kicker="Doctrine"
            title={clearance.projectsUnlocked ? "Operational Doctrine" : "Operational Doctrine [ENCRYPTED]"}
            subtitle="Zero-trust methodologies, offensive verification, and hardware integrity."
          />

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5 font-mono">
            <div className="hud-card p-7 border-primary/40">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Zero-Trust Telemetry</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Exit code 0 and green notifications are not proof of execution. Hardware state readback and deterministic observation are the only truths.
              </p>
            </div>

            <div className="hud-card p-7 border-primary/40">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Subcarrier Awareness</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                RF environments perturb subcarrier phase. Every wireless packet is an ambient sensor; physical presence cannot be concealed from mathematics.
              </p>
            </div>

            <div className="hud-card p-7 relative overflow-hidden flex flex-col justify-center border-primary/40">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <Sparkles className="w-6 h-6 text-primary mb-4" />
              <p className="text-sm font-bold text-primary italic leading-snug">
                "A system is only as secure as the assumptions of its architect. Question every default, audit every register."
              </p>
              <span className="text-[11px] text-muted-foreground mt-3">
                Clearance: {clearanceLevel} / 3 Nodes Active
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default Guest philosophy
  return (
    <section id="philosophy" className="py-24 relative z-10 cv-auto">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader index="03" kicker="Mindset" title="Philosophy" subtitle="How I approach systems, security and the people who use them." />

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
          {guestPrinciples.map(({ icon: Icon, title, body }) => (
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
};
