import React, { useEffect, useRef } from "react";

const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
};

/**
 * Matrix HUD Background Watching Eye
 * - Live procedural 70-character RGB ASCII eye behind the Matrix HUD layout.
 * - Smoothly tracks cursor/touch position across the entire viewport.
 * - Blinks organically on every click/tap anywhere on the page (via capture listener),
 *   plus occasional natural idle blinks.
 */
export const MatrixWatchingEye: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 1;
    let height = 1;
    let cellW = 8;
    let cellH = 14;
    let cols = 1;
    let rows = 1;
    let fontSpec = "bold 12px 'Consolas', 'Courier New', monospace";
    let uCoords = new Float32Array(0);
    let vCoords = new Float32Array(0);
    let activeColStart = 0;
    let activeColEnd = 0;
    let activeRowStart = 0;
    let activeRowEnd = 0;

    let targetX = 0;
    let targetY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const startTime = performance.now();
    let manualBlinkStart = -10;
    let autoBlinkStart = -10;
    let nextAutoBlinkTime = 4.0;

    const resizeGrid = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const isDesktop = width >= 768;

      const fontSize = width < 640 ? 10 : width < 1024 ? 12 : 13;
      fontSpec = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;
      ctx.font = fontSpec;
      const charWidth = ctx.measureText("M").width || fontSize * 0.6;
      cellW = Math.max(6, Math.round(charWidth));
      cellH = Math.max(9, Math.round(fontSize * 1.24));

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = fontSpec;
      ctx.textBaseline = "top";

      cols = Math.max(20, Math.ceil(width / cellW));
      rows = Math.max(16, Math.ceil(height / cellH));

      uCoords = new Float32Array(cols);
      vCoords = new Float32Array(rows);

      // Large isotropic scale so the background eye spans majestically across the Matrix HUD
      const unitPixels = isDesktop
        ? Math.min(height * 0.56, width * 0.42)
        : Math.min(height * 0.36, width * 0.46);

      activeColStart = cols;
      activeColEnd = 0;
      for (let c = 0; c < cols; c++) {
        const px = (c + 0.5) * cellW - width * 0.5;
        const u = px / unitPixels;
        uCoords[c] = u;
        if (Math.abs(u) <= 1.12) {
          if (c < activeColStart) activeColStart = c;
          if (c > activeColEnd) activeColEnd = c;
        }
      }

      activeRowStart = rows;
      activeRowEnd = 0;
      for (let r = 0; r < rows; r++) {
        const py = (r + 0.5) * cellH - height * 0.5;
        const v = py / unitPixels;
        vCoords[r] = v;
        if (Math.abs(v) <= 0.52) {
          if (r < activeRowStart) activeRowStart = r;
          if (r > activeRowEnd) activeRowEnd = r;
        }
      }
    };

    resizeGrid();

    const updateTargetFromPoint = (clientX: number, clientY: number) => {
      if (width <= 0 || height <= 0) return;
      targetX = clamp((clientX - width * 0.5) / (width * 0.5), -1.0, 1.0);
      targetY = clamp((clientY - height * 0.5) / (height * 0.5), -1.0, 1.0);
    };

    const onPointerMove = (e: PointerEvent) => {
      updateTargetFromPoint(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      updateTargetFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      const nowSec = (performance.now() - startTime) * 0.001;
      manualBlinkStart = nowSec;
      nextAutoBlinkTime = nowSec + 3.8 + Math.random() * 3.0;
      updateTargetFromPoint(e.clientX, e.clientY);
    };

    // Capture phase ensures clicks on buttons/cards that call stopPropagation() still blink the eye
    window.addEventListener("resize", resizeGrid, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: true });
    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });

    const eyeOut = { r: 0, g: 0, b: 0, lum: 0 };

    const computeBlinkFactor = (elapsed: number, duration: number): number => {
      if (elapsed < 0 || elapsed > duration) return 1.0;
      const closeEnd = duration * 0.36;
      const holdEnd = duration * 0.50;
      if (elapsed < closeEnd) {
        return 1.0 - 0.98 * smoothstep(0.0, 1.0, elapsed / closeEnd);
      }
      if (elapsed < holdEnd) {
        return 0.02;
      }
      return 0.02 + 0.98 * smoothstep(0.0, 1.0, (elapsed - holdEnd) / (duration - holdEnd));
    };

    const evaluateWatchingEye = (
      u: number,
      v: number,
      t: number,
      blinkOpen: number,
      lookU: number,
      lookV: number,
      clickPulse: number
    ) => {
      const absU = Math.abs(u);
      const absV = Math.abs(v);
      if (absU >= 1.06 || absV >= 0.46) {
        eyeOut.lum = 0;
        return;
      }

      const eyeSpanX = 1.04;
      const nx = u / eyeSpanX;
      const arch = Math.pow(Math.max(0.0, 1.0 - nx * nx), 0.85);

      const maxHalfOpen = 0.38;
      const gazeLidShift = lookV * 0.05 * arch * blinkOpen;
      const upperLid = -maxHalfOpen * arch * blinkOpen + gazeLidShift;
      const lowerLid = maxHalfOpen * arch * blinkOpen + gazeLidShift;

      const insideAperture = v >= upperLid && v <= lowerLid && blinkOpen > 0.02;

      if (insideAperture) {
        const eu = u - lookU;
        const ev = v - lookV;
        const r = Math.hypot(eu, ev);
        const angle = Math.atan2(ev, eu);

        const distToUpper = v - upperLid;
        const distToLower = lowerLid - v;
        const lidShadow =
          smoothstep(0.0, 0.11, distToUpper) * smoothstep(0.0, 0.08, distToLower);

        const specDist = Math.hypot(eu + 0.075 - lookU * 0.14, ev + 0.068 - lookV * 0.14);
        const spec2Dist = Math.hypot(eu - 0.068, ev - 0.055);
        const spec =
          Math.exp(-specDist * specDist * 1150.0) +
          0.42 * Math.exp(-spec2Dist * spec2Dist * 1450.0);

        const pupilRadius = 0.125 + 0.032 * clickPulse;

        if (r < pupilRadius) {
          const pupilEdge = smoothstep(pupilRadius - 0.024, pupilRadius, r);
          let rr = mix(4, 0, pupilEdge);
          let gg = mix(8, 145, pupilEdge);
          let bb = mix(14, 102, pupilEdge);
          let lum = mix(0.04, 0.38, pupilEdge);

          if (spec > 0.06) {
            const s = clamp(spec, 0.0, 1.0);
            rr = mix(rr, 235, s);
            gg = mix(gg, 255, s);
            bb = mix(bb, 248, s);
            lum = mix(lum, 1.0, s);
          }

          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        } else if (r < 0.355) {
          const nr = (r - pupilRadius) / (0.355 - pupilRadius);
          const fiberWave = Math.sin(angle * 26.0 + Math.sin(r * 34.0 + t * 0.9));
          const fiberWave2 = Math.cos(angle * 18.0 - Math.cos(r * 42.0 - t * 0.6));
          const fibers = 0.5 + 0.34 * fiberWave + 0.16 * fiberWave2;

          const collarette = Math.exp(-Math.pow((nr - 0.28) / 0.16, 2.0));
          const limbal = smoothstep(1.0, 0.74, nr);
          const tone = clamp(fibers * 0.68 + collarette * 0.48, 0.0, 1.0) * limbal;

          const goldMix = clamp(collarette * (0.52 + 0.48 * clickPulse), 0.0, 1.0);
          const baseR = mix(0, 255, goldMix);
          const baseG = mix(255, 215, goldMix);
          const baseB = mix(158, 95, goldMix);

          let rr = mix(baseR * 0.35, baseR, tone) * (0.45 + 0.55 * limbal);
          let gg = mix(baseG * 0.48, baseG, tone) * (0.45 + 0.55 * limbal);
          let bb = mix(baseB * 0.48, baseB, tone) * (0.45 + 0.55 * limbal);

          rr *= 0.48 + 0.52 * lidShadow;
          gg *= 0.48 + 0.52 * lidShadow;
          bb *= 0.48 + 0.52 * lidShadow;

          let lum = clamp(
            (0.35 + 0.63 * tone) * limbal * (0.48 + 0.52 * lidShadow),
            0.07,
            0.96
          );

          if (spec > 0.05) {
            const s = clamp(spec, 0.0, 1.0);
            rr = mix(rr, 240, s);
            gg = mix(gg, 255, s);
            bb = mix(bb, 250, s);
            lum = mix(lum, 1.0, s);
          }

          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        } else {
          const sphereZ = Math.sqrt(Math.max(0.05, 1.0 - (u * u * 0.65 + v * v * 2.2)));
          const limbusAO = smoothstep(0.355, 0.405, r);
          const shade = sphereZ * (0.40 + 0.60 * lidShadow) * (0.72 + 0.28 * limbusAO);

          eyeOut.r = 72 * shade;
          eyeOut.g = 210 * shade;
          eyeOut.b = 165 * shade;
          eyeOut.lum = clamp(shade * 0.62, 0.06, 0.66);
          return;
        }
      }

      // Eyelid cyber-lash contour (glows brightly during blink closure!)
      const dLid = Math.min(Math.abs(v - upperLid), Math.abs(v - lowerLid));
      const lidThickness = blinkOpen < 0.15 ? 0.052 : 0.038;
      if (dLid < lidThickness) {
        const lashStrength = (1.0 - dLid / lidThickness) * (1.0 - Math.abs(nx) * 0.32);
        const blinkGlow = 1.0 + (1.0 - blinkOpen) * 0.75;
        eyeOut.r = clamp(mix(0, 120, lashStrength) * blinkGlow, 0, 255);
        eyeOut.g = clamp(mix(110, 255, lashStrength) * blinkGlow, 0, 255);
        eyeOut.b = clamp(mix(75, 190, lashStrength) * blinkGlow, 0, 255);
        eyeOut.lum = clamp(lashStrength * (0.46 + 0.38 * (1.0 - blinkOpen)), 0.09, 0.88);
        return;
      }

      eyeOut.lum = 0;
    };

    let rafId = 0;
    let lastFrameMs = 0;
    const frameInterval = 1000 / 32;

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      if (document.hidden) return;
      if (now - lastFrameMs < frameInterval) return;
      lastFrameMs = now;

      const t = (now - startTime) * 0.001;

      if (t >= nextAutoBlinkTime) {
        autoBlinkStart = t;
        nextAutoBlinkTime = t + 4.0 + Math.random() * 3.5;
      }

      smoothX += (targetX - smoothX) * 0.16;
      smoothY += (targetY - smoothY) * 0.16;

      // Full-range cursor tracking across the almond eye aperture
      const lookU = smoothX * 0.40 + 0.007 * Math.sin(t * 1.4);
      const lookV = smoothY * 0.18 + 0.005 * Math.cos(t * 1.1);

      const manualBlink = computeBlinkFactor(t - manualBlinkStart, 0.30);
      const autoBlink = computeBlinkFactor(t - autoBlinkStart, 0.25);
      const blinkOpen = Math.min(manualBlink, autoBlink);

      const sinceClick = t - manualBlinkStart;
      const clickPulse =
        sinceClick >= 0 && sinceClick < 0.55
          ? Math.sin((sinceClick / 0.55) * Math.PI)
          : 0.0;

      ctx.clearRect(0, 0, width, height);
      ctx.font = fontSpec;

      for (let r = activeRowStart; r <= activeRowEnd; r++) {
        const v = vCoords[r];
        const py = r * cellH;

        let batchStr = "";
        let batchStartCol = 0;
        let batchColor = "";

        const flushBatch = () => {
          if (batchStr.length > 0) {
            ctx.fillStyle = batchColor;
            ctx.fillText(batchStr, batchStartCol * cellW, py);
            batchStr = "";
          }
        };

        for (let c = activeColStart; c <= activeColEnd; c++) {
          const u = uCoords[c];
          evaluateWatchingEye(u, v, t, blinkOpen, lookU, lookV, clickPulse);

          if (eyeOut.lum <= 0.03) {
            flushBatch();
            continue;
          }

          const charIdx = clamp(Math.floor(eyeOut.lum * (RAMP_LEN - 1)), 0, RAMP_LEN - 1);
          if (charIdx === 0) {
            flushBatch();
            continue;
          }

          const ch = RAMP[charIdx];
          const qr = (Math.round(eyeOut.r) >> 3) << 3;
          const qg = (Math.round(eyeOut.g) >> 3) << 3;
          const qb = (Math.round(eyeOut.b) >> 3) << 3;
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
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeGrid);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.62] sm:opacity-[0.72] mix-blend-screen"
    />
  );
};
