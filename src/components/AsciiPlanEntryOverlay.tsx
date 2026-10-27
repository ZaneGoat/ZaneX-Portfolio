import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { PricingTier } from "@/data/portfolio";
import { useUniverseTheme } from "@/context/ThemeContext";
import { sound } from "@/lib/sound";

interface AsciiPlanEntryOverlayProps {
  tier: PricingTier | null;
  mailtoUrl: string;
  onClose: () => void;
}

const RAMP = " .·:;+*%#@$";
const RAMP_LEN = RAMP.length;
const CIPHER_CHARS = "$#01◈+=*<>[]{}";
const DURATION_SEC = 3.25;

// 8 face normals of a unit octahedron (|x| + |y| + |z| <= R), normalized by 1/sqrt(3)
const INV_SQRT3 = 0.577350269;
const OCT_SIGNS: [number, number, number][] = [
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
  [-1, 1, 1],
  [-1, 1, -1],
  [-1, -1, 1],
  [-1, -1, -1],
];

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

const TARGET_HEADLINE = "It's way cheaper than you think.";

export const AsciiPlanEntryOverlay: React.FC<AsciiPlanEntryOverlayProps> = ({
  tier,
  mailtoUrl,
  onClose,
}) => {
  const { isExistence } = useUniverseTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const launchedRef = useRef(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [decodedHeadline, setDecodedHeadline] = useState("");
  const [showCard, setShowCard] = useState(false);

  const launchMailAndClose = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    sound.playSuccess();
    sound.haptic([35, 25, 50]);
    setFadingOut(true);

    // Trigger the exact Outlook mailto URL as configured
    window.location.href = mailtoUrl;

    window.setTimeout(() => {
      onClose();
    }, 480);
  }, [mailtoUrl, onClose]);

  const cancelOverlay = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (launchedRef.current) return;
      launchedRef.current = true;
      sound.playClick();
      setFadingOut(true);
      window.setTimeout(() => {
        onClose();
      }, 300);
    },
    [onClose]
  );

  // Cipher-decode the headline & update progress bar
  useEffect(() => {
    if (!tier) {
      launchedRef.current = false;
      setFadingOut(false);
      setProgress(0);
      setDecodedHeadline("");
      setShowCard(false);
      return;
    }

    launchedRef.current = false;
    setFadingOut(false);
    setProgress(0);
    setDecodedHeadline("");

    const cardTimer = window.setTimeout(() => {
      setShowCard(true);
    }, 420);

    const start = performance.now();
    const tick = window.setInterval(() => {
      const elapsed = (performance.now() - start) * 0.001;
      const pct = clamp(elapsed / DURATION_SEC, 0, 1);
      setProgress(pct);

      // Decode headline between 0.45s and 1.55s
      const decodeNorm = clamp((elapsed - 0.45) / 1.05, 0, 1);
      const lockedChars = Math.floor(decodeNorm * TARGET_HEADLINE.length);
      let nextStr = "";
      for (let i = 0; i < TARGET_HEADLINE.length; i++) {
        const targetCh = TARGET_HEADLINE[i];
        if (targetCh === " ") {
          nextStr += " ";
        } else if (i < lockedChars) {
          nextStr += targetCh;
        } else if (elapsed >= 0.42) {
          const idx = Math.floor((i * 7 + elapsed * 32) % CIPHER_CHARS.length);
          nextStr += CIPHER_CHARS[idx];
        }
      }
      setDecodedHeadline(nextStr);

      if (elapsed >= DURATION_SEC) {
        window.clearInterval(tick);
        launchMailAndClose();
      }
    }, 33);

    return () => {
      window.clearTimeout(cardTimer);
      window.clearInterval(tick);
    };
  }, [tier, launchMailAndClose]);

  // 60-FPS Procedural 3D ASCII Faceted Emerald Gem + Orbiting Currency Seal Canvas
  useEffect(() => {
    if (!tier) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cellW = 8;
    let cellH = 14;
    let cols = 0;
    let rows = 0;
    let fontSpec = "bold 12px 'IBM Plex Mono', 'Consolas', monospace";
    let uCoords = new Float32Array(0);
    let vCoords = new Float32Array(0);

    const resizeGrid = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);

      const fontSize = width < 640 ? 11 : width < 1024 ? 12 : 14;
      fontSpec = `bold ${fontSize}px 'IBM Plex Mono', 'Consolas', monospace`;
      ctx.font = fontSpec;
      const charW = ctx.measureText("M").width || 8;
      cellW = Math.max(6, Math.round(charW));
      cellH = Math.max(10, Math.round(fontSize * 1.25));

      // 1:1 native pixel buffer per zanex-portfolio-dev 60 FPS standard
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = fontSpec;
      ctx.textBaseline = "top";

      cols = Math.max(24, Math.ceil(width / cellW));
      rows = Math.max(18, Math.ceil(height / cellH));

      uCoords = new Float32Array(cols);
      vCoords = new Float32Array(rows);

      const unitPixels = Math.min(width, height) * (width < 640 ? 0.44 : 0.40);
      for (let c = 0; c < cols; c++) {
        uCoords[c] = ((c + 0.5) * cellW - width * 0.5) / unitPixels;
      }
      for (let r = 0; r < rows; r++) {
        vCoords[r] = ((r + 0.5) * cellH - height * 0.5) / unitPixels;
      }
    };

    resizeGrid();
    window.addEventListener("resize", resizeGrid, { passive: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelOverlay();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        launchMailAndClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    let rafId = 0;
    const startMs = performance.now();

    // Directional light normalized
    const lx = -0.48;
    const ly = -0.62;
    const lz = 0.62;

    const renderFrame = (now: number) => {
      const t = (now - startMs) * 0.001;

      // Clear background
      ctx.fillStyle = isExistence ? "#000000" : "#04070e";
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSpec;

      // Smooth scale-in of the 3D ASCII gem
      const introScale = clamp(t / 0.45, 0.15, 1.0);
      const gemRadius = 0.56 * (1.0 + 0.04 * Math.sin(t * 4.5)) * introScale;

      // 3D rotation angles (Y spin + gentle X tilt)
      const ay = t * 2.35;
      const ax = 0.42 + 0.18 * Math.sin(t * 1.5);
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);

      // Rotate all 8 octahedron plane normals into world space once per frame
      const worldNormals: [number, number, number][] = new Array(8);
      for (let i = 0; i < 8; i++) {
        const [sx, sy, sz] = OCT_SIGNS[i];
        const nx0 = sx * INV_SQRT3;
        const ny0 = sy * INV_SQRT3;
        const nz0 = sz * INV_SQRT3;
        // Rotate around Y
        const nx1 = nx0 * cosY + nz0 * sinY;
        const nz1 = -nx0 * sinY + nz0 * cosY;
        // Rotate around X
        const ny2 = ny0 * cosX - nz1 * sinX;
        const nz2 = ny0 * sinX + nz1 * cosX;
        worldNormals[i] = [nx1, ny2, nz2];
      }

      const dPlane = gemRadius * INV_SQRT3;

      let lastColor = "";

      for (let r = 0; r < rows; r++) {
        const v = vCoords[r];
        const absV = Math.abs(v);
        const py = r * cellH;

        let batchStr = "";
        let batchStartCol = -1;
        let batchColor = "";

        const flushBatch = () => {
          if (batchStr.length > 0 && batchColor) {
            if (batchColor !== lastColor) {
              ctx.fillStyle = batchColor;
              lastColor = batchColor;
            }
            ctx.fillText(batchStr, batchStartCol * cellW, py);
            batchStr = "";
            batchStartCol = -1;
          }
        };

        for (let c = 0; c < cols; c++) {
          const u = uCoords[c];
          const absU = Math.abs(u);

          // Early geometric rejection outside field
          if (absU > 1.65 || absV > 1.45) {
            // Subtle vertical ASCII matrix ticks in outer margin
            const streamHash = Math.sin(c * 19.31) * 437.58;
            const colSpeed = 2.5 + (streamHash - Math.floor(streamHash)) * 3.0;
            const drop = (v + t * colSpeed + streamHash) % 2.4;
            if (drop > 0 && drop < 0.14 && (c % 3 === 0)) {
              const ch = (c + r) % 2 === 0 ? "$" : "·";
              const colStr = isExistence ? "rgb(64,64,72)" : "rgb(0,88,56)";
              if (batchStr.length > 0 && colStr === batchColor && batchStartCol + batchStr.length === c) {
                batchStr += ch;
              } else {
                flushBatch();
                batchColor = colStr;
                batchStartCol = c;
                batchStr = ch;
              }
            } else {
              flushBatch();
            }
            continue;
          }

          const rad2D = Math.hypot(u, v);
          let lum = 0;
          let cr = 0;
          let cg = 0;
          let cb = 0;
          let overrideChar = "";

          // 1. Analytic 3D Orthographic Ray vs Convex Octahedron (8 half-space slab intersection)
          if (rad2D < gemRadius * 1.05) {
            let zNear = -1e6;
            let zFar = 1e6;
            let hitFace = -1;
            let valid = true;

            for (let i = 0; i < 8; i++) {
              const [nx, ny, nz] = worldNormals[i];
              const rhs = dPlane - nx * u - ny * v;
              if (Math.abs(nz) < 1e-5) {
                if (rhs < 0) {
                  valid = false;
                  break;
                }
              } else {
                const zHit = rhs / nz;
                if (nz > 0) {
                  // Front-facing plane (normal points toward +Z viewer): z <= zHit -> wait:
                  // For viewer at +Z looking toward -Z, front surface has larger Z!
                  // Inside condition: nx*u + ny*v + nz*z <= dPlane.
                  // If nz > 0 -> z <= rhs / nz (upper bound on Z = front surface!)
                  if (zHit < zFar) {
                    zFar = zHit;
                    hitFace = i;
                  }
                } else {
                  // Back-facing plane (nz < 0) -> z >= rhs / nz (lower bound on Z)
                  if (zHit > zNear) {
                    zNear = zHit;
                  }
                }
              }
            }

            if (valid && zFar >= zNear && hitFace !== -1) {
              const [fnx, fny, fnz] = worldNormals[hitFace];
              const diff = Math.max(0.08, -(fnx * lx + fny * ly + fnz * lz));
              // Edge wireframe highlight near ridge boundaries
              const ridgeDist = zFar - zNear;
              const edgeBoost = ridgeDist < 0.14 ? (1.0 - ridgeDist / 0.14) * 0.55 : 0;
              const spec = Math.pow(Math.max(0, fnz), 6) * 0.45;
              lum = clamp(0.24 + diff * 0.58 + spec + edgeBoost, 0.15, 1.0);

              if (isExistence) {
                const vGray = Math.round(clamp(70 + lum * 185, 0, 255));
                cr = vGray;
                cg = vGray;
                cb = vGray;
              } else {
                // Crisp Emerald + Gold ridge highlights
                cr = Math.round(clamp(edgeBoost * 240 + spec * 220, 0, 255));
                cg = Math.round(clamp(90 + lum * 165, 0, 255));
                cb = Math.round(clamp(65 + lum * 105 + edgeBoost * 40, 0, 255));
              }

              if (edgeBoost > 0.36) {
                overrideChar = "+";
              }
            }
          }

          // 2. Tilted 3D Orbiting Price-Slash / Value Halo Ring + Expanding Pulse Ripples
          if (lum === 0) {
            // Inclined ring ellipse
            const ringAng = -0.32;
            const ru = u * Math.cos(ringAng) - v * Math.sin(ringAng);
            const rv = (u * Math.sin(ringAng) + v * Math.cos(ringAng)) * 2.35;
            const ringR = Math.hypot(ru, rv);
            const ringDist = Math.abs(ringR - 0.88 * introScale);

            if (ringDist < 0.055) {
              const theta = Math.atan2(rv, ru) - t * 2.2;
              const wave = 0.55 + 0.45 * Math.cos(theta * 6.0);
              lum = (1.0 - ringDist / 0.055) * wave * 0.92;
              if (Math.cos(theta * 4.0) > 0.92) {
                overrideChar = "$";
              } else if (Math.sin(theta * 4.0) > 0.92) {
                overrideChar = "◈";
              }
              if (isExistence) {
                const g = Math.round(clamp(90 + lum * 165, 0, 255));
                cr = g;
                cg = g;
                cb = g;
              } else {
                // Warm amber-gold orbit ring
                cr = Math.round(clamp(180 + lum * 75, 0, 255));
                cg = Math.round(clamp(140 + lum * 85, 0, 255));
                cb = Math.round(clamp(35 + lum * 55, 0, 255));
              }
            } else {
              // Concentric shockwave pulse rings expanding outward
              const pulsePhase = (rad2D * 3.2 - t * 2.1);
              const pulseRing = Math.sin(pulsePhase * Math.PI);
              if (rad2D > 0.62 && rad2D < 1.55 && pulseRing > 0.88) {
                const fade = (1.55 - rad2D) / 0.93;
                lum = ((pulseRing - 0.88) / 0.12) * fade * 0.48;
                if (isExistence) {
                  const g = Math.round(clamp(50 + lum * 150, 0, 255));
                  cr = g;
                  cg = g;
                  cb = g;
                } else {
                  cr = 0;
                  cg = Math.round(clamp(85 + lum * 170, 0, 255));
                  cb = Math.round(clamp(55 + lum * 110, 0, 255));
                }
              }
            }
          }

          if (lum <= 0.04) {
            flushBatch();
            continue;
          }

          const charIdx = clamp(Math.floor(lum * (RAMP_LEN - 1)), 1, RAMP_LEN - 1);
          const ch = overrideChar || RAMP[charIdx];
          const qr = (cr >> 3) << 3;
          const qg = (cg >> 3) << 3;
          const qb = (cb >> 3) << 3;
          const colorStr = `rgb(${qr},${qg},${qb})`;

          if (batchStr.length > 0 && colorStr === batchColor && batchStartCol + batchStr.length === c) {
            batchStr += ch;
          } else {
            flushBatch();
            batchColor = colorStr;
            batchStartCol = c;
            batchStr = ch;
          }
        }
        flushBatch();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeGrid);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [tier, isExistence, cancelOverlay, launchMailAndClose]);

  if (!tier || typeof document === "undefined") return null;

  const totalBars = 18;
  const filledBars = Math.round(progress * totalBars);
  const asciiProgressBar =
    "▓".repeat(filledBars) + "░".repeat(Math.max(0, totalBars - filledBars));

  return createPortal(
    <div
      onClick={launchMailAndClose}
      className={`fixed inset-0 z-[130] flex items-center justify-center p-4 font-mono select-none cursor-pointer transition-opacity duration-500 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Plan Initiation ASCII Sequence"
    >
      {/* Fullscreen 60-FPS Procedural 3D ASCII Gem & Shockwave Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 block w-full h-full" />

      {/* Centered Terminal ASCII Message Box */}
      <div
        onClick={e => e.stopPropagation()}
        className={`relative z-10 w-full max-w-lg transition-all duration-300 cursor-default ${
          showCard ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"
        } ${
          isExistence
            ? "bg-black/92 border-2 border-white text-white"
            : "bg-[#040812]/92 border border-primary/70 text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
        }`}
      >
        {/* Top ASCII Frame Header */}
        <div
          className={`flex items-center justify-between gap-2 px-3.5 py-2 border-b text-[10px] sm:text-[11px] ${
            isExistence
              ? "border-white/30 bg-white/[0.04] text-white/80"
              : "border-primary/25 bg-primary/[0.06] text-primary"
          }`}
        >
          <span className="font-bold truncate">
            ┌──[ PLAN {tier.index} :: {tier.name.toUpperCase()} ]
          </span>
          <button
            type="button"
            onClick={cancelOverlay}
            className="px-1.5 py-0.5 border border-current/30 hover:bg-white/10 text-[10px] font-bold cursor-pointer shrink-0"
            title="Cancel"
          >
            [ESC]
          </button>
        </div>

        {/* ASCII Body & Message */}
        <div className="p-5 sm:p-7 text-center space-y-4">
          {/* Compact ASCII Price Tag Art */}
          <pre
            aria-hidden="true"
            className={`text-[10px] sm:text-xs leading-[1.15] inline-block text-left font-bold ${
              isExistence ? "text-white" : "text-amber-300"
            }`}
          >
{`╔══════════════════════════════╗
║  ${`${tier.price} ${tier.period}`.padEnd(26, " ")}  ║
╚══════════════════════════════╝`}
          </pre>

          <h3
            className={`text-xl sm:text-3xl font-black tracking-tight leading-snug min-h-[2.5rem] ${
              isExistence ? "text-white" : "text-primary"
            }`}
          >
            {decodedHeadline || " "}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            No agency markup, no middlemen—just direct engineering. Opening your Outlook message now...
          </p>

          {/* ASCII Routing Progress Bar */}
          <div className="pt-1 space-y-1.5">
            <div className="text-[11px] tracking-widest text-foreground/85">
              [{asciiProgressBar}] {Math.round(progress * 100)}%
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              → mailto:azizmaaizat@outlook.com
            </div>
          </div>

          {/* Instant Skip / Continue Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={launchMailAndClose}
              className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold tracking-wider transition-all cursor-pointer active:scale-95 ${
                isExistence
                  ? "bg-white text-black hover:bg-white/85"
                  : "bg-primary text-background rounded-lg hover:bg-primary/90"
              }`}
            >
              OPEN OUTLOOK MESSAGE NOW →
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
