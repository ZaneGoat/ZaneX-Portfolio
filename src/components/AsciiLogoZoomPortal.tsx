import React, { useEffect, useRef, useState, useCallback } from "react";
import { MEDITATING_LOGO_SVG_PATH } from "@/components/CelestialZenLogo";
import { sound } from "@/lib/sound";

export interface AsciiLogoZoomPortalProps {
  active: boolean;
  fromTheme: "matrix" | "existence";
  toTheme: "matrix" | "existence";
  onPeakFlip: () => void;
  onComplete: () => void;
}

// Exact 70-character cinematic ASCII ramp matching AsciiIntroOverlay & RyukAsciiOverlay
const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;

interface Star {
  x: number;
  y: number;
  freq: number;
  phase: number;
  size: number;
  accent: boolean;
}

const NUM_STARS = 46;

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

/**
 * Shared high-contrast vector renderer for the Meditating Guardian + Sacred Mandala + Chakra Core.
 * Exported so AsciiBrandLogo's live hover hologram canvas can also render the exact same shaded ASCII art!
 */
export function drawShadedMeditatingGuardian(
  bctx: CanvasRenderingContext2D,
  bw: number,
  bh: number,
  t: number,
  rollAngle: number,
  spinAngle: number,
  chakraMix: number,
  blinkOpen: number,
  zoom: number,
  camCenterX: number,
  camCenterY: number,
  toExistenceMix: number
) {
  bctx.save();
  bctx.fillStyle = "#040508";
  bctx.fillRect(0, 0, bw, bh);

  const aspect = bw / Math.max(1, bh);
  const normScale = aspect >= 1.0 ? 1.0 : 1.0 / Math.max(0.58, aspect);

  bctx.translate(bw * 0.5, bh * 0.5);
  const baseScaleX = (bw * 0.5) / (aspect * normScale);
  const baseScaleY = (bh * 0.5) / normScale;
  bctx.scale(baseScaleX * zoom, baseScaleY * zoom);
  bctx.translate(-camCenterX, -camCenterY);

  // Palette interpolation: Matrix (emerald/cyan/gold) <-> Existence (stark ivory/silver/obsidian)
  const priR = Math.round(mix(0, 245, toExistenceMix));
  const priG = Math.round(mix(255, 245, toExistenceMix));
  const priB = Math.round(mix(158, 252, toExistenceMix));

  const accR = Math.round(mix(0, 190, toExistenceMix));
  const accG = Math.round(mix(225, 195, toExistenceMix));
  const accB = Math.round(mix(255, 210, toExistenceMix));

  const hotR = 255;
  const hotG = Math.round(mix(205, 255, toExistenceMix));
  const hotB = Math.round(mix(80, 255, toExistenceMix));

  // 1. Rising Cosmic Embers in Background
  for (let i = 0; i < 30; i++) {
    const sA = Math.sin(i * 73.1 + 1.9) * 43758.5453;
    const rx = ((sA - Math.floor(sA)) * 2.0 - 1.0) * 1.15;
    const sB = Math.cos(i * 41.7 + 3.3) * 23421.631;
    const ryBase = (sB - Math.floor(sB)) * 2.0 - 1.0;
    const ry = ((ryBase - t * (0.32 + (i % 5) * 0.08) + 4.0) % 2.0) - 1.0;
    const rad = 0.013 + (i % 3) * 0.007;
    bctx.fillStyle =
      i % 3 === 0
        ? `rgba(${hotR}, ${hotG}, ${hotB}, ${0.55 + 0.35 * chakraMix})`
        : `rgba(${priR}, ${priG}, ${priB}, ${0.45 + 0.4 * chakraMix})`;
    bctx.beginPath();
    bctx.arc(rx, ry, rad, 0, Math.PI * 2);
    bctx.fill();
  }

  // Apply barrel roll + subtle meditation levitation bob
  const bobY = Math.sin(t * 2.8) * 0.025;
  bctx.translate(0, bobY);
  bctx.rotate(rollAngle);

  // 2. Counter-Rotating Sacred Mandala / Cyber Halo Rings
  const ringAlpha = 0.42 + 0.48 * chakraMix;
  bctx.save();
  bctx.rotate(t * 0.55);
  bctx.strokeStyle = `rgba(${accR}, ${accG}, ${accB}, ${ringAlpha * 0.65})`;
  bctx.lineWidth = 0.018;
  bctx.beginPath();
  bctx.arc(0, -0.02, 0.88, 0, Math.PI * 2);
  bctx.stroke();

  // 12 radial sacred geometry ticks around outer mandala
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const r0 = k % 2 === 0 ? 0.80 : 0.84;
    const r1 = k % 2 === 0 ? 0.96 : 0.92;
    bctx.strokeStyle =
      k % 3 === 0
        ? `rgba(${hotR}, ${hotG}, ${hotB}, ${ringAlpha})`
        : `rgba(${priR}, ${priG}, ${priB}, ${ringAlpha * 0.8})`;
    bctx.lineWidth = k % 2 === 0 ? 0.022 : 0.014;
    bctx.beginPath();
    bctx.moveTo(Math.cos(a) * r0, -0.02 + Math.sin(a) * r0);
    bctx.lineTo(Math.cos(a) * r1, -0.02 + Math.sin(a) * r1);
    bctx.stroke();
  }
  bctx.restore();

  // Inner counter-rotating crown halo behind head & heart
  bctx.save();
  bctx.rotate(-t * 0.85);
  bctx.strokeStyle = `rgba(${priR}, ${priG}, ${priB}, ${ringAlpha * 0.75})`;
  bctx.lineWidth = 0.016;
  bctx.setLineDash([0.08, 0.05]);
  bctx.beginPath();
  bctx.arc(0, -0.04, 0.68, 0, Math.PI * 2);
  bctx.stroke();
  bctx.setLineDash([]);
  bctx.restore();

  // 3. 3D Perspective Coin-Spin + Extruded Meditating Silhouette
  const cosSpin = Math.cos(spinAngle);
  const sinSpin = Math.sin(spinAngle);
  const horizScale = Math.sign(cosSpin || 1) * Math.max(0.18, Math.abs(cosSpin));

  bctx.save();
  // Map SVG [-100..100] coordinates into normalized [-0.78..0.78] world units
  const svgToWorld = 0.0076;
  bctx.scale(svgToWorld * horizScale, svgToWorld);

  if (typeof Path2D !== "undefined") {
    const logoPath = new Path2D(MEDITATING_LOGO_SVG_PATH);

    // 3D Extruded Side Rim Offset when spinning
    const extrudeShift = (sinSpin * 11.0) / Math.max(0.25, Math.abs(horizScale));
    if (Math.abs(extrudeShift) > 0.6) {
      bctx.save();
      bctx.translate(extrudeShift, 0);
      bctx.fillStyle = `rgb(${Math.round(priR * 0.42)}, ${Math.round(priG * 0.42)}, ${Math.round(priB * 0.42)})`;
      bctx.fill(logoPath, "evenodd");
      bctx.strokeStyle = `rgba(${accR}, ${accG}, ${accB}, 0.85)`;
      bctx.lineWidth = 4.2;
      bctx.stroke(logoPath);
      bctx.restore();
    }

    // Thick Bright Outer Aura Cutline (produces crisp @#$MW rim in 70-char ASCII!)
    bctx.lineJoin = "round";
    bctx.lineCap = "round";
    bctx.strokeStyle = "#f5f7ff";
    bctx.lineWidth = 7.5;
    bctx.stroke(logoPath);

    // Inner Rich Shaded Body Gradient so ASCII ramp renders sculptural 3D volume
    const grad = bctx.createLinearGradient(0, -82, 0, 96);
    grad.addColorStop(0.0, `rgb(${hotR}, ${hotG}, ${hotB})`);
    grad.addColorStop(0.32, `rgb(${priR}, ${priG}, ${priB})`);
    grad.addColorStop(0.72, `rgb(${Math.round(priR * 0.68 + accR * 0.32)}, ${Math.round(priG * 0.68 + accG * 0.32)}, ${Math.round(priB * 0.68 + accB * 0.32)})`);
    grad.addColorStop(1.0, `rgb(${Math.round(priR * 0.35)}, ${Math.round(priG * 0.38)}, ${Math.round(priB * 0.42)})`);
    bctx.fillStyle = grad;
    bctx.fill(logoPath, "evenodd");

    // Sculptural Dark Inner Groove Line just inside the white sticker rim (Ryuk manga contrast technique!)
    bctx.strokeStyle = "#080b12";
    bctx.lineWidth = 2.8;
    bctx.stroke(logoPath);

    // Anatomical Chakra & Lotus Fold Highlights inside the figure
    // A) Third-Eye Blinking Shinigami/Observatory Eye on Forehead (0, -54)
    const eyeHalfH = 4.8 * blinkOpen;
    if (eyeHalfH > 0.3) {
      bctx.fillStyle = "#06080f";
      bctx.beginPath();
      bctx.ellipse(0, -54, 9.5, eyeHalfH + 1.8, 0, 0, Math.PI * 2);
      bctx.fill();

      bctx.fillStyle = chakraMix > 0.2 ? `rgb(${hotR}, ${hotG}, ${hotB})` : "#ffffff";
      bctx.beginPath();
      bctx.ellipse(0, -54, 7.5, eyeHalfH, 0, 0, Math.PI * 2);
      bctx.fill();

      // Glowing Pupil
      bctx.fillStyle = "#ffffff";
      bctx.beginPath();
      bctx.arc(0, -54, Math.min(3.0, eyeHalfH), 0, Math.PI * 2);
      bctx.fill();
    }

    // B) Blazing Heart / Singularity Core at Chest Center (0, 6) — Camera Zoom Target!
    const corePulse = 1.0 + 0.16 * Math.sin(t * 7.5);
    const coreRad = (13.5 + 7.5 * chakraMix) * corePulse;
    const coreGrad = bctx.createRadialGradient(0, 6, 1.5, 0, 6, coreRad * 1.9);
    coreGrad.addColorStop(0.0, "#ffffff");
    coreGrad.addColorStop(0.35, `rgba(${hotR}, ${hotG}, ${hotB}, 0.95)`);
    coreGrad.addColorStop(0.7, `rgba(${priR}, ${priG}, ${priB}, 0.55)`);
    coreGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    bctx.fillStyle = coreGrad;
    bctx.beginPath();
    bctx.arc(0, 6, coreRad * 1.9, 0, Math.PI * 2);
    bctx.fill();

    // C) Crisp Lotus Knee & Spine Energy Ridges
    bctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    bctx.lineWidth = 2.4;
    bctx.beginPath();
    bctx.moveTo(0, -34);
    bctx.lineTo(0, 26);
    bctx.moveTo(-68, 56);
    bctx.quadraticCurveTo(-30, 48, -8, 66);
    bctx.moveTo(68, 56);
    bctx.quadraticCurveTo(30, 48, 8, 66);
    bctx.stroke();
  }

  bctx.restore();
  bctx.restore();
}

