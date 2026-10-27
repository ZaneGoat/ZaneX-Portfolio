import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { useUniverseTheme } from "@/context/ThemeContext";
import { MatrixRain } from "@/components/MatrixRain";
import { MatrixWatchingEye } from "@/components/MatrixWatchingEye";
import { FloatingParticles } from "@/components/FloatingParticles";
import { ExistenceAsciiCanvas } from "@/components/ExistenceAsciiCanvas";
import { ExistenceWorld } from "@/components/ExistenceWorld";
import { EasterEggs } from "@/components/EasterEggs";
import { Navigation } from "@/components/Navigation";
import { CyberdeckFAB } from "@/components/CyberdeckFAB";
import { BentoGrid } from "@/components/BentoGrid";
import { AsciiIntroOverlay } from "@/components/AsciiIntroOverlay";
import { LiveRepositories } from "@/components/sections/LiveRepositories";
import { Philosophy } from "@/components/sections/Philosophy";
import { Pricing } from "@/components/sections/Pricing";
import { Games } from "@/components/sections/Games";
import { Contact } from "@/components/sections/Contact";

// Heavy overlays are split into their own chunks and only fetched the first time they're opened.
const TerminalOverlay = lazy(() => import("@/components/TerminalOverlay").then(m => ({ default: m.TerminalOverlay })));
const BreachProtocol = lazy(() => import("@/components/BreachProtocol").then(m => ({ default: m.BreachProtocol })));
const CelestialZenModal = lazy(() => import("@/components/CelestialZenModal").then(m => ({ default: m.CelestialZenModal })));
const MatrixTakeover = lazy(() => import("@/components/MatrixTakeover").then(m => ({ default: m.MatrixTakeover })));
const CsiRadarModal = lazy(() => import("@/components/CsiRadarModal").then(m => ({ default: m.CsiRadarModal })));
const CtfBountyBoard = lazy(() => import("@/components/CtfBountyBoard").then(m => ({ default: m.CtfBountyBoard })));
const ZaneMegaCenterModal = lazy(() => import("@/components/ZaneMegaCenterModal").then(m => ({ default: m.ZaneMegaCenterModal })));
const ZanophyModal = lazy(() => import("@/components/ZanophyModal").then(m => ({ default: m.ZanophyModal })));
const ZanophyMoodModal = lazy(() => import("@/components/ZanophyMoodModal").then(m => ({ default: m.ZanophyMoodModal })));
const OperatorInfiltrationModal = lazy(() => import("@/components/OperatorInfiltrationModal").then(m => ({ default: m.OperatorInfiltrationModal })));

import { ZanophyMiniBar } from "@/components/ZanophyMiniBar";

type Overlay = "terminal" | "breach" | "celestial" | "matrix" | "csi" | "ctf" | "megacenter" | "infiltration";

