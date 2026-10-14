import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { contactLinks } from "@/data/portfolio";
import { sound } from "@/lib/sound";

export const Contact = () => {
  return (
    <section id="contact" className="py-24 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight mb-4"
            style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
          >
            Direct Comms & Network
          </motion.h2>
          <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
            Available for enterprise ERP engineering, agentic AI pipelines, and custom software systems.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-4xl mx-auto font-mono">
          {contactLinks.map((contact, i) => {
            const Icon = contact.icon;
            const isInternal = contact.href.startsWith("/");

            const content = (
              <>
                <Icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="block font-bold text-sm text-primary">{contact.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{contact.display}</span>
                </div>
              </>
            );

            const className = "flex items-center gap-3 px-6 py-4 bg-[#050816]/90 border border-primary/30 rounded-xl text-primary hover:border-primary hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.1)]";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                {isInternal ? (
                  <Link to={contact.href} onClick={() => sound.playClick()} className={className}>
                    {content}
                  </Link>
                ) : (
                  <a
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className={className}
                  >
                    {content}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
