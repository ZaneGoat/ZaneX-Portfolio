import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D } from "@/components/3DCard";
import { projectsData, Project } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { SectionHeader } from "@/components/SectionHeader";
import { CheckCircle2, Github, ExternalLink, Radio, Globe, Wind } from "lucide-react";

interface ProjectsProps {
  onOpenCsi?: () => void;
  onOpenThreatMap?: () => void;
  onOpenMegaCenter?: () => void;
}

export const Projects = ({ onOpenCsi, onOpenThreatMap, onOpenMegaCenter }: ProjectsProps = {}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [clickCount, setClickCount] = useState(0);
  const [showJoke, setShowJoke] = useState(false);

  const categories = ["ALL", "ERP", "SECURITY", "SYSTEMS", "AI", "WEB"];

  const filteredProjects = filter === "ALL" 
    ? projectsData 
    : projectsData.filter(p => p.category.toUpperCase() === filter);

  const handleSeeMore = () => {
    sound.playClick();
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 3) {
      sound.playSuccess();
      setShowJoke(true);
      setTimeout(() => {
        setShowJoke(false);
        setClickCount(0);
      }, 3500);
    }
  };

  return (
    <section id="projects" className="py-24 relative z-10 cv-auto">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          index="01"
          kicker="Repositories"
          title="Engineering Showcase"
          subtitle="Enterprise ERPs, Wi-Fi CSI radar, dark-web OSINT and EC hardware tuning, pulled from github.com/ZaneGoat."
        />

        {/* Category Filter Pills */}
        <div className="max-w-7xl mx-auto mb-10 flex gap-2 overflow-x-auto no-scrollbar font-mono">
          {categories.map(cat => {
            const count = cat === "ALL" ? projectsData.length : projectsData.filter(p => p.category.toUpperCase() === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setFilter(cat);
                }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filter === cat
                    ? "bg-primary text-background"
                    : "bg-primary/10 text-primary/70 hover:text-primary border border-primary/20"
                }`}
              >
                {cat} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Project Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card3D>
                <div className="bg-[#050816]/90 border border-primary/20 rounded-2xl p-6 h-full backdrop-blur-xl flex flex-col justify-between hover:border-primary/60 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.1)] group">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-primary/15 text-primary border border-primary/30 rounded-md text-[11px] font-mono font-bold">
                        {project.category}
                      </span>
                      <span className="text-[11px] font-mono text-primary/60">
                        {project.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-primary group-hover:text-primary transition-colors mb-1">
                      {project.title}
                    </h3>
                    <p className="text-primary/70 text-xs font-mono font-semibold mb-3">
                      {project.subtitle}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Architecture Highlights */}
                    <div className="space-y-1.5 mb-6 bg-primary/5 p-3 rounded-xl border border-primary/10">
                      {project.highlights.slice(0, 2).map((h, j) => (
                        <div key={j} className="flex items-start gap-2 text-[11px] text-muted-foreground font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer: Tags & Direct GitHub Repo Link */}
                  <div className="pt-3 border-t border-primary/10 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-primary/10 text-primary/80 border border-primary/20 rounded text-[10px] font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {project.id === "csi_project" && onOpenCsi && (
                          <button
                            onClick={() => { sound.playBoot(); onOpenCsi(); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>LAUNCH RADAR</span>
                          </button>
                        )}
                        {project.id === "robin" && onOpenThreatMap && (
                          <button
                            onClick={() => { sound.playBoot(); onOpenThreatMap(); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>THREAT MAP</span>
                          </button>
                        )}
                        {project.id === "zanemegacenter" && onOpenMegaCenter && (
                          <button
                            onClick={() => { sound.playBoot(); onOpenMegaCenter(); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
                          >
                            <Wind className="w-3.5 h-3.5" />
                            <span>LIVE EC STATION</span>
                          </button>
                        )}
                      </div>

                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playClick()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>VIEW CODE</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>

        {/* Easter Egg Base Button */}
        <div className="text-center relative">
          <button
            onClick={handleSeeMore}
            className="border-2 border-primary/40 text-primary font-mono font-bold hover:bg-primary/10 px-8 py-4 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
          >
            Click to see more...
          </button>

          <AnimatePresence>
            {showJoke && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  top: typeof window !== "undefined" && window.innerWidth < 768 ? "50%" : "-70px",
                  left: "50%",
                  x: "-50%",
                  position: typeof window !== "undefined" && window.innerWidth < 768 ? "fixed" : "absolute"
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-primary text-background px-8 py-3.5 rounded-full font-mono font-black shadow-[0_0_50px_hsl(var(--primary)/0.8)] z-[10002] whitespace-nowrap text-base"
              >
                Just kidding! 😂 There's no more.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
