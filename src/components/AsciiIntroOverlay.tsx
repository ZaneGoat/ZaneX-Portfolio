import React, { useEffect, useRef, useState, useCallback } from "react";

interface AsciiIntroOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
}

const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;
const CELL_W = 10;
const CELL_H = 16;

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
  const [phaseLabel, setPhaseLabel] = useState("PHASE 01 // OCULAR SDF & BLINK");
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
    setPhaseLabel("PHASE 01 // OCULAR SDF & BLINK");

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
    let cols = 0;
    let rows = 0;
    let aspect = 1;
    let uCoords = new Float32Array(0);
    let vCoords = new Float32Array(0);

    const resizeGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `bold ${CELL_H - 2}px 'Consolas', 'Courier New', monospace`;
      ctx.textBaseline = "top";

      cols = Math.max(20, Math.ceil(width / CELL_W));
      rows = Math.max(15, Math.ceil(height / CELL_H));
      aspect = width / Math.max(1, height);

      uCoords = new Float32Array(cols);
      vCoords = new Float32Array(rows);

      const normScale = aspect >= 1.0 ? 1.0 : 1.0 / Math.max(0.55, aspect);
      for (let c = 0; c < cols; c++) {
        const nx = ((c + 0.5) / cols) * 2.0 - 1.0;
        uCoords[c] = nx * aspect * normScale;
      }
      for (let r = 0; r < rows; r++) {
        const ny = ((r + 0.5) / rows) * 2.0 - 1.0;
        vCoords[r] = ny * normScale;
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
      const cosTerm = Math.cos(clamp(u * 1.45, -1.57, 1.57));
      const baseArch = Math.max(0.0, cosTerm);

      const upperLid = -0.36 * Math.pow(baseArch, 1.15) * blinkOpen;
      const lowerLid = 0.32 * Math.pow(baseArch, 1.25) * blinkOpen;

      const insideAperture =
        Math.abs(u) < 1.08 && v > upperLid && v < lowerLid && blinkOpen > 0.015;

      if (insideAperture) {
        const lookX = 0.025 * Math.sin(t * 1.7);
        const lookY = 0.015 * Math.cos(t * 1.3);
        const eu = u - lookX;
        const ev = v - lookY;
        const r = Math.hypot(eu, ev);
        const angle = Math.atan2(ev, eu);

        const distToUpper = v - upperLid;
        const distToLower = lowerLid - v;
        const lidShadow =
          smoothstep(0.0, 0.08, distToUpper) * smoothstep(0.0, 0.06, distToLower);

        const specDist = Math.hypot(eu + 0.105, ev + 0.095);
        const spec2Dist = Math.hypot(eu - 0.085, ev - 0.075);
        const spec =
          Math.exp(-specDist * specDist * 950.0) +
          0.45 * Math.exp(-spec2Dist * spec2Dist * 1400.0);

        if (r < 0.13) {
          const pupilEdge = smoothstep(0.11, 0.13, r);
          let rr = mix(6, 55, pupilEdge);
          let gg = mix(5, 32, pupilEdge);
          let bb = mix(10, 18, pupilEdge);
          let lum = mix(0.03, 0.18, pupilEdge);

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
          const nr = (r - 0.13) / (0.34 - 0.13);
          const fiberWave = Math.sin(angle * 28.0 + Math.sin(r * 35.0 + t * 0.8));
          const fiberWave2 = Math.cos(angle * 19.0 - Math.cos(r * 42.0));
          const fibers = 0.5 + 0.32 * fiberWave + 0.18 * fiberWave2;

          const collarette = Math.exp(-Math.pow((nr - 0.28) / 0.18, 2.0));
          const limbal = smoothstep(1.0, 0.78, nr);

          const tone = clamp(fibers * 0.68 + collarette * 0.42, 0.0, 1.0) * limbal;

          let rr = mix(184, 245, tone) * (0.45 + 0.55 * limbal);
          let gg = mix(107, 165, tone) * (0.45 + 0.55 * limbal);
          let bb = mix(53, 85, tone) * (0.45 + 0.55 * limbal);

          rr *= 0.4 + 0.6 * lidShadow;
          gg *= 0.4 + 0.6 * lidShadow;
          bb *= 0.4 + 0.6 * lidShadow;

          let lum = clamp(
            (0.28 + 0.62 * tone) * limbal * (0.45 + 0.55 * lidShadow),
            0.05,
            0.95
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
          const sphereZ = Math.sqrt(Math.max(0.05, 1.0 - (u * u * 0.72 + v * v * 2.2)));
          const limbusAO = smoothstep(0.34, 0.39, r);
          const caruncle = smoothstep(-1.05, -0.72, u);
          const shade = sphereZ * (0.35 + 0.65 * lidShadow) * (0.75 + 0.25 * limbusAO);

          let rr = 216 * shade;
          let gg = 216 * shade;
          let bb = 232 * shade;

          const cornerPink = (1.0 - caruncle) * 0.35 + smoothstep(0.65, 1.02, Math.abs(u)) * 0.22;
          rr = mix(rr, 215, cornerPink);
          gg = mix(gg, 130, cornerPink);
          bb = mix(bb, 135, cornerPink);

          const lum = clamp(shade * 0.85, 0.08, 0.9);
          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        }
      }

      // Eyelids, Creases & Orbital Skin
      const dUpper = Math.abs(v - upperLid);
      const dLower = Math.abs(v - lowerLid);
      const dLid = Math.min(dUpper, dLower);

      const lashLine =
        Math.abs(u) < 1.08 ? Math.exp(-dLid * dLid * 1800.0) : 0.0;

      const creaseCurve = -0.36 * Math.pow(baseArch, 1.1) * (0.35 + 0.65 * blinkOpen) - 0.14;
      const dCrease =
        Math.abs(v - creaseCurve) + Math.max(0.0, Math.abs(u) - 0.95) * 0.5;
      const creaseShadow = Math.exp(-dCrease * dCrease * 260.0);

      const lowerBagCurve = 0.32 * Math.pow(baseArch, 1.2) * (0.4 + 0.6 * blinkOpen) + 0.12;
      const dBag =
        Math.abs(v - lowerBagCurve) + Math.max(0.0, Math.abs(u) - 0.85) * 0.5;
      const bagShadow = 0.45 * Math.exp(-dBag * dBag * 220.0);

      const browCurve = -0.62 - 0.12 * Math.cos(clamp(u * 1.8, -1.57, 1.57));
      const dBrow =
        Math.abs(v - browCurve) + Math.max(0.0, Math.abs(u) - 1.05) * 0.4;
      const browMask =
        Math.exp(-dBrow * dBrow * 110.0) * smoothstep(1.18, 0.85, Math.abs(u));

      const radialVignette = smoothstep(1.65, 0.25, Math.hypot(u * 0.78, v * 1.05));
      const lidBulge =
        Math.exp(-dUpper * dUpper * 45.0) * 0.22 +
        Math.exp(-dLower * dLower * 60.0) * 0.14;

      let skinTone =
        0.52 * radialVignette +
        lidBulge -
        0.38 * creaseShadow -
        0.22 * bagShadow -
        0.45 * browMask;
      skinTone = clamp(skinTone, 0.0, 1.0);

      let rr = mix(200, 240, skinTone) * radialVignette;
      let gg = mix(138, 184, skinTone) * radialVignette;
      let bb = mix(101, 149, skinTone) * radialVignette;

      if (lashLine > 0.05) {
        const l = clamp(lashLine * 0.92, 0.0, 1.0);
        rr = mix(rr, 42, l);
        gg = mix(gg, 22, l);
        bb = mix(bb, 18, l);
        skinTone = mix(skinTone, 0.06, l);
      }

      if (browMask > 0.1) {
        const b = clamp(browMask * 0.65, 0.0, 1.0);
        rr = mix(rr, 75, b);
        gg = mix(gg, 45, b);
        bb = mix(bb, 32, b);
      }

      const lum = clamp(skinTone * 0.78 * radialVignette, 0.02, 0.86);
      eyeOut.r = rr;
      eyeOut.g = gg;
      eyeOut.b = bb;
      eyeOut.lum = lum;
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
    let currentPhase = 1;

    const renderFrame = (now: number) => {
      const t = (now - startTime) * 0.001;

      if (t < 3.2 && currentPhase !== 1) {
        currentPhase = 1;
        setPhaseLabel("PHASE 01 // OCULAR SDF & BLINK");
      } else if (t >= 3.2 && t < 7.5 && currentPhase !== 2) {
        currentPhase = 2;
        setPhaseLabel("PHASE 02 // PUPIL SINGULARITY & HEART NEBULA");
      } else if (t >= 7.5 && currentPhase !== 3) {
        currentPhase = 3;
        setPhaseLabel("PHASE 03 // NEBULA DISSOLVE -> ZANEX ROOT");
      }

      // Blink factor (1.2s -> 1.8s)
      let blinkOpen = 1.0;
      if (t >= 1.2 && t <= 1.8) {
        const bp = (t - 1.2) / 0.6;
        if (bp < 0.5) {
          blinkOpen = 1.0 - easeInOutCubic(bp * 2.0);
        } else {
          blinkOpen = easeInOutCubic((bp - 0.5) * 2.0);
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
        const py = r * CELL_H;

        for (let c = 0; c < cols; c++) {
          const u = uCoords[c];

          if (p3Progress > 0.05) {
            const cellHash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
            const rand01 = cellHash - Math.floor(cellHash);
            if (rand01 < p3Progress * 1.08 - 0.08) {
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
          if (charIdx === 0) continue;

          const ch = RAMP[charIdx];
          const qr = finalR & 248;
          const qg = finalG & 248;
          const qb = finalB & 248;
          const colorStr = `rgb(${qr},${qg},${qb})`;

          if (colorStr !== lastColor) {
            ctx.fillStyle = colorStr;
            lastColor = colorStr;
          }

          ctx.fillText(ch, c * CELL_W, py);
        }
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

      {/* Top-Left Telemetry Status */}
      <div className="fixed top-5 left-5 z-[130] flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/65 border border-white/15 backdrop-blur-md font-mono text-[11px] tracking-widest uppercase text-white/75 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#ff2a55] animate-pulse" />
        <span>{phaseLabel}</span>
      </div>

      {/* Bottom-Right Skip Intro Button */}
      <button
        type="button"
        onClick={finishIntro}
        className="fixed bottom-6 right-6 z-[130] flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/70 hover:bg-rose-500/20 border border-white/20 hover:border-rose-400/60 backdrop-blur-md font-mono text-xs tracking-widest uppercase text-white/80 hover:text-white transition-all shadow-lg cursor-pointer"
      >
        <span>Skip Intro</span>
        <span className="text-rose-400">→</span>
      </button>
    </div>
  );
};
