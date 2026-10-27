import React, { useEffect, useRef, useState, useCallback } from "react";

interface AsciiIntroOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
}

const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;

interface Star {
  x: number;
  y: number;
  freq: number;
  phase: number;
  size: number;
  tint: number; // 0: #ffffff, 1: #aaddff
}

const NUM_STARS = 42;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
};
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4.0 * x * x * x : 1.0 - Math.pow(-2.0 * x + 2.0, 3.0) / 2.0;
const easeInExpo = (x: number) => (x <= 0.0 ? 0.0 : Math.pow(2.0, 10.0 * x - 10.0));
const easeInOutExpo = (x: number) => {
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;
  return x < 0.5
    ? Math.pow(2.0, 20.0 * x - 10.0) / 2.0
    : (2.0 - Math.pow(2.0, -20.0 * x + 10.0)) / 2.0;
};

export const AsciiIntroOverlay: React.FC<AsciiIntroOverlayProps> = ({
  isOpen,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const completedRef = useRef(false);

  const finishIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFadingOut(true);
    window.setTimeout(() => {
      onComplete();
    }, 650);
  }, [onComplete]);

  useEffect(() => {
    if (!isOpen) {
      completedRef.current = false;
      setFadingOut(false);
      return;
    }

    completedRef.current = false;
    setFadingOut(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Deterministic pseudo-random stars
    const stars: Star[] = [];
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < NUM_STARS; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 0.12 + rand() * 1.45;
      stars.push({
        x: Math.cos(ang) * rad * 1.35,
        y: Math.sin(ang) * rad,
        freq: 2.2 + rand() * 4.5,
        phase: rand() * Math.PI * 2,
        size: 0.65 + rand() * 0.85,
        tint: rand() > 0.45 ? 1 : 0,
      });
    }

    let width = 0;
    let height = 0;
    let cellW = 8;
    let cellH = 13;
    let cols = 0;
    let rows = 0;
    let uCoords = new Float32Array(0);
    let vCoords = new Float32Array(0);

    const resizeGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const isDesktop = width >= 768;

      let fontSize = 12;
      if (width < 640) {
        fontSize = 10;
      } else if (width < 1024) {
        fontSize = 12;
      } else {
        fontSize = 14;
      }

      ctx.font = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;
      const charWidth = ctx.measureText("M").width || 8.4;
      cellW = Math.max(5, Math.round(charWidth));
      cellH = Math.max(8, Math.round(fontSize * 1.25));

      // 1:1 pixel buffer prevents 4K retina blit stalls on 1080p desktop monitors
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;
      ctx.textBaseline = "top";

      cols = Math.max(30, Math.ceil(width / cellW));
      rows = Math.max(20, Math.ceil(height / cellH));

      uCoords = new Float32Array(cols);
      vCoords = new Float32Array(rows);

      // Isotropic unitPixels: identical physical pixel scaling for X and Y
      // Ensures the iris and eye are perfectly circular and centered on any monitor
      const unitPixels = isDesktop
        ? Math.min(height * 0.60, width * 0.38)
        : Math.min(height * 0.36, width * 0.44);

      for (let c = 0; c < cols; c++) {
        const px = (c + 0.5) * cellW - width * 0.5;
        uCoords[c] = px / unitPixels;
      }
      for (let r = 0; r < rows; r++) {
        const py = (r + 0.5) * cellH - height * 0.5;
        vCoords[r] = py / unitPixels;
      }
    };

    resizeGrid();
    window.addEventListener("resize", resizeGrid, { passive: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        finishIntro();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Output scratch tuple
    const eyeOut = { r: 0, g: 0, b: 0, lum: 0 };
    const spaceOut = { r: 0, g: 0, b: 0, lum: 0 };

    const evaluateEye = (u: number, v: number, t: number, blinkOpen: number) => {
      // Fast early rejection: eye aperture + lashes span [-1.05, 1.05] in U and [-0.42, 0.42] in V
      const absU = Math.abs(u);
      const absV = Math.abs(v);
      if (absU >= 1.05 || absV >= 0.42) {
        eyeOut.lum = 0;
        return;
      }

      const eyeSpanX = 1.05;
      const nx = u / eyeSpanX;
      // Symmetrical almond arch: 1.0 at center, 0.0 at outer corners
      const arch = Math.pow(Math.max(0.0, 1.0 - nx * nx), 0.85);

      // Symmetrically centered around v = 0 (exact screen vertical midpoint)
      const maxHalfOpen = 0.38;
      const upperLid = -maxHalfOpen * arch * blinkOpen;
      const lowerLid = maxHalfOpen * arch * blinkOpen;

      const insideAperture = v >= upperLid && v <= lowerLid && blinkOpen > 0.015;

      if (insideAperture) {
        // Subtle micro-saccades locked to center during zoom
        const dampLook = t > 3.0 ? Math.max(0.0, 1.0 - (t - 3.0) * 2.0) : 1.0;
        const lookX = 0.012 * Math.sin(t * 1.3) * dampLook;
        const lookY = 0.007 * Math.cos(t * 1.1) * dampLook;
        const eu = u - lookX;
        const ev = v - lookY;
        const r = Math.hypot(eu, ev);
        const angle = Math.atan2(ev, eu);

        const distToUpper = v - upperLid;
        const distToLower = lowerLid - v;
        const lidShadow =
          smoothstep(0.0, 0.12, distToUpper) * smoothstep(0.0, 0.08, distToLower);

        // Specular highlight: crisp pin-point glint + secondary reflection
        const specDist = Math.hypot(eu + 0.08, ev + 0.07);
        const spec2Dist = Math.hypot(eu - 0.07, ev - 0.06);
        const spec =
          Math.exp(-specDist * specDist * 1200.0) +
          0.38 * Math.exp(-spec2Dist * spec2Dist * 1500.0);

        if (r < 0.13) {
          // Pupil: deep velvet black with smooth anti-aliased edge
          const pupilEdge = smoothstep(0.11, 0.13, r);
          let rr = mix(4, 42, pupilEdge);
          let gg = mix(4, 25, pupilEdge);
          let bb = mix(8, 16, pupilEdge);
          let lum = mix(0.02, 0.16, pupilEdge);

          if (spec > 0.08) {
            const s = clamp(spec, 0.0, 1.0);
            rr = mix(rr, 255, s);
            gg = mix(gg, 255, s);
            bb = mix(bb, 255, s);
            lum = mix(lum, 1.0, s);
          }

          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        } else if (r < 0.34) {
          // Iris: glowing amber/gold and crimson fibers with dark limbal rim
          const nr = (r - 0.13) / (0.34 - 0.13);
          const fiberWave = Math.sin(angle * 26.0 + Math.sin(r * 32.0 + t * 0.7));
          const fiberWave2 = Math.cos(angle * 18.0 - Math.cos(r * 40.0));
          const fibers = 0.5 + 0.34 * fiberWave + 0.16 * fiberWave2;

          const collarette = Math.exp(-Math.pow((nr - 0.30) / 0.16, 2.0));
          const limbal = smoothstep(1.0, 0.76, nr);

          const tone = clamp(fibers * 0.65 + collarette * 0.45, 0.0, 1.0) * limbal;

          let rr = mix(205, 255, tone) * (0.42 + 0.58 * limbal);
          let gg = mix(125, 185, tone) * (0.42 + 0.58 * limbal);
          let bb = mix(55, 95, tone) * (0.42 + 0.58 * limbal);

          rr *= 0.45 + 0.55 * lidShadow;
          gg *= 0.45 + 0.55 * lidShadow;
          bb *= 0.45 + 0.55 * lidShadow;

          let lum = clamp(
            (0.32 + 0.65 * tone) * limbal * (0.45 + 0.55 * lidShadow),
            0.05,
            0.96
          );

          if (spec > 0.05) {
            const s = clamp(spec, 0.0, 1.0);
            rr = mix(rr, 255, s);
            gg = mix(gg, 255, s);
            bb = mix(bb, 255, s);
            lum = mix(lum, 1.0, s);
          }

          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        } else {
          // Sclera: 3D spherical eyeball depth with corner pink caruncles
          const sphereZ = Math.sqrt(Math.max(0.05, 1.0 - (u * u * 0.65 + v * v * 2.2)));
          const limbusAO = smoothstep(0.34, 0.39, r);
          const caruncle = smoothstep(-1.0, -0.65, u);
          const shade = sphereZ * (0.40 + 0.60 * lidShadow) * (0.75 + 0.25 * limbusAO);

          let rr = 220 * shade;
          let gg = 220 * shade;
          let bb = 236 * shade;

          const cornerPink = (1.0 - caruncle) * 0.30 + smoothstep(0.65, 1.0, Math.abs(u)) * 0.20;
          rr = mix(rr, 220, cornerPink);
          gg = mix(gg, 135, cornerPink);
          bb = mix(bb, 140, cornerPink);

          const lum = clamp(shade * 0.88, 0.08, 0.92);
          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        }
      }

      // Outside aperture: Only sleek lash rim along eyelid margins
      const dLid = Math.min(Math.abs(v - upperLid), Math.abs(v - lowerLid));
      if (dLid < 0.035) {
        const lashStrength = (1.0 - dLid / 0.035) * (1.0 - Math.abs(nx) * 0.45);
        eyeOut.r = mix(12, 45, lashStrength);
        eyeOut.g = mix(10, 25, lashStrength);
        eyeOut.b = mix(14, 20, lashStrength);
        eyeOut.lum = lashStrength * 0.18;
        return;
      }

      // Pure void: No skin, no brow, no orbital borders, no edges!
      eyeOut.lum = 0;
    };

    const evaluateSpaceAndHeart = (
      u: number,
      v: number,
      t: number,
      p3Progress: number
    ) => {
      let su = u;
      let sv = v;

      if (p3Progress > 0.0) {
        const p3Zoom = 1.0 + easeInExpo(p3Progress) * 9.5;
        su = u / p3Zoom;
        sv = v / p3Zoom;

        const rOrig = Math.hypot(u, v) + 1e-4;
        const angOrig = Math.atan2(v, u);
        const scatter =
          p3Progress * p3Progress * 0.65 * Math.sin(angOrig * 17.0 + rOrig * 24.0 - t * 9.0);
        su -= (u / rOrig) * scatter;
        sv -= (v / rOrig) * scatter;
      }

      let rr = 5.0;
      let gg = 5.0;
      let bb = 10.0;
      let lum = 0.015;

      const nebWave =
        Math.sin(su * 2.4 + t * 0.7) * Math.cos(sv * 2.4 - t * 0.5);
      const nebGlow =
        Math.exp(-Math.hypot(su * 0.8, sv * 0.8) * 1.4) * (0.5 + 0.5 * nebWave);
      rr += nebGlow * 38.0;
      gg += nebGlow * 12.0;
      bb += nebGlow * 45.0;
      lum += nebGlow * 0.1;

      for (let i = 0; i < NUM_STARS; i++) {
        const st = stars[i];
        const dx = Math.abs(su - st.x);
        const dy = Math.abs(sv - st.y);
        if (dx > 0.22 || dy > 0.22) continue;

        const pulse = 0.45 + 0.55 * Math.sin(t * st.freq + st.phase);
        const d2 = dx * dx + dy * dy;
        const core = Math.exp(-d2 * (1900.0 / st.size));
        const hFlare =
          Math.exp(-dy * dy * 4800.0) * Math.exp(-dx * 22.0 / st.size);
        const vFlare =
          Math.exp(-dx * dx * 4800.0) * Math.exp(-dy * 22.0 / st.size);
        const starVal = (core + 0.65 * (hFlare + vFlare)) * pulse;

        if (starVal > 0.02) {
          if (st.tint === 0) {
            rr += starVal * 255.0;
            gg += starVal * 255.0;
            bb += starVal * 255.0;
          } else {
            rr += starVal * 170.0;
            gg += starVal * 221.0;
            bb += starVal * 255.0;
          }
          lum += starVal * 0.92;
        }
      }

      const beat = 1.0 + 0.08 * Math.sin(t * 6.0);
      const heartScale = 0.44 * beat;
      const hx = su / heartScale;
      const hy = -sv / heartScale + 0.12;

      const x2 = hx * hx;
      const y2 = hy * hy;
      const a = x2 + y2 - 1.0;
      const F = a * a * a - x2 * (hy * y2);

      const plasma1 = Math.sin(hx * 5.2 + t * 3.4) * Math.cos(hy * 5.2 - t * 2.8);
      const plasma2 = Math.sin(Math.hypot(hx, hy) * 8.0 - t * 5.5);
      const plasma = 0.5 + 0.3 * plasma1 + 0.2 * plasma2;

      if (F <= 0.0) {
        const depth = clamp(Math.pow(Math.min(1.0, -F * 2.2), 0.35), 0.0, 1.0);
        const edgeRim = 1.0 - depth;

        let hr = mix(255, 255, plasma);
        let hg = mix(42, 107, plasma);
        let hb = mix(85, 139, plasma);

        const hot = clamp(edgeRim * 0.55 + Math.max(0.0, plasma - 0.55) * 0.9, 0.0, 1.0);
        hr = mix(hr, 255, hot);
        hg = mix(hg, 179, hot);
        hb = mix(hb, 193, hot);

        rr = hr;
        gg = hg;
        bb = hb;
        lum = clamp(0.58 + 0.38 * plasma + 0.2 * edgeRim, 0.4, 1.0);
      } else {
        const approxDist = Math.pow(F, 0.3333);
        const corona = Math.exp(-approxDist * 3.8) * (0.82 + 0.18 * plasma);

        if (corona > 0.02) {
          const cr = mix(255, 255, corona);
          const cg = mix(42, 107, corona);
          const cb = mix(85, 139, corona);

          rr += cr * corona * 1.15;
          gg += cg * corona * 1.05;
          bb += cb * corona * 1.15;
          lum += corona * 0.85;
        }
      }

      if (p3Progress > 0.0) {
        const fadeMultiplier = 1.0 - smoothstep(0.25, 0.98, p3Progress);
        lum *= fadeMultiplier;
        rr *= fadeMultiplier;
        gg *= fadeMultiplier;
        bb *= fadeMultiplier;
      }

      spaceOut.r = clamp(rr, 0, 255);
      spaceOut.g = clamp(gg, 0, 255);
      spaceOut.b = clamp(bb, 0, 255);
      spaceOut.lum = clamp(lum, 0.0, 1.0);
    };

    let rafId = 0;
    const startTime = performance.now();

    const renderFrame = (now: number) => {
      const t = (now - startTime) * 0.001;

      // Natural lifelike blinks centered on mid-screen
      let blinkOpen = 1.0;
      if (t >= 0.85 && t <= 1.45) {
        const bp = (t - 0.85) / 0.60;
        if (bp < 0.45) {
          blinkOpen = 1.0 - easeInOutCubic(bp / 0.45);
        } else if (bp <= 0.55) {
          blinkOpen = 0.0;
        } else {
          blinkOpen = easeInOutCubic((bp - 0.55) / 0.45);
        }
      } else if (t >= 2.2 && t <= 2.65) {
        const bp = (t - 2.2) / 0.45;
        if (bp < 0.45) {
          blinkOpen = 1.0 - easeInOutCubic(bp / 0.45);
        } else if (bp <= 0.55) {
          blinkOpen = 0.0;
        } else {
          blinkOpen = easeInOutCubic((bp - 0.55) / 0.45);
        }
      }

      // Phase 2 zoom & crossfade (3.2s -> 7.5s)
      let zoom = 1.0;
      let spaceMix = 0.0;
      if (t > 3.2) {
        const zNorm = clamp((t - 3.2) / (7.5 - 3.2), 0.0, 1.0);
        zoom = mix(1.0, 14.0, easeInOutExpo(zNorm));
        spaceMix = smoothstep(0.12, 0.62, zNorm);
      }

      // Phase 3 progress (7.5s -> 9.5s)
      let p3Progress = 0.0;
      if (t > 7.5) {
        p3Progress = clamp((t - 7.5) / 2.0, 0.0, 1.0);
      }

      // Clear background
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, width, height);

      let lastColor = "";

      for (let r = 0; r < rows; r++) {
        const v = vCoords[r];
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

          if (p3Progress > 0.05) {
            const cellHash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
            const rand01 = cellHash - Math.floor(cellHash);
            if (rand01 < p3Progress * 1.08 - 0.08) {
              flushBatch();
              continue;
            }
          }

          let finalR = 0;
          let finalG = 0;
          let finalB = 0;
          let finalLum = 0;

          if (spaceMix < 0.999) {
            evaluateEye(u / zoom, v / zoom, t, blinkOpen);
            finalR = eyeOut.r;
            finalG = eyeOut.g;
            finalB = eyeOut.b;
            finalLum = eyeOut.lum;
          }

          if (spaceMix > 0.001) {
            evaluateSpaceAndHeart(u, v, t, p3Progress);
            finalR = mix(finalR, spaceOut.r, spaceMix);
            finalG = mix(finalG, spaceOut.g, spaceMix);
            finalB = mix(finalB, spaceOut.b, spaceMix);
            finalLum = mix(finalLum, spaceOut.lum, spaceMix);
          }

          const charIdx = clamp(Math.floor(finalLum * (RAMP_LEN - 1)), 0, RAMP_LEN - 1);
          if (charIdx === 0) {
            flushBatch();
            continue;
          }

          const ch = RAMP[charIdx];
          const qr = (finalR >> 3) << 3;
          const qg = (finalG >> 3) << 3;
          const qb = (finalB >> 3) << 3;
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

      if (t >= 9.45) {
        finishIntro();
        return;
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeGrid);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, finishIntro]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[120] bg-[#050508] transition-opacity duration-700 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Procedural ASCII Art Intro Animation"
    >
      <canvas ref={canvasRef} className="block w-full h-full select-none" />
    </div>
  );
};
