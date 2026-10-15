import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { MatrixRain } from "@/components/MatrixRain";
import { FloatingParticles } from "@/components/FloatingParticles";
import { EasterEggs } from "@/components/EasterEggs";
import { Navigation } from "@/components/Navigation";
import { CyberdeckFAB } from "@/components/CyberdeckFAB";
import { BentoGrid } from "@/components/BentoGrid";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Philosophy } from "@/components/sections/Philosophy";
import { Games } from "@/components/sections/Games";
import { Contact } from "@/components/sections/Contact";

// Heavy overlays are split into their own chunks and only fetched the first time they're opened.
const TerminalOverlay = lazy(() => import("@/components/TerminalOverlay").then(m => ({ default: m.TerminalOverlay })));
const BreachProtocol = lazy(() => import("@/components/BreachProtocol").then(m => ({ default: m.BreachProtocol })));
const MatrixTakeover = lazy(() => import("@/components/MatrixTakeover").then(m => ({ default: m.MatrixTakeover })));

type Overlay = "terminal" | "breach" | "matrix";

const Index = () => {
  const [open, setOpen] = useState<Overlay | null>(null);
  // Once an overlay has been opened, keep it mounted so its exit animation and state survive.
  const [loaded, setLoaded] = useState<Record<Overlay, boolean>>({ terminal: false, breach: false, matrix: false });

  const show = useCallback((o: Overlay) => {
    setLoaded(prev => (prev[o] ? prev : { ...prev, [o]: true }));
    setOpen(o);
  }, []);
  const close = useCallback(() => setOpen(null), []);
  const openTerminal = useCallback(() => show("terminal"), [show]);
  const openBreach = useCallback(() => show("breach"), [show]);
  const openMatrix = useCallback(() => show("matrix"), [show]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("zanex_theme");
    if (savedTheme === "amber" || savedTheme === "cyan") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  // ` (backtick) toggles the terminal from anywhere, like a game console.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "`") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      setOpen(cur => (cur === "terminal" ? null : cur));
      if (open !== "terminal") openTerminal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openTerminal]);

  const matrixOpen = open === "matrix";

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-background">
      {/* Background FX — paused while the fullscreen construct owns the GPU */}
      {!matrixOpen && <MatrixRain />}
      {!matrixOpen && <FloatingParticles />}
      <div className="scanlines fixed inset-0 pointer-events-none z-10 opacity-30" />

      <EasterEggs onOpenTerminal={openTerminal} onOpenMatrixTakeover={openMatrix} />
      <Navigation onOpenTerminal={openTerminal} onOpenBreach={openBreach} />
      <CyberdeckFAB
        onOpenTerminal={openTerminal}
        onOpenBreach={openBreach}
        onOpenMatrixTakeover={openMatrix}
      />

      <main className="relative z-10 pt-16">
        <BentoGrid onOpenTerminal={openTerminal} onOpenBreach={openBreach} />
        <Projects />
        <Skills />
        <Philosophy />
        <Games onOpenBreach={openBreach} />
        <Contact />
      </main>

      <Suspense fallback={null}>
        {loaded.terminal && (
          <TerminalOverlay
            isOpen={open === "terminal"}
            onClose={close}
            onOpenBreach={openBreach}
            onOpenMatrixTakeover={openMatrix}
          />
        )}
        {loaded.breach && <BreachProtocol isOpen={open === "breach"} onClose={close} />}
        {loaded.matrix && <MatrixTakeover isOpen={matrixOpen} onClose={close} />}
      </Suspense>

      <footer className="py-10 border-t border-primary/20 relative z-10 bg-black/60 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-muted-foreground">
          <div>
            <p className="text-primary font-bold">ZANEX // ROOT CLEARANCE LEVEL 99</p>
            <p>&copy; {new Date().getFullYear()} Aziz Maaizate (Zane Goat)</p>
          </div>
          <p className="text-primary/60">
            Try{" "}
            <kbd
              onClick={openTerminal}
              className="px-1.5 py-0.5 border border-primary/40 rounded text-primary hover:border-primary hover:bg-primary/10 cursor-pointer transition-colors"
              title="Launch ZaneOS Shell"
            >
              `
            </kbd>{" "}
            for the shell ·{" "}
            <button
              onClick={openMatrix}
              className="text-primary/70 hover:text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-4 cursor-pointer transition-colors"
              title="Unleash Matrix Construct"
            >
              ↑↑↓↓←→←→BA (or Shake) for Matrix
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
