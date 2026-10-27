import React, { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";

const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
};

interface MatrixWatchingEyeProps {
  className?: string;
}

/**
 * Fixed Top-Center Visor Optic Pod (Matrix HUD)
 * - Live procedural 70-char RGB micro-ASCII eye housed in the center keystone of Navigation.
 * - Tracks cursor & touch position relative to the top-center pod across the entire viewport.
 * - Blinks organically on every click/tap anywhere on the page (and double-blinks when clicked directly).
 */
export const MatrixWatchingEye: React.FC<MatrixWatchingEyeProps> = ({ className = "" }) => {
  const podRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blinkFlash, setBlinkFlash] = useState(false);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  const azRef = useRef<HTMLSpanElement | null>(null);
  const elRef = useRef<HTMLSpanElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);
  const manualBlinkRef = useRef<number>(-10);
  const doubleBlinkRef = useRef<boolean>(false);
  const startMsRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const pod = podRef.current;
    if (!canvas || !pod) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    startMsRef.current = performance.now();
    let cssW = 148;
    let cssH = 48;
    let dpr = 1;
    let cellW = 4.2;
    let cellH = 6.5;
    let cols = 1;
    let rows = 1;
    let fontSpec = "bold 6.5px 'Consolas', 'Courier New', monospace";
    let uCoords = new Float32Array(0);
    let vCoords = new Float32Array(0);
    let unitPxVal = 40;
    let lockMix = 0;
    let frameCount = 0;

    let targetX = 0;
    let targetY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let nextAutoBlinkTime = 3.8;
    let autoBlinkStart = -10;
    let flashTimer: number | null = null;

    const resizePod = () => {
      const vw = window.innerWidth;
      if (vw < 640) {
        cssW = 84;
        cssH = 30;
      } else if (vw < 1024) {
        cssW = 108;
        cssH = 34;
      } else if (vw < 1536) {
        cssW = 120;
        cssH = 36;
      } else {
        cssW = 144;
        cssH = 40;
      }

      dpr = Math.min(2, window.devicePixelRatio || 1);
      const fontSize = vw < 640 ? 5.2 : vw < 1024 ? 6.0 : vw < 1536 ? 6.2 : 6.8;
      fontSpec = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = fontSpec;
      ctx.textBaseline = "top";

      const measuredW = ctx.measureText("M").width || fontSize * 0.6;
      cellW = Math.max(3.1, measuredW);
      cellH = Math.max(4.8, fontSize * 1.12);

      cols = Math.max(16, Math.ceil(cssW / cellW));
      rows = Math.max(6, Math.ceil(cssH / cellH));

      uCoords = new Float32Array(cols);
      vCoords = new Float32Array(rows);

      // Isotropic physical scaling so iris & pupil stay circular inside the almond pod
      const unitPx = Math.min(cssW * 0.45, cssH * 1.05);
      unitPxVal = unitPx;
      for (let c = 0; c < cols; c++) {
        const px = (c + 0.5) * cellW - cssW * 0.5;
        uCoords[c] = px / unitPx;
      }
      for (let r = 0; r < rows; r++) {
        const py = (r + 0.5) * cellH - cssH * 0.5;
        vCoords[r] = py / unitPx;
      }
    };

    resizePod();

    const updateGazeFromPoint = (clientX: number, clientY: number) => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const rect = pod.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      // Horizontal gaze relative to the center pod; vertical gaze relative to upper-hero horizon
      targetX = clamp((clientX - cx) / (vw * 0.44), -1.0, 1.0);
      targetY = clamp((clientY - vh * 0.26) / (vh * 0.62), -1.0, 1.0);
    };

    const onPointerMove = (e: PointerEvent) => {
      updateGazeFromPoint(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      updateGazeFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    };

    const triggerBlinkPulse = (clientX?: number, clientY?: number, isDouble = false) => {
      const nowSec = (performance.now() - startMsRef.current) * 0.001;
      manualBlinkRef.current = nowSec;
      doubleBlinkRef.current = isDouble;
      nextAutoBlinkTime = nowSec + 4.0 + Math.random() * 3.2;

      if (typeof clientX === "number" && typeof clientY === "number") {
        updateGazeFromPoint(clientX, clientY);
      }

      setBlinkFlash(true);
      if (flashTimer !== null) window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => setBlinkFlash(false), 260);
    };

    const onGlobalPointerDown = (e: PointerEvent) => {
      triggerBlinkPulse(e.clientX, e.clientY, false);
    };

    window.addEventListener("resize", resizePod, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: true });
    window.addEventListener("pointerdown", onGlobalPointerDown, { capture: true, passive: true });

    const eyeOut = { r: 0, g: 0, b: 0, lum: 0 };

    const computeSingleBlink = (elapsed: number, duration: number): number => {
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

    const evaluateVisorEye = (
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
      if (absU >= 1.05 || absV >= 0.46) {
        eyeOut.lum = 0;
        return;
      }

      const nx = u / 1.02;
      const arch = Math.pow(Math.max(0.0, 1.0 - nx * nx), 0.82);

      const maxHalfOpen = 0.40;
      const gazeLidShift = lookV * 0.045 * arch * blinkOpen;
      const upperLid = -maxHalfOpen * arch * blinkOpen + gazeLidShift;
      const lowerLid = maxHalfOpen * arch * blinkOpen + gazeLidShift;

      const insideAperture = v >= upperLid && v <= lowerLid && blinkOpen > 0.025;

      if (insideAperture) {
        const eu = u - lookU;
        const ev = v - lookV;
        const r = Math.hypot(eu, ev);
        const angle = Math.atan2(ev, eu);

        const distToUpper = v - upperLid;
        const distToLower = lowerLid - v;
        const lidShadow =
          smoothstep(0.0, 0.10, distToUpper) * smoothstep(0.0, 0.08, distToLower);

        const specDist = Math.hypot(eu + 0.075 - lookU * 0.12, ev + 0.065 - lookV * 0.12);
        const spec2Dist = Math.hypot(eu - 0.065, ev - 0.055);
        const spec =
          Math.exp(-specDist * specDist * 980.0) +
          0.45 * Math.exp(-spec2Dist * spec2Dist * 1300.0);

        const pupilRadius = 0.13 + 0.035 * clickPulse;

        if (r < pupilRadius) {
          const pupilEdge = smoothstep(pupilRadius - 0.028, pupilRadius, r);
          let rr = mix(3, 0, pupilEdge);
          let gg = mix(6, 175, pupilEdge);
          let bb = mix(12, 120, pupilEdge);
          let lum = mix(0.03, 0.42, pupilEdge);

          if (spec > 0.06) {
            const s = clamp(spec, 0.0, 1.0);
            rr = mix(rr, 245, s);
            gg = mix(gg, 255, s);
            bb = mix(bb, 250, s);
            lum = mix(lum, 1.0, s);
          }

          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        } else if (r < 0.365) {
          const nr = (r - pupilRadius) / (0.365 - pupilRadius);
          const fiberWave = Math.sin(angle * 22.0 + Math.sin(r * 30.0 + t * 1.1));
          const fiberWave2 = Math.cos(angle * 14.0 - Math.cos(r * 36.0 - t * 0.7));
          const fibers = 0.5 + 0.35 * fiberWave + 0.15 * fiberWave2;

          const collarette = Math.exp(-Math.pow((nr - 0.28) / 0.18, 2.0));
          const limbal = smoothstep(1.0, 0.72, nr);
          const tone = clamp(fibers * 0.68 + collarette * 0.52, 0.0, 1.0) * limbal;

          // Vivid Matrix Emerald + Golden-Amber Collarette Flare on Click
          const goldMix = clamp(collarette * (0.55 + 0.45 * clickPulse), 0.0, 1.0);
          const baseR = mix(0, 255, goldMix);
          const baseG = mix(255, 220, goldMix);
          const baseB = mix(158, 95, goldMix);

          let rr = mix(baseR * 0.38, baseR, tone) * (0.50 + 0.50 * limbal);
          let gg = mix(baseG * 0.52, baseG, tone) * (0.50 + 0.50 * limbal);
          let bb = mix(baseB * 0.52, baseB, tone) * (0.50 + 0.50 * limbal);

          rr *= 0.52 + 0.48 * lidShadow;
          gg *= 0.52 + 0.48 * lidShadow;
          bb *= 0.52 + 0.48 * lidShadow;

          let lum = clamp(
            (0.40 + 0.60 * tone) * limbal * (0.52 + 0.48 * lidShadow),
            0.10,
            0.98
          );

          if (spec > 0.05) {
            const s = clamp(spec, 0.0, 1.0);
            rr = mix(rr, 245, s);
            gg = mix(gg, 255, s);
            bb = mix(bb, 252, s);
            lum = mix(lum, 1.0, s);
          }

          eyeOut.r = rr;
          eyeOut.g = gg;
          eyeOut.b = bb;
          eyeOut.lum = lum;
          return;
        } else {
          // Crisp spherical cyber-sclera
          const sphereZ = Math.sqrt(Math.max(0.06, 1.0 - (u * u * 0.68 + v * v * 2.1)));
          const limbusAO = smoothstep(0.365, 0.415, r);
          const shade = sphereZ * (0.45 + 0.55 * lidShadow) * (0.74 + 0.26 * limbusAO);

          eyeOut.r = 95 * shade;
          eyeOut.g = 230 * shade;
          eyeOut.b = 185 * shade;
          eyeOut.lum = clamp(shade * 0.72, 0.08, 0.76);
          return;
        }
      }

      // Eyelid cyber-lash contour (glows vivid emerald when blinking shut!)
      const dLid = Math.min(Math.abs(v - upperLid), Math.abs(v - lowerLid));
      const lidThickness = blinkOpen < 0.15 ? 0.068 : 0.048;
      if (dLid < lidThickness) {
        const lashStrength = (1.0 - dLid / lidThickness) * (1.0 - Math.abs(nx) * 0.28);
        const blinkGlow = 1.0 + (1.0 - blinkOpen) * 0.85;
        eyeOut.r = clamp(mix(0, 140, lashStrength) * blinkGlow, 0, 255);
        eyeOut.g = clamp(mix(135, 255, lashStrength) * blinkGlow, 0, 255);
        eyeOut.b = clamp(mix(90, 200, lashStrength) * blinkGlow, 0, 255);
        eyeOut.lum = clamp(lashStrength * (0.55 + 0.40 * (1.0 - blinkOpen)), 0.12, 0.94);
        return;
      }

      eyeOut.lum = 0;
    };

    let rafId = 0;
    let lastFrameMs = 0;
    const frameInterval = 1000 / 40;

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      if (document.hidden) return;
      if (now - lastFrameMs < frameInterval) return;
      lastFrameMs = now;

      const t = (now - startMsRef.current) * 0.001;

      if (t >= nextAutoBlinkTime) {
        autoBlinkStart = t;
        nextAutoBlinkTime = t + 4.2 + Math.random() * 3.4;
      }

      smoothX += (targetX - smoothX) * 0.18;
      smoothY += (targetY - smoothY) * 0.18;

      const lookU = smoothX * 0.44 + 0.007 * Math.sin(t * 1.5);
      const lookV = smoothY * 0.15 + 0.004 * Math.cos(t * 1.2);

      const sinceManual = t - manualBlinkRef.current;
      let manualBlink = computeSingleBlink(sinceManual, 0.28);
      if (doubleBlinkRef.current && sinceManual > 0.30 && sinceManual <= 0.58) {
        manualBlink = Math.min(manualBlink, computeSingleBlink(sinceManual - 0.30, 0.26));
      }
      const autoBlink = computeSingleBlink(t - autoBlinkStart, 0.24);
      const blinkOpen = Math.min(manualBlink, autoBlink);

      const clickPulse =
        sinceManual >= 0 && sinceManual < 0.55
          ? Math.sin((sinceManual / 0.55) * Math.PI)
          : 0.0;

      ctx.fillStyle = "#03060e";
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.font = fontSpec;

      let lastColor = "";
      for (let r = 0; r < rows; r++) {
        const v = vCoords[r];
        const py = r * cellH;

        let batchStr = "";
        let batchStartCol = 0;
        let batchColor = "";

        const flushBatch = () => {
          if (batchStr.length > 0 && batchColor) {
            if (batchColor !== lastColor) {
              ctx.fillStyle = batchColor;
              lastColor = batchColor;
            }
            ctx.fillText(batchStr, batchStartCol * cellW, py);
            batchStr = "";
          }
        };

        for (let c = 0; c < cols; c++) {
          const u = uCoords[c];
          evaluateVisorEye(u, v, t, blinkOpen, lookU, lookV, clickPulse);

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

      // ---- Holographic reticle overlay (vector pass on top of the ASCII eye) ----
      lockMix += ((lockedRef.current ? 1 : 0) - lockMix) * 0.2;
      const cx = cssW * 0.5;
      const cy = cssH * 0.5;
      const orbitRx = unitPxVal * 1.1;
      const orbitRy = Math.min(cssH * 0.47, unitPxVal * 0.52);

      ctx.save();
      ctx.lineWidth = 0.8;

      // Counter-rotating dashed orbital rings around the eyelid aperture
      ctx.setLineDash([3, 4]);
      ctx.lineDashOffset = -t * 14;
      ctx.strokeStyle = `rgba(0,255,158,${0.26 + 0.3 * lockMix})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitRx, orbitRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([1.5, 6]);
      ctx.lineDashOffset = t * 9;
      ctx.strokeStyle = `rgba(0,224,255,${0.22 + 0.2 * lockMix})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitRx * 0.9, orbitRy * 0.82, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Range ticks on the horizontal axis (left & right of the almond)
      ctx.strokeStyle = `rgba(0,255,158,${0.5 + 0.3 * lockMix})`;
      for (const side of [-1, 1]) {
        const x0 = cx + side * (orbitRx + 1.5);
        ctx.beginPath();
        ctx.moveTo(x0, cy);
        ctx.lineTo(x0 + side * 5, cy);
        for (let k = 1; k <= 2; k++) {
          const xt = x0 + side * k * 2.2;
          ctx.moveTo(xt, cy - 1.6);
          ctx.lineTo(xt, cy + 1.6);
        }
        ctx.stroke();
      }

      // Iris target brackets: loose while tracking, tighten into a gold lock on hover
      const ix = cx + lookU * unitPxVal;
      const iy = cy + lookV * unitPxVal;
      const bw = mix(unitPxVal * 0.6, unitPxVal * 0.42, lockMix);
      const bh = Math.min(cssH * 0.44, bw * 0.92);
      const bl = 3.5;
      const lr = Math.round(mix(0, 255, lockMix));
      const lg = Math.round(mix(255, 205, lockMix));
      const lb = Math.round(mix(158, 80, lockMix));
      ctx.strokeStyle = `rgba(${lr},${lg},${lb},${0.4 + 0.5 * lockMix})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
        const px = ix + sx * bw;
        const py = iy + sy * bh;
        ctx.moveTo(px, py - sy * bl);
        ctx.lineTo(px, py);
        ctx.lineTo(px - sx * bl, py);
      }
      ctx.stroke();

      // Click pulse: expanding ripple ring from the iris
      if (clickPulse > 0.01) {
        const sinceClick = clamp(sinceManual / 0.55, 0, 1);
        ctx.strokeStyle = `rgba(255,220,120,${0.55 * (1 - sinceClick)})`;
        ctx.beginPath();
        ctx.ellipse(ix, iy, unitPxVal * (0.3 + 0.9 * sinceClick), unitPxVal * (0.24 + 0.5 * sinceClick), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Servo shutter line while the eyelid snaps shut
      if (blinkOpen < 0.45) {
        ctx.fillStyle = `rgba(143,247,204,${0.65 * (1 - blinkOpen / 0.45)})`;
        ctx.fillRect(cx - orbitRx * 0.95, cy - 0.5, orbitRx * 1.9, 1);
      }

      // Fine CRT scanlines
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      for (let y = 1; y < cssH; y += 2) ctx.fillRect(0, y, cssW, 0.6);
      ctx.restore();

      // ---- Live telemetry readout (throttled DOM writes, no React re-render) ----
      if (frameCount++ % 5 === 0) {
        const az = Math.round(smoothX * 60);
        const el = Math.round(-smoothY * 30);
        const fmt = (n: number) => `${n >= 0 ? "+" : "-"}${String(Math.abs(n)).padStart(2, "0")}°`;
        if (azRef.current) azRef.current.textContent = `AZ${fmt(az)}`;
        if (elRef.current) elRef.current.textContent = `EL${fmt(el)}`;
        if (statusRef.current) {
          statusRef.current.textContent =
            blinkOpen < 0.5 ? "BLINK" : lockMix > 0.5 ? "LOCK" : "TRACK";
        }
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      if (flashTimer !== null) window.clearTimeout(flashTimer);
      window.removeEventListener("resize", resizePod);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("pointerdown", onGlobalPointerDown, true);
    };
  }, []);

  const handlePodClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playRadarPing();
    sound.haptic(25);
    const nowSec = (performance.now() - startMsRef.current) * 0.001;
    manualBlinkRef.current = nowSec;
    doubleBlinkRef.current = true;
    setBlinkFlash(true);
    window.setTimeout(() => setBlinkFlash(false), 450);
  };

  const setLock = (on: boolean) => {
    if (lockedRef.current === on) return;
    lockedRef.current = on;
    setLocked(on);
    if (on) sound.playKeypress();
  };

  const lit = blinkFlash || locked;

  return (
    <div
      ref={podRef}
      onClick={handlePodClick}
      onMouseEnter={() => setLock(true)}
      onMouseLeave={() => setLock(false)}
      onFocus={() => setLock(true)}
      onBlur={() => setLock(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          sound.playRadarPing();
          const nowSec = (performance.now() - startMsRef.current) * 0.001;
          manualBlinkRef.current = nowSec;
          doubleBlinkRef.current = true;
        }
      }}
      title="Overwatch Oculus — follows your cursor · click anywhere to blink"
      aria-label="Overwatch Oculus — follows your cursor and blinks on click"
      style={{
        filter: lit
          ? "drop-shadow(0 0 12px rgba(0,255,158,0.55))"
          : "drop-shadow(0 4px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 8px rgba(0,255,158,0.18))",
      }}
      className={`group relative cursor-pointer select-none outline-none transition-[filter] duration-200 ${className}`}
    >
      {/* Chamfered emerald bezel (1px border via layered clip-path) */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 oculus-chamfer transition-colors duration-200 ${
          lit
            ? "bg-gradient-to-b from-[#9dffd8] via-[#00ff9e] to-[#00b874]"
            : "bg-gradient-to-b from-primary/80 via-primary/35 to-primary/70"
        }`}
      />

      <div className="relative m-px oculus-chamfer bg-[#03060e] flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1">
        {/* Left telemetry column (2xl only, keeps laptops & tablets compact) */}
        <div className="hidden 2xl:flex flex-col items-end gap-0.5 w-[36px] text-[8px] leading-none tabular-nums font-mono text-primary/75">
          <span ref={azRef}>AZ+00°</span>
          <span ref={elRef}>EL+00°</span>
          <span className="text-primary/40">FOV·90</span>
        </div>

        <canvas ref={canvasRef} className="block pointer-events-none" />

        {/* Right telemetry column */}
        <div className="hidden 2xl:flex flex-col items-start gap-0.5 w-[36px] text-[8px] leading-none font-mono">
          <span className="text-primary/40">OPTIC</span>
          <span
            ref={statusRef}
            className={`font-bold ${locked ? "text-amber-300" : "text-primary"}`}
          >
            TRACK
          </span>
          <span className="flex items-center gap-1 text-primary/40">
            <span
              className={`oculus-led inline-block w-1 h-1 rounded-full ${
                locked ? "bg-amber-300" : "bg-primary"
              }`}
            />
            LIVE
          </span>
        </div>
      </div>
    </div>
  );
};
