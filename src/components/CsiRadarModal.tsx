import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  X,
  Activity,
  Volume2,
  VolumeX,
  ExternalLink,
  Target,
  Waves,
  Zap,
  Info
} from "lucide-react";
import { sound } from "@/lib/sound";

interface CsiRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TargetBlip {
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
  intensity: number;
  decay: number;
  timestamp: number;
}

export const CsiRadarModal = ({ isOpen, onClose }: CsiRadarModalProps) => {
  const [band, setBand] = useState<"2.4G" | "5.0G">("5.0G");
  const [sonarAudio, setSonarAudio] = useState<boolean>(true);
  const [dopplerShift, setDopplerShift] = useState<number>(0.3);
  const [motionState, setMotionState] = useState<string>("AMBIENT FIELD");
  const [targetDist, setTargetDist] = useState<number>(1.8);
  const [respirationBpm, setRespirationBpm] = useState<number>(16);

  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ofdmCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const sweepAngleRef = useRef<number>(0);
  const activeBlipsRef = useRef<TargetBlip[]>([]);
  const lastInteractionRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const ofdmAmplitudesRef = useRef<number[]>(new Array(64).fill(25));
  const lastPingAngleRef = useRef<number>(0);

  // Initialize OFDM baselines
  useEffect(() => {
    ofdmAmplitudesRef.current = Array.from({ length: 64 }, (_, i) => {
      // Null DC subcarrier around index 32
      if (i === 32) return 5;
      // Pilot subcarriers
      if ([7, 21, 43, 57].includes(i)) return 38;
      return 22 + Math.sin(i * 0.4) * 10 + Math.random() * 6;
    });
  }, []);

  // Handle interaction (touch or mouse) on the radar display
  const handleInteraction = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((clientY - rect.top) / rect.height) * 2 - 1;
    const distFromCenter = Math.sqrt(x * x + y * y);

    if (distFromCenter <= 0.98) {
      mousePosRef.current = { x, y };
      lastInteractionRef.current = performance.now();

      // Add or update target blip
      activeBlipsRef.current.push({
        x,
        y,
        intensity: 1.0,
        decay: 0.015,
        timestamp: performance.now()
      });

      // Keep blip list bounded
      if (activeBlipsRef.current.length > 8) {
        activeBlipsRef.current.shift();
      }

      // Update telemetry readings
      const speedMagnitude = Math.min(8.8, 1.2 + Math.random() * 4.5);
      setDopplerShift(parseFloat(speedMagnitude.toFixed(2)));
      setTargetDist(parseFloat((distFromCenter * 3.5).toFixed(1)));
      setMotionState(speedMagnitude > 3.5 ? "TARGET CROSSING" : "SUBTLE HUMAN DISPLACEMENT");
      setRespirationBpm(Math.round(15 + Math.random() * 4));
      sound.haptic(15);
    }
  };

  // Canvas render loop
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;

    const render = () => {
      const now = performance.now();

      // Decay Doppler back to idle if no interaction in last 1.8s
      if (now - lastInteractionRef.current > 1800) {
        setDopplerShift(prev => {
          const idleVal = 0.2 + Math.sin(now * 0.003) * 0.15;
          return parseFloat(idleVal.toFixed(2));
        });
        setMotionState("AMBIENT / RESPIRATION MONITOR");
      }

      // ================= RADAR CANVAS =================
      const radarCanvas = radarCanvasRef.current;
      if (radarCanvas) {
        const ctx = radarCanvas.getContext("2d");
        if (ctx) {
          const w = radarCanvas.width;
          const h = radarCanvas.height;
          const cx = w / 2;
          const cy = h / 2;
          const r = Math.min(cx, cy) - 8;

          // CRT phosphor decay trail: soft clear
          ctx.fillStyle = "rgba(4, 9, 8, 0.22)";
          ctx.fillRect(0, 0, w, h);

          // Polar concentric range rings
          ctx.lineWidth = 1;
          for (let ring = 1; ring <= 4; ring++) {
            const ringR = (r / 4) * ring;
            ctx.strokeStyle = ring === 4 ? "rgba(0, 255, 102, 0.45)" : "rgba(0, 255, 102, 0.18)";
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();

            // Distance label
            ctx.fillStyle = "rgba(0, 255, 102, 0.5)";
            ctx.font = "9px monospace";
            ctx.fillText(`${(ring * 0.8).toFixed(1)}m`, cx + 4, cy - ringR + 10);
          }

          // Crosshairs & degree marks
          ctx.strokeStyle = "rgba(0, 255, 102, 0.2)";
          ctx.beginPath();
          ctx.moveTo(cx - r, cy);
          ctx.lineTo(cx + r, cy);
          ctx.moveTo(cx, cy - r);
          ctx.lineTo(cx, cy + r);
          ctx.stroke();

          // Azimuth angles
          ctx.fillStyle = "rgba(0, 255, 102, 0.4)";
          ctx.font = "8px monospace";
          ctx.fillText("000°", cx - 10, cy - r + 14);
          ctx.fillText("090°", cx + r - 24, cy - 4);
          ctx.fillText("180°", cx - 10, cy + r - 6);
          ctx.fillText("270°", cx - r + 6, cy - 4);

          // Sweep rotation
          sweepAngleRef.current = (sweepAngleRef.current + (band === "5.0G" ? 0.038 : 0.028)) % (Math.PI * 2);
          const angle = sweepAngleRef.current;

          // Draw radar sweep line
          const sweepX = cx + Math.cos(angle) * r;
          const sweepY = cy + Math.sin(angle) * r;

          const sweepGrad = ctx.createLinearGradient(cx, cy, sweepX, sweepY);
          sweepGrad.addColorStop(0, "rgba(0, 255, 102, 0.8)");
          sweepGrad.addColorStop(1, "rgba(0, 255, 102, 0.0)");

          ctx.strokeStyle = sweepGrad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sweepX, sweepY);
          ctx.stroke();

          // Sector glow cone behind sweep (No shadowBlur for zero lag)
          ctx.fillStyle = "rgba(0, 255, 102, 0.06)";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, angle - 0.35, angle);
          ctx.closePath();
          ctx.fill();

          // Check if sweep passed a blip for audio sonar ping
          let hitBlip = false;

          // Render active target blips
          for (let i = activeBlipsRef.current.length - 1; i >= 0; i--) {
            const blip = activeBlipsRef.current[i];
            const bx = cx + blip.x * r;
            const by = cy + blip.y * r;

            // Compute angle of blip from center
            let blipAngle = Math.atan2(blip.y, blip.x);
            if (blipAngle < 0) blipAngle += Math.PI * 2;

            const angleDiff = Math.abs(angle - blipAngle);
            if (angleDiff < 0.06 && !hitBlip) {
              hitBlip = true;
            }

            // Blip glowing core
            ctx.fillStyle = `rgba(0, 255, 150, ${blip.intensity.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(bx, by, 4 + (1 - blip.intensity) * 6, 0, Math.PI * 2);
            ctx.fill();

            // Expanding ripple ring
            ctx.strokeStyle = `rgba(0, 255, 150, ${(blip.intensity * 0.7).toFixed(2)})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(bx, by, (1 - blip.intensity) * 22 + 4, 0, Math.PI * 2);
            ctx.stroke();

            // Coordinate tag
            ctx.fillStyle = `rgba(0, 255, 150, ${(blip.intensity * 0.8).toFixed(2)})`;
            ctx.font = "8px monospace";
            ctx.fillText(
              `TARGET [${(blip.x * 3.5).toFixed(1)}m, ${(blip.y * 3.5).toFixed(1)}m]`,
              bx + 8,
              by - 6
            );

            // Decay blip
            blip.intensity -= blip.decay;
            if (blip.intensity <= 0) {
              activeBlipsRef.current.splice(i, 1);
            }
          }

          // Trigger Sonar Ping when sweep hits a blip
          if (hitBlip && sonarAudio && now - lastPingAngleRef.current > 400) {
            sound.playRadarPing();
            lastPingAngleRef.current = now;
          }
        }
      }

      // ================= 64 OFDM SUBCARRIER BARS =================
      const ofdmCanvas = ofdmCanvasRef.current;
      if (ofdmCanvas) {
        const oCtx = ofdmCanvas.getContext("2d");
        if (oCtx) {
          const ow = ofdmCanvas.width;
          const oh = ofdmCanvas.height;

          oCtx.fillStyle = "rgba(3, 7, 6, 0.4)";
          oCtx.fillRect(0, 0, ow, oh);

          const barCount = 64;
          const barWidth = Math.max(2, (ow / barCount) - 1.5);
          const amplitudes = ofdmAmplitudesRef.current;

          // Modulate amplitudes with Doppler ripple if active
          const isDisturbed = now - lastInteractionRef.current < 1800;

          for (let i = 0; i < barCount; i++) {
            // Null DC carrier at center
            if (i === 32) {
              amplitudes[i] = 4;
            } else {
              const baseTarget = 24 + Math.sin(i * 0.35 + now * 0.002) * 8;
              let disturbance = 0;

              if (isDisturbed) {
                // Wave distortion traveling along subcarriers
                disturbance = Math.sin((i - 32) * 0.4 - now * 0.015) * 22;
              }

              // Smooth lerp
              amplitudes[i] += ((baseTarget + disturbance) - amplitudes[i]) * 0.12;
            }

            const barH = Math.max(3, Math.min(oh - 8, amplitudes[i] * (oh / 65)));
            const bx = i * (barWidth + 1.5);
            const by = oh - barH;

            // Pilot carriers highlighted in cyan, data in emerald green
            const isPilot = [7, 21, 43, 57].includes(i);
            const isDC = i === 32;

            if (isDC) {
              oCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
            } else if (isPilot) {
              oCtx.fillStyle = "#00e5ff";
            } else if (isDisturbed) {
              oCtx.fillStyle = "#00ff66";
            } else {
              oCtx.fillStyle = "rgba(0, 255, 102, 0.65)";
            }

            oCtx.fillRect(bx, by, barWidth, barH);
          }

          // Center 0 Hz axis line
          oCtx.strokeStyle = "rgba(0, 255, 102, 0.25)";
          oCtx.lineWidth = 1;
          oCtx.beginPath();
          oCtx.moveTo(0, oh - 1);
          oCtx.lineTo(ow, oh - 1);
          oCtx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, band, sonarAudio]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10005] bg-background/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 font-mono select-none"
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            className="w-full max-w-4xl bg-[#040807] border-2 border-emerald-500/60 rounded-2xl shadow-[0_0_90px_rgba(0,255,102,0.25)] flex flex-col overflow-hidden max-h-[94vh]"
          >
            {/* Top Bar / HUD Banner */}
            <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
                <div className="flex flex-col">
                  <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-emerald-400 flex items-center gap-2">
                    CSI_RADAR // WI-FI DOPPLER SENSOR v1.4
                    <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300">
                      LIVE RF
                    </span>
                  </span>
                  <span className="text-[10px] text-emerald-400/60 hidden sm:inline">
                    Passive 802.11n/ac Channel State Information (OFDM Phase Profiler)
                  </span>
                </div>
              </div>

              {/* Controls & Close */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Audio toggle */}
                <button
                  onClick={() => {
                    setSonarAudio(a => !a);
                    sound.haptic(20);
                  }}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    sonarAudio
                      ? "border-emerald-500/60 text-emerald-400 bg-emerald-500/15"
                      : "border-emerald-500/20 text-emerald-400/40 bg-transparent"
                  }`}
                  title="Toggle Sonar Audio Ping"
                >
                  {sonarAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="text-[10px] hidden sm:inline">{sonarAudio ? "PING ON" : "MUTED"}</span>
                </button>

                {/* Band Switch */}
                <div className="flex rounded-lg border border-emerald-500/30 p-0.5 bg-black/40 text-[10px]">
                  <button
                    onClick={() => {
                      setBand("2.4G");
                      sound.playClick();
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      band === "2.4G" ? "bg-emerald-500 text-black" : "text-emerald-400/70 hover:text-emerald-300"
                    }`}
                  >
                    2.4 GHz
                  </button>
                  <button
                    onClick={() => {
                      setBand("5.0G");
                      sound.playClick();
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      band === "5.0G" ? "bg-emerald-500 text-black" : "text-emerald-400/70 hover:text-emerald-300"
                    }`}
                  >
                    5.0 GHz
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="p-1 hover:text-red-400 text-emerald-400/60 transition-colors ml-1"
                  title="Close Radar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Radar Area */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto custom-scrollbar">
              {/* Radar Screen (7 cols) */}
              <div className="md:col-span-7 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-full border-2 border-emerald-500/50 p-1 bg-black/80 shadow-[inset_0_0_40px_rgba(0,255,102,0.2)]">
                  <canvas
                    ref={radarCanvasRef}
                    width={380}
                    height={380}
                    className="w-full h-full rounded-full cursor-crosshair touch-none"
                    onMouseMove={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleInteraction(e.clientX, e.clientY, rect);
                    }}
                    onTouchMove={e => {
                      if (e.touches.length > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        handleInteraction(e.touches[0].clientX, e.touches[0].clientY, rect);
                      }
                    }}
                    onTouchStart={e => {
                      if (e.touches.length > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        handleInteraction(e.touches[0].clientX, e.touches[0].clientY, rect);
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[9px] text-emerald-400/70 bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
                    Touch / Move mouse inside radar to inject Doppler shift
                  </div>
                </div>
              </div>

              {/* Telemetry & Subcarrier HUD (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                {/* Real-time Telemetry Card */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 uppercase">
                      <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Doppler Telemetry
                    </span>
                    <span className="text-[10px] text-emerald-400/60">SNR: 33.8 dB</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/50 border border-emerald-500/20 p-2 rounded-lg">
                      <span className="text-[10px] text-emerald-400/60 block">Phase Shift (Δf)</span>
                      <span className="text-lg font-black text-emerald-300">
                        {dopplerShift > 0 ? `+${dopplerShift}` : dopplerShift} Hz
                      </span>
                    </div>

                    <div className="bg-black/50 border border-emerald-500/20 p-2 rounded-lg">
                      <span className="text-[10px] text-emerald-400/60 block">Target Distance</span>
                      <span className="text-lg font-black text-emerald-300">{targetDist} m</span>
                    </div>

                    <div className="bg-black/50 border border-emerald-500/20 p-2 rounded-lg">
                      <span className="text-[10px] text-emerald-400/60 block">Est. Respiration</span>
                      <span className="text-base font-black text-emerald-300">{respirationBpm} BPM</span>
                    </div>

                    <div className="bg-black/50 border border-emerald-500/20 p-2 rounded-lg">
                      <span className="text-[10px] text-emerald-400/60 block">Carrier Band</span>
                      <span className="text-base font-black text-emerald-300">{band} (OFDMA)</span>
                    </div>
                  </div>

                  {/* Motion Status */}
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                    <span className="text-[10px] text-emerald-400/70 block">STATE CLASSIFICATION</span>
                    <span className="text-xs font-bold text-emerald-300 tracking-wider">
                      {motionState}
                    </span>
                  </div>
                </div>

                {/* 64 OFDM Subcarriers Spectrum Graph */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 uppercase">
                      <Waves className="w-3.5 h-3.5 text-emerald-400" /> 64 OFDM Subcarriers Amplitude
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">Cyan = Pilot</span>
                  </div>

                  <div className="w-full h-24 bg-black/80 rounded-lg border border-emerald-500/20 p-1 overflow-hidden">
                    <canvas
                      ref={ofdmCanvasRef}
                      width={320}
                      height={88}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex justify-between text-[9px] text-emerald-400/50">
                    <span>Subcarrier -28</span>
                    <span>DC Carrier (0 Hz)</span>
                    <span>Subcarrier +28</span>
                  </div>
                </div>

                {/* Hardware & Theory Footnote */}
                <div className="bg-black/40 border border-emerald-500/15 p-2.5 rounded-xl text-[11px] text-emerald-400/80 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    Trained on real 802.11 CSI phase variations across 64 subcarriers to infer room motion through solid walls without cameras.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer with Direct Source Link */}
            <div className="bg-emerald-950/30 border-t border-emerald-500/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-emerald-400/70 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sensor Feed: <code>wlan0mon (Atheros AR9271 / Intel 5300)</code>
              </span>

              <a
                href="https://github.com/ZaneGoat/csi_project"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
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
