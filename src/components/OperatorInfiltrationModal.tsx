import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Lock,
  Unlock,
  Terminal,
  Cpu,
  Database,
  CheckCircle2,
  X,
  Zap,
  RotateCcw,
  Key
} from "lucide-react";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { sound } from "@/lib/sound";
import { toast } from "sonner";

interface OperatorInfiltrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorInfiltrationModal: React.FC<OperatorInfiltrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { clearance, clearanceLevel, isAllUnlocked, unlockNode, unlockAll, resetClearance } =
    useOperatorClearance();

  // Active challenge tab (1, 2, or 3)
  const [activeNode, setActiveNode] = useState<1 | 2 | 3>(1);

  // Challenge 1 state (Recon / OS question)
  const [reconAnswer, setReconAnswer] = useState("");
  // Challenge 2 state (EC Register 0x68 memory slider/button)
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null);
  // Challenge 3 state (Token / Arcane flag)
  const [tokenInput, setTokenInput] = useState("");

  if (!isOpen) return null;

  const handleSolveRecon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = reconAnswer.trim().toLowerCase();
    if (clean.includes("kali") || clean.includes("linux") || clean === "zane" || clean === "aziz") {
      unlockNode("identityUnlocked");
      setReconAnswer("");
    } else {
      sound.playError();
      toast.error("SECURITY CHALLENGE FAILED", {
        description: "Incorrect recon signature. Hint: Primary offensive security OS on this machine."
      });
    }
  };

  const handleSolveHardware = (hex: string) => {
    setSelectedRegister(hex);
    if (hex === "0x68") {
      unlockNode("hardwareUnlocked");
    } else {
      sound.playError();
      toast.error("EC BUS ACCESS DENIED", {
        description: `Register ${hex} is invalid. Required register controls the hardware fan governor.`
      });
    }
  };

  const handleSolveToken = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim().toUpperCase();
    if (
      clean === "OPERATOR" ||
      clean === "ZANEX" ||
      clean.includes("ARCANE_MAZE_OPERATOR_ROOT_99") ||
      clean.includes("ROOT")
    ) {
      unlockNode("projectsUnlocked");
      setTokenInput("");
    } else {
      sound.playError();
      toast.error("INVALID DECLASSIFICATION TOKEN", {
        description: "Enter declassification cipher 'OPERATOR' or 'ZANEX'."
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 overscroll-contain"
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-[#030712] border-2 border-primary/50 rounded-2xl p-4 sm:p-8 shadow-[0_0_60px_hsl(var(--primary)/0.3)] font-mono text-foreground custom-scrollbar"
        >
          {/* Subtle matrix glow in background */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-primary/20 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] shrink-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <span>CLASSIFIED DOSSIER</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold shrink-0">
                    LVL {clearanceLevel} / 3
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                  Infiltrate 3 security nodes to permanently declassify Zane's identity, specs & archives.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/20 transition cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Node Progression Tabs */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mb-6">
            {/* Node 1 */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveNode(1);
              }}
              className={`p-2 sm:p-3 rounded-xl border text-left transition-all ${
                activeNode === 1
                  ? "border-primary bg-primary/15 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                  : "border-primary/20 bg-primary/5 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-[10px] text-primary/70 uppercase font-bold">NODE 01</span>
                {clearance.identityUnlocked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/50" />
                )}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-foreground truncate">Recon Identity</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                {clearance.identityUnlocked ? "DECLASSIFIED" : "REDACTED"}
              </div>
            </button>

            {/* Node 2 */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveNode(2);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeNode === 2
                  ? "border-primary bg-primary/15 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                  : "border-primary/20 bg-primary/5 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-primary/70 uppercase font-bold">NODE 02</span>
                {clearance.hardwareUnlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-primary/50" />
                )}
              </div>
              <div className="text-xs font-bold text-foreground">Hardware Rig</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {clearance.hardwareUnlocked ? "DECLASSIFIED" : "REDACTED"}
              </div>
            </button>

            {/* Node 3 */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveNode(3);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeNode === 3
                  ? "border-primary bg-primary/15 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                  : "border-primary/20 bg-primary/5 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-primary/70 uppercase font-bold">NODE 03</span>
                {clearance.projectsUnlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-primary/50" />
                )}
              </div>
              <div className="text-xs font-bold text-foreground">Black-Ops Archives</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {clearance.projectsUnlocked ? "DECLASSIFIED" : "REDACTED"}
              </div>
            </button>
          </div>

          {/* Node Active Challenge Area */}
          <div className="bg-primary/5 border border-primary/25 rounded-xl p-5 mb-6 min-h-[200px] flex flex-col justify-between">
            {activeNode === 1 && (
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Challenge 01: Host OS Recon Handshake</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  The operative's real name, handle, and home base are protected behind host identification. Identify the primary offensive security operating system driving this cyberdeck:
                </p>

                {clearance.identityUnlocked ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <strong>ACCESS GRANTED // IDENTITY DECLASSIFIED:</strong>
                      <p className="text-[11px] text-emerald-300 mt-0.5">
                        Operative: <strong>Aziz Maaizate (Zane Goat)</strong> · Base: <strong>Casablanca, Morocco</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSolveRecon} className="flex gap-2">
                    <input
                      type="text"
                      value={reconAnswer}
                      onChange={e => setReconAnswer(e.target.value)}
                      placeholder="Enter OS name (e.g. Kali, Linux)..."
                      className="flex-1 bg-black/60 border border-primary/40 rounded-xl px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="bg-primary text-background font-bold text-xs px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      AUTHENTICATE
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeNode === 2 && (
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                  <Cpu className="w-4 h-4" />
                  <span>Challenge 02: Embedded Controller Register Bus</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  The host rig is cooled via a proprietary direct-to-register hardware EC governor. Select the hex address where the thermal fan speed register resides:
                </p>

                {clearance.hardwareUnlocked ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <strong>ACCESS GRANTED // RIG SPECS DECLASSIFIED:</strong>
                      <p className="text-[11px] text-emerald-300 mt-0.5">
                        Rig: <strong>MSI GF65 Thin (Dual-Boot Kali Hardened)</strong> · EC Register: <strong>0x68</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {["0x1F", "0x68", "0xEE"].map(hex => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => handleSolveHardware(hex)}
                        className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                          selectedRegister === hex
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-primary/30 bg-black/40 hover:border-primary/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {hex}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeNode === 3 && (
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                  <Database className="w-4 h-4" />
                  <span>Challenge 03: Black-Site Vault Decryption Cipher</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  The top-secret security projects (Wi-Fi CSI Sensing Radar, Controler-space Gamepad Suite, ZaneMegaCenter) are locked in the black-site vault. Enter the master declassification cipher (e.g. <strong>'OPERATOR'</strong> or <strong>'ZANEX'</strong>):
                </p>

                {clearance.projectsUnlocked ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <strong>ACCESS GRANTED // BLACK-OPS ARCHIVES UNMASKED:</strong>
                      <p className="text-[11px] text-emerald-300 mt-0.5">
                        All classified projects (Wi-Fi CSI Radar, Controler-space, ZaneMegaCenter) are now fully visible!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <form onSubmit={handleSolveToken} className="flex gap-2">
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={e => setTokenInput(e.target.value)}
                        placeholder="Enter cipher token (e.g. OPERATOR or ZANEX)..."
                        className="flex-1 bg-black/60 border border-primary/40 rounded-xl px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="bg-primary text-background font-bold text-xs px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        DECRYPT
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer controls: Instant Override & Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/20 pt-4 text-xs">
            <button
              onClick={resetClearance}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors w-full sm:w-auto justify-center"
              title="Reset all declassifications back to 100% redacted"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-encrypt Dossier (Level 0)</span>
            </button>

            <button
              onClick={() => {
                unlockAll();
              }}
              className="flex items-center gap-1.5 text-primary/70 hover:text-primary transition-colors text-[11px]"
              title="Developer Master Bypass"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Bypass: Unlock All (Level 99)</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
