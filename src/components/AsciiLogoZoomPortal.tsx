import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MEDITATING_LOGO_SVG_PATH } from "@/components/CelestialZenLogo";
import { sound } from "@/lib/sound";

export interface AsciiLogoZoomPortalProps {
  active: boolean;
  fromTheme: "matrix" | "existence";
  toTheme: "matrix" | "existence";
  onPeakFlip: () => void;
  onComplete: () => void;
}

const RAMP = " ·:⠁⠃⠇⠏⠟⠿░▒▓█";
const RAMP_LEN = RAMP.length;
const BEVEL_CHARS = "+=*#◈";

const FIELD_SIZE = 128;
let cachedInsideField: Uint8Array | null = null;
let cachedEdgeField: Uint8Array | null = null;

function ensureLogoField(): { inside: Uint8Array; edge: Uint8Array } {
  if (cachedInsideField && cachedEdgeField) {
    return { inside: cachedInsideField, edge: cachedEdgeField };
  }

  const inside = new Uint8Array(FIELD_SIZE * FIELD_SIZE);
  const edge = new Uint8Array(FIELD_SIZE * FIELD_SIZE);

  if (typeof document !== "undefined") {
    const off = document.createElement("canvas");
    off.width = FIELD_SIZE;
    off.height = FIELD_SIZE;
    const ctx = off.getContext("2d");
    if (ctx && typeof Path2D !== "undefined") {
      ctx.clearRect(0, 0, FIELD_SIZE, FIELD_SIZE);
      ctx.save();
      // Map [-104..104] viewBox into [0..FIELD_SIZE]
      const scale = FIELD_SIZE / 208;
      ctx.translate(FIELD_SIZE * 0.5, FIELD_SIZE * 0.5);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      const path = new Path2D(MEDITATING_LOGO_SVG_PATH);
      ctx.fill(path, "evenodd");
      ctx.restore();

      const img = ctx.getImageData(0, 0, FIELD_SIZE, FIELD_SIZE).data;
      for (let i = 0; i < FIELD_SIZE * FIELD_SIZE; i++) {
        inside[i] = img[i * 4 + 3];
      }

      // Compute 1-2px Sobel-style contour rim intensity
      for (let y = 1; y < FIELD_SIZE - 1; y++) {
        for (let x = 1; x < FIELD_SIZE - 1; x++) {
          const idx = y * FIELD_SIZE + x;
          const c = inside[idx];
          if (c === 0) continue;
          const minN = Math.min(
            inside[idx - 1],
            inside[idx + 1],
            inside[idx - FIELD_SIZE],
            inside[idx + FIELD_SIZE],
            inside[idx - FIELD_SIZE - 1],
            inside[idx + FIELD_SIZE + 1]
          );
          edge[idx] = Math.min(255, Math.max(0, c - minN));
        }
      }
    }
  }

  cachedInsideField = inside;
  cachedEdgeField = edge;
  return { inside, edge };
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const fract = (x: number) => x - Math.floor(x);

const PEAK_SEC = 1.62;
const TOTAL_SEC = 2.08;

export const AsciiLogoZoomPortal: React.FC<AsciiLogoZoomPortalProps> = ({
  active,
  fromTheme,
  toTheme,
  onPeakFlip,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flippedRef = useRef(false);
  const doneRef = useRef(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!active) {
      flippedRef.current = false;
      doneRef.current = false;
      setFadingOut(false);
      return;
    }

    flippedRef.current = false;
    doneRef.current = false;
    setFadingOut(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { inside, edge } = ensureLogoField();

    // Launch heavy-bass spaceship thruster pulse at t=0
    sound.playEmpPulse();
    sound.haptic([25, 20, 40]);

    let width = 1;
    let height = 1;
    let cellW = 8;
    let cellH = 14;
    let cols = 1;
    let rows = 1;
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
      cellH = Math.max(10, Math.round(fontSize * 1.22));

      // 1:1 native pixel buffer for locked 60 FPS on 1080p+ monitors
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
      const unit = Math.min(width, height) * 0.45;
      for (let c = 0; c < cols; c++) {
        uCoords[c] = ((c + 0.5) * cellW - width * 0.5) / unit;
      }
      for (let r = 0; r < rows; r++) {
        vCoords[r] = ((r + 0.5) * cellH - height * 0.5) / unit;
      }
    };

    resizeGrid();
    window.addEventListener("resize", resizeGrid, { passive: true });

    let rafId = 0;
    const startMs = performance.now();

    const sampleSilhouette = (lx: number, ly: number): [number, number] => {
      const fx = Math.floor((lx * 0.5 + 0.5) * FIELD_SIZE);
      const fy = Math.floor((ly * 0.5 + 0.5) * FIELD_SIZE);
      if (fx < 0 || fx >= FIELD_SIZE || fy < 0 || fy >= FIELD_SIZE) return [0, 0];
      const idx = fy * FIELD_SIZE + fx;
      return [inside[idx], edge[idx]];
    };

    const renderFrame = (now: number) => {
      const t = (now - startMs) * 0.001;

      if (t >= PEAK_SEC && !flippedRef.current) {
        flippedRef.current = true;
        setFadingOut(true);
        onPeakFlip();
      }

      if (t >= TOTAL_SEC) {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
        return;
      }

      const zp = clamp(t / PEAK_SEC, 0, 1);
      // Crossfade palette from current theme toward target theme as zoom approaches climax
      const toExistenceMix =
        fromTheme === toTheme
          ? toTheme === "existence"
            ? 1
            : 0
          : toTheme === "existence"
          ? easeInOutCubic(zp)
          : 1 - easeInOutCubic(zp);

      // Exponential zoom from 0.38x -> 9.2x so the rolling emblem engulfs the viewport
      const zoomScale = 0.38 * Math.pow(24.2, Math.pow(zp, 2.1));
      const invZoom = 1 / zoomScale;

      // Simultaneous 360° barrel roll (Z) + 3D coin spin (Y) + subtle pitch (X)
      const roll = easeInOutCubic(zp) * Math.PI * 2.0;
      const yaw = zp * Math.PI * 2.0 + Math.sin(zp * Math.PI) * 0.85;
      const pitch = 0.24 * Math.sin(zp * Math.PI * 2.0);

      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Climax flash boost near t = PEAK_SEC
      const flashDist = Math.abs(t - PEAK_SEC);
      const flashBoost = flashDist < 0.22 ? (1 - flashDist / 0.22) * 0.65 : 0;

      ctx.fillStyle = toExistenceMix > 0.55 ? "#000000" : "#030711";
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSpec;

      const slabHalf = 0.13;
      const raySteps = 5;

      let lastColor = "";

      for (let r = 0; r < rows; r++) {
        const vScreen = vCoords[r];
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
          const uScreen = uCoords[c];
          const uScaled = uScreen * invZoom;
          const vScaled = vScreen * invZoom;

          let lum = 0;
          let isRim = false;
          let isSideWall = false;
          let overrideChar = "";

          // Early geometric bounding rejection in zoomed emblem space
          const radLocal = Math.hypot(uScaled, vScaled);
          if (radLocal <= 1.18) {
            // Undo 2D Z-roll
            const ux = uScaled * cosR + vScaled * sinR;
            const uy = -uScaled * sinR + vScaled * cosR;

            // March 5 view-space depth slices through the 3D rotated emblem slab
            for (let s = 0; s < raySteps; s++) {
              const vz = -0.22 + (s / (raySteps - 1)) * 0.44;
              // Rotate (ux, uy, vz) into emblem object coordinates
              const y1 = uy * cosP - vz * sinP;
              const z1 = uy * sinP + vz * cosP;
              const lx = ux * cosY + z1 * sinY;
              const lz = -ux * sinY + z1 * cosY;

              if (Math.abs(lz) <= slabHalf) {
                const [alpha, rim] = sampleSilhouette(lx, y1);
                if (alpha > 96) {
                  const faceDist = Math.abs(Math.abs(lz) - slabHalf);
                  isSideWall = faceDist > 0.045;
                  isRim = rim > 80 || isSideWall;
                  const faceShade = 0.52 + 0.48 * Math.abs(cosY * cosP);
                  lum = clamp(
                    (isSideWall ? 0.62 : 0.35 + faceShade * 0.58) +
                      (rim / 255) * 0.45 +
                      flashBoost,
                    0.22,
                    1.0
                  );
                  if (isSideWall) {
                    overrideChar = BEVEL_CHARS[(c + r) % BEVEL_CHARS.length];
                  }
                  break;
                }
              }
            }

            // Outer aura ring around the rolling meditating crest
            if (lum === 0 && Math.abs(radLocal - 1.04) < 0.042) {
              const ringAng = Math.atan2(vScaled, uScaled) - roll * 1.5;
              const ringWave = 0.55 + 0.45 * Math.cos(ringAng * 8);
              lum = (1 - Math.abs(radLocal - 1.04) / 0.042) * ringWave * 0.9;
              isRim = true;
              if (Math.cos(ringAng * 4) > 0.92) overrideChar = "◈";
            }
          }

          // Radial ASCII hyperspace warp streaks rushing past the camera
          if (lum <= 0.04) {
            const screenRad = Math.hypot(uScreen, vScreen);
            if (screenRad > 0.08) {
              const ang = Math.atan2(vScreen, uScreen) + roll * 0.25;
              const sector = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 64);
              const h = fract(Math.sin(sector * 19.19 + 3.7) * 43758.5453);
              if (h > 0.52) {
                const head = fract(h * 7.3 + t * (1.35 + h * 1.6));
                const streakPos = head * 1.85;
                const d = streakPos - screenRad;
                if (d >= 0 && d < 0.34) {
                  lum = (1 - d / 0.34) * (0.28 + zp * 0.52) + flashBoost * 0.4;
                }
              }
            } else if (flashBoost > 0.15) {
              lum = flashBoost;
            }
          }

          if (lum <= 0.05) {
            flushBatch();
            continue;
          }

          const charIdx = clamp(Math.floor(lum * (RAMP_LEN - 1)), 1, RAMP_LEN - 1);
          const ch = overrideChar || RAMP[charIdx];

          // Blend between Matrix Emerald/Gold and Existence Pure Monochrome
          let mr: number;
          let mg: number;
          let mb: number;
          if (isRim) {
            mr = Math.round(clamp(180 + lum * 75, 0, 255));
            mg = Math.round(clamp(235 + lum * 20, 0, 255));
            mb = Math.round(clamp(195 + lum * 55, 0, 255));
          } else {
            mr = Math.round(flashBoost * 220);
            mg = Math.round(clamp(85 + lum * 170, 0, 255));
            mb = Math.round(clamp(55 + lum * 108, 0, 255));
          }

          const er = Math.round(clamp(80 + lum * 175, 0, 255));
          const cr = Math.round(mr + (er - mr) * toExistenceMix);
          const cg = Math.round(mg + (er - mg) * toExistenceMix);
          const cb = Math.round(mb + (er - mb) * toExistenceMix);

          const qr = (cr >> 3) << 3;
          const qg = (cg >> 3) << 3;
          const qb = (cb >> 3) << 3;
          const colorStr = `rgb(${qr},${qg},${qb})`;

          if (
            batchStr.length > 0 &&
            colorStr === batchColor &&
            batchStartCol + batchStr.length === c
          ) {
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
    };
  }, [active, fromTheme, toTheme, onPeakFlip, onComplete]);

  if (!active || typeof document === "undefined") return null;

  const targetLabel =
    toTheme === "existence"
      ? "Ω-EXISTENCE // MONOCHROME ASCII UNIVERSE"
      : "MATRIX EMERALD // CYBER-HUD UNIVERSE";

  return createPortal(
    <div
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="ASCII Logo Dimensional Shift"
      className={`fixed inset-0 z-[10060] select-none font-mono transition-opacity duration-500 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="fixed inset-0 block w-full h-full" />

      {/* Subtle Bottom Telemetry Tag */}
      <div className="fixed inset-x-0 bottom-6 z-10 flex justify-center px-4 pointer-events-none">
        <div
          style={{
            backgroundColor: "rgba(4, 8, 18, 0.78)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          className="px-4 py-1.5 rounded-full border border-white/25 text-[10px] sm:text-xs font-bold tracking-widest text-white shadow-2xl"
        >
          [ ◈ SHIFTING REALM → {targetLabel} ]
        </div>
      </div>
    </div>,
    document.body
  );
};
