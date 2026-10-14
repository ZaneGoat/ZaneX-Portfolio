import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X } from "lucide-react";
import { sound } from "@/lib/sound";

interface MatrixTakeoverProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

interface RuneBurst {
  x: number;
  y: number;
  char: string;
  vy: number;
  alpha: number;
}

export const MatrixTakeover = ({ isOpen, onClose }: MatrixTakeoverProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeColor, setThemeColor] = useState<"#00ff9e" | "#ff0055" | "#00f0ff">("#00ff9e");
  const [keystrokesCount, setKeystrokesCount] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showIntro, setShowIntro] = useState(true);

  const keystrokesRef = useRef(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const ripplesRef = useRef<Ripple[]>([]);
  const burstsRef = useRef<RuneBurst[]>([]);
  const lastShockwaveTime = useRef(0);

  // Trigger sound and reset states on open
  useEffect(() => {
    if (isOpen) {
      sound.playMatrixDrop();
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Main Canvas Animation Loop (Zero software shadowBlur for silky 60-144 FPS)
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンZANEXG0AT";
    const forceRadiusSq = 140 * 140;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      // 1. Semi-transparent black background creates natural trails without overhead
      ctx.fillStyle = "rgba(5, 8, 22, 0.14)";
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Shockwave Ripples (Lightweight crisp vector circles)
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        if (rip.alpha <= 0.03) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = rip.alpha;
        ctx.stroke();

        rip.radius += 10;
        rip.alpha *= 0.93;
      }
      ctx.globalAlpha = 1;

      // 3. Draw Matrix Rain with Forcefield Repulsion
      ctx.font = `bold ${fontSize}px monospace`;
      const mouse = mousePosRef.current;

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        let renderX = x;
        let renderY = drops[i] * fontSize;

        // Forcefield Repulsion only computed when within bounding box
        const dx = x - mouse.x;
        const dy = renderY - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < forceRadiusSq) {
          const dist = Math.sqrt(distSq);
          const force = (140 - dist) / 140;
          renderX += (dx / (dist || 1)) * force * 35;
          renderY += (dy / (dist || 1)) * force * 35;
        }

        const char = chars[Math.floor(Math.random() * chars.length)];

        // Glowing white tip character vs trail body
        if (Math.random() > 0.88) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = themeColor;
        }

        ctx.fillText(char, renderX, renderY);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1 * speedMultiplier;
      }

      // 4. Draw Keystroke Bursts
      const bursts = burstsRef.current;
      if (bursts.length > 0) {
        ctx.font = "bold 28px monospace";
        for (let i = bursts.length - 1; i >= 0; i--) {
          const burst = bursts[i];
          if (burst.alpha <= 0.05) {
            bursts.splice(i, 1);
            continue;
          }

          ctx.fillStyle = themeColor;
          ctx.globalAlpha = burst.alpha;
          ctx.fillText(burst.char, burst.x, burst.y);

          burst.y += burst.vy;
          burst.alpha *= 0.95;
        }
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, themeColor, speedMultiplier]);

  // Mouse & Touch Tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    mousePosRef.current.x = e.clientX;
    mousePosRef.current.y = e.clientY;
  };

  // Trigger Shockwave with strict 200ms cooldown to protect CPU/GPU
  const triggerEmpShockwave = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastShockwaveTime.current < 180) return;
    lastShockwaveTime.current = now;

    sound.playEmpPulse();

    // Cap ripples at max 3
    if (ripplesRef.current.length >= 3) {
      ripplesRef.current.shift();
    }

    ripplesRef.current.push({
      x,
      y,
      radius: 12,
      alpha: 0.9
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    triggerEmpShockwave(e.clientX, e.clientY);
  };

  // Keystroke Magic Listener (Ignore repeats, throttle state updates)
  useEffect(() => {
    if (!isOpen) return;

    let pendingCountUpdate = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Ignore OS automatic key-repeat while holding key down
      if (e.repeat) return;

      if (e.key === " ") {
        const x = mousePosRef.current.x > 0 ? mousePosRef.current.x : window.innerWidth / 2;
        const y = mousePosRef.current.y > 0 ? mousePosRef.current.y : window.innerHeight / 2;
        triggerEmpShockwave(x, y);
        return;
      }

      sound.playKeypress();

      // Throttled counter update to prevent excessive React renders
      keystrokesRef.current += 1;
      if (!pendingCountUpdate) {
        pendingCountUpdate = true;
        requestAnimationFrame(() => {
          setKeystrokesCount(keystrokesRef.current);
          pendingCountUpdate = false;
        });
      }

      // Cap active bursts to max 10
      if (burstsRef.current.length >= 10) {
        burstsRef.current.shift();
      }

      const spawnX = mousePosRef.current.x > 0 
        ? mousePosRef.current.x + (Math.random() * 40 - 20) 
        : Math.random() * window.innerWidth;
      const spawnY = mousePosRef.current.y > 0 
        ? mousePosRef.current.y 
        : Math.random() * (window.innerHeight / 3);

      burstsRef.current.push({
        x: spawnX,
        y: spawnY,
        char: e.key.length === 1 ? e.key.toUpperCase() : "01",
        vy: 2 + Math.random() * 3,
        alpha: 1
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          className="fixed inset-0 z-[20000] bg-[#050816] select-none cursor-crosshair overflow-hidden"
        >
          {/* Main Magical Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />

          {/* Intro Awakening Sequence */}
          <AnimatePresence>
            {showIntro && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-30 font-mono"
              >
                <div
                  className="p-5 bg-black/85 border-2 rounded-2xl shadow-[0_0_60px_currentColor] space-y-2.5 backdrop-blur-md"
                  style={{ color: themeColor, borderColor: themeColor }}
                >
                  <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] animate-pulse">
                    <Radio className="w-4 h-4" />
                    <span>CONSTRUCT_INITIATION // ROOT_ACCESS</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                    WAKE UP, OPERATOR.
                  </h2>
                  <p className="text-xs md:text-sm opacity-80 max-w-md">
                    Move your cursor to bend reality. Press keys to materialize glyphs. Tap anywhere or press Space for EMP shockwave.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Cyber HUD Top Bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-3 pointer-events-auto z-40 font-mono text-xs">
            {/* Status & Keystrokes Pill */}
            <div className="bg-black/85 border px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-4 shadow-lg" style={{ borderColor: `${themeColor}40` }}>
              <div className="flex items-center gap-2" style={{ color: themeColor }}>
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />
                <span className="font-bold hidden sm:inline">CONSTRUCT_ACTIVE</span>
              </div>
              <div className="text-muted-foreground text-[11px]">
                RUNES CAST: <span className="font-bold" style={{ color: themeColor }}>{keystrokesCount}</span>
              </div>
            </div>

            {/* Magic Controls: Color & Speed & Eject */}
            <div className="flex items-center gap-2">
              {/* Color Toggles */}
              <div className="bg-black/85 border border-white/10 p-1 rounded-xl flex gap-1 backdrop-blur-md">
                <button
                  onClick={e => { e.stopPropagation(); setThemeColor("#00ff9e"); sound.playClick(); }}
                  className={`w-6 h-6 rounded-lg transition-all ${themeColor === "#00ff9e" ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-100"}`}
                  style={{ backgroundColor: "#00ff9e" }}
                  title="Matrix Emerald"
                />
                <button
                  onClick={e => { e.stopPropagation(); setThemeColor("#ff0055"); sound.playClick(); }}
                  className={`w-6 h-6 rounded-lg transition-all ${themeColor === "#ff0055" ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-100"}`}
                  style={{ backgroundColor: "#ff0055" }}
                  title="Agent Crimson"
                />
                <button
                  onClick={e => { e.stopPropagation(); setThemeColor("#00f0ff"); sound.playClick(); }}
                  className={`w-6 h-6 rounded-lg transition-all ${themeColor === "#00f0ff" ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-100"}`}
                  style={{ backgroundColor: "#00f0ff" }}
                  title="Ghost Cyan"
                />
              </div>

              {/* Speed Multiplier */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  sound.playClick();
                  setSpeedMultiplier(s => (s === 1 ? 2 : s === 2 ? 4 : 1));
                }}
                className="bg-black/85 border px-3 py-2 rounded-xl backdrop-blur-md font-bold transition-all hover:scale-105 active:scale-95"
                style={{ borderColor: `${themeColor}60`, color: themeColor }}
                title="Cycle Warp Speed"
              >
                {speedMultiplier}X SPEED
              </button>

              {/* Disconnect Button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  sound.playBoot();
                  onClose();
                }}
                className="bg-black/90 border-2 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_currentColor]"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">DISCONNECT</span>
              </button>
            </div>
          </div>

          {/* Bottom Floating Hint */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-30 font-mono text-[11px] text-white/50 px-4 text-center">
            <span className="bg-black/75 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              TIP: Type any key to cast runes • Tap anywhere or press Space for EMP shockwave • Press [ESC] to exit
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
