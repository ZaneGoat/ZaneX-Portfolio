import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  X,
  Terminal,
  HelpCircle,
  Copy,
  Zap,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { sound } from "@/lib/sound";

interface CtfBountyBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal?: () => void;
  onOpenBreach?: () => void;
}

export interface CtfFlagInfo {
  id: string;
  name: string;
  category: "RECON" | "OSINT" | "INTRUSION";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  hint: string;
  description: string;
  flagValue: string;
}

export const CTF_FLAGS: CtfFlagInfo[] = [
  {
    id: "flag1",
    name: "Subtle Inspector",
    category: "RECON",
    difficulty: "EASY",
    points: 100,
    hint: "Inspect the DOM meta tags, or run 'curl /robots.txt' in ZaneOS Shell.",
    description: "Source code holds no secrets. Find the recon flag embedded within the DOM head or robots directive.",
    flagValue: "ZANEX{DOM_INSPECTOR_ROOT_42}"
  },
  {
    id: "flag2",
    name: "Subcarrier RF Leak Vault",
    category: "SIGNALS",
    difficulty: "MEDIUM",
    points: 250,
    hint: "Run 'csi --scan' or inspect 'cat .radio_secret' in ZaneOS Shell.",
    description: "Intercept the raw 802.11 CSI OFDM subcarrier phase perturbation payload hidden in the RF buffer.",
    flagValue: "ZANEX{DARK_ONION_EXTRACTOR_99}"
  },
  {
    id: "flag3",
    name: "ICE Breaker Protocol",
    category: "INTRUSION",
    difficulty: "HARD",
    points: 500,
    hint: "Solve the Cyber Arena Breach Protocol mini-game before time expires.",
    description: "Infiltrate the 5x5 hex matrix. Match the target sequence to decrypt the root memory token.",
    flagValue: "ZANEX{HEX_BREACH_BUFFER_MASTER}"
  }
];

