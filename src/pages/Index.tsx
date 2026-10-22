import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { MatrixRain } from "@/components/MatrixRain";
import { FloatingParticles } from "@/components/FloatingParticles";
import { EasterEggs } from "@/components/EasterEggs";
import { Navigation } from "@/components/Navigation";
import { CyberdeckFAB } from "@/components/CyberdeckFAB";
import { BentoGrid } from "@/components/BentoGrid";
import { AsciiIntroOverlay } from "@/components/AsciiIntroOverlay";
import { LiveRepositories } from "@/components/sections/LiveRepositories";
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
const ZaneMegaCenterModal = lazy(() => import("@/components/ZaneMegaCenterModal").then(m => ({ default: m.ZaneMegaCenterModal })));
const ZanophyModal = lazy(() => import("@/components/ZanophyModal").then(m => ({ default: m.ZanophyModal })));
const OperatorInfiltrationModal = lazy(() => import("@/components/OperatorInfiltrationModal").then(m => ({ default: m.OperatorInfiltrationModal })));

import { ZanophyMiniBar } from "@/components/ZanophyMiniBar";

type Overlay = "terminal" | "breach" | "matrix" | "csi" | "ctf" | "megacenter" | "infiltration";

const Index = () => {
  const { persona } = usePersona();
  const { clearance } = useOperatorClearance();
  const [open, setOpen] = useState<Overlay | null>(null);
  const [introOpen, setIntroOpen] = useState<boolean>(true);
  const handleIntroComplete = useCallback(() => setIntroOpen(false), []);
  const replayIntro = useCallback(() => setIntroOpen(true), []);

  // Once an overlay has been opened, keep it mounted so its exit animation and state survive.
  const [loaded, setLoaded] = useState<Record<Overlay, boolean>>({
    terminal: false,
    breach: false,
    matrix: false,
    csi: false,
    ctf: false,
    megacenter: false,
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
  const openMegaCenter = useCallback(() => show("megacenter"), [show]);
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
  const canvasOverlayActive = matrixOpen || introOpen;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-background">
      {/* Procedural RGB ASCII Art Intro Animation before entering Index */}
      <AsciiIntroOverlay isOpen={introOpen} onComplete={handleIntroComplete} />

      {/* Background FX — paused while a fullscreen construct owns the GPU */}
      {!canvasOverlayActive && <MatrixRain />}
      {!canvasOverlayActive && <FloatingParticles />}
      <div className="scanlines fixed inset-0 pointer-events-none z-10 opacity-30" />

      <EasterEggs onOpenTerminal={openTerminal} onOpenMatrixTakeover={openMatrix} />
      <Navigation
        onOpenTerminal={openTerminal}
        onOpenBreach={openBreach}
        onOpenCtf={openCtf}
        onReplayIntro={replayIntro}
      />
      <CyberdeckFAB
        onOpenTerminal={openTerminal}
        onOpenBreach={openBreach}
        onOpenMatrixTakeover={openMatrix}
        onOpenCsi={openCsi}
        onOpenCtf={openCtf}
        onOpenMegaCenter={openMegaCenter}
      />

      <main className="relative z-10 pt-16">
        <BentoGrid
          onOpenTerminal={openTerminal}
          onOpenBreach={openBreach}
          onOpenCsi={openCsi}
          onOpenCtf={openCtf}
          onOpenMegaCenter={openMegaCenter}
          onOpenInfiltration={openInfiltration}
        />

        {/* Technical Showcase: Live Git Repositories & Tech Matrix (Operator mode; hidden for Friends who see the Lounge) */}
        {persona !== "friend" && (
          <>
            <LiveRepositories />
            <Skills />
          </>
        )}

        {/* Culture, Philosophy, Breach Protocol & Minigames */}
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
            onOpenCsi={openCsi}
            onOpenCtf={openCtf}
            onOpenMegaCenter={openMegaCenter}
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
        {loaded.megacenter && (
          <ZaneMegaCenterModal
            isOpen={open === "megacenter"}
            onClose={close}
          />
        )}
        {loaded.infiltration && (
          <OperatorInfiltrationModal
            isOpen={open === "infiltration"}
            onClose={close}
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
              onClick={replayIntro}
              className="text-rose-400 hover:text-rose-300 underline decoration-rose-400/40 hover:decoration-rose-400 underline-offset-4 cursor-pointer transition-colors"
              title="Replay Procedural RGB ASCII Art Intro"
            >
              ◉ Replay ASCII Intro
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
