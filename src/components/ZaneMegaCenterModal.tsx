import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Flame,
  Volume2,
  VolumeX,
  ExternalLink,
  X,
  RotateCcw,
  Sliders,
  Wind,
  Info
} from "lucide-react";
import { sound } from "@/lib/sound";

interface ZaneMegaCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CurvePoint {
  temp: number; // 30 to 95 °C
  speed: number; // 0 to 100 %
}

const DEFAULT_POINTS: CurvePoint[] = [
  { temp: 35, speed: 25 },
  { temp: 48, speed: 45 },
  { temp: 60, speed: 65 },
  { temp: 72, speed: 82 },
  { temp: 85, speed: 95 },
  { temp: 95, speed: 100 }
];

export const ZaneMegaCenterModal = ({ isOpen, onClose }: ZaneMegaCenterModalProps) => {
  const [points, setPoints] = useState<CurvePoint[]>(DEFAULT_POINTS);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  // Simulated Hardware State
  const [cpuTemp, setCpuTemp] = useState<number>(52);
  const [gpuTemp, setGpuTemp] = useState<number>(46);
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [isCoolerBoost, setIsCoolerBoost] = useState<boolean>(false);
  const [turbineAudio, setTurbineAudio] = useState<boolean>(false);

  // Web Audio Nodes for Turbine Synth
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const oscGainRef = useRef<GainNode | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);

  // Calculate fan speed % from curve for a given temp
  const getFanSpeedForTemp = (temp: number) => {
    if (isCoolerBoost) return 100;
    if (temp <= points[0].temp) return points[0].speed;
    if (temp >= points[points.length - 1].temp) return points[points.length - 1].speed;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (temp >= p1.temp && temp <= p2.temp) {
        const ratio = (temp - p1.temp) / (p2.temp - p1.temp);
        return Math.round(p1.speed + ratio * (p2.speed - p1.speed));
      }
    }
    return 50;
  };

  const cpuFanPercent = getFanSpeedForTemp(cpuTemp);
  const gpuFanPercent = getFanSpeedForTemp(gpuTemp);

  const cpuRPM = Math.round((cpuFanPercent / 100) * 5800);
  const gpuRPM = Math.round((gpuFanPercent / 100) * 5500);

  // Thermal physics loop (stress test & cooling)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCpuTemp(prev => {
        let target = isStressTesting ? 84 : 48;
        if (isCoolerBoost) target = Math.max(38, target - 16);
        const delta = (target - prev) * 0.08 + (Math.random() - 0.5) * 0.6;
        return parseFloat((prev + delta).toFixed(1));
      });

      setGpuTemp(prev => {
        let target = isStressTesting ? 78 : 44;
        if (isCoolerBoost) target = Math.max(36, target - 14);
        const delta = (target - prev) * 0.07 + (Math.random() - 0.5) * 0.5;
        return parseFloat((prev + delta).toFixed(1));
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, isStressTesting, isCoolerBoost]);

  // Turbine Web Audio Synthesizer Loop
  useEffect(() => {
    if (!isOpen || !turbineAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 1. Brownian-smoothed noise generator for deep pressurized thruster airflow
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.06 * white) / 1.06;
        output[i] = Math.max(-1, Math.min(1, last * 3.2));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Deep lowpass filter modeling heavy hull enclosure
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(190, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);
      noiseGainRef.current = noiseGain;

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start();

      // 2. Heavy sub-bass reactor/turbine rumble oscillator through warm lowpass
      const osc = ctx.createOscillator();
      const oscFilter = ctx.createBiquadFilter();
      const oscGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(48, ctx.currentTime);
      oscFilter.type = "lowpass";
      oscFilter.frequency.setValueAtTime(180, ctx.currentTime);
      oscFilter.Q.setValueAtTime(3.0, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(oscFilter);
      oscFilter.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();

      oscNodeRef.current = osc;
      oscGainRef.current = oscGain;
    } catch { /* ignore */ }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isOpen, turbineAudio]);

  // Dynamically update audio parameters based on RPM
  useEffect(() => {
    if (!turbineAudio || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const avgRPM = (cpuRPM + gpuRPM) / 2;
      const rpmRatio = Math.max(0.1, avgRPM / 5800);

      if (oscNodeRef.current && oscGainRef.current && noiseGainRef.current) {
        oscNodeRef.current.frequency.setTargetAtTime(42 + rpmRatio * 56, ctx.currentTime, 0.1);
        oscGainRef.current.gain.setTargetAtTime(0.06 + rpmRatio * 0.12, ctx.currentTime, 0.1);
        noiseGainRef.current.gain.setTargetAtTime(0.05 + rpmRatio * 0.14, ctx.currentTime, 0.1);
      }
    } catch { /* ignore */ }
  }, [cpuRPM, gpuRPM, turbineAudio]);

  // Handle Dragging Fan Curve Points
  const handleSvgMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (draggingIdx === null) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();

    let clientY = 0;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientX !== undefined ? e.clientY : 0;
    }

    const y = clientY - rect.top;
    // Map Y: height 160 -> speed 0% at bottom (y=140), 100% at top (y=20)
    const normalizedSpeed = Math.round(100 - ((y - 20) / 120) * 100);
    const clampedSpeed = Math.max(10, Math.min(100, normalizedSpeed));

    setPoints(prev => {
      const next = [...prev];
      next[draggingIdx] = { ...next[draggingIdx], speed: clampedSpeed };
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10007] bg-background/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 font-mono select-none"
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            className="w-full max-w-4xl bg-[#060912] border-2 border-primary/60 rounded-2xl shadow-[0_0_90px_hsl(var(--primary)/0.25)] flex flex-col overflow-hidden max-h-[94vh]"
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-primary">
                <Wind className="w-5 h-5 text-primary animate-pulse" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2">
                    ZANE_MEGA_CENTER // LIVE EC TELEMETRY
                    <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] bg-primary/20 border border-primary/40 rounded text-primary">
                      MSI GF65 (MS-16W1)
                    </span>
                  </h3>
                  <p className="text-[10px] text-primary/60 hidden sm:inline">
                    Direct Embedded Controller register I/O governor & fan curve profiler
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setTurbineAudio(a => !a);
                    sound.haptic(20);
                  }}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    turbineAudio
                      ? "border-primary/60 text-primary bg-primary/15"
                      : "border-primary/20 text-primary/40 bg-transparent"
                  }`}
                  title="Toggle Turbine Audio Synthesizer"
                >
                  {turbineAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="text-[10px] hidden sm:inline">{turbineAudio ? "TURBINE ON" : "MUTED"}</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1 hover:text-red-400 text-primary/60 transition-colors"
                  title="Close Station"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Dual Tachometers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CPU Gauge */}
                <div className="bg-black/60 border border-primary/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase">
                      <Cpu className="w-4 h-4 text-primary" /> CPU Fan 1
                    </div>
                    <div className="text-3xl font-black text-primary font-mono tracking-tight">
                      {cpuRPM} <span className="text-xs font-normal text-primary/60">RPM</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Temp: <span className="text-foreground font-bold">{cpuTemp}°C</span> · Duty: <span className="text-primary font-bold">{cpuFanPercent}%</span>
                    </div>
                  </div>

                  {/* Circular Arc Graphic */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-primary/15"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary transition-all duration-300"
                        strokeDasharray={`${cpuFanPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-primary">{cpuFanPercent}%</span>
                  </div>
                </div>

                {/* GPU Gauge */}
                <div className="bg-black/60 border border-primary/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase">
                      <Flame className="w-4 h-4 text-primary" /> GPU Fan 2
                    </div>
                    <div className="text-3xl font-black text-primary font-mono tracking-tight">
                      {gpuRPM} <span className="text-xs font-normal text-primary/60">RPM</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Temp: <span className="text-foreground font-bold">{gpuTemp}°C</span> · Duty: <span className="text-primary font-bold">{gpuFanPercent}%</span>
                    </div>
                  </div>

                  {/* Circular Arc Graphic */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-primary/15"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary transition-all duration-300"
                        strokeDasharray={`${gpuFanPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-primary">{gpuFanPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Cooler Boost & Thermal Stress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsCoolerBoost(c => !c);
                    sound.playBoot();
                    sound.haptic([40, 20, 60]);
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isCoolerBoost
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                      : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  COOLER BOOST (MAX 6000 RPM) : {isCoolerBoost ? "ACTIVE" : "OFF"}
                </button>

                <button
                  onClick={() => {
                    setIsStressTesting(s => !s);
                    sound.playClick();
                    sound.haptic(30);
                  }}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isStressTesting
                      ? "bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  THERMAL STRESS TEST (+30°C) : {isStressTesting ? "RUNNING" : "OFF"}
                </button>
              </div>

              {/* Interactive SVG Fan Curve Editor */}
              <div className="bg-black/60 border border-primary/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-primary/15 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
                    <Sliders className="w-4 h-4" /> Interactive EC Curve Matrix
                  </div>
                  <button
                    onClick={() => {
                      setPoints(DEFAULT_POINTS);
                      sound.playClick();
                    }}
                    className="text-[11px] text-primary/70 hover:text-primary flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Curve
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Drag any of the 6 control nodes vertically to recalibrate the fan duty response curve.
                </p>

                {/* SVG Curve Plotter */}
                <div className="relative w-full h-44 bg-black/90 border border-primary/20 rounded-lg overflow-hidden p-2 touch-none">
                  <svg
                    className="w-full h-full cursor-crosshair"
                    viewBox="0 0 600 160"
                    onMouseMove={handleSvgMove}
                    onTouchMove={handleSvgMove}
                    onMouseUp={() => setDraggingIdx(null)}
                    onTouchEnd={() => setDraggingIdx(null)}
                  >
                    {/* Grid horizontal lines */}
                    {[20, 50, 80, 110, 140].map(y => (
                      <line
                        key={y}
                        x1="30"
                        y1={y}
                        x2="580"
                        y2={y}
                        stroke="rgba(0, 255, 102, 0.12)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Polyline curve connecting points */}
                    <path
                      d={points
                        .map((p, idx) => {
                          const x = 50 + ((p.temp - 30) / 70) * 520;
                          const y = 140 - (p.speed / 100) * 120;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2.5"
                    />

                    {/* Area under curve */}
                    <path
                      d={
                        points
                          .map((p, idx) => {
                            const x = 50 + ((p.temp - 30) / 70) * 520;
                            const y = 140 - (p.speed / 100) * 120;
                            return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ") + " L 570 140 L 50 140 Z"
                      }
                      fill="hsl(var(--primary)/0.08)"
                    />

                    {/* Current operating temperature vertical line indicator */}
                    <line
                      x1={50 + ((cpuTemp - 30) / 70) * 520}
                      y1="10"
                      x2={50 + ((cpuTemp - 30) / 70) * 520}
                      y2="145"
                      stroke="#ff007f"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />

                    {/* Draggable Point Nodes */}
                    {points.map((p, idx) => {
                      const x = 50 + ((p.temp - 30) / 70) * 520;
                      const y = 140 - (p.speed / 100) * 120;
                      const isDragging = draggingIdx === idx;

                      return (
                        <g key={idx} className="cursor-ns-resize">
                          <circle
                            cx={x}
                            cy={y}
                            r={isDragging ? 9 : 6}
                            fill={isDragging ? "#ffffff" : "hsl(var(--primary))"}
                            stroke="#000000"
                            strokeWidth="2"
                            onMouseDown={() => {
                              setDraggingIdx(idx);
                              sound.playClick();
                            }}
                            onTouchStart={() => {
                              setDraggingIdx(idx);
                              sound.playClick();
                            }}
                          />
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fill="hsl(var(--primary))"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {p.speed}%
                          </text>
                          <text
                            x={x}
                            y={154}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.4)"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {p.temp}°C
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* EC Hardware Registers Dump */}
              <div className="bg-black/40 border border-primary/20 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] text-primary/70 block uppercase font-bold tracking-wider">
                  EC REGISTER DUMP [PORTS 0x68 &amp; 0x6C]:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-primary/5 border border-primary/20">
                    <span className="text-primary/60 block text-[10px]">ADDR 0x68 (CPU_TEMP)</span>
                    <span className="font-bold text-primary">0x{Math.round(cpuTemp).toString(16).toUpperCase()} ({Math.round(cpuTemp)}°C)</span>
                  </div>
                  <div className="p-2 rounded bg-primary/5 border border-primary/20">
                    <span className="text-primary/60 block text-[10px]">ADDR 0x6C (CPU_FAN)</span>
                    <span className="font-bold text-primary">0x{Math.round(cpuFanPercent).toString(16).toUpperCase()} ({cpuFanPercent}%)</span>
                  </div>
                  <div className="p-2 rounded bg-primary/5 border border-primary/20">
                    <span className="text-primary/60 block text-[10px]">ADDR 0x71 (GPU_TEMP)</span>
                    <span className="font-bold text-primary">0x{Math.round(gpuTemp).toString(16).toUpperCase()} ({Math.round(gpuTemp)}°C)</span>
                  </div>
                  <div className="p-2 rounded bg-primary/5 border border-primary/20">
                    <span className="text-primary/60 block text-[10px]">ADDR 0x8A (BOOST_REG)</span>
                    <span className="font-bold text-primary">0x{isCoolerBoost ? "01" : "00"}</span>
                  </div>
                </div>
              </div>

              {/* Hardware Disclaimer */}
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-xl text-[11px] text-primary/80 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  In-browser telemetry simulator. Live kernel control on physical hardware is powered by Zane's Python daemon interacting with Linux <code>/dev/ec_sys</code>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-primary/10 border-t border-primary/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-primary/70 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Daemon status: <code>ISW Governor Active (MSI MS-16W1)</code>
              </span>

              <a
                href="https://github.com/ZaneGoat/ZaneMegaCenter"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
              >
                <span>OPEN GITHUB REPO</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
