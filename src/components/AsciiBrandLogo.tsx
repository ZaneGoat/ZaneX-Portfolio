import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CelestialZenLogo, MEDITATING_LOGO_SVG_PATH } from "@/components/CelestialZenLogo";
import { drawShadedMeditatingGuardian } from "@/components/AsciiLogoZoomPortal";
import { useUniverseTheme } from "@/context/ThemeContext";
import { sound } from "@/lib/sound";

export type AsciiLogoSize = "micro" | "sm" | "md" | "lg";

interface AsciiBrandLogoProps {
  size?: AsciiLogoSize;
  variant?: "navbar" | "ascii";
  interactive?: boolean;
  withPopover?: boolean;
  framed?: boolean;
  className?: string;
  label?: string;
}

const HOLO_RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const HOLO_RAMP_LEN = HOLO_RAMP.length;

const SIZE_PRESETS: Record<
  AsciiLogoSize,
  { cols: number; rows: number; fontPx: number; linePx: number }
> = {
  micro: { cols: 13, rows: 7, fontPx: 5.2, linePx: 5.4 },
  sm: { cols: 17, rows: 9, fontPx: 6.2, linePx: 6.5 },
  md: { cols: 21, rows: 11, fontPx: 7.4, linePx: 7.8 },
  lg: { cols: 31, rows: 16, fontPx: 10.0, linePx: 10.6 },
};

const BRAILLE_BITS: readonly [number, number, number][] = [
  [0, 0, 0x01],
  [0, 1, 0x02],
  [0, 2, 0x04],
  [0, 3, 0x40],
  [1, 0, 0x08],
  [1, 1, 0x10],
  [1, 2, 0x20],
  [1, 3, 0x80],
];

const rasterCache = new Map<string, string>();

const FALLBACK_MICRO = [
  "⠀⠀⢀⣠⣤⣄⡀⠀⠀",
  "⠀⠀⢸⣿⣿⣿⡇⠀⠀",
  "⠀⣠⣾⡿⠋⢿⣷⣄⠀",
  "⠀⣿⣿⡇⠀⢸⣿⣿⠀",
  "⣠⣿⣿⣷⣤⣾⣿⣿⣄",
  "⢿⣿⣿⣿⣿⣿⣿⣿⣿",
  "⠀⠙⠻⠿⠶⠿⠟⠋⠀",
].join("\n");

export function rasterizeMeditatingBraille(cols: number, rows: number): string {
  const key = `${cols}x${rows}`;
  const hit = rasterCache.get(key);
  if (hit) return hit;

  if (typeof document === "undefined" || typeof Path2D === "undefined") {
    return FALLBACK_MICRO;
  }

  const subW = cols * 2;
  const subH = rows * 4;
  const canvas = document.createElement("canvas");
  canvas.width = subW;
  canvas.height = subH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return FALLBACK_MICRO;

  ctx.clearRect(0, 0, subW, subH);
  ctx.save();
  const scaleX = subW / 198;
  const scaleY = subH / 184;
  const scale = Math.min(scaleX, scaleY);
  ctx.translate(subW * 0.5, subH * 0.465);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  const path = new Path2D(MEDITATING_LOGO_SVG_PATH);
  ctx.fill(path, "evenodd");
  ctx.restore();

  const data = ctx.getImageData(0, 0, subW, subH).data;
  const lines: string[] = [];

  for (let r = 0; r < rows; r++) {
    let rowStr = "";
    const baseY = r * 4;
    for (let c = 0; c < cols; c++) {
      const baseX = c * 2;
      let mask = 0;
      for (let i = 0; i < 8; i++) {
        const [dx, dy, bit] = BRAILLE_BITS[i];
        const px = baseX + dx;
        const py = baseY + dy;
        const alpha = data[(py * subW + px) * 4 + 3];
        if (alpha >= 108) {
          mask |= bit;
        }
      }
      rowStr += String.fromCharCode(0x2800 | mask);
    }
    lines.push(rowStr);
  }

  const result = lines.join("\n");
  rasterCache.set(key, result);
  return result;
}

/**
 * Live 60-FPS Procedural RGB 70-Char ASCII Hologram Canvas rendered on Logo Hover
 */
