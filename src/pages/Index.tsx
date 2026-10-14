import { useState, useEffect } from "react";
import { MatrixRain } from "@/components/MatrixRain";
import { FloatingParticles } from "@/components/FloatingParticles";
import { EasterEggs } from "@/components/EasterEggs";
import { Navigation } from "@/components/Navigation";
import { BentoGrid } from "@/components/BentoGrid";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Philosophy } from "@/components/sections/Philosophy";
import { Games } from "@/components/sections/Games";
import { Contact } from "@/components/sections/Contact";
import { TerminalOverlay } from "@/components/TerminalOverlay";
import { BreachProtocol } from "@/components/BreachProtocol";
import { MatrixTakeover } from "@/components/MatrixTakeover";

const Index = () => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isBreachOpen, setIsBreachOpen] = useState(false);
  const [isMatrixTakeoverOpen, setIsMatrixTakeoverOpen] = useState(false);

  useEffect(() => {
    // Restore saved theme on mount
    const savedTheme = localStorage.getItem("zanex_theme");
    if (savedTheme === "amber" || savedTheme === "cyan") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-background">
      {/* Background FX Layers (Paused during Fullscreen Takeover) */}
      {!isMatrixTakeoverOpen && <MatrixRain />}
      {!isMatrixTakeoverOpen && <FloatingParticles />}
      <div className="scanlines fixed inset-0 pointer-events-none z-10 opacity-30" />

      {/* Global Interactive Easter Eggs */}
      <EasterEggs 
        onOpenTerminal={() => setIsTerminalOpen(true)} 
        onOpenMatrixTakeover={() => setIsMatrixTakeoverOpen(true)}
      />

      {/* Navigation */}
      <Navigation
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenBreach={() => setIsBreachOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 pt-16">
        {/* Bento Grid Command Hub */}
        <BentoGrid
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onOpenBreach={() => setIsBreachOpen(true)}
        />

        {/* Featured Projects Grid */}
        <Projects />

        {/* Categorized Skills Matrix */}
        <Skills />

        {/* Cyber Arena & Minigames */}
        <Games onOpenBreach={() => setIsBreachOpen(true)} />

        {/* Philosophy */}
        <Philosophy />

        {/* Contact Links */}
        <Contact />
      </main>

      {/* Interactive Overlays */}
      <TerminalOverlay
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onOpenBreach={() => setIsBreachOpen(true)}
        onOpenMatrixTakeover={() => setIsMatrixTakeoverOpen(true)}
      />

      <BreachProtocol
        isOpen={isBreachOpen}
        onClose={() => setIsBreachOpen(false)}
      />

      <MatrixTakeover
        isOpen={isMatrixTakeoverOpen}
        onClose={() => setIsMatrixTakeoverOpen(false)}
      />

      {/* High-Tech Footer */}
      <footer className="py-12 border-t border-primary/20 relative z-10 backdrop-blur-md bg-black/40 font-mono text-xs">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-muted-foreground">
          <div>
            <p className="text-primary font-bold">ZANEX PORTFOLIO // ROOT CLEARANCE LEVEL 99</p>
            <p>&copy; {new Date().getFullYear()} Aziz Maaizate (Zane Goat). Engineered for high performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary/70">ALL SYSTEMS DEPLOYED & MONITORED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
