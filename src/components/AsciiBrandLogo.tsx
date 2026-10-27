import React, { useRef, useEffect } from "react";
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

// Pure 7-bit standard ASCII ramp (100% consistent monospace cell width on Linux, Android, iOS, Windows, macOS)
const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;

const CANVAS_PRESETS: Record<
  AsciiLogoSize,
  { width: number; height: number; fontSize: number; animated: boolean }
> = {
  micro: { width: 64, height: 64, fontSize: 6, animated: false },
  sm: { width: 112, height: 112, fontSize: 7, animated: false },
  md: { width: 164, height: 164, fontSize: 8, animated: true },
  lg: { width: 224, height: 210, fontSize: 8, animated: true },
};

/**
 * Square-pixel standard-ASCII emblem canvas for ZaneOS Terminal (`neofetch` & `logo` command).
 * Uses standard 7-bit monospace glyphs on an isotropic canvas so rows never skew or collapse.
 */
export const AsciiBrandLogo: React.FC<AsciiBrandLogoProps> = ({
  size = "micro",
  interactive = true,
  framed = true,
  className = "",
  label,
}) => {
  const { isExistence, setTheme, triggerLogoThemeShift } = useUniverseTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preset = CANVAS_PRESETS[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const W = preset.width;
    const H = preset.height;
    const fontSpec = `bold ${preset.fontSize}px 'Consolas', 'Courier New', monospace`;

    canvas.width = W;
    canvas.height = H;
    ctx.font = fontSpec;
    ctx.textBaseline = "top";

    const cellW = Math.max(3.5, ctx.measureText("M").width || preset.fontSize * 0.6);
    const cellH = Math.max(5, Math.round(preset.fontSize * 1.18));
    const cols = Math.max(8, Math.ceil(W / cellW));
    const rows = Math.max(8, Math.ceil(H / cellH));

    // Square-pixel supersampled source buffer so the lotus emblem & arm cutouts stay razor-sharp
    const ssW = Math.max(120, W);
    const ssH = Math.max(120, H);
    const offCanvas = document.createElement("canvas");
    offCanvas.width = ssW;
    offCanvas.height = ssH;
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    let rafId = 0;
    const startMs = performance.now();

    const drawFrame = (now: number) => {
      const t = preset.animated ? (now - startMs) * 0.001 : 0.8;
      const swaySpin = preset.animated ? Math.sin(t * 1.8) * 0.36 : 0.0;
      const swayRoll = preset.animated ? Math.sin(t * 1.1) * 0.08 : 0.0;

      drawShadedMeditatingGuardian(
        offCtx,
        ssW,
        ssH,
        t,
        swayRoll,
        swaySpin,
        0.85,
        1.0,
        1.14,
        0,
        0,
        isExistence ? 1.0 : 0.0
      );

      const pixels = offCtx.getImageData(0, 0, ssW, ssH).data;
      ctx.fillStyle = isExistence ? "#000000" : "#050914";
      ctx.fillRect(0, 0, W, H);
      ctx.font = fontSpec;

      let lastColor = "";
      for (let r = 0; r < rows; r++) {
        const py = r * cellH;
        const sy = Math.min(ssH - 1, Math.floor(((py + cellH * 0.5) / H) * ssH));
        let batchStr = "";
        let batchStart = 0;
        let batchColor = "";

        const flush = () => {
          if (batchStr.length > 0 && batchColor) {
            if (batchColor !== lastColor) {
              ctx.fillStyle = batchColor;
              lastColor = batchColor;
            }
            ctx.fillText(batchStr, batchStart * cellW, py);
            batchStr = "";
          }
        };

        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * cellW;
          const sx = Math.min(ssW - 1, Math.floor((px / W) * ssW));
          const pIdx = (sy * ssW + sx) * 4;
          const pr = pixels[pIdx];
          const pg = pixels[pIdx + 1];
          const pb = pixels[pIdx + 2];
          const lum = (0.299 * pr + 0.587 * pg + 0.114 * pb) / 255.0;

          const idx = Math.min(RAMP_LEN - 1, Math.max(0, Math.floor(lum * (RAMP_LEN - 1))));
          if (idx <= 1) {
            flush();
            continue;
          }

          const ch = RAMP[idx];
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

      if (preset.animated) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame(startMs);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isExistence, preset]);

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    if (isExistence) {
      setTheme("matrix");
      return;
    }
    sound.playClick();
    triggerLogoThemeShift("existence");
  };

  const canvasNode = (
    <canvas
      ref={canvasRef}
      style={{ width: preset.width, height: preset.height }}
      className="block rounded select-none"
    />
  );

  if (!framed) {
    return (
      <div
        onClick={interactive ? handleClick : undefined}
        className={`inline-flex items-center justify-center ${
          interactive ? "cursor-pointer active:scale-95 transition-transform" : ""
        } ${className}`}
      >
        {canvasNode}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label || "ZaneX Procedural ASCII Emblem"}
      title={label || "ZaneX Procedural ASCII Emblem"}
      className={`inline-flex items-center justify-center p-1 transition-all select-none ${
        interactive ? "cursor-pointer active:scale-95" : "cursor-default"
      } ${
        isExistence
          ? "bg-black border border-white/70"
          : "rounded-lg bg-[#050914] border border-primary/45 hover:border-primary"
      } ${className}`}
    >
      {canvasNode}
    </button>
  );
};
