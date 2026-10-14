import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, Cookie } from "lucide-react";
import { sound } from "@/lib/sound";

interface EasterEggsProps {
  onOpenTerminal: () => void;
  onOpenMatrixTakeover: () => void;
}

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  char: string;
}

export const EasterEggs = ({ onOpenTerminal, onOpenMatrixTakeover }: EasterEggsProps) => {
  const [clickCount, setClickCount] = useState(0);
  const [showCookie, setShowCookie] = useState(false);
  const [showSecretButton, setShowSecretButton] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintPlatform, setHintPlatform] = useState<"none" | "pc" | "phone">("none");
  const [hasClaimed, setHasClaimed] = useState(false);
  const [particles, setParticles] = useState<ClickParticle[]>([]);

  const isHoldingRef = useRef(false);
  const konamiIndexRef = useRef(0);
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    let lastShakeTime = 0;

    // Mobile Motion Handler (Shake while holding screen -> Unleash Matrix Construct)
    const handleMotion = (e: DeviceMotionEvent) => {
      if (!isHoldingRef.current) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (acceleration > 24 && now - lastShakeTime > 1200) {
        lastShakeTime = now;
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        sound.playMatrixDrop();
        onOpenMatrixTakeover();
        setShowHint(false);
      }
    };

    // Desktop Konami Code Handler -> Unleash Matrix Construct
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = konamiIndexRef.current;
      if (e.key === konamiCode[idx]) {
        konamiIndexRef.current = idx + 1;
        sound.playKeypress();
        if (konamiIndexRef.current === konamiCode.length) {
          sound.playMatrixDrop();
          onOpenMatrixTakeover();
          setShowHint(false);
          konamiIndexRef.current = 0;
        }
      } else {
        konamiIndexRef.current = 0;
      }
    };

    const handleHoldStart = () => { isHoldingRef.current = true; };
    const handleHoldEnd = () => { isHoldingRef.current = false; };

    // Register Motion once
    if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", handleMotion);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleHoldStart);
    window.addEventListener("mouseup", handleHoldEnd);
    window.addEventListener("touchstart", handleHoldStart, { passive: true });
    window.addEventListener("touchend", handleHoldEnd, { passive: true });

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleHoldStart);
      window.removeEventListener("mouseup", handleHoldEnd);
      window.removeEventListener("touchstart", handleHoldStart);
      window.removeEventListener("touchend", handleHoldEnd);
    };
  }, [onOpenTerminal]);

  // Click & Tap Counter with Binary Ripple Visuals
  useEffect(() => {
    const handlePointerClick = (e: MouseEvent | TouchEvent) => {
      // Determine click coordinates
      let clientX = 0;
      let clientY = 0;
      if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      if (clientX > 0 && clientY > 0) {
        const char = Math.random() > 0.5 ? "1" : "0";
        const newParticle: ClickParticle = {
          id: Date.now() + Math.random(),
          x: clientX,
          y: clientY,
          char
        };
        setParticles(prev => [...prev.slice(-10), newParticle]);
      }

      setClickCount(prev => {
        const next = prev + 1;
        if (next === 15) {
          sound.playSuccess();
          setShowCookie(true);
        }
        if (next === 40) {
          sound.playSuccess();
          setShowSecretButton(true);
        }
        return next;
      });
    };

    window.addEventListener("click", handlePointerClick);
    return () => window.removeEventListener("click", handlePointerClick);
  }, []);

  const claimCookie = () => {
    sound.playSuccess();
    document.cookie = "ZaneGoatReward=🍪; max-age=86400; path=/";
    setHasClaimed(true);
    setTimeout(() => {
      setShowCookie(false);
      setHasClaimed(false);
    }, 4000);
  };

  return (
    <>
      {/* Visual Click Binary Particles */}
      <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 0, scale: 0.5, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ left: p.x - 8, top: p.y - 12 }}
            className="absolute text-xs font-mono font-bold text-primary select-none drop-shadow-[0_0_8px_hsl(var(--primary))]"
          >
            {p.char}
          </motion.div>
        ))}
      </div>

      {/* 15 Clicks: Cookie Reward Modal */}
      <AnimatePresence>
        {showCookie && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <div className="bg-[#050816] border-2 border-primary p-6 sm:p-8 rounded-3xl shadow-[0_0_80px_hsl(var(--primary)/0.5)] text-center max-w-sm w-full font-mono relative">
              <div className="text-6xl mb-4 animate-bounce">🍪</div>
              <h3 className="text-2xl font-black text-primary uppercase mb-2">
                {hasClaimed ? "REWARD INJECTED" : "DATA DECRYPTED"}
              </h3>
              <p className="text-muted-foreground text-xs mb-6">
                {hasClaimed
                  ? "[+] 1x COOKIE ADDED TO SYSTEM STORAGE"
                  : "[+] 15 Clicks Verified! Exploit Successful."}
              </p>
              {!hasClaimed ? (
                <button
                  onClick={claimCookie}
                  className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_hsl(var(--primary)/0.5)]"
                >
                  CLAIM_REWARD.exe
                </button>
              ) : (
                <div className="text-primary font-bold text-xs flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span>LOCAL_STORAGE UPDATED (Keep tapping for secret #2)</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 40 Clicks: Secret Hint Trigger Button */}
      <AnimatePresence>
        {showSecretButton && (
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              sound.playClick();
              setShowHint(!showHint);
            }}
            className="fixed bottom-6 right-6 bg-black/90 border-2 border-primary text-primary px-5 py-3 rounded-xl font-mono text-xs font-bold z-[9999] flex items-center gap-2 shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-primary animate-pulse" />
            <span>GET_HINT.txt</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hint Memo Modal */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <div className="bg-[#050816] border-2 border-primary p-6 rounded-2xl shadow-[0_0_60px_hsl(var(--primary)/0.4)] font-mono max-w-sm w-full">
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase mb-4 border-b border-primary/20 pb-2">
                <Zap className="w-4 h-4" />
                <span>ROOT_OVERRIDE_MEMO.txt</span>
              </div>

              {hintPlatform === "none" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    [!] Select your system interface to view terminal ignition sequence:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setHintPlatform("pc")}
                      className="p-3 border border-primary/30 rounded-lg hover:bg-primary/20 text-primary text-xs font-bold"
                    >
                      Desktop / PC
                    </button>
                    <button
                      onClick={() => setHintPlatform("phone")}
                      className="p-3 border border-primary/30 rounded-lg hover:bg-primary/20 text-primary text-xs font-bold"
                    >
                      Mobile / Phone
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl text-center">
                    <div className="text-base text-primary font-bold tracking-widest mb-1">
                      {hintPlatform === "pc" ? "↑ ↑ ↓ ↓ ← → ← → B A" : "HOLD SCREEN + SHAKE"}
                    </div>
                    <p className="text-[10px] text-primary/70 uppercase">
                      {hintPlatform === "pc" ? "Type Konami Code to unleash Full Matrix Construct" : "Long press display & shake to unleash Matrix Construct"}
                    </p>
                  </div>
                  <button
                    onClick={() => setHintPlatform("none")}
                    className="text-[11px] text-primary/60 hover:text-primary block"
                  >
                    {"<"} Back to selection
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowHint(false)}
                className="mt-6 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg"
              >
                CLOSE MEMO
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
