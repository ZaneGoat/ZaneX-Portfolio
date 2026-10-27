import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX, X } from "lucide-react";

interface CelestialZenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CelestialMode = "ascent" | "breaker" | "sandbox";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number;
  hue: number;
}

interface Nebula {
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  life: number;
  decay: number;
}

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  decay: number;
  color: string;
}

interface ZenRipple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  color: string;
}

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "normal" | "moving" | "boost";
  vx: number;
}

interface StarOrb {
  x: number;
  y: number;
  r: number;
  angle: number;
}

interface BrickStyle {
  fill: string;
  border: string;
  glow: string;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  row: number;
  style: BrickStyle;
}

// Exact custom meditating figure SVG path from Celestial Zen Night Arcade
export const MEDITATING_LOGO_SVG_PATH = `
  M 0,-75
  C 16,-75 18,-62 16,-47
  C 14,-35 6,-32 6,-27
  C 6,-21 15,-22 24,-29
  C 33,-36 44,-26 42,-14
  C 40,-3 36,3 42,12
  C 48,21 52,24 62,31
  C 72,38 88,37 92,50
  C 96,63 82,70 78,78
  C 74,86 64,89 52,82
  C 40,75 32,76 23,87
  C 14,98 2,94 -1,84
  C -4,74 3,66 12,62
  C 21,58 34,66 38,60
  C 42,54 27,48 16,44
  C 8,40 4,32 0,32
  C -4,32 -8,40 -16,44
  C -27,48 -42,54 -38,60
  C -34,66 -21,58 -12,62
  C -3,66 4,74 1,84
  C -2,94 -14,98 -23,87
  C -32,76 -40,75 -52,82
  C -64,89 -74,86 -78,78
  C -82,70 -96,63 -92,50
  C -88,37 -72,38 -62,31
  C -52,24 -48,21 -42,12
  C -36,3 -40,-3 -42,-14
  C -44,-26 -33,-36 -24,-29
  C -15,-22 -6,-21 -6,-27
  C -6,-32 -14,-35 -16,-47
  C -18,-62 -16,-75 0,-75 Z
  M 7,-8
  C 7,-17 19,-18 25,-8
  C 31,2 25,15 28,24
  C 31,33 48,37 56,44
  C 64,51 62,61 52,58
  C 42,55 31,46 21,37
  C 11,28 7,17 7,-8 Z
  M -7,-8
  C -7,-17 -19,-18 -25,-8
  C -31,2 -25,15 -28,24
  C -31,33 -48,37 -56,44
  C -64,51 -62,61 -52,58
  C -42,55 -31,46 -21,37
  C -11,28 -7,17 -7,-8 Z
`;

// Dreamy Celestial Lydian / Pentatonic Night-Sky Scale (D4 -> D6)
const CELESTIAL_SCALE = [293.66, 369.99, 440.0, 493.88, 554.37, 587.33, 739.99, 880.0, 987.77];
const BRICK_ROW_NOTES = [880.0, 739.99, 587.33, 493.88];

/**
 * Dedicated Ethereal Night-Sky Audio Synthesizer for Celestial Zen
 * Completely separate from the cyberpunk heavy-bass spaceship synth so every chime,
 * singing-bowl swell, and starlight cascade matches the tranquil midnight cosmos theme.
 */
class CelestialAudioEngine {
  private ctx: AudioContext | null = null;
  private bus: AudioNode | null = null;
  public enabled = true;

  private ensureBus(): AudioNode | null {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      this.ctx = ctx;

      // Velvet lowpass warmth filter + gentle compressor so crystal bells stay soothing at night
      const warmth = ctx.createBiquadFilter();
      warmth.type = "lowpass";
      warmth.frequency.value = 3600;
      warmth.Q.value = 0.6;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 14;
      comp.ratio.value = 4;
      comp.attack.value = 0.005;
      comp.release.value = 0.22;

      const master = ctx.createGain();
      master.gain.value = 0.85;

      warmth.connect(comp);
      comp.connect(master);
      master.connect(ctx.destination);
      this.bus = warmth;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.bus;
  }

  public unlock() {
    this.ensureBus();
  }

