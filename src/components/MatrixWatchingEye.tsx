import React, { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
};

interface MatrixWatchingEyeProps {
  className?: string;
}

// Fullscreen quad vertex shader
const VS_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Realistic Raymarched / Physically Shaded 3D Eyeball Fragment Shader
const FS_SOURCE = `
precision highp float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uLook;
uniform float uBlink;
uniform float uClickPulse;
uniform float uLockMix;

// Smooth minimum
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  // Normalized aspect-corrected coordinate centered at (0, 0)
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x * 0.46, uResolution.y * 1.08);

  // Eyelid aperture arch
  float nx = p.x / 1.05;
  float absNx = abs(nx);
  if (absNx >= 1.0) {
    gl_FragColor = vec4(0.012, 0.024, 0.055, 1.0);
    return;
  }

  float arch = pow(max(0.0, 1.0 - nx * nx), 0.84);
  float maxHalfOpen = 0.42;
  float gazeLidShift = uLook.y * 0.045 * arch * uBlink;
  float upperLid = -maxHalfOpen * arch * uBlink + gazeLidShift;
  float lowerLid =  maxHalfOpen * arch * uBlink + gazeLidShift;

  // Outer Almond Contour Mask
  if (p.y < upperLid - 0.04 || p.y > lowerLid + 0.04) {
    gl_FragColor = vec4(0.012, 0.024, 0.055, 1.0);
    return;
  }

  // Eyelid lashes / seam contour
  float dLid = min(abs(p.y - upperLid), abs(p.y - lowerLid));
  float lidThickness = uBlink < 0.15 ? 0.065 : 0.038;

  bool insideAperture = p.y >= upperLid && p.y <= lowerLid && uBlink > 0.025;

  if (!insideAperture) {
    if (dLid < lidThickness) {
      float edge = (1.0 - dLid / lidThickness) * (1.0 - absNx * 0.3);
      vec3 lidColor = mix(vec3(0.0, 0.55, 0.35), vec3(0.4, 1.0, 0.7), edge);
      gl_FragColor = vec4(lidColor * (0.6 + 0.4 * (1.0 - uBlink)), 1.0);
      return;
    }
    gl_FragColor = vec4(0.012, 0.024, 0.055, 1.0);
    return;
  }

  // --- Real 3D Spherical Eyeball Intersection ---
  float sphereR = 1.15;
  float r2 = dot(p, p);
  float zSphere = sqrt(max(0.001, sphereR * sphereR - r2));
  vec3 sphereNormal = normalize(vec3(p.x, p.y, zSphere));

  // Gaze vector in 3D
  vec3 gazeDir = normalize(vec3(uLook.x * 0.52, uLook.y * 0.32, 1.0));

  // Angle from gaze vector to current surface normal
  float gazeDot = dot(sphereNormal, gazeDir);
  float irisAngle = acos(clamp(gazeDot, -1.0, 1.0));

  float irisRadius = 0.38;
  float pupilRadius = 0.13 + 0.04 * uClickPulse;

  // Environmental lighting
  vec3 lightDir1 = normalize(vec3(0.35, 0.55, 0.8));
  vec3 lightDir2 = normalize(vec3(-0.45, -0.2, 0.6));
  float diff1 = max(0.0, dot(sphereNormal, lightDir1));
  float diff2 = max(0.0, dot(sphereNormal, lightDir2));

  // Eyelid ambient occlusion / shadow
  float distToUpper = p.y - upperLid;
  float distToLower = lowerLid - p.y;
  float lidAO = smoothstep(0.0, 0.12, distToUpper) * smoothstep(0.0, 0.09, distToLower);

  vec3 col = vec3(0.0);

  if (irisAngle < irisRadius) {
    // ---- Realistic Iris & Pupil ----
    float normR = irisAngle / irisRadius;

    if (normR < pupilRadius / irisRadius) {
      // Void black pupil with cornea wet reflection
      col = vec3(0.01, 0.018, 0.028);
    } else {
      // Sub-pupil to limbal margin
      float tR = (normR - pupilRadius / irisRadius) / (1.0 - pupilRadius / irisRadius);
      
      // Radial angle around gaze center for organic striae/fibers
      vec3 tangent = normalize(cross(gazeDir, vec3(0.0, 1.0, 0.0)));
      vec3 bitangent = cross(gazeDir, tangent);
      float localX = dot(sphereNormal - gazeDir, tangent);
      float localY = dot(sphereNormal - gazeDir, bitangent);
      float phi = atan(localY, localX);

      // Organic iris fiber harmonics
      float fiber1 = sin(phi * 36.0 + sin(tR * 18.0 + uTime * 0.8));
      float fiber2 = cos(phi * 24.0 - cos(tR * 28.0 - uTime * 0.5));
      float fiber3 = sin(phi * 64.0 + tR * 12.0);
      float striae = 0.5 + 0.28 * fiber1 + 0.14 * fiber2 + 0.08 * fiber3;

      // Golden Collarette Ring (inner iris sphincter)
      float collarette = exp(-pow((tR - 0.28) / 0.18, 2.0));
      // Dark Limbal Ring (outer edge of iris)
      float limbalRing = smoothstep(1.0, 0.72, tR);

      // Realistic Cyberpunk Emerald & Golden Hazel Palette
      vec3 outerIris = vec3(0.0, 0.78, 0.48); // Matrix Emerald
      vec3 innerIris = vec3(0.08, 0.95, 0.62); // Bright mint
      vec3 goldCollarette = vec3(1.0, 0.82, 0.28); // Amber Gold
      
      vec3 irisColor = mix(outerIris, innerIris, striae * 0.8);
      irisColor = mix(irisColor, goldCollarette, collarette * (0.65 + 0.35 * uClickPulse));
      irisColor *= limbalRing;
      irisColor *= (0.45 + 0.55 * diff1);

      col = irisColor;
    }

    // Cornea Wet Highlights (Fresnel + Specular reflection)
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec1 = normalize(lightDir1 + viewDir);
    float spec1 = pow(max(0.0, dot(sphereNormal, halfVec1)), 180.0);
    vec3 halfVec2 = normalize(lightDir2 + viewDir);
    float spec2 = pow(max(0.0, dot(sphereNormal, halfVec2)), 90.0);

    col += vec3(0.95, 1.0, 0.98) * spec1 * 1.35;
    col += vec3(0.5, 0.8, 1.0) * spec2 * 0.45;

  } else {
    // ---- Real Anatomical Sclera (White of Eye) with depth shading ----
    float limbusEdge = smoothstep(irisRadius, irisRadius + 0.05, irisAngle);
    
    // Slight organic warmth with subtle sub-surface vascular depth
    vec3 scleraBase = vec3(0.82, 0.88, 0.86);
    float scleraShade = (diff1 * 0.7 + diff2 * 0.3) * (0.45 + 0.55 * limbusEdge);

    col = scleraBase * scleraShade;

    // Outer corner subtle redness / shadow
    float cornerDark = smoothstep(0.4, 0.95, abs(p.x));
    col = mix(col, vec3(0.65, 0.68, 0.70), cornerDark * 0.4);
  }

  // Apply eyelid shadow
  col *= (0.35 + 0.65 * lidAO);

  // Subtle Holographic CRT Scanline
  float scanline = sin(gl_FragCoord.y * 1.5) * 0.04;
  col -= scanline;

  gl_FragColor = vec4(col, 1.0);
}
`;

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

    // WebGL Context
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true }) ||
               (canvas.getContext("experimental-webgl", { alpha: false, antialias: true }) as WebGLRenderingContext | null);

    if (!gl) {
      console.warn("WebGL not supported, rendering fallback.");
      return;
    }

    startMsRef.current = performance.now();

    // Shader compiler helper
    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile err:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link err:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Quad Buffer
    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResLoc = gl.getUniformLocation(program, "uResolution");
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uLookLoc = gl.getUniformLocation(program, "uLook");
    const uBlinkLoc = gl.getUniformLocation(program, "uBlink");
    const uClickPulseLoc = gl.getUniformLocation(program, "uClickPulse");
    const uLockMixLoc = gl.getUniformLocation(program, "uLockMix");

    let cssW = 148;
    let cssH = 48;
    let dpr = 1;
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
        cssW = 80;
        cssH = 28;
      } else if (vw < 1024) {
        cssW = 104;
        cssH = 32;
      } else if (vw < 1536) {
        cssW = 116;
        cssH = 34;
      } else {
        cssW = 140;
        cssH = 38;
      }

      dpr = Math.min(2, window.devicePixelRatio || 1);
      const renderW = Math.round(cssW * dpr);
      const renderH = Math.round(cssH * dpr);

      canvas.width = renderW;
      canvas.height = renderH;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      gl.viewport(0, 0, renderW, renderH);
      gl.uniform2f(uResLoc, renderW, renderH);
    };

    resizePod();

    const updateGazeFromPoint = (clientX: number, clientY: number) => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const rect = pod.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
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

    let rafId = 0;
    let lastFrameMs = 0;
    const frameInterval = 1000 / 60; // 60 FPS silky smooth WebGL

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

      lockMix += ((lockedRef.current ? 1 : 0) - lockMix) * 0.2;

      // Pass uniforms to WebGL shader
      gl.uniform1f(uTimeLoc, t);
      gl.uniform2f(uLookLoc, lookU, lookV);
      gl.uniform1f(uBlinkLoc, blinkOpen);
      gl.uniform1f(uClickPulseLoc, clickPulse);
      gl.uniform1f(uLockMixLoc, lockMix);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Telemetry update
      if (frameCount++ % 4 === 0) {
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
