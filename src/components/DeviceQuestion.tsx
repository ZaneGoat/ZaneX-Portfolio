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
  const [expanded, setExpanded] = useState(false);

  const realLabel =
    telemetry.deviceCategory === "desktop"
      ? "Desktop"
      : telemetry.deviceCategory === "tablet"
      ? "Tablet"
      : "Phone";

  const getStatusMessage = () => {
    if (deviceChoice === "auto") {
      return persona === "friend"
        ? `Detected ${telemetry.os} ${realLabel} (${telemetry.screenWidth}×${telemetry.screenHeight}, ${telemetry.pointerType} input).`
        : `Client detected: ${telemetry.os} ${realLabel} (${telemetry.screenWidth}×${telemetry.screenHeight}, ${telemetry.dpr}x DPR).`;
    }

    if (spoofActive) {
      return persona === "friend"
        ? `Override active: forcing ${deviceChoice} layout on a ${telemetry.os} ${realLabel}.`
        : `Layout override: [${deviceChoice.toUpperCase()}] selected on physical ${telemetry.os} ${realLabel}. Emulation active.`;
    }

    return persona === "friend"
      ? `Confirmed ${telemetry.os} ${realLabel} layout.`
      : `Client profile verified: ${telemetry.os} ${realLabel} matches hardware telemetry.`;
  };

  return (
    <div
      className={`w-full max-w-xl rounded-xl bg-[#070b14]/90 border border-white/10 font-mono text-xs overflow-hidden ${className}`}
    >
      {/* Compact 1-Line Hardware Status Header (keeps mobile Hero immediately visible) */}
      <button
        type="button"
        onClick={() => {
          sound.playClick();
          setExpanded(prev => !prev);
        }}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate">
            Client: <span className="text-foreground font-semibold">{telemetry.os}</span> ·{" "}
            <span>{telemetry.screenWidth}×{telemetry.screenHeight}</span> ·{" "}
            <span className={spoofActive ? "text-amber-400 font-semibold" : "text-primary font-semibold"}>
              {spoofActive ? `${deviceChoice.toUpperCase()} (Override)` : realLabel}
            </span>
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
          <span className="hidden sm:inline">{expanded ? "Hide" : "Configure"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {/* Expandable Device Override & Raw Telemetry */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.08]"
          >
            <div className="p-3 space-y-2.5">
              {/* Status Line */}
              <div
                className={`p-2.5 rounded-lg text-[11px] leading-relaxed border flex items-start justify-between gap-2 ${
                  spoofActive
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : deviceChoice !== "auto" && isHonest
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white/[0.02] border-white/10 text-muted-foreground"
                }`}
              >
                <div className="flex items-start gap-2">
                  {spoofActive ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  )}
                  <p>{getStatusMessage()}</p>
                </div>

                {deviceChoice !== "auto" && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setDeviceChoice("auto");
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Reset to Auto Detection"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Auto</span>
                  </button>
                )}
              </div>

              {/* Phone / Desktop Override Buttons (No emojis) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeviceChoice("phone")}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                    deviceChoice === "phone"
                      ? "bg-primary text-background font-bold border-primary"
                      : "bg-black/40 text-foreground/80 hover:text-foreground hover:bg-white/[0.04] border-white/10"
                  }`}
                >
                  <Smartphone className={`w-3.5 h-3.5 ${deviceChoice === "phone" ? "text-background" : "text-primary"}`} />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-none">Phone</span>
                    <span className={`text-[9px] ${deviceChoice === "phone" ? "text-background/75" : "text-muted-foreground"}`}>
                      Handheld UI
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeviceChoice("desktop")}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                    deviceChoice === "desktop"
                      ? "bg-primary text-background font-bold border-primary"
                      : "bg-black/40 text-foreground/80 hover:text-foreground hover:bg-white/[0.04] border-white/10"
                  }`}
                >
                  <Monitor className={`w-3.5 h-3.5 ${deviceChoice === "desktop" ? "text-background" : "text-primary"}`} />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-none">Desktop</span>
                    <span className={`text-[9px] ${deviceChoice === "desktop" ? "text-background/75" : "text-muted-foreground"}`}>
                      Workstation UI
                    </span>
                  </div>
                </button>
              </div>

              {/* Compact Raw Client Specs */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-white/[0.06] text-[10px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Display:</span>
                  <span className="text-foreground font-semibold">{telemetry.screenWidth}×{telemetry.screenHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span>DPR:</span>
                  <span className="text-foreground font-semibold">{telemetry.dpr}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Input:</span>
                  <span className="text-foreground font-semibold">{telemetry.pointerType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Touch:</span>
                  <span className="text-foreground font-semibold">{telemetry.touchCapable ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
