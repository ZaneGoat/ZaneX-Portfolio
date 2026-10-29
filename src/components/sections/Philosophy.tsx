import { Brain, Heart, Terminal, Zap, Coffee, ShieldAlert, Music, Sparkles } from "lucide-react";
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
    icon: Heart,
    title: "Keep It Real & Genuine",
    body: "Life is too short for pretension, corporate masks, or gatekeeping. Treat people with warmth, listen deeply, and keep your circle honest and supportive.",
  },
  {
    icon: Coffee,
    title: "Moroccan Mint Tea > Energy Drinks",
    body: "Energy drink crashes ruin your body. Slow-brewed Moroccan mint tea in a real pot with fresh mint and sugar is pure comfort—sweet, hot, and keeps the conversation flowing until 3 AM.",
  },
  {
    icon: Music,
    title: "Music & Late-Night Talks",
    body: "The best ideas, funniest stories, and closest bonds always happen late at night when the noise fades, the playlist hits right, and you can just be yourself.",
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
            kicker="Vibe Check"
            title="Late-Night Thoughts & Tea Rituals"
            subtitle="No tech gatekeeping, no buzzwords. Just honest life thoughts, Moroccan mint tea, and late-night philosophy."
          />

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 font-mono">
            {friendPrinciples.map(({ icon: Icon, title, body }) => (
              <div key={title} className="hud-card p-5 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
                </div>
              </div>
            ))}

            <div className="hud-card p-5 sm:p-7 relative overflow-hidden flex flex-col justify-center border border-emerald-500/25 bg-emerald-500/[0.03]">
              <Sparkles className="w-5 h-5 text-emerald-400 mb-3" />
              <p className="text-sm sm:text-base font-bold text-foreground leading-snug">
                &quot;You don&apos;t need to know code to create something meaningful or have great ideas. Just stay curious, be kind, and enjoy the journey.&quot;
              </p>
              <span className="text-[11px] text-emerald-400/80 mt-3">— Late-Night Casablanca Thoughts</span>
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
