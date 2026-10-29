import { Mail, ArrowUpRight } from "lucide-react";
import { contactLinks } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";
import { usePersona } from "@/context/PersonaContext";

export const Contact = () => {
  const { persona } = usePersona();
  const isFriend = persona === "friend";

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-24 relative z-10 cv-auto">
      <div className="container mx-auto px-3.5 sm:px-6">
        <SectionHeader
          index="05"
          kicker={isFriend ? "Homie Inbox" : "Contact"}
          title={isFriend ? "Say Hey to Zane" : "Get In Touch"}
          subtitle={
            isFriend
              ? "Always down to talk music, gaming, cool ideas, or just catch up over tea."
              : undefined
          }
        />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-4 sm:gap-5">
          {/* Primary CTA */}
          <div className="hud-card lg:col-span-3 p-5 sm:p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs text-primary mb-3">
                {isFriend ? "Direct Message" : "Direct Inquiry"}
              </p>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground leading-snug mb-3 sm:mb-4">
                {isFriend
                  ? "Got a crazy idea, gaming rec, or just want to say hi?"
                  : "Need custom ERP software, backend automation, or a second pair of eyes on your system?"}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8 max-w-xl">
                {isFriend
                  ? "Zero corporate talk or sales pressure. My inbox is always open for friends—drop a note anytime."
                  : "Available for monthly engineering retainers and scoped software builds. Direct replies within 24 hours."}
              </p>
            </div>
            <div>
              <a
                href={
                  isFriend
                    ? "mailto:azizmaaizat@outlook.com?subject=Hey%20Zane!"
                    : "mailto:azizmaaizat@outlook.com"
                }
                onClick={() => sound.playClick()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-background font-mono font-bold px-5 py-3 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all text-xs sm:text-sm"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {isFriend ? "Say Hey: azizmaaizat@outlook.com" : "azizmaaizat@outlook.com"}
                </span>
              </a>
            </div>
          </div>

        {/* Link list */}
        <div className="lg:col-span-2 flex flex-col gap-2.5 sm:gap-3">
          {contactLinks.map(contact => {
            const Icon = contact.icon;
            return (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="hud-card flex-1 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="font-mono min-w-0">
                    <span className="block font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                      {contact.label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      {contact.display}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  </section>
  );
};
