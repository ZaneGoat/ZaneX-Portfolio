import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Monitor, ShieldCheck, AlertTriangle, Cpu, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { usePersona } from "@/context/PersonaContext";
import { sound } from "@/lib/sound";

interface DeviceQuestionProps {
  className?: string;
}

export const DeviceQuestion: React.FC<DeviceQuestionProps> = ({ className = "" }) => {
  const { persona, telemetry, deviceChoice, setDeviceChoice, spoofActive, isHonest } = usePersona();
  const [showRawDetails, setShowRawDetails] = useState(false);

  const realLabel = telemetry.deviceCategory === "desktop" ? "Desktop Rig" : telemetry.deviceCategory === "tablet" ? "Tablet" : "Phone";

  const getPersonaHumor = () => {
    if (deviceChoice === "auto") {
      switch (persona) {
        case "friend":
          return `(Wait... why am I even asking? Zane already knows you're on a ${telemetry.os} ${realLabel} at ${telemetry.screenWidth}×${telemetry.screenHeight} with ${telemetry.pointerType} input. Bro's telemetry never sleeps 💀)`;
        case "operator":
        default:
          return `[SIGINT INTERCEPT] Hardware fingerprint intercepted: ${telemetry.os} ${realLabel} (${telemetry.screenWidth}×${telemetry.screenHeight} DPR:${telemetry.dpr}). Spoofing attempts will be logged.`;
      }
    }

    if (spoofActive) {
      switch (persona) {
        case "friend":
          return `Caught in 4K! 💀 You clicked "${deviceChoice.toUpperCase()}", but Zane's telemetry literally caught your real ${telemetry.os} ${realLabel} with ${telemetry.pointerType} input! Cyberdeck emulation forced anyway!`;
        case "operator":
        default:
          return `🚨 SPOOFING DETECTED // Client declared [${deviceChoice.toUpperCase()}], but raw OSI telemetry confirms [${telemetry.os.toUpperCase()} ${realLabel.toUpperCase()}]. Counter-emulation engaged.`;
      }
    }

    // Honest match
    switch (persona) {
      case "friend":
        return `Bro told the truth! 🤝 Telemetry verified: real ${telemetry.os} ${realLabel}. (I already knew 42ms ago, but thanks for keeping it 100% real!)`;
      case "operator":
      default:
        return `[CLEARANCE APPROVED] Client identity matches physical SIGINT telemetry: ${telemetry.os} ${realLabel} verified. Zero spoofing delta.`;
    }
  };

  return (
    <div
      className={`w-full max-w-xl p-3 sm:p-4 rounded-2xl bg-black/70 border border-primary/25 shadow-[0_0_25px_hsl(var(--primary)/0.1)] backdrop-blur-xl font-mono text-xs ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-primary/15 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="font-bold tracking-wider text-[11px] text-primary uppercase">
            HARDWARE RECON // PHONE OR DESKTOP?
          </span>
        </div>
        <div className="flex items-center gap-2">
          {deviceChoice !== "auto" && (
            <button
              onClick={() => {
                sound.playClick();
                setDeviceChoice("auto");
              }}
              className="text-[10px] text-primary/60 hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset to Auto Telemetry"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Auto</span>
            </button>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary/80">
            {telemetry.os}
          </span>
        </div>
      </div>

      {/* The 'I Already Know' commentary banner */}
      <div
        className={`p-2.5 rounded-xl mb-3 text-[11px] leading-relaxed transition-colors border ${
          spoofActive
            ? "bg-red-500/10 border-red-500/30 text-red-300"
            : deviceChoice !== "auto" && isHonest
            ? "bg-primary/15 border-primary/40 text-primary"
            : "bg-primary/5 border-primary/20 text-primary/80"
        }`}
      >
        <div className="flex items-start gap-2">
          {spoofActive ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-bounce" />
          ) : deviceChoice !== "auto" && isHonest ? (
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-ping" />
          )}
          <div className="flex-1">
            <p className="font-medium">{getPersonaHumor()}</p>
          </div>
        </div>
      </div>

      {/* Two Interactive Choice Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setDeviceChoice("phone")}
          className={`relative p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
            deviceChoice === "phone"
              ? "bg-primary text-background font-bold border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
              : "bg-black/40 text-primary/80 hover:text-primary hover:bg-primary/10 border-primary/20"
          }`}
        >
          <Smartphone className={`w-4 h-4 ${deviceChoice === "phone" ? "text-background" : "text-primary"}`} />
          <div className="text-left">
            <span className="text-xs font-bold block leading-none">📱 Phone</span>
            <span className={`text-[9px] ${deviceChoice === "phone" ? "text-background/80" : "text-primary/50"}`}>
              Cyberdeck Mode
            </span>
          </div>
        </button>

        <button
          onClick={() => setDeviceChoice("desktop")}
          className={`relative p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
            deviceChoice === "desktop"
              ? "bg-primary text-background font-bold border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
              : "bg-black/40 text-primary/80 hover:text-primary hover:bg-primary/10 border-primary/20"
          }`}
        >
          <Monitor className={`w-4 h-4 ${deviceChoice === "desktop" ? "text-background" : "text-primary"}`} />
          <div className="text-left">
            <span className="text-xs font-bold block leading-none">💻 Desktop</span>
            <span className={`text-[9px] ${deviceChoice === "desktop" ? "text-background/80" : "text-primary/50"}`}>
              Terminal Rig
            </span>
          </div>
        </button>
      </div>

      {/* Expandable Raw Telemetry Inspector */}
      <div className="mt-2.5 pt-2 border-t border-primary/10 flex flex-col">
        <button
          onClick={() => {
            sound.playClick();
            setShowRawDetails(prev => !prev);
          }}
          className="flex items-center justify-between text-[10px] text-primary/50 hover:text-primary transition-colors cursor-pointer"
        >
          <span>Raw Client Telemetry ({telemetry.screenWidth}×{telemetry.screenHeight} px)</span>
          {showRawDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {showRawDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2 p-2 rounded-lg bg-black/80 border border-primary/15 text-[10px] text-primary/70 space-y-1 font-mono"
            >
              <div className="flex justify-between">
                <span>OS Platform:</span>
                <span className="text-primary font-bold">{telemetry.os}</span>
              </div>
              <div className="flex justify-between">
                <span>Viewport Matrix:</span>
                <span className="text-primary font-bold">{telemetry.screenWidth}×{telemetry.screenHeight} ({telemetry.orientation})</span>
              </div>
              <div className="flex justify-between">
                <span>Pixel Ratio (DPR):</span>
                <span className="text-primary font-bold">{telemetry.dpr}x</span>
              </div>
              <div className="flex justify-between">
                <span>Input Modality:</span>
                <span className="text-primary font-bold">{telemetry.pointerType} {telemetry.touchCapable ? "(Touch enabled)" : "(Pointer only)"}</span>
              </div>
              <div className="flex justify-between">
                <span>Telemetry Status:</span>
                <span className={spoofActive ? "text-red-400 font-bold" : "text-primary font-bold"}>
                  {spoofActive ? "SPOOFED (Emulation Active)" : "HONEST (100% Match)"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