export const AsciiLogoZoomPortal: React.FC<AsciiLogoZoomPortalProps> = ({
  active,
  fromTheme,
  toTheme,
  onPeakFlip,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onPeakFlipRef = useRef(onPeakFlip);
  const onCompleteRef = useRef(onComplete);
  onPeakFlipRef.current = onPeakFlip;
  onCompleteRef.current = onComplete;

  const flippedRef = useRef(false);
  const finishedRef = useRef(false);
  const radarPingedRef = useRef(false);
  const [fadingOut, setFadingOut] = useState(false);

  const finishPortal = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (!flippedRef.current) {
      flippedRef.current = true;
      onPeakFlipRef.current();
    }
    setFadingOut(true);
    window.setTimeout(() => {
      onCompleteRef.current();
    }, 520);
  }, []);

  useEffect(() => {
    if (!active) {
      flippedRef.current = false;
      finishedRef.current = false;
      radarPingedRef.current = false;
      setFadingOut(false);
      return;
    }

    flippedRef.current = false;
    finishedRef.current = false;
    radarPingedRef.current = false;
    setFadingOut(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Heavy spaceship sub-bass pulse as the ASCII Guardian materializes
    sound.playEmpPulse();
    sound.haptic([35, 25, 55]);

    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });

    // Deterministic crosshair starfield for Phase 3 Cosmic Core Dive
    const stars: Star[] = [];
    let seed = 4242;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < NUM_STARS; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 0.1 + rand() * 1.45;
      stars.push({
        x: Math.cos(ang) * rad * 1.35,
        y: Math.sin(ang) * rad,
        freq: 2.2 + rand() * 4.5,
        phase: rand() * Math.PI * 2,
        size: 0.65 + rand() * 0.85,
        accent: rand() > 0.42,
      });
    }

    let width = 1;
    let height = 1;
    let cellW = 8;
    let cellH = 13;
    let cols = 1;
    let rows = 1;
    let aspect = 1;
    let fontSpec = "bold 12px 'Consolas', 'Courier New', monospace";
    let uCoords = new Float32Array(0);
    let vCoords = new Float32Array(0);

    const resizeGrid = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      aspect = width / height;

      const fontSize = width < 640 ? 10 : width < 1024 ? 12 : 14;
      fontSpec = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;
      ctx.font = fontSpec;
      const charWidth = ctx.measureText("M").width || 8.4;
      cellW = Math.max(5, Math.round(charWidth));
      cellH = Math.max(8, Math.round(fontSize * 1.25));

      // 1:1 native pixel buffer for locked 60 FPS on 1080p+ monitors
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = fontSpec;
      ctx.textBaseline = "top";

      cols = Math.max(30, Math.ceil(width / cellW));
      rows = Math.max(20, Math.ceil(height / cellH));

      offCanvas.width = cols;
      offCanvas.height = rows;

      uCoords = new Float32Array(cols);
      vCoords = new Float32Array(rows);
      const normScale = aspect >= 1.0 ? 1.0 : 1.0 / Math.max(0.58, aspect);
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
        finishPortal();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const spaceOut = { r: 0, g: 0, b: 0, lum: 0 };

    /**
     * Phase 3 & 4: Deep Dive Inside the Meditating Core -> Swirling Singularity Vortex & Crosshair Stars
     */
    const evaluateSingularityCoreSpace = (
      u: number,
      v: number,
      t: number,
      p4Progress: number,
      targetExistence: boolean
    ) => {
      let su = u;
      let sv = v;

      if (p4Progress > 0.0) {
        const p4Zoom = 1.0 + easeInExpo(p4Progress) * 9.5;
        su = u / p4Zoom;
        sv = v / p4Zoom;

        const rOrig = Math.hypot(u, v) + 1e-4;
        const angOrig = Math.atan2(v, u);
        const scatter =
          p4Progress * p4Progress * 0.7 * Math.sin(angOrig * 19.0 + rOrig * 26.0 - t * 10.0);
        su -= (u / rOrig) * scatter;
        sv -= (v / rOrig) * scatter;
      }

      let rr = 4.0;
      let gg = 5.0;
      let bb = 8.0;
      let lum = 0.015;

      // Ambient cosmic nebula
      const nebWave = Math.sin(su * 2.5 + t * 0.9) * Math.cos(sv * 2.5 - t * 0.7);
      const nebGlow = Math.exp(-Math.hypot(su * 0.85, sv * 0.85) * 1.3) * (0.5 + 0.5 * nebWave);
      if (targetExistence) {
        rr += nebGlow * 48.0;
        gg += nebGlow * 48.0;
        bb += nebGlow * 54.0;
      } else {
        rr += nebGlow * 8.0;
        gg += nebGlow * 55.0;
        bb += nebGlow * 38.0;
      }
      lum += nebGlow * 0.12;

      // Twinkling Crosshair Stars (matching Intro & Shinigami)
      for (let i = 0; i < NUM_STARS; i++) {
        const st = stars[i];
        const dx = Math.abs(su - st.x);
        const dy = Math.abs(sv - st.y);
        if (dx > 0.22 || dy > 0.22) continue;

        const pulse = 0.45 + 0.55 * Math.sin(t * st.freq + st.phase);
        const d2 = dx * dx + dy * dy;
        const core = Math.exp(-d2 * (1900.0 / st.size));
        const hFlare = Math.exp(-dy * dy * 4800.0) * Math.exp((-dx * 22.0) / st.size);
        const vFlare = Math.exp(-dx * dx * 4800.0) * Math.exp((-dy * 22.0) / st.size);
        const starVal = (core + 0.65 * (hFlare + vFlare)) * pulse;

        if (starVal > 0.02) {
          if (targetExistence) {
            rr += starVal * 250.0;
            gg += starVal * 250.0;
            bb += starVal * 255.0;
          } else if (st.accent) {
            rr += starVal * 0.0;
            gg += starVal * 255.0;
            bb += starVal * 165.0;
          } else {
            rr += starVal * 210.0;
            gg += starVal * 250.0;
            bb += starVal * 255.0;
          }
          lum += starVal * 0.92;
        }
      }

      // Central Swirling Lotus Singularity / Accretion Halo
      const rad = Math.hypot(su, sv);
      const ang = Math.atan2(sv, su);
      const spiral = Math.sin(ang * 6.0 - Math.log(rad + 0.06) * 7.5 - t * 5.2);
      const petal = 0.5 + 0.5 * Math.cos(ang * 8.0 + t * 2.4);

      if (rad < 0.16) {
        // Event horizon surrounded by white-hot photon ring
        const photon = smoothstep(0.09, 0.155, rad);
        rr = mix(4, 255, photon);
        gg = mix(4, 255, photon);
        bb = mix(6, 255, photon);
        lum = mix(0.02, 1.0, photon);
      } else {
        const disk = Math.exp(-Math.pow((rad - 0.30) / 0.22, 2.0)) * (0.62 + 0.38 * spiral);
        const corona = Math.exp(-rad * 2.8) * (0.35 + 0.35 * petal);
        const energy = clamp(disk + corona * 0.55, 0.0, 1.0);

        if (energy > 0.02) {
          if (targetExistence) {
            const vBright = mix(135, 255, energy);
            rr += vBright * energy * 1.15;
            gg += vBright * energy * 1.15;
            bb += mix(145, 255, energy) * energy * 1.18;
          } else {
            rr += mix(0, 220, Math.pow(energy, 2.2)) * energy;
            gg += mix(155, 255, energy) * energy * 1.15;
            bb += mix(95, 210, petal) * energy * 1.05;
          }
          lum += energy * 0.92;
        }
      }

      if (p4Progress > 0.0) {
        const fadeMultiplier = 1.0 - smoothstep(0.22, 0.98, p4Progress);
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

      // Double Third-Eye Blink & Chakra Ignition (1.35s -> 2.3s)
      let blinkOpen = 1.0;
      if (t >= 1.35 && t <= 1.68) {
        const bp = (t - 1.35) / 0.33;
        blinkOpen = bp < 0.5 ? 1.0 - easeInOutCubic(bp * 2.0) : easeInOutCubic((bp - 0.5) * 2.0);
      } else if (t >= 1.78 && t <= 2.12) {
        const bp = (t - 1.78) / 0.34;
        blinkOpen = bp < 0.5 ? 1.0 - easeInOutCubic(bp * 2.0) : easeInOutCubic((bp - 0.5) * 2.0);
      }

      const chakraMix = smoothstep(1.5, 2.2, t);
      if (t >= 1.55 && !radarPingedRef.current) {
        radarPingedRef.current = true;
        sound.playRadarPing();
      }

      // Smooth 360° Barrel Roll + 3D Perspective Spin (1.5s -> 4.8s)
      const rollProgress = smoothstep(1.4, 4.8, t);
      const rollAngle = easeInOutCubic(rollProgress) * Math.PI * 2.0;
      const spinAngle = easeInOutCubic(smoothstep(1.2, 4.4, t)) * Math.PI * 2.0;

      // Palette shifts smoothly from current theme to target theme
      const startExist = fromTheme === "existence" ? 1.0 : 0.0;
      const endExist = toTheme === "existence" ? 1.0 : 0.0;
      const toExistenceMix = mix(startExist, endExist, smoothstep(1.8, 4.6, t));

      // Phase 3: Exponential Camera Dive Zoom (1x -> 16x) into Chest Singularity Core (3.6s -> 6.4s)
      let zoom = 1.0;
      let camCenterX = 0.0;
      let camCenterY = 0.0;
      let spaceMix = 0.0;

      if (t > 3.6) {
        const zNorm = clamp((t - 3.6) / (6.4 - 3.6), 0.0, 1.0);
        const zEase = easeInOutExpo(zNorm);
        zoom = mix(1.0, 16.0, zEase);
        const panEase = smoothstep(0.0, 0.45, zNorm);
        camCenterX = 0.0;
        camCenterY = mix(0.0, 0.045, panEase);
        spaceMix = smoothstep(0.18, 0.58, zNorm);
      }

      // Flip the live DOM Universe Theme while 100% immersed inside the ASCII Singularity
      if (t >= 5.35 && !flippedRef.current) {
        flippedRef.current = true;
        onPeakFlipRef.current();
      }

      // Phase 4: Outward ASCII Character Scatter Dissolve (6.4s -> 7.8s)
      let p4Progress = 0.0;
      if (t > 6.4) {
        p4Progress = clamp((t - 6.4) / 1.4, 0.0, 1.0);
      }

      let guardianPixels: Uint8ClampedArray | null = null;
      if (spaceMix < 0.999 && offCtx) {
        drawShadedMeditatingGuardian(
          offCtx,
          cols,
          rows,
          t,
          rollAngle,
          spinAngle,
          chakraMix,
          blinkOpen,
          zoom,
          camCenterX,
          camCenterY,
          toExistenceMix
        );
        guardianPixels = offCtx.getImageData(0, 0, cols, rows).data;
      }

      ctx.fillStyle = "#040508";
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSpec;

      let lastColor = "";
      const glitchPhase = t < 1.5 ? 1.0 - smoothstep(0.45, 1.5, t) : 0.0;
      const targetExistence = toTheme === "existence";

      for (let r = 0; r < rows; r++) {
        const v = vCoords[r];
        const py = r * cellH;

        // Horizontal scanline glitch wave during Phase 1 materialization
        let colShift = 0;
        if (glitchPhase > 0.01) {
          const rWave = Math.sin(r * 0.75 + t * 38.0) * Math.cos(r * 0.23 - t * 21.0);
          if (rWave > 0.72) {
            colShift = Math.round((rWave - 0.72) * 14 * glitchPhase);
          }
        }

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

          // Phase 4 outward character scatter dropout (matching Intro & Shinigami)
          if (p4Progress > 0.05) {
            const cellHash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
            const rand01 = cellHash - Math.floor(cellHash);
            if (rand01 < p4Progress * 1.08 - 0.08) {
              flushBatch();
              continue;
            }
          }

          let finalR = 0;
          let finalG = 0;
          let finalB = 0;
          let finalLum = 0;

          if (spaceMix < 0.999 && guardianPixels) {
            const sc = clamp(c + colShift, 0, cols - 1);
            const pIdx = (r * cols + sc) * 4;
            finalR = guardianPixels[pIdx];
            finalG = guardianPixels[pIdx + 1];
            finalB = guardianPixels[pIdx + 2];
            finalLum = (0.299 * finalR + 0.587 * finalG + 0.114 * finalB) / 255.0;

            // Terminal spark materialization during first 0.7s
            if (t < 0.7) {
              const matProgress = smoothstep(0.0, 0.7, t);
              const noiseHash =
                Math.sin((c + Math.floor(t * 28.0)) * 37.17 + r * 91.3) * 43758.5453;
              const n01 = noiseHash - Math.floor(noiseHash);
              if (n01 > matProgress) {
                if (n01 > 0.9) {
                  finalR = targetExistence ? 255 : 0;
                  finalG = 255;
                  finalB = targetExistence ? 255 : 158;
                  finalLum = 0.52 * (1.0 - matProgress);
                } else {
                  flushBatch();
                  continue;
                }
              }
            }
          }

          if (spaceMix > 0.001) {
            evaluateSingularityCoreSpace(u, v, t, p4Progress, targetExistence);
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

      if (t >= 7.8) {
        finishPortal();
        return;
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("resize", resizeGrid);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, fromTheme, toTheme, finishPortal]);

  if (!active) return null;

  const targetLabel =
    toTheme === "existence"
      ? "Ω-EXISTENCE // MONOCHROME SINGULARITY"
      : "MATRIX EMERALD // CYBER-HUD";

  return (
    <div
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 99999 }}
      className={`fixed inset-0 bg-[#040508] select-none font-mono transition-opacity duration-500 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Procedural ASCII Logo Dimensional Shift"
    >
      <canvas ref={canvasRef} className="block w-full h-full select-none" />

      {/* Discreet Skip Pill & Realm Telemetry */}
      <div className="fixed inset-x-0 bottom-5 flex items-center justify-center gap-3 px-4 pointer-events-none">
        <span
          style={{
            backgroundColor: "rgba(4, 8, 18, 0.78)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          className="px-3.5 py-1.5 rounded-full border border-white/25 text-[10px] sm:text-xs font-bold tracking-widest text-white"
        >
          [ ◈ SHIFTING REALM → {targetLabel} ]
        </span>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            finishPortal();
          }}
          style={{
            backgroundColor: "rgba(4, 8, 18, 0.85)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          className="pointer-events-auto px-3 py-1.5 rounded-full border border-white/35 hover:bg-white/15 text-[10px] sm:text-xs font-bold text-white cursor-pointer"
        >
          [ESC / SKIP]
        </button>
      </div>
    </div>
  );
};