  public close() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.bus = null;
    }
  }

  private scheduleBell(
    freq: number,
    delaySec: number,
    duration: number,
    vol: number,
    shimmer = 0.22
  ) {
    const bus = this.ensureBus();
    if (!this.ctx || !bus) return;

    try {
      const t = this.ctx.currentTime + delaySec;

      // Fundamental warm crystal sine
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, t);

      gain1.gain.setValueAtTime(0.0001, t);
      gain1.gain.linearRampToValueAtTime(vol, t + 0.008);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc1.connect(gain1);
      gain1.connect(bus);
      osc1.onended = () => {
        try {
          osc1.disconnect();
          gain1.disconnect();
        } catch {}
      };
      osc1.start(t);
      osc1.stop(t + duration + 0.02);

      // Soft +1 octave celesta harmonic shimmer
      if (shimmer > 0) {
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = "triangle";
        osc2.detune.setValueAtTime(5, t);
        osc2.frequency.setValueAtTime(freq * 2, t);

        const shimmerDur = duration * 0.65;
        gain2.gain.setValueAtTime(0.0001, t);
        gain2.gain.linearRampToValueAtTime(vol * shimmer, t + 0.006);
        gain2.gain.exponentialRampToValueAtTime(0.0001, t + shimmerDur);

        osc2.connect(gain2);
        gain2.connect(bus);
        osc2.onended = () => {
          try {
            osc2.disconnect();
            gain2.disconnect();
          } catch {}
        };
        osc2.start(t);
        osc2.stop(t + shimmerDur + 0.02);
      }
    } catch {}
  }

  // Serene 3-note lunar harp welcome
  public playLaunch() {
    this.scheduleBell(293.66, 0, 0.55, 0.13, 0.25);
    this.scheduleBell(440.0, 0.06, 0.55, 0.12, 0.25);
    this.scheduleBell(739.99, 0.12, 0.65, 0.11, 0.3);
  }

  // Cloud / boost platform bounce
  public playPlatformBounce(isBoost: boolean) {
    if (isBoost) {
      this.scheduleBell(587.33, 0, 0.45, 0.15, 0.3);
      this.scheduleBell(880.0, 0.055, 0.52, 0.14, 0.32);
    } else {
      const note = CELESTIAL_SCALE[Math.floor(Math.random() * 6)];
      this.scheduleBell(note, 0, 0.38, 0.13, 0.2);
    }
  }

  // Catching a golden starlight orb
  public playStarOrb() {
    this.scheduleBell(739.99, 0, 0.38, 0.12, 0.28);
    this.scheduleBell(880.0, 0.045, 0.42, 0.12, 0.28);
    this.scheduleBell(1174.66, 0.09, 0.52, 0.11, 0.22);
  }

  // Airy silk upward astral boost
  public playAstralBoost() {
    const bus = this.ensureBus();
    if (!this.ctx || !bus) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(329.63, t);
      osc.frequency.exponentialRampToValueAtTime(587.33, t + 0.26);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1100, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.11, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(bus);
      osc.onended = () => {
        try {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch {}
      };
      osc.start(t);
      osc.stop(t + 0.3);
    } catch {}
  }

  // Lunar paddle & soft wall reflections
  public playPaddleBounce() {
    this.scheduleBell(369.99, 0, 0.32, 0.13, 0.18);
    this.scheduleBell(554.37, 0.02, 0.28, 0.08, 0.15);
  }

  public playSoftWall(idx?: number) {
    const note =
      typeof idx === "number"
        ? CELESTIAL_SCALE[idx % CELESTIAL_SCALE.length]
        : CELESTIAL_SCALE[Math.floor(Math.random() * 5)];
    this.scheduleBell(note, 0, 0.26, 0.09, 0.14);
  }

  // Constellation glass brick & full constellation clear
  public playBrickBreak(row: number) {
    const note = BRICK_ROW_NOTES[row % BRICK_ROW_NOTES.length];
    this.scheduleBell(note, 0, 0.4, 0.13, 0.28);
  }

  public playConstellationClear() {
    [293.66, 440.0, 587.33, 739.99, 1174.66].forEach((n, i) => {
      this.scheduleBell(n, i * 0.055, 0.7, 0.12, 0.25);
    });
  }

  // Zero-G Tibetan singing-bowl gravity ripple
  public playGravityWave() {
    const bus = this.ensureBus();
    if (!this.ctx || !bus) return;
    try {
      const t = this.ctx.currentTime;
      [220.0, 329.63].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.detune.setValueAtTime(idx === 1 ? 4 : -3, t);
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.14 : 0.08, t + 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.58);

        osc.connect(gain);
        gain.connect(bus);
        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
        osc.start(t);
        osc.stop(t + 0.6);
      });
    } catch {}
  }

  // Peaceful twilight cadence when drifting off-screen
  public playTwilightEnd() {
    this.scheduleBell(493.88, 0, 0.55, 0.12, 0.15);
    this.scheduleBell(369.99, 0.11, 0.65, 0.12, 0.12);
    this.scheduleBell(293.66, 0.22, 0.85, 0.13, 0.1);
  }

  public playUiTap(high = true) {
    this.scheduleBell(high ? 659.25 : 493.88, 0, 0.24, 0.1, 0.2);
  }
}

const getSavedBest = (mode: CelestialMode): number => {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(`celestial_zen_best_${mode}`) || "0", 10) || 0;
  } catch {
    return 0;
  }
};