export const CtfBountyBoard = ({
  isOpen,
  onClose,
  onOpenTerminal,
  onOpenBreach
}: CtfBountyBoardProps) => {
  const [solvedFlags, setSolvedFlags] = useState<string[]>([]);
  const [inputFlag, setInputFlag] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [openHintId, setOpenHintId] = useState<string | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zanex_ctf_solved");
      if (saved) {
        setSolvedFlags(JSON.parse(saved));
      }
    } catch {}
  }, [isOpen]);

  const saveSolved = (newSolved: string[]) => {
    setSolvedFlags(newSolved);
    try {
      localStorage.setItem("zanex_ctf_solved", JSON.stringify(newSolved));
    } catch {}
  };

  const handleFlagSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const candidate = inputFlag.trim();
    if (!candidate) return;

    // Check against flags
    const matched = CTF_FLAGS.find(
      f => f.flagValue.toLowerCase() === candidate.toLowerCase()
    );

    if (matched) {
      if (solvedFlags.includes(matched.id)) {
        setStatusMessage({ text: `Flag already claimed: [${matched.name}]`, type: "info" });
        sound.playBeep(440, 0.1);
      } else {
        const nextSolved = [...solvedFlags, matched.id];
        saveSolved(nextSolved);
        setStatusMessage({ text: `ROOT ACCESS ACCEPTED: Captured [${matched.name}] (+${matched.points} pts)!`, type: "success" });
        sound.playSuccess();
        sound.haptic([50, 40, 90, 40, 160]);
      }
    } else {
      setStatusMessage({ text: "FLAG INVALID // ACCESS DENIED", type: "error" });
      sound.playError();
      sound.haptic([100, 50, 100]);
    }

    setInputFlag("");
  };

  const resetProgress = () => {
    if (confirm("Reset all CTF captured flags and progress?")) {
      saveSolved([]);
      setStatusMessage({ text: "CTF Progress reset to 0/3.", type: "info" });
      sound.playClick();
    }
  };

  const totalPoints = CTF_FLAGS.reduce(
    (acc, f) => (solvedFlags.includes(f.id) ? acc + f.points : acc),
    0
  );
  const maxPoints = CTF_FLAGS.reduce((acc, f) => acc + f.points, 0);
  const isMaster = solvedFlags.length === CTF_FLAGS.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10004] bg-background/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 font-mono select-none"
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            className="w-full max-w-3xl bg-[#060913] border-2 border-primary/60 rounded-2xl shadow-[0_0_90px_hsl(var(--primary)/0.25)] flex flex-col overflow-hidden max-h-[92vh]"
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-primary">
                <ShieldAlert className="w-5 h-5 text-primary animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                    CTF // HACK MY PORTFOLIO
                    <span className="text-[10px] px-1.5 py-0.2 bg-primary/20 border border-primary/40 rounded text-primary">
                      {solvedFlags.length}/{CTF_FLAGS.length} CAPTURED
                    </span>
                  </h3>
                  <p className="text-[10px] text-primary/60">
                    Find 3 hidden vulnerability flags across the architecture.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetProgress}
                  className="p-1 hover:text-primary text-primary/50 transition-colors"
                  title="Reset CTF Progress"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-red-400 text-primary/60 transition-colors"
                  title="Close Bounty Board"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Score & Progress Strip */}
            <div className="px-5 py-3 bg-black/60 border-b border-primary/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-primary/60 block text-[10px]">TOTAL SCORE</span>
                  <span className="text-primary font-black text-base">{totalPoints} / {maxPoints} PTS</span>
                </div>
                <div>
                  <span className="text-primary/60 block text-[10px]">OPERATOR CLEARANCE</span>
                  <span className={`font-bold ${isMaster ? "text-yellow-400" : "text-primary"}`}>
                    {isMaster ? "ROOT LEVEL 99 // MASTER" : "INTRUDER LEVEL 1"}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-48 bg-primary/10 rounded-full h-2.5 overflow-hidden border border-primary/30">
                <div
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(solvedFlags.length / CTF_FLAGS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flag Cards Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {/* Grand Win Banner */}
              {isMaster && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/15 via-primary/20 to-yellow-500/15 border-2 border-yellow-400/60 text-center space-y-2 shadow-[0_0_40px_rgba(234,179,8,0.25)]"
                >
                  <div className="inline-flex items-center gap-2 text-yellow-400 font-black text-sm uppercase">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    PORTFOLIO 100% OWNED // MASTER OPERATOR CERTIFIED
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                    You have extracted all 3 security tokens (DOM Recon, OSINT Dark Web Harvester, and ICE Memory Buffer).
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-primary font-bold">
                    SECURITY CODE: <span className="bg-black/80 px-2 py-0.5 border border-primary/40 rounded text-yellow-300">ZANEX-ROOT-CLEARANCE-PASSED</span>
                  </div>
                </motion.div>
              )}

              {/* Flags List */}
              <div className="space-y-3">
                {CTF_FLAGS.map((flag, idx) => {
                  const isCaptured = solvedFlags.includes(flag.id);
                  const isHintOpen = openHintId === flag.id;

                  return (
                    <div
                      key={flag.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCaptured
                          ? "bg-primary/10 border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                          : "bg-black/40 border-primary/20 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isCaptured ? (
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          ) : (
                            <Lock className="w-5 h-5 text-primary/40 shrink-0" />
                          )}
                          <span className="font-bold text-sm text-foreground">
                            0{idx + 1}. {flag.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                            {flag.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded border ${
                            flag.difficulty === "EASY"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : flag.difficulty === "MEDIUM"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}>
                            {flag.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-black/60 text-primary font-bold border border-primary/30">
                            +{flag.points} PTS
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {flag.description}
                      </p>

                      {/* Action Links & Hint Toggle */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-primary/10 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              sound.playClick();
                              setOpenHintId(isHintOpen ? null : flag.id);
                            }}
                            className="text-primary/70 hover:text-primary flex items-center gap-1 text-[11px] underline underline-offset-2"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            {isHintOpen ? "Hide Intel" : "Declassify Intel (Hint)"}
                          </button>

                          {flag.id === "flag2" && onOpenTerminal && (
                            <button
                              onClick={() => {
                                sound.playBoot();
                                onClose();
                                onOpenTerminal();
                              }}
                              className="text-primary/80 hover:text-primary flex items-center gap-1 text-[11px] bg-primary/10 px-2 py-0.5 rounded border border-primary/30"
                            >
                              <Terminal className="w-3 h-3" />
                              Open Terminal
                            </button>
                          )}

                          {flag.id === "flag3" && onOpenBreach && (
                            <button
                              onClick={() => {
                                sound.playBoot();
                                onClose();
                                onOpenBreach();
                              }}
                              className="text-secondary hover:text-secondary/80 flex items-center gap-1 text-[11px] bg-secondary/10 px-2 py-0.5 rounded border border-secondary/30"
                            >
                              <Zap className="w-3 h-3" />
                              Play Breach
                            </button>
                          )}
                        </div>

                        {isCaptured ? (
                          <span className="text-primary font-bold text-xs flex items-center gap-1 bg-primary/20 px-2.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> CAPTURED
                          </span>
                        ) : (
                          <span className="text-primary/40 text-[11px]">AWAITING CIPHER</span>
                        )}
                      </div>

                      {/* Declassified Intel / Hint Accordion */}
                      {isHintOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-black/60 border border-primary/30 rounded-lg text-xs text-primary/90 space-y-1"
                        >
                          <p className="font-bold text-[11px] text-primary">INTEL DISPATCH:</p>
                          <p className="text-muted-foreground">{flag.hint}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flag Submission Bar */}
            <div className="p-4 bg-black/80 border-t border-primary/20">
              <form onSubmit={handleFlagSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputFlag}
                  onChange={e => setInputFlag(e.target.value)}
                  placeholder="Enter flag cipher (e.g. ZANEX{...})"
                  className="flex-1 bg-primary/5 border border-primary/30 focus:border-primary rounded-xl px-4 py-2.5 text-xs sm:text-sm text-primary font-mono outline-none placeholder:text-primary/30"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-background font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  SUBMIT
                </button>
              </form>

              {/* Status Notice */}
              {statusMessage && (
                <div
                  className={`mt-2.5 text-xs text-center font-bold px-3 py-1.5 rounded-lg border ${
                    statusMessage.type === "success"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : statusMessage.type === "error"
                      ? "bg-red-500/15 border-red-500/40 text-red-400"
                      : "bg-primary/10 border-primary/30 text-primary"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
