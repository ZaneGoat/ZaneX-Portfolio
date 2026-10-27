import { Mail, ArrowUpRight } from "lucide-react";
import { contactLinks } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";

export const Contact = () => (
  <section id="contact" className="py-24 relative z-10 cv-auto">
    <div className="container mx-auto px-4 md:px-6">
      <SectionHeader index="06" kicker="Comms" title="Get In Touch" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-5">
        {/* Primary CTA */}
        <div className="hud-card lg:col-span-3 p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <p className="font-mono text-xs text-primary/60 mb-4">&gt; open_channel --secure</p>
          <h3 className="text-3xl md:text-4xl font-black text-primary leading-tight mb-4">
            Need an ERP, an automation pipeline, or a second pair of eyes on your stack?
          </h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 max-w-xl">
            Available for ERP engineering, local-AI tooling, and custom systems work. Replies usually within a day.
          </p>
          <a
            href="mailto:azizmaaizat@outlook.com"
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-2 bg-primary text-background font-mono font-bold px-6 py-3.5 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
          >
            <Mail className="w-4 h-4" /> azizmaaizat@outlook.com
          </a>
        </div>

        {/* Link list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {contactLinks.map(contact => {
            const Icon = contact.icon;
            return (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="hud-card flex-1 flex items-center justify-between gap-4 px-6 py-5 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-mono">
                    <span className="block font-bold text-sm text-primary">{contact.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{contact.display}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary/50 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