const Index = () => {
  const { persona } = usePersona();
  const { clearance } = useOperatorClearance();
  const { isExistence } = useUniverseTheme();
  const [open, setOpen] = useState<Overlay | null>(null);
  const [introOpen, setIntroOpen] = useState<boolean>(true);
  const handleIntroComplete = useCallback(() => setIntroOpen(false), []);
  const replayIntro = useCallback(() => setIntroOpen(true), []);

  // Once an overlay has been opened, keep it mounted so its exit animation and state survive.
  const [loaded, setLoaded] = useState<Record<Overlay, boolean>>({
    terminal: false,
    breach: false,
    celestial: false,
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
  const openCelestial = useCallback(() => show("celestial"), [show]);
  const openMatrix = useCallback(() => show("matrix"), [show]);
  const openCsi = useCallback(() => show("csi"), [show]);
  const openCtf = useCallback(() => show("ctf"), [show]);
  const openMegaCenter = useCallback(() => show("megacenter"), [show]);
  const openInfiltration = useCallback(() => show("infiltration"), [show]);

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
  const celestialOpen = open === "celestial";
  const canvasOverlayActive = matrixOpen || celestialOpen || introOpen;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-background">
      {/* Procedural RGB ASCII Art Intro Animation before entering Index */}
      <AsciiIntroOverlay isOpen={introOpen} onComplete={handleIntroComplete} />

      {/* Background FX — paused while a fullscreen construct owns the GPU */}
      {!canvasOverlayActive && (
        isExistence ? (
          <ExistenceAsciiCanvas />
        ) : (
          <>
            <MatrixRain />
            <MatrixWatchingEye />
            <FloatingParticles />
          </>
        )
      )}
      <div className="scanlines fixed inset-0 pointer-events-none z-10 opacity-30" />

      <EasterEggs
        disabled={open !== null || introOpen}
        onOpenTerminal={openTerminal}
        onOpenMatrixTakeover={openMatrix}
      />
      <Navigation
        onOpenTerminal={openTerminal}
        onOpenBreach={openBreach}
        onOpenCelestial={openCelestial}
        onOpenCtf={openCtf}
        onReplayIntro={replayIntro}
      />
      <CyberdeckFAB
        onOpenTerminal={openTerminal}
        onOpenBreach={openBreach}
        onOpenCelestial={openCelestial}
        onOpenMatrixTakeover={openMatrix}
        onOpenCsi={openCsi}
        onOpenCtf={openCtf}
        onOpenMegaCenter={openMegaCenter}
      />

      <main className={isExistence ? "relative z-10 pt-20 sm:pt-28" : "relative z-10 pt-14 sm:pt-16"}>
        {isExistence ? (
          /* ASCII universe: a completely different, game-style layout */
          <ExistenceWorld
            inputEnabled={open === null && !introOpen}
            onOpenTerminal={openTerminal}
            onOpenBreach={openBreach}
            onOpenCelestial={openCelestial}
            onOpenCsi={openCsi}
            onOpenCtf={openCtf}
            onOpenMegaCenter={openMegaCenter}
            onOpenInfiltration={openInfiltration}
          />
        ) : (
          <>
            <BentoGrid
              onOpenTerminal={openTerminal}
              onOpenBreach={openBreach}
              onOpenCelestial={openCelestial}
              onOpenCsi={openCsi}
              onOpenCtf={openCtf}
              onOpenMegaCenter={openMegaCenter}
              onOpenInfiltration={openInfiltration}
            />

            {/* Technical Showcase: Git Repositories (collapsed by default for quick skimming; hidden in Friend mode) */}
            {persona !== "friend" && <LiveRepositories />}

            {/* Culture, Philosophy, Breach Protocol & Minigames */}
            <Philosophy />
            <Pricing />
            <Games onOpenBreach={openBreach} onOpenCelestial={openCelestial} />
            <Contact />
          </>
        )}
      </main>

      <Suspense fallback={null}>
        {loaded.terminal && (
          <TerminalOverlay
            isOpen={open === "terminal"}
            onClose={close}
            onOpenBreach={openBreach}
            onOpenCelestial={openCelestial}
            onOpenMatrixTakeover={openMatrix}
            onOpenCsi={openCsi}
            onOpenCtf={openCtf}
            onOpenMegaCenter={openMegaCenter}
          />
        )}
        {loaded.breach && <BreachProtocol isOpen={open === "breach"} onClose={close} />}
        {loaded.celestial && <CelestialZenModal isOpen={celestialOpen} onClose={close} />}
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
        <ZanophyMoodModal />
      </Suspense>

      {/* Floating Background Music Player (Zanophy) */}
      <ZanophyMiniBar />

      <footer className="pt-8 pb-24 sm:py-10 border-t border-white/10 relative z-10 bg-black/70 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-muted-foreground">
          <div>
            <p className="text-foreground font-bold">
              {isExistence ? "[ ZANEX :: Ω-EXISTENCE // SINGULARITY ARCHIVE ]" : "ZANEX v6.0"}
            </p>
            <p>&copy; {new Date().getFullYear()} Aziz Maaizate (Zane Goat)</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1.5 text-muted-foreground">
            <button
              onClick={replayIntro}
              className="text-foreground/80 hover:text-primary underline decoration-white/25 hover:decoration-primary underline-offset-4 cursor-pointer transition-colors"
              title="Replay ASCII Boot Sequence"
            >
              Replay Intro
            </button>
            <span>·</span>
            <button
              onClick={openCtf}
              className="text-amber-300/90 hover:text-amber-300 underline decoration-amber-400/30 hover:decoration-amber-400 underline-offset-4 cursor-pointer transition-colors"
              title="Open CTF Bounty Board"
            >
              CTF (3 Flags)
            </button>
            <span className="hidden sm:inline">·</span>
            <p className="hidden sm:block">
              Press{" "}
              <kbd
                onClick={openTerminal}
                className="px-1.5 py-0.5 border border-white/20 rounded text-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors"
                title="Launch ZaneOS Shell"
              >
                `
              </kbd>{" "}
              for shell
            </p>
            <span>·</span>
            <button
              onClick={openMatrix}
              className="text-foreground/80 hover:text-primary underline decoration-white/25 hover:decoration-primary underline-offset-4 cursor-pointer transition-colors"
              title="Launch Matrix Rain Canvas"
            >
              Matrix Rain
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
