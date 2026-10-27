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
          About Aziz Maaizate
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4 text-lg text-muted-foreground"
          >
            <p>
              I am a Full-Stack &amp; Systems Engineer based in Casablanca, Morocco, building end-to-end software—from desktop and web ERP platforms (OptiGest, AyaResto, IPIRNET) to Linux hardware telemetry utilities and data automation pipelines.
            </p>
            <p>
              Whether it's designing clean ERD database schemas, writing Python backend services, or building responsive UIs, I focus on code quality, performance, and real-world business value.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="space-y-4 text-lg text-muted-foreground"
          >
            <p>
              I take pride in transforming raw requirements into robust, containerized applications (Docker) ready for cloud deployment (Vercel). I also hold a strong background in project specification ("Cahiers des charges"), digital marketing strategy, and visual communication.
            </p>
            <p>
              My philosophy: Build clean, automate the repetitive, and constantly innovate. Known online as <strong>Zane Goat</strong>.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
