import React, { useEffect, useRef, useState, useCallback } from "react";

interface RyukAsciiOverlayProps {
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

/**
 * Draws a high-contrast, anatomically detailed vector illustration of Ryuk's iconic Death Note
 * sticker onto a 2D canvas in normalized [-1, 1] coordinates (where 0,0 is center).
 */
function drawDetailedRyukPortrait(
  bctx: CanvasRenderingContext2D,
  bw: number,
  bh: number,
  t: number,
  blinkOpen: number,
  shinigamiMix: number,
  laughOpen: number,
  zoom: number,
  camCenterX: number,
  camCenterY: number
) {
  bctx.save();
  bctx.fillStyle = "#050507";
  bctx.fillRect(0, 0, bw, bh);

  const aspect = bw / Math.max(1, bh);
  const normScale = aspect >= 1.0 ? 1.0 : 1.0 / Math.max(0.58, aspect);

  // Map normalized world space (u, v) to buffer pixels (px, py)
  // u = camCenterX + (nx * aspect * normScale) / zoom
  // v = camCenterY + (ny * normScale) / zoom
  bctx.translate(bw * 0.5, bh * 0.5);
  const baseScaleX = (bw * 0.5) / (aspect * normScale);
  const baseScaleY = (bh * 0.5) / normScale;
  bctx.scale(baseScaleX * zoom, baseScaleY * zoom);
  bctx.translate(-camCenterX, -camCenterY);

  // Subtle breathing/chuckling head bob
  const headBobY = -0.02 + Math.sin(t * 16.0) * 0.008 * (laughOpen / 0.06);
  bctx.translate(0, headBobY);

  // =========================================================================
  // 0. RISING SHINIGAMI CRIMSON EMBERS IN BACKGROUND (Phase 2+)
  // =========================================================================
  if (shinigamiMix > 0.02) {
    for (let i = 0; i < 28; i++) {
      const seedA = Math.sin(i * 73.1 + 1.9) * 43758.5453;
      const rx = ((seedA - Math.floor(seedA)) * 2.0 - 1.0) * 0.95;
      const seedB = Math.cos(i * 41.7 + 3.3) * 23421.631;
      const ryBase = (seedB - Math.floor(seedB)) * 2.0 - 1.0;
      const ry = ((ryBase - t * (0.35 + (i % 5) * 0.08) + 3.0) % 2.0) - 1.0;
      const rad = 0.014 + (i % 3) * 0.008;
      bctx.fillStyle = i % 3 === 0 ? `rgba(255, 170, 0, ${0.75 * shinigamiMix})` : `rgba(255, 17, 43, ${0.85 * shinigamiMix})`;
      bctx.beginPath();
      bctx.arc(rx, ry, rad, 0, Math.PI * 2);
      bctx.fill();
    }
  }

  // Hair spike coordinates [tipX, tipY, baseLeftX, baseLeftY, baseRightX, baseRightY]
  const hairSpikes: [number, number, number, number, number, number][] = [
    // Left lower wild spikes
    [-0.78, -0.02, -0.40, 0.06, -0.42, -0.10],
    [-0.86, -0.18, -0.41, -0.04, -0.42, -0.22],
    [-0.92, -0.36, -0.42, -0.16, -0.40, -0.34],
    [-0.88, -0.56, -0.40, -0.28, -0.34, -0.44],
    [-0.76, -0.74, -0.36, -0.38, -0.26, -0.50],
    [-0.58, -0.89, -0.28, -0.44, -0.15, -0.54],
    [-0.36, -0.98, -0.18, -0.48, -0.05, -0.55],
    [-0.14, -1.03, -0.08, -0.50, 0.04, -0.55],
    // Center crown tall spikes
    [0.02, -1.05, -0.04, -0.52, 0.08, -0.52],
    [0.18, -1.01, 0.04, -0.55, 0.16, -0.48],
    [0.39, -0.96, 0.12, -0.52, 0.25, -0.45],
    [0.60, -0.87, 0.22, -0.48, 0.34, -0.40],
    [0.78, -0.72, 0.28, -0.44, 0.38, -0.32],
    [0.90, -0.54, 0.34, -0.38, 0.41, -0.22],
    [0.93, -0.34, 0.38, -0.28, 0.42, -0.12],
    [0.85, -0.16, 0.40, -0.18, 0.41, -0.02],
    [0.76, 0.00, 0.41, -0.08, 0.39, 0.08],
  ];

  // Feathered shoulder collar spikes framing the jaw
  const collarSpikes: [number, number, number, number, number, number][] = [
    [-0.72, 0.32, -0.34, 0.18, -0.30, 0.38],
    [-0.78, 0.50, -0.32, 0.30, -0.26, 0.52],
    [-0.68, 0.68, -0.28, 0.44, -0.20, 0.66],
    [-0.52, 0.84, -0.24, 0.56, -0.12, 0.78],
    [0.72, 0.32, 0.34, 0.18, 0.30, 0.38],
    [0.78, 0.50, 0.32, 0.30, 0.26, 0.52],
    [0.68, 0.68, 0.28, 0.44, 0.20, 0.66],
    [0.52, 0.84, 0.24, 0.56, 0.12, 0.78],
  ];

  const traceFullSilhouette = () => {
    bctx.beginPath();
    for (const [tx, ty, lx, ly, rx, ry] of hairSpikes) {
      bctx.moveTo(lx, ly);
      bctx.lineTo(tx, ty);
      bctx.lineTo(rx, ry);
      bctx.closePath();
    }
    for (const [tx, ty, lx, ly, rx, ry] of collarSpikes) {
      bctx.moveTo(lx, ly);
      bctx.lineTo(tx, ty);
      bctx.lineTo(rx, ry);
      bctx.closePath();
    }
    // Central hair dome
    bctx.moveTo(-0.44, -0.05);
    bctx.bezierCurveTo(-0.48, -0.45, -0.25, -0.64, 0.0, -0.64);
    bctx.bezierCurveTo(0.25, -0.64, 0.48, -0.45, 0.44, -0.05);
    bctx.closePath();

    // Neck & lower jaw base
    bctx.moveTo(-0.30, 0.32);
    bctx.lineTo(-0.22, 0.82);
    bctx.lineTo(0.0, 0.90);
    bctx.lineTo(0.22, 0.82);
    bctx.lineTo(0.30, 0.32);
    bctx.closePath();
  };

  // =========================================================================
  // 1. THICK CHALK-WHITE DIE-CUT STICKER BORDER AROUND SILHOUETTE
  // =========================================================================
  bctx.lineJoin = "round";
  bctx.lineCap = "round";
  traceFullSilhouette();
  bctx.strokeStyle = "#f2f2f8";
  bctx.lineWidth = 0.075;
  bctx.stroke();

  // Inner black border inside the white sticker cutline
  bctx.strokeStyle = "#08080c";
  bctx.lineWidth = 0.025;
  bctx.stroke();

  // =========================================================================
  // 2. SPIKY BLACK PINEAPPLE HAIR & FEATHER COLLAR WITH MANGA SHADING
  // =========================================================================
  // Draw collar feathers
  for (const [tx, ty, lx, ly, rx, ry] of collarSpikes) {
    bctx.beginPath();
    bctx.moveTo(lx, ly);
    bctx.lineTo(tx, ty);
    bctx.lineTo(rx, ry);
    bctx.closePath();
    bctx.fillStyle = "#181822";
    bctx.fill();
    // Ash-gray ridge highlight along each feather spike so ASCII characters render its shape
    bctx.beginPath();
    bctx.moveTo((lx + rx) * 0.5, (ly + ry) * 0.5);
    bctx.lineTo(tx, ty);
    bctx.strokeStyle = "#525264";
    bctx.lineWidth = 0.018;
    bctx.stroke();
  }

  // Draw hair spikes with individual 3D ridge highlights
  for (const [tx, ty, lx, ly, rx, ry] of hairSpikes) {
    bctx.beginPath();
    bctx.moveTo(lx, ly);
    bctx.lineTo(tx, ty);
    bctx.lineTo(rx, ry);
    bctx.closePath();
    bctx.fillStyle = "#14141c";
    bctx.fill();

    // Inner ash-gray manga sheen along spike center line
    bctx.beginPath();
    bctx.moveTo(lx * 0.65 + rx * 0.35, ly * 0.65 + ry * 0.35);
    bctx.lineTo(tx, ty);
    bctx.strokeStyle = "#626276";
    bctx.lineWidth = 0.022;
    bctx.stroke();

    // Crisp dark separator between spikes
    bctx.beginPath();
    bctx.moveTo(lx, ly);
    bctx.lineTo(tx, ty);
    bctx.lineTo(rx, ry);
    bctx.strokeStyle = "#060609";
    bctx.lineWidth = 0.012;
    bctx.stroke();
  }

  // Central Hair Mass
  bctx.beginPath();
  bctx.moveTo(-0.44, -0.02);
  bctx.bezierCurveTo(-0.48, -0.45, -0.25, -0.62, 0.0, -0.62);
  bctx.bezierCurveTo(0.25, -0.62, 0.48, -0.45, 0.44, -0.02);
  bctx.closePath();
  bctx.fillStyle = "#12121a";
  bctx.fill();

  // =========================================================================
  // 3. ICONIC JAGGED WHITE ZIG-ZAG HIGHLIGHT BAND ACROSS UPPER HAIR
  // =========================================================================
  bctx.beginPath();
  const zigPoints: [number, number][] = [
    [-0.64, -0.44],
    [-0.50, -0.62],
    [-0.38, -0.48],
    [-0.26, -0.68],
    [-0.13, -0.52],
    [0.0, -0.72],
    [0.13, -0.52],
    [0.26, -0.68],
    [0.38, -0.48],
    [0.50, -0.62],
    [0.64, -0.44],
    // Lower edge of zig-zag band
    [0.52, -0.36],
    [0.39, -0.51],
    [0.26, -0.39],
    [0.13, -0.56],
    [0.0, -0.43],
    [-0.13, -0.56],
    [-0.26, -0.39],
    [-0.39, -0.51],
    [-0.52, -0.36],
  ];
  bctx.moveTo(zigPoints[0][0], zigPoints[0][1]);
  for (let i = 1; i < zigPoints.length; i++) {
    bctx.lineTo(zigPoints[i][0], zigPoints[i][1]);
  }
  bctx.closePath();
  bctx.fillStyle = "#f4f4fa";
  bctx.fill();

  // =========================================================================
  // 4. GAUNT SKULL, WIDOW'S PEAK, CHEEKBONES & ELONGATED POINTED CHIN
  // =========================================================================
  const chinDrop = laughOpen;
  const traceFacePath = () => {
    bctx.beginPath();
    // Start at Widow's Peak center V-dip on forehead
    bctx.moveTo(0.0, -0.29);
    // Right forehead arch up into temple
    bctx.bezierCurveTo(0.10, -0.43, 0.29, -0.42, 0.37, -0.26);
    // Right brow & flaring zygomatic cheekbone
    bctx.bezierCurveTo(0.41, -0.14, 0.44, -0.02, 0.41, 0.09);
    // Gaunt hollow indentation below cheekbone
    bctx.bezierCurveTo(0.37, 0.19, 0.30, 0.28, 0.26, 0.40 + chinDrop * 0.6);
    // Narrow elongated jaw tapering to pointed chin
    bctx.bezierCurveTo(0.21, 0.56 + chinDrop, 0.10, 0.72 + chinDrop, 0.0, 0.77 + chinDrop);
    // Left jaw tapering up
    bctx.bezierCurveTo(-0.10, 0.72 + chinDrop, -0.21, 0.56 + chinDrop, -0.26, 0.40 + chinDrop * 0.6);
    // Left hollow cheek indentation
    bctx.bezierCurveTo(-0.30, 0.28, -0.37, 0.19, -0.41, 0.09);
    // Left flaring cheekbone & temple
    bctx.bezierCurveTo(-0.44, -0.02, -0.41, -0.14, -0.37, -0.26);
    // Left forehead arch back to Widow's Peak
    bctx.bezierCurveTo(-0.29, -0.42, -0.10, -0.43, 0.0, -0.29);
    bctx.closePath();
  };

  // Fill face with bright chalk-white manga tone
  traceFacePath();
  bctx.fillStyle = "#ededf5";
  bctx.fill();
  bctx.lineWidth = 0.026;
  bctx.strokeStyle = "#08080c";
  bctx.stroke();

  // Ash-gray gaunt cheekbone & temple shadows (left & right)
  bctx.fillStyle = "#8a8a9c";
  // Left cheek hollow
  bctx.beginPath();
  bctx.moveTo(-0.39, 0.05);
  bctx.bezierCurveTo(-0.31, 0.10, -0.27, 0.22, -0.24, 0.38 + chinDrop * 0.5);
  bctx.bezierCurveTo(-0.29, 0.30, -0.35, 0.20, -0.39, 0.05);
  bctx.fill();
  // Right cheek hollow
  bctx.beginPath();
  bctx.moveTo(0.39, 0.05);
  bctx.bezierCurveTo(0.31, 0.10, 0.27, 0.22, 0.24, 0.38 + chinDrop * 0.5);
  bctx.bezierCurveTo(0.29, 0.30, 0.35, 0.20, 0.39, 0.05);
  bctx.fill();

  // Temple & lower jaw ash-gray shading bands for 3D skull volume
  bctx.strokeStyle = "#78788a";
  bctx.lineWidth = 0.022;
  bctx.beginPath();
  bctx.moveTo(-0.34, -0.24);
  bctx.quadraticCurveTo(-0.38, -0.10, -0.35, 0.02);
  bctx.moveTo(0.34, -0.24);
  bctx.quadraticCurveTo(0.38, -0.10, 0.35, 0.02);
  bctx.stroke();

  // =========================================================================
  // 5. HEAVY FURROWED V-BROWS & FOREHEAD WRINKLES
  // =========================================================================
  bctx.strokeStyle = "#09090e";
  bctx.lineWidth = 0.032;
  bctx.beginPath();
  // Left heavy angled brow ridge
  bctx.moveTo(-0.04, -0.13);
  bctx.quadraticCurveTo(-0.18, -0.25, -0.35, -0.19);
  // Right heavy angled brow ridge
  bctx.moveTo(0.04, -0.13);
  bctx.quadraticCurveTo(0.18, -0.25, 0.35, -0.19);
  bctx.stroke();

  // Furrowed forehead V-wrinkles between brows
  bctx.lineWidth = 0.016;
  bctx.beginPath();
  bctx.moveTo(-0.12, -0.26);
  bctx.quadraticCurveTo(0.0, -0.21, 0.12, -0.26);
  bctx.moveTo(-0.09, -0.31);
  bctx.quadraticCurveTo(0.0, -0.27, 0.09, -0.31);
  bctx.stroke();

  // =========================================================================
  // 6. SKELETAL NOSE BRIDGE & TWIN UPTURNED SKULL NOSTRILS
  // =========================================================================
  bctx.strokeStyle = "#14141d";
  bctx.lineWidth = 0.016;
  bctx.beginPath();
  bctx.moveTo(-0.025, -0.11);
  bctx.lineTo(-0.038, 0.06);
  bctx.moveTo(0.025, -0.11);
  bctx.lineTo(0.038, 0.06);
  bctx.stroke();

  // Twin dark skull nostril slits
  bctx.fillStyle = "#08080c";
  bctx.beginPath();
  bctx.ellipse(-0.032, 0.085, 0.018, 0.032, -0.25, 0, Math.PI * 2);
  bctx.ellipse(0.032, 0.085, 0.018, 0.032, 0.25, 0, Math.PI * 2);
  bctx.fill();

  // =========================================================================
  // 7. BULGING SHINIGAMI EYES (WITH DOUBLE BLINK & CRIMSON/GOLD IGNITION)
  // =========================================================================
  const eyeCenters: [number, number][] = [
    [-0.185, -0.055],
    [0.185, -0.055],
  ];

  for (const [ex, ey] of eyeCenters) {
    // Dark sunken gothic eye socket ring
    bctx.beginPath();
    bctx.ellipse(ex, ey, 0.132, 0.112, 0, 0, Math.PI * 2);
    bctx.fillStyle = "#08080d";
    bctx.fill();

    // Under-eye skeletal bag line
    bctx.beginPath();
    bctx.arc(ex, ey + 0.01, 0.145, 0.25, Math.PI - 0.25);
    bctx.strokeStyle = "#3a3a48";
    bctx.lineWidth = 0.014;
    bctx.stroke();

    // Eyeball aperture (vertical radius scales with blinkOpen)
    const openH = Math.max(0.006, 0.088 * blinkOpen);
    bctx.save();
    bctx.beginPath();
    bctx.ellipse(ex, ey, 0.106, openH, 0, 0, Math.PI * 2);
    bctx.clip();

    if (blinkOpen > 0.08) {
      // Sclera fill (chalk-white in Phase 1, deep blood-crimson tint in Phase 2+)
      const scR = Math.round(mix(242, 185, shinigamiMix * 0.45));
      const scG = Math.round(mix(242, 28, shinigamiMix * 0.75));
      const scB = Math.round(mix(248, 45, shinigamiMix * 0.75));
      bctx.fillStyle = `rgb(${scR},${scG},${scB})`;
      bctx.fillRect(ex - 0.12, ey - 0.12, 0.24, 0.24);

      if (shinigamiMix < 0.05) {
        // Phase 1: Eerie Death Note sticker blank eyes with small dark iris ring & pinpoint pupil
        bctx.beginPath();
        bctx.arc(ex, ey, 0.042, 0, Math.PI * 2);
        bctx.strokeStyle = "#22222c";
        bctx.lineWidth = 0.015;
        bctx.stroke();

        bctx.beginPath();
        bctx.arc(ex, ey, 0.018, 0, Math.PI * 2);
        bctx.fillStyle = "#050507";
        bctx.fill();
      } else {
        // Phase 2+: Blazing Shinigami Eyes (Crimson #ff112b outer iris + Gold #ffaa00 inner ring + Black pupil)
        // Outer Crimson Iris
        bctx.beginPath();
        bctx.arc(ex, ey, 0.078, 0, Math.PI * 2);
        bctx.fillStyle = "#ff112b";
        bctx.fill();

        // Glowing Amber-Gold Inner Ring
        bctx.beginPath();
        bctx.arc(ex, ey, 0.052, 0, Math.PI * 2);
        bctx.fillStyle = "#ffaa00";
        bctx.fill();

        // Radial iris spokes
        bctx.strokeStyle = "#ff112b";
        bctx.lineWidth = 0.008;
        for (let s = 0; s < 12; s++) {
          const ang = (s / 12) * Math.PI * 2 + t * 1.5;
          bctx.beginPath();
          bctx.moveTo(ex + Math.cos(ang) * 0.024, ey + Math.sin(ang) * 0.024);
          bctx.lineTo(ex + Math.cos(ang) * 0.076, ey + Math.sin(ang) * 0.076);
          bctx.stroke();
        }

        // Pitch-black pupil singularity
        bctx.beginPath();
        bctx.arc(ex, ey, 0.026, 0, Math.PI * 2);
        bctx.fillStyle = "#050507";
        bctx.fill();

        // Bright white specular catchlight
        bctx.beginPath();
        bctx.arc(ex - 0.022, ey - 0.022, 0.012, 0, Math.PI * 2);
        bctx.fillStyle = "#ffffff";
        bctx.fill();
      }
    } else {
      // Closed eyelid crease line
      bctx.fillStyle = "#181822";
      bctx.fillRect(ex - 0.12, ey - 0.12, 0.24, 0.24);
    }
    bctx.restore();
  }

  // =========================================================================
  // 8. MACABRE EAR-TO-EAR GRIN WITH INDIVIDUAL POINTED TEETH
  // =========================================================================
  const mouthTopY = 0.24;
  const mouthBotY = 0.42 + chinDrop * 1.15;

  // Outer black mouth cavity stretching ear-to-ear up toward the cheekbones
  bctx.beginPath();
  bctx.moveTo(-0.34, 0.15);
  bctx.quadraticCurveTo(0.0, mouthTopY + 0.08, 0.34, 0.15);
  bctx.quadraticCurveTo(0.0, mouthBotY + 0.12, -0.34, 0.15);
  bctx.closePath();
  bctx.fillStyle = "#07070b";
  bctx.fill();
  bctx.lineWidth = 0.022;
  bctx.strokeStyle = "#050507";
  bctx.stroke();

  // Stitched corner smile scars at left & right cheek corners
  bctx.lineWidth = 0.015;
  bctx.strokeStyle = "#101018";
  bctx.beginPath();
  bctx.moveTo(-0.34, 0.15);
  bctx.lineTo(-0.38, 0.10);
  bctx.moveTo(-0.35, 0.18);
  bctx.lineTo(-0.31, 0.11);
  bctx.moveTo(0.34, 0.15);
  bctx.lineTo(0.38, 0.10);
  bctx.moveTo(0.35, 0.18);
  bctx.lineTo(0.31, 0.11);
  bctx.stroke();

  // Draw individual high-contrast upper & lower teeth inside the grin!
  const numTeeth = 11;
  for (let i = 0; i < numTeeth; i++) {
    const frac = (i / (numTeeth - 1)) * 2.0 - 1.0; // -1 to +1
    const tx = frac * 0.27;
    const archFactor = 1.0 - frac * frac;
    const toothHalfW = 0.019 * (0.65 + 0.35 * archFactor);

    const upperY = 0.15 + (mouthTopY - 0.10) * archFactor;
    const lowerY = 0.15 + (mouthBotY - 0.06) * archFactor;
    const midY = (upperY + lowerY) * 0.5;
    const jawGap = (0.008 + chinDrop * 0.45) * archFactor;

    // Upper tooth (chalk white)
    bctx.fillStyle = "#f4f4fa";
    bctx.beginPath();
    bctx.moveTo(tx - toothHalfW, upperY);
    bctx.lineTo(tx + toothHalfW, upperY);
    bctx.lineTo(tx + toothHalfW * 0.75, midY - jawGap);
    bctx.lineTo(tx - toothHalfW * 0.75, midY - jawGap);
    bctx.closePath();
    bctx.fill();

    // Lower tooth (chalk white)
    bctx.beginPath();
    bctx.moveTo(tx - toothHalfW, lowerY);
    bctx.lineTo(tx + toothHalfW, lowerY);
    bctx.lineTo(tx + toothHalfW * 0.75, midY + jawGap);
    bctx.lineTo(tx - toothHalfW * 0.75, midY + jawGap);
    bctx.closePath();
    bctx.fill();
  }

  // Pointed chin cleft lines
  bctx.strokeStyle = "#525264";
  bctx.lineWidth = 0.015;
  bctx.beginPath();
  bctx.moveTo(-0.05, 0.54 + chinDrop);
  bctx.quadraticCurveTo(0.0, 0.50 + chinDrop, 0.05, 0.54 + chinDrop);
  bctx.moveTo(0.0, 0.58 + chinDrop);
  bctx.lineTo(0.0, 0.70 + chinDrop);
  bctx.stroke();

  bctx.restore();
}

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

