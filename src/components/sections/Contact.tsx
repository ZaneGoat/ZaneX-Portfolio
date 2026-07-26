import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { contactLinks } from "@/data/portfolio";
import { ExternalLink, Sparkles, Radio } from "lucide-react";

export const Contact = () => {
  const liveLink = contactLinks.find(c => c.label.includes("Live") || c.href.includes("ngrok"));
  const otherLinks = contactLinks.filter(c => c !== liveLink);

  return (
    <section id="contact" className="py-32 relative z-10">
      <div className="container mx-auto px-6">
        
        {/* Curated Interactive Live Banner */}
        {liveLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-20 relative group"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse" />

            <div className="relative p-8 md:p-12 bg-background/90 border-2 border-primary/60 rounded-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_60px_hsl(var(--primary)/0.4)]">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-xs font-bold text-primary tracking-wider uppercase">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
                  <span>Live Deployed Ecosystem Active</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                  Explore All Live Projects Interactive
                </h3>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                  Step inside the live sandbox—test ERP systems, AI pipelines, and custom web applications in real-time.
                </p>
              </div>

              <motion.a
                href={liveLink.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="shrink-0 group/btn relative px-8 py-5 bg-gradient-to-r from-primary via-blue-600 to-cyan-500 text-white font-extrabold text-lg md:text-xl rounded-xl shadow-[0_0_40px_rgba(2,132,199,0.8)] hover:shadow-[0_0_80px_rgba(2,132,199,1)] transition-all flex items-center gap-3 overflow-hidden"
              >
                <Sparkles className="w-6 h-6 animate-spin text-yellow-300" style={{ animationDuration: '4s' }} />
                <span>ENTER LIVE PORTFOLIO</span>
                <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              </motion.a>
            </div>
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 text-primary"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
        >
          Direct Links & Contact
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {otherLinks.map((contact, i) => {
            const Icon = contact.icon;
            const isInternal = contact.href.startsWith('/');
            
            const content = (
              <>
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{contact.label}</span>
              </>
            );

            const className = "flex items-center gap-3 px-6 py-4 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.08 }}
              >
                {isInternal ? (
                  <Link to={contact.href} className={className}>
                    {content}
                  </Link>
                ) : (
                  <a href={contact.href} target="_blank" rel="noopener noreferrer" className={className}>
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
