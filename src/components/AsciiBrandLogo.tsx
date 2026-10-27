import React, { useMemo, useState } from "react";
import { MEDITATING_LOGO_SVG_PATH } from "@/components/CelestialZenLogo";
import { useUniverseTheme } from "@/context/ThemeContext";

export type AsciiLogoSize = "micro" | "sm" | "md" | "lg";

interface AsciiBrandLogoProps {
  size?: AsciiLogoSize;
  interactive?: boolean;
  withPopover?: boolean;
  framed?: boolean;
  className?: string;
  label?: string;
}

const SIZE_PRESETS: Record<
  AsciiLogoSize,
  { cols: number; rows: number; fontPx: number; linePx: number }
> = {
  micro: { cols: 13, rows: 7, fontPx: 5.1, linePx: 5.3 },
  sm: { cols: 17, rows: 9, fontPx: 6.2, linePx: 6.5 },
  md: { cols: 21, rows: 11, fontPx: 7.4, linePx: 7.8 },
  lg: { cols: 31, rows: 16, fontPx: 10.0, linePx: 10.6 },
};

// Standard ISO/Unicode 8-dot Braille subpixel bit positions within a 2x4 cell
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
  // Map SVG [-98..98] x [-80..98] cleanly into the subpixel grid
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
      // U+2800 (Braille Blank) ensures identical glyph width with U+2801..U+28FF across all OS fonts
      rowStr += String.fromCharCode(0x2800 | mask);
    }
    lines.push(rowStr);
  }

  const result = lines.join("\n");
  rasterCache.set(key, result);
  return result;
}

export const AsciiBrandLogo: React.FC<AsciiBrandLogoProps> = ({
  size = "micro",
  interactive = true,
  withPopover = false,
  framed = true,
  className = "",
  label,
}) => {
  const { isExistence, triggerLogoThemeShift } = useUniverseTheme();
  const [hovered, setHovered] = useState(false);

  const preset = SIZE_PRESETS[size];
  const brailleArt = useMemo(
    () => rasterizeMeditatingBraille(preset.cols, preset.rows),
    [preset.cols, preset.rows]
  );
  const hologramArt = useMemo(
    () => (withPopover ? rasterizeMeditatingBraille(31, 16) : ""),
    [withPopover]
  );

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
      className={`font-mono font-bold tracking-normal select-none m-0 whitespace-pre transition-colors ${
        isExistence
          ? "text-white group-hover/ascii:text-black"
          : "text-[#00ff9e] drop-shadow-[0_0_6px_rgba(0,255,158,0.55)] group-hover/ascii:text-white"
      }`}
    >
      {brailleArt}
    </pre>
  );

  if (!framed) {
    return (
      <div
        onClick={interactive ? handleClick : undefined}
        className={`inline-flex flex-col items-center ${
          interactive ? "cursor-pointer group/ascii" : ""
        } ${className}`}
        title={
          label ||
          (interactive
            ? `Click ASCII Emblem → 3D Rolling Zoom & Switch to ${nextUniverseName}`
            : undefined)
        }
      >
        {preBlock}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => withPopover && setHovered(true)}
      onMouseLeave={() => withPopover && setHovered(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        onFocus={() => withPopover && setHovered(true)}
        onBlur={() => withPopover && setHovered(false)}
        aria-label={
          label || `ZaneX ASCII Emblem — Click for 3D Rolling Zoom to ${nextUniverseName}`
        }
        title={
          label || `Click ASCII Emblem → 3D Rolling Zoom & Switch to ${nextUniverseName}`
        }
        className={`group/ascii relative inline-flex flex-col items-center justify-center transition-all select-none ${
          interactive ? "cursor-pointer active:scale-95" : "cursor-default"
        } ${
          size === "micro"
            ? "px-1.5 py-1"
            : size === "sm"
            ? "px-2 py-1.5"
            : "px-2.5 py-2"
        } ${
          isExistence
            ? "bg-black border border-white/70 hover:bg-white shadow-[0_0_16px_rgba(255,255,255,0.18)]"
            : "rounded-lg bg-[#040915]/95 border border-primary/50 hover:border-primary shadow-[0_0_16px_rgba(0,255,158,0.22)] hover:shadow-[0_0_24px_rgba(0,255,158,0.42)]"
        }`}
      >
        {preBlock}
      </button>

      {/* Full-Size Glowing ASCII Hologram Popover (Desktop Hover / Focus) */}
      {withPopover && hovered && (
        <div
          onClick={handleClick}
          style={{
            backgroundColor: isExistence ? "rgba(0, 0, 0, 0.94)" : "rgba(4, 9, 20, 0.90)",
            backdropFilter: "blur(18px) saturate(145%)",
            WebkitBackdropFilter: "blur(18px) saturate(145%)",
          }}
          className={`hidden sm:flex flex-col items-center gap-2 p-3.5 absolute left-0 top-full mt-2.5 z-[95] cursor-pointer font-mono select-none transition-all ${
            isExistence
              ? "border-2 border-white text-white shadow-[0_24px_60px_rgba(0,0,0,0.95)]"
              : "rounded-xl border border-primary/70 text-white shadow-[0_24px_60px_rgba(0,0,0,0.92),0_0_32px_rgba(0,255,158,0.20)]"
          }`}
        >
          <div
            className={`w-full flex items-center justify-between gap-4 text-[10px] font-bold pb-1.5 border-b ${
              isExistence ? "border-white/30 text-white" : "border-primary/30 text-primary"
            }`}
          >
            <span>┌──[ Z A N E X // Ω ]</span>
            <span className="opacity-80">▓▒░ BRAILLE_8X</span>
          </div>

          <pre
            aria-hidden="true"
            style={{ fontSize: "9.5px", lineHeight: "10px" }}
            className={`font-mono font-bold whitespace-pre m-0 py-0.5 ${
              isExistence
                ? "text-white"
                : "text-[#00ff9e] drop-shadow-[0_0_10px_rgba(0,255,158,0.55)]"
            }`}
          >
            {hologramArt}
          </pre>

          <div
            className={`w-full text-center text-[9.5px] font-bold px-2 py-1 border ${
              isExistence
                ? "border-white/40 bg-white text-black"
                : "rounded border-primary/40 bg-primary/15 text-[#00ff9e]"
            }`}
          >
            ◈ CLICK → 3D ROLLING ZOOM · {nextUniverseName}
          </div>
        </div>
      )}
    </div>
  );
};