    // Offscreen sampling canvas (1 pixel per ASCII cell) for razor-sharp Ryuk portrait details
    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });

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
    let cellW = 7;
    let cellH = 12;
    let cols = 0;
    let rows = 0;
    let aspect = 1;
    let uCoords = new Float32Array(0);
    let vCoords = new Float32Array(0);

    const resizeGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      let fontSize = 11;
      if (width < 640) {
        fontSize = 9;
      } else if (width < 1024) {
        fontSize = 11;
      } else {
        fontSize = 13;
      }

      ctx.font = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;
      const charWidth = ctx.measureText("M").width || 7.5;
      cellW = Math.max(5, Math.round(charWidth));
      cellH = Math.max(8, Math.round(fontSize * 1.25));

      // 1:1 pixel buffer avoids 4K retina blit bottlenecks on 1080p desktop displays
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = `bold ${fontSize}px 'Consolas', 'Courier New', monospace`;
      ctx.textBaseline = "top";

      cols = Math.max(30, Math.ceil(width / cellW));
      rows = Math.max(25, Math.ceil(height / cellH));
      aspect = width / Math.max(1, height);

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
      if (e.key === "Escape") {
        e.preventDefault();
        finishAnimation();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const spaceOut = { r: 0, g: 0, b: 0, lum: 0 };

    /**
     * Phase 3 & 4: Inside Ryuk's Left Pupil -> Shinigami Space & Beating Crimson Heart / Apple Nebula
     * (Preserved 100% intact!)
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

      // Phase 1: Glitch In & Laugh (0.0s -> 2.2s)
      const laughEnv = smoothstep(0.15, 0.5, t) * smoothstep(4.2, 2.2, t);
      const laughOpen = Math.max(0.0, Math.sin(t * 18.0)) * 0.065 * laughEnv;

      // Phase 2: Double Blink & Shinigami Eye Ignition (2.2s -> 4.2s)
      let blinkOpen = 1.0;
      if (t >= 2.15 && t <= 2.48) {
        const bp = (t - 2.15) / 0.33;
        blinkOpen = bp < 0.5 ? 1.0 - easeInOutCubic(bp * 2.0) : easeInOutCubic((bp - 0.5) * 2.0);
      } else if (t >= 2.58 && t <= 2.95) {
        const bp = (t - 2.58) / 0.37;
        blinkOpen = bp < 0.5 ? 1.0 - easeInOutCubic(bp * 2.0) : easeInOutCubic((bp - 0.5) * 2.0);
      }

      // Shinigami Eyes ignite right as the blink reopens (~2.32s -> 2.80s)
      const shinigamiMix = smoothstep(2.30, 2.80, t);

      // Phase 3: Pan & Zoom into Ryuk's Left Eye (-0.185, -0.055) -> Crimson Heart Space (4.2s -> 8.0s)
      let zoom = 1.0;
      let camCenterX = 0.0;
      let camCenterY = 0.0;
      let spaceMix = 0.0;

      if (t > 4.2) {
        const zNorm = clamp((t - 4.2) / (8.0 - 4.2), 0.0, 1.0);
        const zEase = easeInOutExpo(zNorm);
        zoom = mix(1.0, 16.0, zEase);
        const panEase = smoothstep(0.0, 0.45, zNorm);
        camCenterX = mix(0.0, -0.185, panEase);
        camCenterY = mix(0.0, -0.055, panEase);
        spaceMix = smoothstep(0.18, 0.58, zNorm);
      }

      // Phase 4: Dissolve Back to Website (8.0s -> 9.5s)
      let p4Progress = 0.0;
      if (t > 8.0) {
        p4Progress = clamp((t - 8.0) / 1.5, 0.0, 1.0);
      }

      // Render detailed Ryuk portrait into offscreen grid buffer when visible
      let ryukPixels: Uint8ClampedArray | null = null;
      if (spaceMix < 0.999 && offCtx) {
        drawDetailedRyukPortrait(
          offCtx,
          cols,
          rows,
          t,
          blinkOpen,
          shinigamiMix,
          laughOpen,
          zoom,
          camCenterX,
          camCenterY
        );
        ryukPixels = offCtx.getImageData(0, 0, cols, rows).data;
      }

      // Clear main ASCII canvas
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, width, height);

      let lastColor = "";
      const glitchPhase = t < 1.8 ? 1.0 - smoothstep(0.6, 1.8, t) : 0.0;

      for (let r = 0; r < rows; r++) {
        const v = vCoords[r];
        const py = r * cellH;

        // Subtle horizontal scanline glitch during initial materialization
        let colShift = 0;
        if (glitchPhase > 0.01) {
          const rWave = Math.sin(r * 0.75 + t * 38.0) * Math.cos(r * 0.23 - t * 21.0);
          if (rWave > 0.75) {
            colShift = Math.round((rWave - 0.75) * 14 * glitchPhase);
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

          // Phase 4 outward character scatter dropout
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

          if (spaceMix < 0.999 && ryukPixels) {
            const sc = clamp(c + colShift, 0, cols - 1);
            const pIdx = (r * cols + sc) * 4;
            finalR = ryukPixels[pIdx];
            finalG = ryukPixels[pIdx + 1];
            finalB = ryukPixels[pIdx + 2];
            finalLum = (0.299 * finalR + 0.587 * finalG + 0.114 * finalB) / 255.0;

            // Brief terminal noise materialization during first 0.75s
            if (t < 0.75) {
              const matProgress = smoothstep(0.0, 0.75, t);
              const noiseHash =
                Math.sin((c + Math.floor(t * 28.0)) * 37.17 + r * 91.3) * 43758.5453;
              const n01 = noiseHash - Math.floor(noiseHash);
              if (n01 > matProgress) {
                if (n01 > 0.90) {
                  finalR = 255;
                  finalG = 17;
                  finalB = 43;
                  finalLum = 0.5 * (1.0 - matProgress);
                } else {
                  flushBatch();
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
