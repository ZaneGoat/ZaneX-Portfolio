import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
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
const CsiRadarModal = lazy(() => import("@/components/CsiRadarModal").then(m => ({ default: m.CsiRadarModal })));
const CtfBountyBoard = lazy(() => import("@/components/CtfBountyBoard").then(m => ({ default: m.CtfBountyBoard })));
const RobinThreatMap = lazy(() => import("@/components/RobinThreatMap").then(m => ({ default: m.RobinThreatMap })));
const ZaneMegaCenterModal = lazy(() => import("@/components/ZaneMegaCenterModal").then(m => ({ default: m.ZaneMegaCenterModal })));
const ZanophyModal = lazy(() => import("@/components/ZanophyModal").then(m => ({ default: m.ZanophyModal })));
const ArcaneMazeModal = lazy(() => import("@/components/ArcaneMazeModal").then(m => ({ default: m.ArcaneMazeModal })));
const OperatorInfiltrationModal = lazy(() => import("@/components/OperatorInfiltrationModal").then(m => ({ default: m.OperatorInfiltrationModal })));

import { ZanophyMiniBar } from "@/components/ZanophyMiniBar";

type Overlay = "terminal" | "breach" | "matrix" | "csi" | "ctf" | "threatmap" | "megacenter" | "maze" | "infiltration";

const Index = () => {
  const { persona } = usePersona();
  const { clearance } = useOperatorClearance();
  const [open, setOpen] = useState<Overlay | null>(null);

  // Once an overlay has been opened, keep it mounted so its exit animation and state survive.
  const [loaded, setLoaded] = useState<Record<Overlay, boolean>>({
    terminal: false,
    breach: false,
    matrix: false,
    csi: false,
    ctf: false,
    threatmap: false,
    megacenter: false,
    maze: false,
    infiltration: false
  });

  const show = useCallback((o: Overlay) => {
    setLoaded(prev => (prev[o] ? prev : { ...prev, [o]: true }));
    setOpen(o);
  }, []);
  const close = useCallback(() => setOpen(null), []);

  const openTerminal = useCallback(() => show("terminal"), [show]);
  const openBreach = useCallback(() => show("breach"), [show]);
  const openMatrix = useCallback(() => show("matrix"), [show]);
  const openCsi = useCallback(() => show("csi"), [show]);
  const openCtf = useCallback(() => show("ctf"), [show]);
  const openThreatMap = useCallback(() => show("threatmap"), [show]);
  const openMegaCenter = useCallback(() => show("megacenter"), [show]);
  const openMaze = useCallback(() => show("maze"), [show]);
  const openInfiltration = useCallback(() => show("infiltration"), [show]);

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
      <Navigation
        onOpenTerminal={openTerminal}
        onOpenBreach={openBreach}
        onOpenCtf={openCtf}
        onOpenMaze={openMaze}
      />
      <CyberdeckFAB
        onOpenTerminal={openTerminal}
        onOpenBreach={openBreach}
        onOpenMatrixTakeover={openMatrix}
        onOpenCsi={openCsi}
        onOpenCtf={openCtf}
        onOpenThreatMap={openThreatMap}
        onOpenMegaCenter={openMegaCenter}
        onOpenMaze={openMaze}
      />

      <main className="relative z-10 pt-16">
        <BentoGrid
          onOpenTerminal={openTerminal}
          onOpenBreach={openBreach}
          onOpenCsi={openCsi}
          onOpenCtf={openCtf}
          onOpenThreatMap={openThreatMap}
          onOpenMegaCenter={openMegaCenter}
          onOpenMaze={openMaze}
          onOpenInfiltration={openInfiltration}
        />

        {/* Technical Showcase: Projects & Skills (Guest always; Operator only if Node 03 declassified; hidden for Friends) */}
        {(persona === "guest" || (persona === "operator" && clearance.projectsUnlocked)) && (
          <>
            <Projects
              onOpenCsi={openCsi}
              onOpenThreatMap={openThreatMap}
              onOpenMegaCenter={openMegaCenter}
            />
            <Skills />
          </>
        )}

        {/* Culture, Philosophy, Breach Protocol & Minigames */}
        <Philosophy />
        <Games onOpenBreach={openBreach} onOpenMaze={openMaze} />
        <Contact />
      </main>

      <Suspense fallback={null}>
        {loaded.terminal && (
          <TerminalOverlay
            isOpen={open === "terminal"}
            onClose={close}
            onOpenBreach={openBreach}
            onOpenMatrixTakeover={openMatrix}
            onOpenCsi={openCsi}
            onOpenCtf={openCtf}
            onOpenThreatMap={openThreatMap}
            onOpenMegaCenter={openMegaCenter}
            onOpenMaze={openMaze}
          />
        )}
        {loaded.breach && <BreachProtocol isOpen={open === "breach"} onClose={close} />}
        {loaded.matrix && <MatrixTakeover isOpen={matrixOpen} onClose={close} />}
        {loaded.csi && <CsiRadarModal isOpen={open === "csi"} onClose={close} />}
        {loaded.ctf && (
          <CtfBountyBoard
            isOpen={open === "ctf"}
            onClose={close}
            onOpenTerminal={openTerminal}
            onOpenBreach={openBreach}
          />
        )}
        {loaded.threatmap && (
          <RobinThreatMap
            isOpen={open === "threatmap"}
            onClose={close}
            onOpenTerminal={openTerminal}
          />
        )}
        {loaded.megacenter && (
          <ZaneMegaCenterModal
            isOpen={open === "megacenter"}
            onClose={close}
          />
        )}
        {loaded.maze && (
          <ArcaneMazeModal
            isOpen={open === "maze"}
            onClose={close}
          />
        )}
        {loaded.infiltration && (
          <OperatorInfiltrationModal
            isOpen={open === "infiltration"}
            onClose={close}
            onOpenMaze={openMaze}
          />
        )}
        <ZanophyModal />
      </Suspense>

      {/* Floating Background Music Player (Zanophy) */}
      <ZanophyMiniBar />

      <footer className="py-10 border-t border-primary/20 relative z-10 bg-black/60 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-muted-foreground">
          <div>
            <p className="text-primary font-bold">ZANEX // ROOT CLEARANCE LEVEL 99</p>
            <p>&copy; {new Date().getFullYear()} Aziz Maaizate (Zane Goat)</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-primary/70">
            <button
              onClick={openMaze}
              className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/40 hover:decoration-amber-400 underline-offset-4 cursor-pointer transition-colors"
              title="Launch 3D Arcane Maze Realm"
            >
              ✦ 3D Arcane Realm
            </button>
            <span>·</span>
            <button
              onClick={openCtf}
              className="text-yellow-400 hover:text-yellow-300 underline decoration-yellow-400/40 hover:decoration-yellow-400 underline-offset-4 cursor-pointer transition-colors"
              title="Open CTF Bounty Board"
            >
              ★ CTF: 3 Flags Hidden
            </button>
            <span>·</span>
            <p>
              Try{" "}
              <kbd
                onClick={openTerminal}
                className="px-1.5 py-0.5 border border-primary/40 rounded text-primary hover:border-primary hover:bg-primary/10 cursor-pointer transition-colors"
                title="Launch ZaneOS Shell"
              >
                `
              </kbd>{" "}
              for shell
            </p>
            <span>·</span>
            <button
              onClick={openMatrix}
              className="text-primary/70 hover:text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-4 cursor-pointer transition-colors"
              title="Unleash Matrix Construct"
            >
              Matrix (or Shake)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
