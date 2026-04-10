import { motion } from "framer-motion";

export const About = () => {
  return (
    <section id="about" className="py-32 relative z-10">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center mb-16 text-primary"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
        >
          Who's This Guy? 
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4 text-lg text-muted-foreground"
          >
            <p>Hey there its BatMan! I'm that person who looks at a website and wonders "I wonder what happens if I click this 47 times..." Spoiler alert: interesting things happen.</p>
            <p>I spend my time spectating or obseriving / hunting (wep bugs ,human bugs ,logical bugs syntax bugs , souls) even real bugs (not all of it ofc), and occasionally remembering to touch grass , i admire Music human creations and earth creatures . My idea of fun? Living, surviving, Enjoying Good and Bad </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="space-y-4 text-lg text-muted-foreground"
          >
            <p>
When I'm not observing systems or writing Python scripts that may or may not work, I'm exploring patterns—CTFs, attack surfaces, and the small details most people ignore. 
I don't just look for vulnerabilities, I look for what breaks, what bends, and what reveals itself under pressure.
</p>
<p>
My philosophy, if it matters: everything has flaws—code, logic, people.  
My mission: understand them, find them, and sometimes prove they exist (ethically, of course). Mybe im just a Moonsick 
</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