export const CelestialZenModal: React.FC<CelestialZenModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<CelestialAudioEngine | null>(null);

  const [mode, setMode] = useState<CelestialMode>("ascent");
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState<Record<CelestialMode, number>>(() => ({
    ascent: getSavedBest("ascent"),
    breaker: getSavedBest("breaker"),
    sandbox: getSavedBest("sandbox"),
  }));
  const [showAuraCircle, setShowAuraCircle] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameOverInfo, setGameOverInfo] = useState<{
    title: string;
    desc: string;
    finalScore: number;
    best: number;
  } | null>(null);
  const [restartToken, setRestartToken] = useState(0);

  // Refs synced into the 60-FPS canvas loop
  const modeRef = useRef<CelestialMode>(mode);
  const auraRef = useRef<boolean>(showAuraCircle);
  const bestScoresRef = useRef(bestScores);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    auraRef.current = showAuraCircle;
  }, [showAuraCircle]);

  useEffect(() => {
    bestScoresRef.current = bestScores;
  }, [bestScores]);

  // Manage dedicated Celestial Night-Sky Audio Engine lifecycle
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.close();
        audioRef.current = null;
      }
      return;
    }

    const engine = new CelestialAudioEngine();
    engine.enabled = soundEnabled;
    audioRef.current = engine;
    engine.playLaunch();

    return () => {
      engine.close();
      if (audioRef.current === engine) {
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.enabled = soundEnabled;
    }
  }, [soundEnabled]);

  const handleClose = useCallback(() => {
    audioRef.current?.playUiTap(false);
    onClose();
  }, [onClose]);

  const handleSwitchMode = useCallback((nextMode: CelestialMode) => {
    audioRef.current?.playLaunch();
    setMode(nextMode);
    setGameOverInfo(null);
    setRestartToken(t => t + 1);
  }, []);

  const handleRestart = useCallback(() => {
    audioRef.current?.playLaunch();
    setGameOverInfo(null);
    setRestartToken(t => t + 1);
  }, []);

  const handleToggleAura = useCallback(() => {
    setShowAuraCircle(prev => {
      const next = !prev;
      audioRef.current?.playUiTap(next);
      return next;
    });
  }, []);

  const handleToggleAudio = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.enabled = next;
        if (next) audioRef.current.playUiTap(true);
      }
      return next;
    });
  }, []);

  // Main Fullscreen Night-Arcade Simulation & Renderer
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logoPath2D = new Path2D(MEDITATING_LOGO_SVG_PATH);

    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);
    canvas.width = width;
    canvas.height = height;

    const activeMode = modeRef.current;
    let localScore = 0;
    let isGameOver = false;
    let timeTick = 0;

    const player = {
      x: width / 2,
      y: height * 0.6,
      vx: 0,
      vy: 0,
      radius: 25,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      isDragging: false,
    };

    let stars: Star[] = [];
    let nebulae: Nebula[] = [];
    const shootingStars: ShootingStar[] = [];
    const particles: StardustParticle[] = [];
    const ripples: ZenRipple[] = [];

    let platforms: Platform[] = [];
    let starOrbs: StarOrb[] = [];
    const paddle = { x: 0, y: 0, w: 130, h: 14, targetX: 0 };
    let bricks: Brick[] = [];

    const keys = { left: false, right: false };
    const pointer = { x: width / 2, y: height / 2, down: false, active: false };

    const syncScore = (nextScore: number) => {
      localScore = nextScore;
      setScore(nextScore);
      const curBest = bestScoresRef.current[activeMode] || 0;
      if (nextScore > curBest) {
        const updated = { ...bestScoresRef.current, [activeMode]: nextScore };
        bestScoresRef.current = updated;
        setBestScores(updated);
        try {
          localStorage.setItem(`celestial_zen_best_${activeMode}`, String(nextScore));
        } catch {}
      }
    };

    const createStarfield = () => {
      stars = [];
      const count = Math.floor((width * height) / 3500);
      for (let i = 0; i < count; i++) {
        const layer = Math.random() < 0.55 ? 1 : Math.random() < 0.85 ? 2 : 3;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r:
            layer === 1
              ? Math.random() * 1.0 + 0.3
              : layer === 2
              ? Math.random() * 1.6 + 0.7
              : Math.random() * 2.4 + 1.2,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.05 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          layer,
          hue: Math.random() < 0.25 ? 210 : Math.random() < 0.1 ? 40 : 0,
        });
      }

      nebulae = [];
      for (let i = 0; i < 4; i++) {
        nebulae.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 220 + 160,
          color: i % 2 === 0 ? "rgba(30, 58, 138, 0.12)" : "rgba(76, 29, 149, 0.1)",
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    const spawnShootingStar = () => {
      const startX = Math.random() * width * 0.85 + width * 0.05;
      const startY = Math.random() * height * 0.3;
      const angle = Math.PI * 0.72 + (Math.random() - 0.5) * 0.15;
      const speed = 12 + Math.random() * 8;
      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 85 + Math.random() * 60,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.015,
      });
    };

    const spawnStardust = (
      x: number,
      y: number,
      count = 10,
      color = "#ffffff",
      speedMult = 1
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (Math.random() * 4 + 0.5) * speedMult;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          r: Math.random() * 2.8 + 0.8,
          life: 1.0,
          decay: 0.025 + Math.random() * 0.025,
          color,
        });
      }
    };

    const spawnRipple = (
      x: number,
      y: number,
      maxR = 60,
      color = "rgba(255, 255, 255, 0.7)"
    ) => {
      ripples.push({ x, y, r: 10, maxR, alpha: 0.85, color });
    };

    const spawnAscentPlatform = (yPos: number) => {
      const w = Math.max(75, Math.min(120, width * 0.25));
      const x = Math.random() * (width - w - 24) + 12;
      const rand = Math.random();
      const type: Platform["type"] =
        rand < 0.18 ? "boost" : rand < 0.4 ? "moving" : "normal";
      platforms.push({
        x,
        y: yPos,
        w,
        h: 11,
        type,
        vx: type === "moving" ? (Math.random() < 0.5 ? 2.2 : -2.2) : 0,
      });

      if (Math.random() < 0.55) {
        starOrbs.push({
          x: x + w / 2,
          y: yPos - 35,
          r: 9,
          angle: Math.random() * Math.PI * 2,
        });
      }
    };

    const buildConstellationBricks = () => {
      bricks = [];
      const cols = Math.min(8, Math.max(4, Math.floor((width - 40) / 80)));
      const rows = 4;
      const pad = 10;
      const totalW = Math.min(width - 30, cols * 82);
      const brickW = (totalW - (cols - 1) * pad) / cols;
      const brickH = 22;
      const startX = (width - totalW) / 2;
      const startY = 122;

      const colors: BrickStyle[] = [
        { fill: "rgba(147, 197, 253, 0.3)", border: "#93c5fd", glow: "#60a5fa" },
        { fill: "rgba(196, 181, 253, 0.3)", border: "#c4b5fd", glow: "#a78bfa" },
        { fill: "rgba(253, 230, 138, 0.3)", border: "#fde68a", glow: "#fbbf24" },
        { fill: "rgba(167, 243, 208, 0.3)", border: "#a7f3d0", glow: "#34d399" },
      ];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bricks.push({
            x: startX + c * (brickW + pad),
            y: startY + r * (brickH + pad),
            w: brickW,
            h: brickH,
            alive: true,
            row: r,
            style: colors[r % colors.length],
          });
        }
      }
    };

    const initCurrentMode = () => {
      syncScore(0);
      isGameOver = false;
      pointer.x = width / 2;
      pointer.y = height / 2;
      pointer.active = false;

      if (activeMode === "ascent") {
        platforms = [];
        starOrbs = [];
        player.x = width / 2;
        player.y = height * 0.65;
        player.vx = 0;
        player.vy = -12;

        const count = 9;
        const spacing = height / count;
        platforms.push({
          x: width / 2 - 65,
          y: height * 0.78,
          w: 130,
          h: 12,
          type: "normal",
          vx: 0,
        });
        for (let i = 1; i < count; i++) {
          spawnAscentPlatform(height * 0.78 - i * spacing);
        }
      } else if (activeMode === "breaker") {
        paddle.w = Math.min(140, Math.max(90, width * 0.28));
        paddle.x = width / 2 - paddle.w / 2;
        paddle.targetX = paddle.x;
        paddle.y = height - 75;

        player.x = width / 2;
        player.y = paddle.y - player.radius - 12;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        const spd = 7.5;
        player.vx = Math.cos(angle) * spd;
        player.vy = Math.sin(angle) * spd;

        buildConstellationBricks();
      } else {
        player.x = width / 2;
        player.y = height / 2;
        player.vx = (Math.random() - 0.5) * 5;
        player.vy = (Math.random() - 0.5) * 5;

        starOrbs = [];
        for (let i = 0; i < 7; i++) {
          starOrbs.push({
            x: Math.random() * (width - 80) + 40,
            y: Math.random() * (height - 220) + 130,
            r: 10,
            angle: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const triggerGameOver = (title: string, desc: string) => {
      if (isGameOver) return;
      isGameOver = true;
      audioRef.current?.playTwilightEnd();
      setGameOverInfo({
        title,
        desc,
        finalScore: localScore,
        best: bestScoresRef.current[activeMode] || localScore,
      });
    };

    const drawMeditatingLogo = (
      x: number,
      y: number,
      radius: number,
      scaleX = 1,
      scaleY = 1,
      rotation = 0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scaleX, scaleY);

      const pulse = Math.sin(timeTick * 0.07) * 0.15 + 0.85;
      const auraGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 2.0);
      auraGrad.addColorStop(0, `rgba(255, 255, 255, ${0.32 * pulse})`);
      auraGrad.addColorStop(0.5, `rgba(147, 197, 253, ${0.14 * pulse})`);
      auraGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 2.0, 0, Math.PI * 2);
      ctx.fill();

      if (auraRef.current) {
        ctx.beginPath();
        ctx.arc(0, 5 * (radius / 85), radius * 1.3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      const pathScale = radius / 78;
      ctx.scale(pathScale, pathScale);

      ctx.shadowColor = "rgba(220, 240, 255, 0.95)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#FFFFFF";
      ctx.fill(logoPath2D, "evenodd");

      ctx.restore();
    };

    const drawNightEnvironment = () => {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#000105");
      skyGrad.addColorStop(0.5, "#04081c");
      skyGrad.addColorStop(1, "#091132");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < nebulae.length; i++) {
        const n = nebulae[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -n.r) n.x = width + n.r;
        if (n.x > width + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = height + n.r;
        if (n.y > height + n.r) n.y = -n.r;

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = Math.sin(timeTick * s.twinkleSpeed + s.twinklePhase) * 0.4 + 0.6;
        const alpha = s.alpha * twinkle;

        ctx.fillStyle =
          s.hue === 0
            ? `rgba(255, 255, 255, ${alpha})`
            : `hsla(${s.hue}, 85%, 88%, ${alpha})`;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.layer === 3 && twinkle > 0.82) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3.5, s.y);
          ctx.lineTo(s.x + s.r * 3.5, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3.5);
          ctx.lineTo(s.x, s.y + s.r * 3.5);
          ctx.stroke();
        }
      }

      // High-Detail Crescent Moon in Upper Right
      const moonX = width * 0.82;
      const moonY = Math.max(105, Math.min(150, height * 0.17));
      const moonR = Math.min(48, Math.max(32, width * 0.06));

      ctx.save();
      const moonHalo = ctx.createRadialGradient(
        moonX,
        moonY,
        moonR * 0.4,
        moonX,
        moonY,
        moonR * 4.2
      );
      moonHalo.addColorStop(0, "rgba(254, 249, 215, 0.28)");
      moonHalo.addColorStop(0.35, "rgba(147, 197, 253, 0.1)");
      moonHalo.addColorStop(1, "rgba(1, 2, 8, 0)");
      ctx.fillStyle = moonHalo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = "rgba(254, 249, 195, 0.8)";
      ctx.shadowBlur = 30;
      ctx.fillStyle = "#fefce8";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0.2 * Math.PI, 1.3 * Math.PI, false);
      ctx.quadraticCurveTo(
        moonX - moonR * 0.2,
        moonY - moonR * 0.2,
        moonX + Math.cos(0.2 * Math.PI) * moonR,
        moonY + Math.sin(0.2 * Math.PI) * moonR
      );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(215, 210, 175, 0.35)";
      ctx.beginPath();
      ctx.arc(moonX - moonR * 0.3, moonY - moonR * 0.2, moonR * 0.18, 0, Math.PI * 2);
      ctx.arc(moonX - moonR * 0.15, moonY + moonR * 0.35, moonR * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= ss.decay;

        if (ss.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const mag = Math.hypot(ss.vx, ss.vy) || 1;
        const tailX = ss.x - (ss.vx / mag) * ss.len;
        const tailY = ss.y - (ss.vy / mag) * ss.len;
        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    };

    const updateAscent = () => {
      if (keys.left) player.vx -= 0.8;
      else if (keys.right) player.vx += 0.8;
      else if (pointer.active && Math.abs(pointer.x - player.x) > 6) {
        const dx = pointer.x - player.x;
        player.vx += dx * 0.022;
      }

      player.vx *= 0.87;
      player.vy += 0.35;
      player.x += player.vx;
      player.y += player.vy;
      player.rotation = player.vx * 0.025;

      if (player.x < -player.radius) player.x = width + player.radius;
      if (player.x > width + player.radius) player.x = -player.radius;

      const climbThreshold = height * 0.42;
      if (player.y < climbThreshold) {
        const diff = climbThreshold - player.y;
        player.y = climbThreshold;

        for (let i = 0; i < stars.length; i++) {
          stars[i].y += diff * (stars[i].layer * 0.18);
          if (stars[i].y > height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * width;
          }
        }

        for (let i = 0; i < platforms.length; i++) platforms[i].y += diff;
        for (let i = 0; i < starOrbs.length; i++) starOrbs[i].y += diff;

        syncScore(localScore + Math.max(1, Math.floor(diff * 0.25)));
      }

      for (let i = platforms.length - 1; i >= 0; i--) {
        const p = platforms[i];
        if (p.type === "moving") {
          p.x += p.vx;
          if (p.x < 12 || p.x + p.w > width - 12) p.vx *= -1;
        }

        if (
          player.vy > 0 &&
          player.x + player.radius * 0.65 > p.x &&
          player.x - player.radius * 0.65 < p.x + p.w &&
          player.y + player.radius >= p.y &&
          player.y + player.radius <= p.y + p.h + player.vy + 4
        ) {
          const isBoost = p.type === "boost";
          player.vy = isBoost ? -16 : -11.5;
          player.scaleX = 1.3;
          player.scaleY = 0.72;
          spawnStardust(
            player.x,
            p.y,
            isBoost ? 18 : 10,
            isBoost ? "#fde047" : "#ffffff",
            isBoost ? 1.4 : 1
          );
          spawnRipple(player.x, p.y, isBoost ? 85 : 50);
          audioRef.current?.playPlatformBounce(isBoost);
        }

        if (p.y > height + 20) {
          platforms.splice(i, 1);
          const highestY = platforms.length > 0 ? Math.min(...platforms.map(pl => pl.y)) : height * 0.3;
          spawnAscentPlatform(highestY - height / 9);
        }
      }

      for (let i = starOrbs.length - 1; i >= 0; i--) {
        const o = starOrbs[i];
        if (o.y > height + 30) {
          starOrbs.splice(i, 1);
          continue;
        }
        if (Math.hypot(player.x - o.x, player.y - o.y) < player.radius + o.r) {
          syncScore(localScore + 50);
          player.vy = Math.min(player.vy, -12.5);
          spawnStardust(o.x, o.y, 16, "#fef08a", 1.3);
          spawnRipple(o.x, o.y, 70, "rgba(254, 240, 138, 0.8)");
          audioRef.current?.playStarOrb();
          starOrbs.splice(i, 1);
        }
      }

      if (player.y - player.radius > height + 40) {
        triggerGameOver("Ascent Ended", "You drifted below the starlit clouds.");
      }
    };

    const updateBreaker = () => {
      if (keys.left) paddle.targetX -= 10;
      if (keys.right) paddle.targetX += 10;
      paddle.targetX = Math.max(12, Math.min(width - paddle.w - 12, paddle.targetX));
      paddle.x += (paddle.targetX - paddle.x) * 0.28;

      player.x += player.vx;
      player.y += player.vy;
      player.rotation = player.vx * 0.03;

      if (player.x - player.radius < 10) {
        player.x = 10 + player.radius;
        player.vx *= -1;
        player.scaleX = 0.8;
        player.scaleY = 1.2;
        audioRef.current?.playSoftWall(0);
      } else if (player.x + player.radius > width - 10) {
        player.x = width - 10 - player.radius;
        player.vx *= -1;
        player.scaleX = 0.8;
        player.scaleY = 1.2;
        audioRef.current?.playSoftWall(1);
      }

      if (player.y - player.radius < 108) {
        player.y = 108 + player.radius;
        player.vy *= -1;
        player.scaleX = 1.2;
        player.scaleY = 0.8;
        audioRef.current?.playSoftWall(2);
      }

      if (
        player.vy > 0 &&
        player.y + player.radius >= paddle.y &&
        player.y - player.radius <= paddle.y + paddle.h &&
        player.x + player.radius >= paddle.x &&
        player.x - player.radius <= paddle.x + paddle.w
      ) {
        const hitOffset = (player.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const speed = Math.min(12, Math.hypot(player.vx, player.vy) * 1.02);
        const bounceAngle = hitOffset * (Math.PI * 0.38) - Math.PI / 2;

        player.vx = Math.cos(bounceAngle) * speed;
        player.vy = Math.sin(bounceAngle) * speed;
        player.y = paddle.y - player.radius - 1;
        player.scaleX = 1.3;
        player.scaleY = 0.72;

        spawnStardust(player.x, paddle.y, 12, "#93c5fd", 1.1);
        spawnRipple(player.x, paddle.y, 55);
        audioRef.current?.playPaddleBounce();
      }

      let remaining = 0;
      for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.alive) continue;
        remaining++;

        if (
          player.x + player.radius > b.x &&
          player.x - player.radius < b.x + b.w &&
          player.y + player.radius > b.y &&
          player.y - player.radius < b.y + b.h
        ) {
          b.alive = false;
          player.vy *= -1;
          player.scaleX = 1.25;
          player.scaleY = 0.8;
          syncScore(localScore + 25);
          spawnStardust(b.x + b.w / 2, b.y + b.h / 2, 16, b.style.border, 1.3);
          spawnRipple(b.x + b.w / 2, b.y + b.h / 2, 65, b.style.border);
          audioRef.current?.playBrickBreak(b.row);
          break;
        }
      }

      if (remaining === 0) {
        syncScore(localScore + 200);
        buildConstellationBricks();
        audioRef.current?.playConstellationClear();
      }

      if (player.y - player.radius > height + 30) {
        triggerGameOver(
          "Lunar Orbit Lost",
          "The meditating figure drifted past your lunar paddle."
        );
      }
    };

    const updateSandbox = () => {
      if (player.isDragging) {
        player.vx = (pointer.x - player.x) * 0.35;
        player.vy = (pointer.y - player.y) * 0.35;
        player.x = pointer.x;
        player.y = pointer.y;
      } else {
        const moonX = width * 0.82;
        const moonY = Math.max(105, Math.min(150, height * 0.17));
        const dx = moonX - player.x;
        const dy = moonY - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 40 && dist < 450) {
          player.vx += (dx / dist) * 0.05;
          player.vy += (dy / dist) * 0.05;
        }

        player.x += player.vx;
        player.y += player.vy;
        player.vx *= 0.994;
        player.vy *= 0.994;
        player.rotation = player.vx * 0.025;

        const pad = player.radius + 12;
        if (player.x < pad) {
          player.x = pad;
          player.vx *= -0.9;
          player.scaleX = 0.75;
          player.scaleY = 1.25;
          spawnRipple(player.x, player.y, 50);
          audioRef.current?.playSoftWall();
        } else if (player.x > width - pad) {
          player.x = width - pad;
          player.vx *= -0.9;
          player.scaleX = 0.75;
          player.scaleY = 1.25;
          spawnRipple(player.x, player.y, 50);
          audioRef.current?.playSoftWall();
        }

        if (player.y < 108) {
          player.y = 108;
          player.vy *= -0.9;
          player.scaleX = 1.25;
          player.scaleY = 0.75;
          spawnRipple(player.x, player.y, 50);
          audioRef.current?.playSoftWall();
        } else if (player.y > height - pad) {
          player.y = height - pad;
          player.vy *= -0.9;
          player.scaleX = 1.25;
          player.scaleY = 0.75;
          spawnRipple(player.x, player.y, 50);
          audioRef.current?.playSoftWall();
        }
      }

      for (let i = 0; i < starOrbs.length; i++) {
        const o = starOrbs[i];
        o.angle += 0.03;
        if (Math.hypot(player.x - o.x, player.y - o.y) < player.radius + o.r) {
          syncScore(localScore + 20);
          spawnStardust(o.x, o.y, 18, "#fef08a", 1.3);
          spawnRipple(o.x, o.y, 75, "rgba(254, 240, 138, 0.75)");
          audioRef.current?.playStarOrb();
          o.x = Math.random() * (width - 100) + 50;
          o.y = Math.random() * (height - 220) + 130;
        }
      }
    };

    const updatePhysics = () => {
      timeTick++;

      if (Math.random() < 0.01 && shootingStars.length < 2) {
        spawnShootingStar();
      }

      player.scaleX += (1 - player.scaleX) * 0.16;
      player.scaleY += (1 - player.scaleY) * 0.16;

      if (Math.hypot(player.vx, player.vy) > 3.2 && timeTick % 2 === 0) {
        particles.push({
          x: player.x + (Math.random() - 0.5) * 14,
          y: player.y + (Math.random() - 0.5) * 14,
          vx: -player.vx * 0.12,
          vy: -player.vy * 0.12,
          r: Math.random() * 2 + 0.6,
          life: 0.75,
          decay: 0.035,
          color: "#e0f2fe",
        });
      }

      if (isGameOver) return;

      if (activeMode === "ascent") updateAscent();
      else if (activeMode === "breaker") updateBreaker();
      else updateSandbox();
    };

    const renderScene = () => {
      drawNightEnvironment();

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += (rp.maxR - rp.r) * 0.12;
        rp.alpha -= 0.028;
        if (rp.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        if (rp.color.startsWith("rgba")) {
          ctx.strokeStyle = rp.color.replace(/[\d.]+\)$/g, `${rp.alpha})`);
        } else {
          ctx.globalAlpha = rp.alpha;
          ctx.strokeStyle = rp.color;
        }
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      if (activeMode === "ascent") {
        for (let i = 0; i < platforms.length; i++) {
          const p = platforms[i];
          ctx.save();
          const isBoost = p.type === "boost";
          ctx.shadowColor = isBoost ? "#fde047" : "#93c5fd";
          ctx.shadowBlur = 14;
          ctx.fillStyle = isBoost ? "rgba(253, 224, 71, 0.9)" : "rgba(255, 255, 255, 0.85)";
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, p.h, 6);
          ctx.fill();
          ctx.restore();
        }
      }

      if (activeMode === "ascent" || activeMode === "sandbox") {
        for (let i = 0; i < starOrbs.length; i++) {
          const o = starOrbs[i];
          ctx.save();
          const pulse = Math.sin(timeTick * 0.08 + o.angle) * 2.5;
          ctx.shadowColor = "#fef08a";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "#fef9c3";
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.r + pulse * 0.3, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(254, 240, 138, 0.5)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.r + 5 + pulse * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      if (activeMode === "breaker") {
        ctx.save();
        ctx.shadowColor = "#93c5fd";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 8);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(147, 197, 253, 0.12)";
        ctx.lineWidth = 1;
        for (let i = 0; i < bricks.length - 1; i++) {
          if (bricks[i].alive && bricks[i + 1].alive && bricks[i].y === bricks[i + 1].y) {
            ctx.beginPath();
            ctx.moveTo(bricks[i].x + bricks[i].w / 2, bricks[i].y + bricks[i].h / 2);
            ctx.lineTo(bricks[i + 1].x + bricks[i + 1].w / 2, bricks[i + 1].y + bricks[i + 1].h / 2);
            ctx.stroke();
          }
        }
        ctx.restore();

        for (let i = 0; i < bricks.length; i++) {
          const b = bricks[i];
          if (!b.alive) continue;
          ctx.save();
          ctx.fillStyle = b.style.fill;
          ctx.strokeStyle = b.style.border;
          ctx.shadowColor = b.style.glow;
          ctx.shadowBlur = 10;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.w, b.h, 7);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= pt.decay;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawMeditatingLogo(
        player.x,
        player.y,
        player.radius,
        player.scaleX,
        player.scaleY,
        player.rotation
      );
    };

    const handlePointerDown = (x: number, y: number) => {
      audioRef.current?.unlock();
      pointer.down = true;
      pointer.active = true;
      pointer.x = x;
      pointer.y = y;
      paddle.targetX = x - paddle.w / 2;

      if (activeMode === "ascent" && !isGameOver) {
        if (player.vy > -4) {
          player.vy = -9.5;
          player.scaleX = 0.82;
          player.scaleY = 1.2;
          spawnStardust(player.x, player.y + 15, 10, "#bae6fd", 1);
          spawnRipple(player.x, player.y, 48);
          audioRef.current?.playAstralBoost();
        }
      } else if (activeMode === "sandbox") {
        if (Math.hypot(x - player.x, y - player.y) < player.radius * 2.2) {
          player.isDragging = true;
        } else {
          const dx = player.x - x;
          const dy = player.y - y;
          const dist = Math.max(40, Math.hypot(dx, dy));
          const force = Math.min(12, 550 / dist);
          player.vx += (dx / dist) * force;
          player.vy += (dy / dist) * force;
          spawnRipple(x, y, 110, "rgba(147, 197, 253, 0.75)");
          spawnStardust(x, y, 14, "#93c5fd", 1.2);
          audioRef.current?.playGravityWave();
        }
      }
    };

    const handlePointerMove = (x: number, y: number) => {
      pointer.active = true;
      pointer.x = x;
      pointer.y = y;
      if (activeMode === "breaker") {
        paddle.targetX = x - paddle.w / 2;
      }
    };

    const handlePointerUp = () => {
      pointer.down = false;
      player.isDragging = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      handlePointerDown(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    const onTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        if (activeMode === "ascent" && !isGameOver && player.vy > -4) {
          player.vy = -9.5;
          player.scaleX = 0.82;
          player.scaleY = 1.2;
          spawnStardust(player.x, player.y + 15, 10, "#bae6fd", 1);
          spawnRipple(player.x, player.y, 48);
          audioRef.current?.playAstralBoost();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
    };

    const handleResize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      canvas.width = width;
      canvas.height = height;
      createStarfield();
      if (activeMode === "breaker") {
        paddle.y = height - 75;
      }
    };

    createStarfield();
    initCurrentMode();

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", handleResize);

    let rafId = 0;
    const loop = () => {
      updatePhysics();
      renderScene();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, mode, restartToken, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const modeSubtitle =
    mode === "ascent"
      ? "Starlight Ascent"
      : mode === "breaker"
      ? "Lunar Breaker"
      : "Zero-G Flow";

  const controlsHint =
    mode === "ascent"
      ? "Swipe / Drag or Arrows to Steer • Tap or Space for Astral Boost"
      : mode === "breaker"
      ? "Slide Lunar Paddle to Deflect the Meditating Figure"
      : "Drag & Fling Meditating Figure • Tap to Create Gravity Waves";

  const currentBest = bestScores[mode] || 0;

  return createPortal(
    <div
      onPointerDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-[140] bg-[#010208] text-white overflow-hidden select-none touch-none font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Celestial Zen Night Mode Arcade"
    >
      {/* Top Floating Header & Mode Selector */}
      <header className="fixed top-0 left-0 right-0 z-30 pt-[max(env(safe-area-inset-top),12px)] px-3.5 sm:px-4 pointer-events-none flex flex-col items-center gap-2">
        {/* Main Top Bar: Meditating Logo, Title, Scores & Close */}
        <div className="w-full max-w-lg rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 pointer-events-auto bg-[#080d20]/75 backdrop-blur-xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-black/90 border border-white/30 flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.35)] shrink-0">
              <svg viewBox="-100 -100 200 200" className="w-5 h-5 fill-white">
                <path fillRule="evenodd" d={MEDITATING_LOGO_SVG_PATH} />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-white truncate">
                Celestial Zen
              </h2>
              <p className="text-[10px] text-blue-200/75 tracking-widest uppercase truncate">
                {modeSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 border-l border-white/15 pl-3 shrink-0">
            <div className="text-right">
              <span className="block text-[9px] uppercase tracking-widest text-blue-200/60">
                Score
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-white tabular-nums">
                {score}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase tracking-widest text-amber-200/60">
                Best
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-amber-300 tabular-nums">
                {currentBest}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="ml-1 p-1.5 sm:p-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white/90 transition cursor-pointer"
              title="Exit Celestial Zen (ESC)"
              aria-label="Close Celestial Zen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Docked Bar: 3 Mode Tabs & Aura/Audio Toggles */}
        <div className="w-full max-w-lg rounded-2xl p-1.5 flex items-center justify-between gap-1 pointer-events-auto bg-[#080d20]/75 backdrop-blur-xl border border-white/15 shadow-xl">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {(
              [
                { id: "ascent", label: "1. Ascent" },
                { id: "breaker", label: "2. Breaker" },
                { id: "sandbox", label: "3. Zero-G" },
              ] as { id: CelestialMode; label: string }[]
            ).map(tab => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSwitchMode(tab.id)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-xl whitespace-nowrap flex-1 transition-all cursor-pointer ${
                    active
                      ? "bg-white text-slate-950 font-bold shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 border-l border-white/15 pl-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleAura}
              title="Toggle Aura Ring"
              className={`p-2 rounded-xl transition cursor-pointer ${
                showAuraCircle ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/85"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleToggleAudio}
              title={soundEnabled ? "Mute Night Chimes" : "Unmute Night Chimes"}
              className="p-2 rounded-xl hover:bg-white/10 text-white/90 transition cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-200" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Controls Helper Pill */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 pb-[max(env(safe-area-inset-bottom),12px)] pointer-events-none flex justify-center px-4">
        <div className="rounded-full px-4 py-1.5 text-[11px] text-blue-100/85 text-center bg-[#080d20]/75 backdrop-blur-xl border border-white/15 shadow-lg">
          {controlsHint}
        </div>
      </footer>

      {/* Game Over Modal Overlay */}
      {gameOverInfo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full text-center bg-[#080d20]/88 border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.18)]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              <svg viewBox="-100 -100 200 200" className="w-11 h-11 fill-white">
                <path fillRule="evenodd" d={MEDITATING_LOGO_SVG_PATH} />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1 text-white">
              {gameOverInfo.title}
            </h3>
            <p className="text-xs sm:text-sm text-blue-200/80 mb-5">{gameOverInfo.desc}</p>
            <div className="bg-white/5 rounded-2xl p-3 mb-6 border border-white/10 flex justify-around">
              <div>
                <span className="text-[10px] uppercase text-blue-200/60 block">Score</span>
                <span className="font-mono text-2xl font-bold text-white tabular-nums">
                  {gameOverInfo.finalScore}
                </span>
              </div>
              <div className="border-l border-white/10" />
              <div>
                <span className="text-[10px] uppercase text-amber-200/60 block">Best</span>
                <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
                  {gameOverInfo.best}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:bg-blue-50 active:scale-[0.98] transition cursor-pointer"
              >
                Ascend Again
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-white/85 hover:bg-white/15 font-bold text-xs sm:text-sm uppercase tracking-wider active:scale-[0.98] transition cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Fullscreen Night-Sky Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>,
    document.body
  );
};
