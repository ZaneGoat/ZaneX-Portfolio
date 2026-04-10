import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { contactLinks } from "@/data/portfolio";

export const Contact = () => {
  return (
    <section id="contact" className="py-32 relative z-10">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center mb-16 text-primary"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
        >
          Get In Touch 
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {contactLinks.map((contact, i) => {
            const Icon = contact.icon;
            const isInternal = contact.href.startsWith('/');
            
            const content = (
              <>
                <Icon className="w-6 h-6" />
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
                whileHover={{ scale: 1.1, rotate: 5 }}
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
