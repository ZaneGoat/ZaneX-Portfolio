import { Brain, Heart, Terminal, Zap, Coffee, ShieldAlert } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";

const defaultPrinciples = [
  {
    icon: Brain,
    title: "Solve the Real Problem",
    body: "Code is a tool. The actual job is understanding the workflow behind the ticket and building software people can rely on every day.",
  },
  {
    icon: Heart,
    title: "Security & Trust",
    body: "Good engineering protects the people using the system—clean data models, predictable failure modes, and honest security boundaries.",
  },
];

const friendPrinciples = [
  {
    icon: Zap,
    title: "The Puzzle Mindset",
    body: "Complex bugs are just state puzzles. Instead of guessing or brute-forcing, read the trace, isolate the register, and fix the root cause.",
  },
  {
    icon: Coffee,
    title: "Moroccan Mint Tea > Energy Drinks",
    body: "Energy drink crashes ruin deep focus. Slow-brewed Moroccan mint tea late at night keeps the mind steady through long debugging sessions.",
  },
];

export const Philosophy = () => {
  const { persona } = usePersona();
  const { clearance, clearanceLevel } = useOperatorClearance();

  if (persona === "friend") {
    return (
      <section id="philosophy" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
        <div className="container mx-auto px-3.5 sm:px-6">
          <SectionHeader
            index="02"
            kicker="Notes"
            title="Late-Night Engineering"
            subtitle="Debugging habits, Moroccan mint tea rituals, and keeping software simple."
          />

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 sm:gap-5 font-mono">
            {friendPrinciples.map(({ icon: Icon, title, body }) => (
              <div key={title} className="hud-card p-5 sm:p-7">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
              </div>
            ))}

            <div className="hud-card p-5 sm:p-7 relative overflow-hidden flex flex-col justify-center">
              <Terminal className="w-5 h-5 text-secondary mb-3" />
              <p className="text-sm sm:text-base font-bold text-foreground leading-snug">
                "Builds break and kernels panic. With patience, good music on Zanophy, and mint tea, we ship it cleaner than before."
              </p>
              <span className="text-[11px] text-muted-foreground mt-3">— Casablanca Lab Notes</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (persona === "operator") {
    return (
      <section id="philosophy" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
        <div className="container mx-auto px-3.5 sm:px-6">
          <SectionHeader
            index="02"
            kicker="Principles"
            title={clearance.projectsUnlocked ? "Engineering Principles" : "Engineering Principles [LOCKED]"}
            subtitle="Direct hardware verification, measurable latency, and defense-in-depth."
          />

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 sm:gap-5 font-mono">
            <div className="hud-card p-5 sm:p-7">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Verify Hardware State</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Exit code 0 is not proof that a system works. Read back the register, measure the response time, and verify under real load.
              </p>
            </div>

            <div className="hud-card p-5 sm:p-7">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Signal Over Noise</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Whether parsing 802.11 OFDM subcarriers or designing a PostgreSQL schema, clean math and simple architecture beat heavy abstractions.
              </p>
            </div>

            <div className="hud-card p-5 sm:p-7 relative overflow-hidden flex flex-col justify-center">
              <Terminal className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-bold text-foreground leading-snug">
                "A system is only as reliable as the assumptions of its builder. Question defaults, inspect the wire, and keep dependencies lean."
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

  return (
    <section id="philosophy" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
      <div className="container mx-auto px-3.5 sm:px-6">
        <SectionHeader
          index="02"
          kicker="Approach"
          title="How I Work"
          subtitle="Practical software architecture, clean databases, and reliable delivery."
        />

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 sm:gap-5">
          {defaultPrinciples.map(({ icon: Icon, title, body }) => (
            <div key={title} className="hud-card p-5 sm:p-7">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{body}</p>
            </div>
          ))}

          <div className="hud-card p-5 sm:p-7 relative overflow-hidden flex flex-col justify-center">
            <Terminal className="w-5 h-5 text-primary mb-3" />
            <p className="text-base font-bold text-foreground leading-snug">
              "Build clean, automate repetitive work, and ship software that holds up in production."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
