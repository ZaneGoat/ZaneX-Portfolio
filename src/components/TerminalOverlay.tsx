import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Check, Download } from "lucide-react";

export const TerminalOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const hackSequence = [
    "INITIATING SYSTEM OVERRIDE...",
    "ACCESSING KERNEL MODULES...",
    "BYPASSING FIREWALL LAYERS 1-7...",
    "INJECTING EXPLOIT PAYLOAD...",
    "CRITICAL VULNERABILITY CVE-2026-ZANE FOUND",
    "DECRYPTING /root/Zane_Goat/identity.enc",
    "........................ [45%]",
    "........................ [89%]",
    "........................ [100%]",
    "ACCESS GRANTED.",
    "IDENTITY: AZIZ MAAIZATE (ZANE GOAT)",
    "ROLE: FULL-STACK WEB & AI DEVELOPER",
    "SECURITY CLEARANCE: LEVEL 99 AUTHORIZED"
  ];

  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setIsComplete(false);
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < hackSequence.length) {
          setLogs(prev => [...prev, hackSequence[currentIdx]]);
          currentIdx++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-2xl bg-[#050816] border-2 border-primary/50 rounded-lg shadow-[0_0_100px_rgba(0,255,158,0.2)] overflow-hidden font-mono">
            {/* Terminal Header */}
            <div className="bg-primary/20 p-3 flex justify-between items-center border-b border-primary/30">
              <div className="flex items-center gap-2 text-primary">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Zane_OS v4.0.4 - Root Shell</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-2 custom-scrollbar flex flex-col">
              <div className="flex-1 space-y-2">
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-primary/50 shrink-0">{">"}</span>
                    <span className={`text-sm ${log && (log.includes("CRITICAL") || log.includes("IDENTITY") || log.includes("CLEARANCE")) ? "text-primary font-bold" : "text-primary/80"}`}>
                      {log}
                    </span>
                    {i < logs.length - 1 && <Check className="w-3 h-3 text-primary/40 mt-1" />}
                  </motion.div>
                ))}
                {!isComplete && <div className="animate-pulse inline-block w-2 h-4 bg-primary ml-2" />}
              </div>

              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-8 pb-4 space-y-6 text-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="space-y-2">
                      <p className="text-primary animate-pulse font-bold tracking-[0.3em] text-sm uppercase">Level 99 Clearance Granted</p>
                      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    </div>
                    
                    <a
                      href="/Coded CV.pdf"
                      target="_blank"
                      download="Aziz_Maaizate_CV.pdf"
                      rel="noopener noreferrer"
                      className="group relative px-10 py-5 bg-primary text-background font-black text-2xl rounded-xl hover:scale-105 transition-all shadow-[0_0_50px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_100px_hsl(var(--primary)/1)] overflow-hidden flex items-center gap-3"
                    >
                      <Download className="w-8 h-8" />
                      <span className="relative z-10">DOWNLOAD CODED CV PDF</span>
                    </a>
                  </div>

                  <button
                    onClick={onClose}
                    className="block mx-auto text-[10px] text-primary/30 hover:text-primary transition-colors uppercase font-bold tracking-[0.2em] pt-4"
                  >
                    [ Terminate Secure Session ]
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
