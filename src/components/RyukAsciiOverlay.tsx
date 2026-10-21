import React, { useEffect, useRef, useState, useCallback } from "react";

interface RyukAsciiOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
}

const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;
const CELL_W = 9;
const CELL_H = 15;

interface Star {
  x: number;
  y: number;
  freq: number;
  phase: number;
  size: number;
  crimson: boolean;
}

const NUM_STARS = 44;

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

// Point-to-segment distance in 2D
const sdSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay + 1e-6), 0.0, 1.0);
  return Math.hypot(pax - bax * h, pay - bay * h);
};

export const RyukAsciiOverlay: React.FC<RyukAsciiOverlayProps> = ({
  isOpen,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const completedRef = useRef(false);

  const finishAnimation = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFadingOut(true);
    window.setTimeout(() => {
      onComplete();
    }, 600);
  }, [onComplete]);

  useEffect(() => {
    if (!isOpen) {
      completedRef.current = false;
      setFadingOut(false);
      return;
    }

    completedRef.current = false;
    setFadingOut(false);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const canvas = canvasRef.current;
    if (!canvas) {
      document.body.style.overflow = prevOverflow;
      return;
    }
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      document.body.style.overflow = prevOverflow;
      return;
    }

    // Deterministic stars for Phase 3 Shinigami Space
    const stars: Star[] = [];
    let seed = 77713;
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
        freq: 2.5 + rand() * 4.5,
        phase: rand() * Math.PI * 2,
        size: 0.65 + rand() * 0.85,
        crimson: rand() > 0.42,
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
      if (e.key === "Escape") {
        e.preventDefault();
        finishAnimation();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const laptopOut = { r: 0, g: 0, b: 0, lum: 0 };
    const ryukOut = { r: 0, g: 0, b: 0, lum: 0 };
    const spaceOut = { r: 0, g: 0, b: 0, lum: 0 };

    /**
     * Phase 0: MSI GF63 Thin Laptop Opening in 3D Perspective (0.0s -> 1.4s)
     * Renders a red-backlit gaming keyboard deck + opening screen lid with a glowing Ryuk sticker
     * that zooms toward the camera.
     */
    const evaluateMsiLaptop = (u: number, v: number, t: number) => {
      const openProg = clamp(t / 1.15, 0.0, 1.0);
      const lidEase = easeInOutCubic(openProg);
      // Camera zooms into the laptop screen as it opens
      const camZoom = 1.0 + smoothstep(0.45, 1.35, t) * 2.4;
      const lu = u / camZoom;
      const lv = (v - 0.08) / camZoom;

      let rr = 5;
      let gg = 5;
      let bb = 8;
      let lum = 0.0;

      // Hinge line at lv = 0.18
      const hingeY = 0.18;

      // 1. Lower Keyboard Deck (3D trapezoid projecting forward: lv from 0.18 to 0.56)
      if (lv >= hingeY && lv <= 0.56) {
        const deckDepth = (lv - hingeY) / (0.56 - hingeY); // 0 at hinge, 1 at front lip
        const halfWidth = mix(0.52, 0.78, deckDepth);
        if (Math.abs(lu) <= halfWidth) {
          const edgeDist = Math.min(halfWidth - Math.abs(lu), Math.min(lv - hingeY, 0.56 - lv));
          const chassisBorder = smoothstep(0.025, 0.0, edgeDist);

          // Red backlit MSI keyboard matrix (deckDepth 0.12 to 0.68)
          if (deckDepth > 0.12 && deckDepth < 0.68 && Math.abs(lu) < halfWidth * 0.84) {
            const keyCol = Math.sin((lu / halfWidth) * 44.0);
            const keyRow = Math.sin(deckDepth * 26.0);
            const isKeyGap = keyCol > 0.55 || keyRow > 0.55;
            const redGlow = 0.55 + 0.45 * Math.sin(t * 10.0 + lu * 6.0);
            if (isKeyGap) {
              rr = 255;
              gg = 22;
              bb = 48;
              lum = 0.68 * redGlow;
            } else {
              rr = 35;
              gg = 14;
              bb = 20;
              lum = 0.22;
            }
          } else {
            // Brushed black aluminum palmrest & touchpad
            const isTouchpad = deckDepth > 0.72 && deckDepth < 0.94 && Math.abs(lu) < 0.14;
            rr = isTouchpad ? 45 : 24;
            gg = isTouchpad ? 20 : 24;
            bb = isTouchpad ? 28 : 32;
            lum = isTouchpad ? 0.25 : 0.14;
          }

          if (chassisBorder > 0.1) {
            rr = mix(rr, 255, chassisBorder);
            gg = mix(gg, 25, chassisBorder);
            bb = mix(bb, 50, chassisBorder);
            lum = Math.max(lum, chassisBorder * 0.85);
          }
        }
      }

      // 2. Opening Laptop Lid (projects upward from hingeY based on lidEase)
      const lidHeight = mix(0.05, 0.66, lidEase);
      const lidTopY = hingeY - lidHeight;
      if (lv <= hingeY && lv >= lidTopY) {
        const lidV = (hingeY - lv) / Math.max(0.04, lidHeight); // 0 at hinge, 1 at top bezel
        // Slight perspective foreshortening as lid swings open
        const halfWidth = mix(0.52, mix(0.38, 0.54, lidEase), lidV);
        if (Math.abs(lu) <= halfWidth) {
          const bezelX = halfWidth - Math.abs(lu);
          const bezelY = Math.min(lv - lidTopY, hingeY - lv);
          const bezel = smoothstep(0.025, 0.0, Math.min(bezelX, bezelY));

          // Center of screen has the glowing Ryuk / MSI emblem waking up
          const sx = lu / (halfWidth * 0.85);
          const sy = (lidV - 0.52) * 1.9;
          const emblemR = Math.hypot(sx, sy);

          if (emblemR < 0.55) {
            // Mini Ryuk sticker silhouette glowing on the MSI screen/lid
            const eyeL = Math.hypot(sx + 0.16, sy + 0.04);
            const eyeR = Math.hypot(sx - 0.16, sy + 0.04);
            const eyesGlow = Math.exp(-eyeL * eyeL * 180.0) + Math.exp(-eyeR * eyeR * 180.0);
            const skull = smoothstep(0.48, 0.18, emblemR);
            rr = mix(30, 255, clamp(eyesGlow + skull * 0.35, 0.0, 1.0));
            gg = mix(10, 40, clamp(eyesGlow * 0.5, 0.0, 1.0));
            bb = mix(18, 60, clamp(eyesGlow * 0.5, 0.0, 1.0));
            lum = clamp(0.25 + skull * 0.45 + eyesGlow * 0.65, 0.1, 1.0);
          } else {
            // Screen scanlines
            const scan = 0.5 + 0.5 * Math.sin(lidV * 50.0 - t * 25.0);
            rr = 18 + 30 * scan;
            gg = 12 + 10 * scan;
            bb = 22 + 16 * scan;
            lum = 0.12 + 0.12 * scan;
          }

          if (bezel > 0.05) {
            rr = mix(rr, 240, bezel);
            gg = mix(gg, 240, bezel);
            bb = mix(bb, 250, bezel);
            lum = Math.max(lum, bezel * 0.9);
          }
        }
      }

      laptopOut.r = rr;
      laptopOut.g = gg;
      laptopOut.b = bb;
      laptopOut.lum = lum;
    };

    /**
     * Procedural Subject: Ryuk High-Contrast Manga Sticker Portrait
     * Evaluates Ryuk at normalized coordinates (u, v)
     */
    const evaluateRyukSticker = (
      u: number,
      v: number,
      t: number,
      blinkOpen: number,
      shinigamiMix: number,
      laughOffset: number
    ) => {
      // Shift v slightly so hair crown and pointed chin fit nicely in [-1, 1]
      const x = u * 1.05;
      const y = v * 1.05 - 0.04;

      const ax = Math.abs(x);

      // 1. Spiky Hair Crown (radial pineapple-like spikes in upper hemisphere)
      let hairDist = 999.0;
      if (y < 0.22) {
        const hx = x;
        const hy = y + 0.18;
        const hr = Math.hypot(hx * 0.88, hy);
        const hang = Math.atan2(hy, hx); // -PI to 0 is upper half
        if (hang < 0.25 && hang > -Math.PI - 0.25) {
          const spike1 = Math.pow(Math.abs(Math.sin(hang * 6.5)), 0.55) * 0.34;
          const spike2 = Math.pow(Math.abs(Math.cos(hang * 11.0 + 0.4)), 0.7) * 0.16;
          const crownSideBoost = smoothstep(0.0, -1.35, hang) * smoothstep(-3.14, -1.75, hang);
          const maxR = 0.44 + spike1 + spike2 + 0.08 * crownSideBoost;
          hairDist = hr - maxR;
        }
      }

      // 2. Gaunt Skull, Cheekbones & Elongated Pointed Chin
      const jawShiftY = y > 0.12 ? y - laughOffset : y;
      let headHalfW = 0.0;
      if (jawShiftY < -0.15) {
        // Forehead / cranium
        headHalfW = 0.40 * Math.sqrt(Math.max(0.0, 1.0 - Math.pow((jawShiftY + 0.15) / 0.42, 2.0)));
      } else if (jawShiftY < 0.08) {
        // Bulging temple / cheekbone flare
        const ct = (jawShiftY + 0.15) / 0.23;
        headHalfW = 0.40 + 0.045 * Math.sin(ct * Math.PI);
      } else if (jawShiftY < 0.34) {
        // Hollow gaunt cheeks indenting inward
        const ct = (jawShiftY - 0.08) / 0.26;
        headHalfW = mix(0.40, 0.25, ct) - 0.038 * Math.sin(ct * Math.PI);
      } else if (jawShiftY <= 0.74) {
        // Narrow elongated pointed chin
        const ct = (jawShiftY - 0.34) / 0.40;
        headHalfW = 0.25 * (1.0 - Math.pow(ct, 0.88));
      }

      const inHeadY = jawShiftY >= -0.52 && jawShiftY <= 0.74;
      const faceDist = inHeadY ? ax - headHalfW : Math.hypot(ax, jawShiftY < -0.52 ? jawShiftY + 0.52 : jawShiftY - 0.74);

      // Feather/collar spikes flanking the lower neck
      let collarDist = 999.0;
      if (y > 0.18 && y < 0.72 && ax > 0.20) {
        const cy = y - 0.44;
        const cang = Math.atan2(cy, ax - 0.18);
        const cRad = Math.hypot((ax - 0.18) * 0.85, cy);
        const featherSpike = 0.36 + 0.18 * Math.abs(Math.sin(cang * 8.0));
        collarDist = cRad - featherSpike;
      }

      const silhouetteDist = Math.min(hairDist, Math.min(faceDist, collarDist));

      // White Sticker Outer Contour around entire silhouette
      if (silhouetteDist > 0.0) {
        if (silhouetteDist < 0.055) {
          // Crisp chalk-white die-cut sticker border
          const edge = smoothstep(0.055, 0.035, silhouetteDist);
          ryukOut.r = 240 * edge;
          ryukOut.g = 240 * edge;
          ryukOut.b = 245 * edge;
          ryukOut.lum = 0.94 * edge;
          return;
        }
        // Outside sticker: dark void with rising crimson Shinigami embers in Phase 2+
        let emberLum = 0.0;
        if (shinigamiMix > 0.01) {
          const ex = Math.sin(u * 14.0 + Math.sin(v * 8.0 + t * 2.5));
          const ey = Math.cos(v * 12.0 + t * 4.2 + u * 5.0);
          const ember = Math.max(0.0, ex * ey - 0.72) * 3.5 * shinigamiMix;
          emberLum = clamp(ember, 0.0, 0.85);
        }
        ryukOut.r = mix(5, 255, emberLum);
        ryukOut.g = mix(5, 17, emberLum);
        ryukOut.b = mix(7, 43, emberLum);
        ryukOut.lum = emberLum * 0.75;
        return;
      }

      // Inside Silhouette! Determine whether we are in Face or Hair/Collar
      // Widow's peak V-shaped hairline at top of forehead
      const hairlineY = -0.34 + 0.15 * (1.0 - clamp(ax / 0.24, 0.0, 1.0)) + 0.08 * Math.pow(ax / 0.4, 2.0);
      const isFace = faceDist <= 0.0 && jawShiftY > hairlineY;

      if (!isFace) {
        // Inside spiky black hair or feathered collar
        // White Zig-Zag Highlight Band cutting across the upper hair spikes
        const zigY = -0.50 + 0.085 * Math.abs(((x * 7.5 + 10.0) % 2.0) - 1.0) + 0.12 * x * x;
        const dZig = Math.abs(y - zigY);
        const inZigDomain = ax < 0.58 && y < -0.30 && y > -0.72;

        if (inZigDomain && dZig < 0.038) {
          // Stark chalk-white zig-zag highlight band
          ryukOut.r = 242;
          ryukOut.g = 242;
          ryukOut.b = 248;
          ryukOut.lum = 0.95;
          return;
        }

        // Subtle inner hair strand striations so ASCII characters give texture to the black spikes
        const strand = Math.sin(Math.atan2(y + 0.15, x) * 28.0);
        const strandLum = 0.07 + 0.06 * Math.max(0.0, strand);
        ryukOut.r = 45;
        ryukOut.g = 45;
        ryukOut.b = 56;
        ryukOut.lum = strandLum;
        return;
      }

      // === INSIDE GAUNT SKULL FACE ===
      // Default chalk-white / ash-gray sticker face shading
      let rr = 238;
      let gg = 238;
      let bb = 245;
      let lum = 0.88;

      // Cheekbone hollow shadows & stippled jawline dots
      const cheekHollow =
        Math.exp(-Math.pow((ax - 0.27) / 0.07, 2.0) - Math.pow((jawShiftY - 0.18) / 0.14, 2.0));
      const jawEdgeDist = Math.abs(faceDist);

      // Stippled halftone dots along the jawline & temples
      const stippleGrid =
        Math.sin(x * 85.0) * Math.sin(jawShiftY * 85.0);
      const isStippleZone = jawEdgeDist < 0.075 || cheekHollow > 0.35;

      if (isStippleZone && stippleGrid > 0.15) {
        rr = 104;
        gg = 104;
        bb = 117;
        lum = 0.36;
      }

      // Dark outer skull ink contour
      if (jawEdgeDist < 0.022) {
        rr = 18;
        gg = 18;
        bb = 24;
        lum = 0.08;
      }

      // Forehead wrinkle creases & brow furrow
      const foreheadCrease1 = Math.abs(jawShiftY + 0.24 - 0.03 * Math.cos(x * 10.0));
      if (ax < 0.22 && foreheadCrease1 < 0.009) {
        rr = 40;
        gg = 40;
        bb = 50;
        lum = 0.12;
      }

      // Heavy angled V-brows overhanging the eyes
      const browDist = sdSegment(ax, y, 0.04, -0.11, 0.34, -0.23);
      if (browDist < 0.026) {
        rr = 15;
        gg = 15;
        bb = 20;
        lum = 0.06;
        ryukOut.r = rr;
        ryukOut.g = gg;
        ryukOut.b = bb;
        ryukOut.lum = lum;
        return;
      }

      // Skeletal nose bridge & twin slit nostrils
      const nostrilDist = Math.hypot((ax - 0.032) * 1.4, (jawShiftY - 0.09) * 0.9);
      if (nostrilDist < 0.028) {
        rr = 12;
        gg = 12;
        bb = 16;
        lum = 0.05;
        ryukOut.r = rr;
        ryukOut.g = gg;
        ryukOut.b = bb;
        ryukOut.lum = lum;
        return;
      }

      // === BULGING EYES & SHINIGAMI EYE IGNITION ===
      // Left eye center at (-0.185, -0.055), right eye at (+0.185, -0.055)
      const ex = ax - 0.185;
      const ey = y + 0.055;
      const eyeR = Math.hypot(ex * 0.92, ey * 1.05);

      if (eyeR < 0.138) {
        // Thick dark orbital rim (`0.105` to `0.138`)
        if (eyeR > 0.105) {
          // Radiating red glow in dark socket rim when Shinigami Eyes ignite
          const rimGlow = shinigamiMix * 0.45;
          rr = mix(16, 180, rimGlow);
          gg = 14;
          bb = mix(22, 35, rimGlow);
          lum = mix(0.06, 0.28, rimGlow);
          ryukOut.r = rr;
          ryukOut.g = gg;
          ryukOut.b = bb;
          ryukOut.lum = lum;
          return;
        }

        // Eyelid blink SDF across the eyeball
        const lidAperture = 0.105 * blinkOpen;
        if (Math.abs(ey) > lidAperture) {
          // Closed dark eyelid with crease
          rr = 32;
          gg = 30;
          bb = 40;
          lum = 0.12;
          ryukOut.r = rr;
          ryukOut.g = gg;
          ryukOut.b = bb;
          ryukOut.lum = lum;
          return;
        }

        // Inside open eyeball!
        // Phase 1: Eerie blank chalk-white eyes (#e8e8f0) with tiny pinpoint dot
        // Phase 2+: Blazing Shinigami Eyes — glowing crimson (#ff112b) & amber-gold (#ffaa00) iris with pitch-black pupil
        if (shinigamiMix < 0.05) {
          const pinPupil = smoothstep(0.018, 0.028, eyeR);
          rr = mix(20, 236, pinPupil);
          gg = mix(20, 236, pinPupil);
          bb = mix(25, 244, pinPupil);
          lum = mix(0.08, 0.94, pinPupil);
        } else {
          // Shinigami Eye Deal Ignited!
          const pupilR = 0.032;
          const irisR = 0.088;
          const angle = Math.atan2(ey, ex);
          const spec = Math.exp(-Math.hypot(ex + 0.028, ey + 0.028) * 45.0);

          if (eyeR < pupilR) {
            // Pitch-black pupil singularity with specular catchlight
            rr = mix(8, 255, spec);
            gg = mix(4, 255, spec);
            bb = mix(8, 255, spec);
            lum = mix(0.03, 1.0, spec);
          } else if (eyeR < irisR) {
            // Glowing Crimson (#ff112b) & Amber-Gold (#ffaa00) Iris Rings
            const nr = (eyeR - pupilR) / (irisR - pupilR);
            const fibers = 0.5 + 0.5 * Math.sin(angle * 20.0 + t * 5.0);
            const goldRing = Math.exp(-Math.pow((nr - 0.28) / 0.22, 2.0));
            const goldMix = clamp(goldRing * 0.85 + fibers * 0.25, 0.0, 1.0);

            const sgR = 255;
            const sgG = mix(17, 170, goldMix);
            const sgB = mix(43, 0, goldMix);
            const sgLum = clamp(0.72 + 0.28 * goldMix, 0.65, 1.0);

            rr = mix(236, sgR, shinigamiMix);
            gg = mix(236, sgG, shinigamiMix);
            bb = mix(244, sgB, shinigamiMix);
            lum = mix(0.92, sgLum, shinigamiMix);
          } else {
            // Blood-shot crimson outer sclera glow
            rr = mix(232, 255, shinigamiMix * 0.85);
            gg = mix(232, 35, shinigamiMix * 0.75);
            bb = mix(240, 55, shinigamiMix * 0.75);
            lum = 0.78;
          }
        }

        ryukOut.r = rr;
        ryukOut.g = gg;
        ryukOut.b = bb;
        ryukOut.lum = lum;
        return;
      }

      // === MACABRE EAR-TO-EAR GRIN ===
      // Massive upturned smile curve across the lower face
      const smileCurveY = 0.27 - 0.42 * (x * x);
      const smileHalfH =
        (0.088 + laughOffset * 0.45) * Math.max(0.0, 1.0 - Math.pow(ax / 0.34, 1.8));

      const dySmile = Math.abs(jawShiftY - smileCurveY);
      if (ax < 0.35 && dySmile < smileHalfH + 0.022) {
        if (dySmile > smileHalfH) {
          // Black inked lips & corner stitches
          rr = 14;
          gg = 14;
          bb = 18;
          lum = 0.05;
        } else {
          // Inside grin: vertical high-contrast teeth striations + horizontal gum/parting line
          const toothGap = Math.abs(Math.sin(x * 46.0)) < 0.22;
          const centerPart = Math.abs(jawShiftY - smileCurveY) < 0.012 + laughOffset * 0.2;
          if (toothGap || centerPart) {
            rr = 20;
            gg = 16;
            bb = 24;
            lum = 0.07;
          } else {
            rr = 244;
            gg = 244;
            bb = 250;
            lum = 0.95;
          }
        }
        ryukOut.r = rr;
        ryukOut.g = gg;
        ryukOut.b = bb;
        ryukOut.lum = lum;
        return;
      }

      ryukOut.r = rr;
      ryukOut.g = gg;
      ryukOut.b = bb;
      ryukOut.lum = lum;
    };

    /**
     * Phase 3 & 4: Inside Ryuk's Left Pupil -> Shinigami Space & Beating Crimson Heart / Apple Nebula
     */
    const evaluateShinigamiHeartSpace = (
      u: number,
      v: number,
      t: number,
      p4Progress: number
    ) => {
      let su = u;
      let sv = v;

      if (p4Progress > 0.0) {
        const p4Zoom = 1.0 + easeInExpo(p4Progress) * 10.0;
        su = u / p4Zoom;
        sv = v / p4Zoom;

        const rOrig = Math.hypot(u, v) + 1e-4;
        const angOrig = Math.atan2(v, u);
        const scatter =
          p4Progress * p4Progress * 0.7 * Math.sin(angOrig * 19.0 + rOrig * 26.0 - t * 10.0);
        su -= (u / rOrig) * scatter;
        sv -= (v / rOrig) * scatter;
      }

      let rr = 5.0;
      let gg = 5.0;
      let bb = 7.0;
      let lum = 0.015;

      // Ambient crimson abyssal nebula
      const nebWave = Math.sin(su * 2.6 + t * 0.8) * Math.cos(sv * 2.6 - t * 0.6);
      const nebGlow =
        Math.exp(-Math.hypot(su * 0.85, sv * 0.85) * 1.35) * (0.5 + 0.5 * nebWave);
      rr += nebGlow * 52.0;
      gg += nebGlow * 8.0;
      bb += nebGlow * 18.0;
      lum += nebGlow * 0.12;

      // Twinkling Crosshair Stars
      for (let i = 0; i < NUM_STARS; i++) {
        const st = stars[i];
        const dx = Math.abs(su - st.x);
        const dy = Math.abs(sv - st.y);
        if (dx > 0.22 || dy > 0.22) continue;

        const pulse = 0.45 + 0.55 * Math.sin(t * st.freq + st.phase);
        const d2 = dx * dx + dy * dy;
        const core = Math.exp(-d2 * (1900.0 / st.size));
        const hFlare =
          Math.exp(-dy * dy * 4800.0) * Math.exp((-dx * 22.0) / st.size);
        const vFlare =
          Math.exp(-dx * dx * 4800.0) * Math.exp((-dy * 22.0) / st.size);
        const starVal = (core + 0.65 * (hFlare + vFlare)) * pulse;

        if (starVal > 0.02) {
          if (st.crimson) {
            rr += starVal * 255.0;
            gg += starVal * 45.0;
            bb += starVal * 75.0;
          } else {
            rr += starVal * 240.0;
            gg += starVal * 240.0;
            bb += starVal * 245.0;
          }
          lum += starVal * 0.92;
        }
      }

      // Central Beating Crimson Heart / Shinigami Apple Core Nebula:
      // ((x^2 + y^2 - 1)^3 - x^2 * y^3) <= 0
      const beat = 1.0 + 0.09 * Math.sin(t * 6.5);
      const heartScale = 0.44 * beat;
      const hx = su / heartScale;
      const hy = -sv / heartScale + 0.12;

      const x2 = hx * hx;
      const y2 = hy * hy;
      const a = x2 + y2 - 1.0;
      const F = a * a * a - x2 * (hy * y2);

      const plasma1 = Math.sin(hx * 5.5 + t * 3.8) * Math.cos(hy * 5.5 - t * 3.1);
      const plasma2 = Math.sin(Math.hypot(hx, hy) * 8.5 - t * 6.0);
      const plasma = 0.5 + 0.3 * plasma1 + 0.2 * plasma2;

      if (F <= 0.0) {
        const depth = clamp(Math.pow(Math.min(1.0, -F * 2.2), 0.35), 0.0, 1.0);
        const edgeRim = 1.0 - depth;

        // Blood-red (#ff112b) to neon-crimson (#ff4d6d) & amber-gold core highlights (#ffaa00)
        let hr = 255;
        let hg = mix(17, 77, plasma);
        let hb = mix(43, 109, plasma);

        const hot = clamp(edgeRim * 0.6 + Math.max(0.0, plasma - 0.58) * 0.95, 0.0, 1.0);
        hr = mix(hr, 255, hot);
        hg = mix(hg, 170, hot);
        hb = mix(hb, 60, hot);

        rr = hr;
        gg = hg;
        bb = hb;
        lum = clamp(0.6 + 0.38 * plasma + 0.22 * edgeRim, 0.42, 1.0);
      } else {
        const approxDist = Math.pow(F, 0.3333);
        const corona = Math.exp(-approxDist * 3.8) * (0.82 + 0.18 * plasma);

        if (corona > 0.02) {
          rr += 255 * corona * 1.2;
          gg += mix(17, 77, corona) * corona;
          bb += mix(43, 109, corona) * corona;
          lum += corona * 0.85;
        }
      }

      if (p4Progress > 0.0) {
        const fadeMultiplier = 1.0 - smoothstep(0.25, 0.98, p4Progress);
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

      // Crossfade from MSI GF63 Laptop Opening (0.0s -> 1.3s) into Full Ryuk Sticker
      const laptopToRyukMix = smoothstep(0.85, 1.35, t);

      // Phase 1: Glitch In & Laugh (jaw chuckle oscillation up to 2.6s)
      const laughEnv = smoothstep(0.9, 1.2, t) * smoothstep(4.2, 2.4, t);
      const laughOffset = Math.max(0.0, Math.sin(t * 19.0)) * 0.055 * laughEnv;

      // Phase 2: Double Blink & Shinigami Eye Ignition (2.2s -> 4.2s)
      // Blink 1 at 2.25s - 2.55s, Blink 2 at 2.65s - 3.00s
      let blinkOpen = 1.0;
      if (t >= 2.25 && t <= 2.55) {
        const bp = (t - 2.25) / 0.3;
        blinkOpen = bp < 0.5 ? 1.0 - easeInOutCubic(bp * 2.0) : easeInOutCubic((bp - 0.5) * 2.0);
      } else if (t >= 2.65 && t <= 3.0) {
        const bp = (t - 2.65) / 0.35;
        blinkOpen = bp < 0.5 ? 1.0 - easeInOutCubic(bp * 2.0) : easeInOutCubic((bp - 0.5) * 2.0);
      }

      // Shinigami Eyes ignite right as the blink reopens (~2.45s -> 2.85s)
      const shinigamiMix = smoothstep(2.38, 2.85, t);

      // Phase 3: Pan & Zoom into Ryuk's Left Eye (-0.176, -0.014) -> Crimson Heart Space (4.2s -> 8.0s)
      let zoom = 1.0;
      let camCenterX = 0.0;
      let camCenterY = 0.0;
      let spaceMix = 0.0;

      if (t > 4.2) {
        const zNorm = clamp((t - 4.2) / (8.0 - 4.2), 0.0, 1.0);
        const zEase = easeInOutExpo(zNorm);
        zoom = mix(1.0, 16.0, zEase);
        const panEase = smoothstep(0.0, 0.45, zNorm);
        camCenterX = mix(0.0, -0.176, panEase);
        camCenterY = mix(0.0, -0.014, panEase);
        spaceMix = smoothstep(0.16, 0.58, zNorm);
      }

      // Phase 4: Dissolve Back to Website (8.0s -> 9.5s)
      let p4Progress = 0.0;
      if (t > 8.0) {
        p4Progress = clamp((t - 8.0) / 1.5, 0.0, 1.0);
      }

      // Clear background
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, width, height);

      let lastColor = "";
      const glitchPhase = t < 2.2 ? 1.0 - smoothstep(1.2, 2.2, t) : 0.0;

      for (let r = 0; r < rows; r++) {
        const v = vCoords[r];
        const py = r * CELL_H;

        // Horizontal scanline glitch displacement during Phase 1
        let rowGlitchU = 0.0;
        if (glitchPhase > 0.01) {
          const rWave = Math.sin(r * 0.75 + t * 38.0) * Math.cos(r * 0.23 - t * 21.0);
          if (rWave > 0.72) {
            rowGlitchU = (rWave - 0.72) * 0.45 * glitchPhase;
          }
        }

        for (let c = 0; c < cols; c++) {
          const u = uCoords[c] + rowGlitchU;

          // Phase 4 outward character scatter dropout
          if (p4Progress > 0.05) {
            const cellHash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
            const rand01 = cellHash - Math.floor(cellHash);
            if (rand01 < p4Progress * 1.08 - 0.08) {
              continue;
            }
          }

          let finalR = 0;
          let finalG = 0;
          let finalB = 0;
          let finalLum = 0;

          if (spaceMix < 0.999) {
            const ru = camCenterX + u / zoom;
            const rv = camCenterY + v / zoom;

            if (laptopToRyukMix < 0.999) {
              evaluateMsiLaptop(u, v, t);
            }
            if (laptopToRyukMix > 0.001) {
              evaluateRyukSticker(ru, rv, t, blinkOpen, shinigamiMix, laughOffset);
            }

            finalR = mix(laptopOut.r, ryukOut.r, laptopToRyukMix);
            finalG = mix(laptopOut.g, ryukOut.g, laptopToRyukMix);
            finalB = mix(laptopOut.b, ryukOut.b, laptopToRyukMix);
            finalLum = mix(laptopOut.lum, ryukOut.lum, laptopToRyukMix);

            // Drifting red/white terminal noise materialization during first 1.5s
            if (t < 1.5) {
              const matProgress = smoothstep(0.0, 1.4, t);
              const noiseHash =
                Math.sin((c + Math.floor(t * 24.0)) * 37.17 + r * 91.3) * 43758.5453;
              const n01 = noiseHash - Math.floor(noiseHash);
              if (n01 > matProgress) {
                if (n01 > 0.92) {
                  finalR = 255;
                  finalG = 17;
                  finalB = 43;
                  finalLum = 0.45 * (1.0 - matProgress);
                } else {
                  continue;
                }
              }
            }
          }

          if (spaceMix > 0.001) {
            evaluateShinigamiHeartSpace(u, v, t, p4Progress);
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

      if (t >= 9.5) {
        finishAnimation();
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
  }, [isOpen, finishAnimation]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#050507] transition-opacity duration-600 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Shinigami Ryuk Procedural ASCII Animation"
    >
      <canvas ref={canvasRef} className="block w-full h-full select-none" />
    </div>
  );
};