const LiveAsciiHologramCanvas: React.FC<{ isExistence: boolean }> = ({ isExistence }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const W = 288;
    const H = 224;
    const fontSize = 8;
    const fontSpec = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;
    ctx.font = fontSpec;
    const cellW = Math.max(4, Math.round(ctx.measureText("M").width || 4.8));
    const cellH = 9;
    const cols = Math.ceil(W / cellW);
    const rows = Math.ceil(H / cellH);

    canvas.width = W;
    canvas.height = H;
    ctx.font = fontSpec;
    ctx.textBaseline = "top";

    const offCanvas = document.createElement("canvas");
    offCanvas.width = cols;
    offCanvas.height = rows;
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });

    let rafId = 0;
    const startMs = performance.now();

    const render = (now: number) => {
      const t = (now - startMs) * 0.001;

      const swaySpin = Math.sin(t * 2.1) * 0.52;
      const swayRoll = Math.sin(t * 1.3) * 0.14;
      const blinkCycle = t % 2.6;
      let blinkOpen = 1.0;
      if (blinkCycle > 1.1 && blinkCycle < 1.38) {
        const bp = (blinkCycle - 1.1) / 0.28;
        blinkOpen = bp < 0.5 ? 1.0 - bp * 2.0 : (bp - 0.5) * 2.0;
      }

      if (offCtx) {
        drawShadedMeditatingGuardian(
          offCtx,
          cols,
          rows,
          t,
          swayRoll,
          swaySpin,
          0.92,
          blinkOpen,
          1.08,
          0,
          0,
          isExistence ? 1.0 : 0.0
        );
        const pixels = offCtx.getImageData(0, 0, cols, rows).data;

        ctx.fillStyle = isExistence ? "#000000" : "#040710";
        ctx.fillRect(0, 0, W, H);
        ctx.font = fontSpec;

        let lastColor = "";
        for (let r = 0; r < rows; r++) {
          const py = r * cellH;
          let batchStr = "";
          let batchStart = -1;
          let batchColor = "";

          const flush = () => {
            if (batchStr.length > 0 && batchColor) {
              if (batchColor !== lastColor) {
                ctx.fillStyle = batchColor;
                lastColor = batchColor;
              }
              ctx.fillText(batchStr, batchStart * cellW, py);
              batchStr = "";
              batchStart = -1;
            }
          };

          for (let c = 0; c < cols; c++) {
            const pIdx = (r * cols + c) * 4;
            let pr = pixels[pIdx];
            let pg = pixels[pIdx + 1];
            let pb = pixels[pIdx + 2];
            let lum = (0.299 * pr + 0.587 * pg + 0.114 * pb) / 255.0;

            if (t < 0.45) {
              const mp = t / 0.45;
              const h = Math.sin((c + Math.floor(t * 32)) * 29.7 + r * 73.1) * 43758.5453;
              const n01 = h - Math.floor(h);
              if (n01 > mp) {
                if (n01 > 0.88) {
                  pr = isExistence ? 255 : 0;
                  pg = 255;
                  pb = isExistence ? 255 : 158;
                  lum = 0.55;
                } else {
                  flush();
                  continue;
                }
              }
            }

            const idx = Math.min(HOLO_RAMP_LEN - 1, Math.max(0, Math.floor(lum * (HOLO_RAMP_LEN - 1))));
            if (idx === 0) {
              flush();
              continue;
            }

            const ch = HOLO_RAMP[idx];
            const colorStr = `rgb(${(pr >> 3) << 3},${(pg >> 3) << 3},${(pb >> 3) << 3})`;
            if (batchStr.length > 0 && colorStr === batchColor && batchStart + batchStr.length === c) {
              batchStr += ch;
            } else {
              flush();
              batchColor = colorStr;
              batchStart = c;
              batchStr = ch;
            }
          }
          flush();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [isExistence]);

  return (
    <canvas
      ref={canvasRef}
      className="block rounded-md border border-white/15 select-none"
      style={{ width: 288, height: 224 }}
    />
  );
};

export const AsciiBrandLogo: React.FC<AsciiBrandLogoProps> = ({
  size = "micro",
  variant = "ascii",
  interactive = true,
  withPopover = true,
  framed = true,
  className = "",
  label,
}) => {
  const { isExistence, triggerLogoThemeShift } = useUniverseTheme();
  const [hovered, setHovered] = useState(false);
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number }>({ top: 56, left: 12 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const preset = SIZE_PRESETS[size];
  const baseBrailleArt = useMemo(
    () => rasterizeMeditatingBraille(preset.cols, preset.rows),
    [preset.cols, preset.rows]
  );

  const openHover = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!hovered) {
      sound.playKeypress();
    }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const popH = 308;
      const top =
        rect.bottom + popH + 12 > window.innerHeight
          ? Math.max(8, rect.top - popH - 6)
          : rect.bottom + 6;
      setAnchorPos({
        top,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 324)),
      });
    }
    setHovered(true);
  };

  const scheduleCloseHover = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setHovered(false);
    }, 110);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    setHovered(false);
    triggerLogoThemeShift();
  };

  const nextUniverseName = isExistence ? "MATRIX EMERALD" : "Ω-EXISTENCE";

  const preBlock = (
    <pre
      aria-hidden="true"
      style={{
        fontSize: `${preset.fontPx}px`,
        lineHeight: `${preset.linePx}px`,
      }}
      className={`font-mono font-bold tracking-normal select-none m-0 whitespace-pre transition-all duration-200 ${
        isExistence
          ? "text-white group-hover/ascii:text-black"
          : hovered
          ? "text-white drop-shadow-[0_0_10px_rgba(0,255,158,0.95)]"
          : "text-[#00ff9e] drop-shadow-[0_0_6px_rgba(0,255,158,0.55)]"
      }`}
    >
      {baseBrailleArt}
    </pre>
  );

  if (!framed && variant === "ascii") {
    return (
      <div
        onClick={interactive ? handleClick : undefined}
        className={`inline-flex flex-col items-center ${
          interactive ? "cursor-pointer group/ascii" : ""
        } ${className}`}
      >
        {preBlock}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={openHover}
      onMouseLeave={scheduleCloseHover}
    >
      {variant === "navbar" ? (
        <button
          ref={btnRef}
          type="button"
          onClick={handleClick}
          onFocus={openHover}
          onBlur={scheduleCloseHover}
          aria-label={
            label || `ZaneX Top-Left Brand Logo — Hover for Live ASCII Hologram · Click to Shift to ${nextUniverseName}`
          }
          title={
            label || `Hover for Live ASCII Hologram · Click for Fullscreen ASCII Shift to ${nextUniverseName}`
          }
          className="flex items-center gap-2 sm:gap-2.5 group font-mono shrink-0 cursor-pointer active:scale-95 transition-all"
        >
          {isExistence ? (
            <>
              <span className="w-7 h-7 sm:w-8 sm:h-8 border border-white/60 bg-black flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                <CelestialZenLogo className="w-4 h-4 sm:w-5 sm:h-5 fill-white group-hover:fill-black transition-colors" />
              </span>
              <span className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight border border-white/50 px-2 py-0.5 bg-black group-hover:bg-white group-hover:text-black transition-colors">
                [ZANEX<span className="hidden sm:inline">::Ω-EXISTENCE</span>
                <span className="sm:hidden">::Ω</span>]
              </span>
            </>
          ) : (
            <>
              <span
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/95 border flex items-center justify-center transition-all shrink-0 ${
                  hovered
                    ? "border-[#00ff9e] scale-110 shadow-[0_0_22px_rgba(0,255,158,0.65)]"
                    : "border-white/35 shadow-[0_0_14px_rgba(255,255,255,0.22)] group-hover:border-primary/80 group-hover:scale-105"
                }`}
              >
                <CelestialZenLogo
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors ${
                    hovered ? "fill-[#00ff9e]" : "fill-white group-hover:fill-primary"
                  }`}
                />
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform">
                ZANE<span className="text-secondary">X</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">
                v6.0
              </span>
            </>
          )}
        </button>
      ) : (
        <button
          ref={btnRef}
          type="button"
          onClick={handleClick}
          onFocus={openHover}
          onBlur={scheduleCloseHover}
          aria-label={label || `ZaneX ASCII Emblem — Click to Shift to ${nextUniverseName}`}
          className={`group/ascii relative inline-flex flex-col items-center justify-center transition-all duration-200 select-none ${
            interactive ? "cursor-pointer active:scale-95" : "cursor-default"
          } px-1.5 py-1 ${
            isExistence
              ? "bg-black border border-white/75 hover:bg-white"
              : "rounded-lg bg-[#040915]/95 border border-primary/55"
          }`}
        >
          {preBlock}
        </button>
      )}

      {/* Portal-Mounted Live 60-FPS Procedural RGB ASCII Hologram Popover */}
      {withPopover &&
        hovered &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseEnter={openHover}
            onMouseLeave={scheduleCloseHover}
            onClick={handleClick}
            onPointerDown={e => e.stopPropagation()}
            style={{
              position: "fixed",
              top: anchorPos.top,
              left: anchorPos.left,
              zIndex: 99992,
              backgroundColor: isExistence ? "rgba(0, 0, 0, 0.94)" : "rgba(4, 8, 18, 0.92)",
              backdropFilter: "blur(18px) saturate(145%)",
              WebkitBackdropFilter: "blur(18px) saturate(145%)",
            }}
            className={`flex flex-col items-center gap-2 p-3 cursor-pointer font-mono select-none ${
              isExistence
                ? "border-2 border-white text-white shadow-[0_24px_64px_rgba(0,0,0,0.95)]"
                : "rounded-xl border border-[#00ff9e]/80 text-white shadow-[0_24px_64px_rgba(0,0,0,0.92),0_0_36px_rgba(0,255,158,0.28)]"
            }`}
          >
            <div
              className={`w-full flex items-center justify-between gap-3 text-[10px] font-bold pb-1.5 border-b ${
                isExistence ? "border-white/30 text-white" : "border-[#00ff9e]/35 text-[#00ff9e]"
              }`}
            >
              <span>┌──[ Z A N E X // LIVE ASCII ]</span>
              <span className="text-white/80">60 FPS · RGB</span>
            </div>

            <LiveAsciiHologramCanvas isExistence={isExistence} />

            <div
              className={`w-full text-center text-[10px] font-bold px-2.5 py-1.5 border ${
                isExistence
                  ? "border-white bg-white text-black"
                  : "rounded-md border-[#00ff9e]/50 bg-[#00ff9e]/15 text-[#00ff9e]"
              }`}
            >
              ◈ CLICK → FULLSCREEN ASCII ZOOM · {nextUniverseName}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
