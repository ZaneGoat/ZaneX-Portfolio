import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, CheckCircle2, Smartphone, Sparkles, Eye } from "lucide-react";
import { sound } from "@/lib/sound";
import { RyukAsciiOverlay } from "@/components/RyukAsciiOverlay";

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
  const [showClickExploit, setShowClickExploit] = useState(false);
  const [showSecretButton, setShowSecretButton] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintPlatform, setHintPlatform] = useState<"none" | "pc" | "phone">("none");
  const [hasClaimed, setHasClaimed] = useState(false);
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [crimsonGlitch, setCrimsonGlitch] = useState(false);
  const [ryukActive, setRyukActive] = useState(false);
  const [shinigamiDealUnlocked, setShinigamiDealUnlocked] = useState(false);
  const pausedRef = useRef(false);

  // Mobile Sensor State
  const [permissionStatus, setPermissionStatus] = useState<"idle" | "granted" | "denied">("idle");
  const [isIosDevice, setIsIosDevice] = useState(false);

  const isHoldingRef = useRef(false);
  const lastHoldEndTimeRef = useRef(0);
  const konamiIndexRef = useRef(0);
  const lastShakeTimeRef = useRef(0);
  const lastAccRef = useRef({ x: 0, y: 0, z: 0 });

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Motion processor
  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const now = Date.now();
    // Allow trigger if currently holding OR released within the last 1200ms
    const isHolding = isHoldingRef.current || (now - lastHoldEndTimeRef.current < 1200);
    if (!isHolding) return;

    const acc = e.acceleration || e.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    let magnitude = 0;
    if (e.acceleration && (e.acceleration.x !== null || e.acceleration.y !== null)) {
      // Linear acceleration (excluding gravity)
      magnitude = Math.hypot(x, y, z);
    } else {
      // Fallback: calculate delta between successive gravity readings
      const dx = Math.abs(x - lastAccRef.current.x);
      const dy = Math.abs(y - lastAccRef.current.y);
      const dz = Math.abs(z - lastAccRef.current.z);
      magnitude = dx + dy + dz;
      lastAccRef.current = { x, y, z };
    }

    // Shake threshold: 13 for linear, ~16 for delta
    if (magnitude > 13 && now - lastShakeTimeRef.current > 1500) {
      lastShakeTimeRef.current = now;
      if (navigator.vibrate) navigator.vibrate([100, 50, 150]);
      sound.playMatrixDrop();
      onOpenMatrixTakeover();
      setShowHint(false);
    }
  }, [onOpenMatrixTakeover]);

  // Request motion permission (specifically for iOS Safari 13+)
  const requestMotionPermission = useCallback(async () => {
    sound.playClick();
    if (
      typeof window !== "undefined" &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })?.requestPermission === "function"
    ) {
      try {
        const response = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (response === "granted") {
          setPermissionStatus("granted");
          window.addEventListener("devicemotion", handleMotion);
          if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
          return true;
        } else {
          setPermissionStatus("denied");
          return false;
        }
      } catch (err) {
        console.warn("Sensor permission request error:", err);
        setPermissionStatus("denied");
        return false;
      }
    } else {
      // Non-iOS or Android: standard registration
      setPermissionStatus("granted");
      window.addEventListener("devicemotion", handleMotion);
      return true;
    }
  }, [handleMotion]);

  // Check device capabilities on mount
  useEffect(() => {
    const isIos =
      typeof window !== "undefined" &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })?.requestPermission === "function";

    setIsIosDevice(isIos);

    // If not iOS (e.g. Android), register motion listener immediately
    if (!isIos && typeof window !== "undefined" && "DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", handleMotion);
      setPermissionStatus("granted");
    }

    // Desktop Konami Code listener
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

    // Hold tracking (pure background state for shake detection, zero UI visual clutter)
    const handleHoldStart = () => {
      isHoldingRef.current = true;
    };

    const handleHoldEnd = () => {
      isHoldingRef.current = false;
      lastHoldEndTimeRef.current = Date.now();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleHoldStart);
    window.addEventListener("mouseup", handleHoldEnd);
    window.addEventListener("touchstart", handleHoldStart, { passive: true });
    window.addEventListener("touchend", handleHoldEnd, { passive: true });
    window.addEventListener("touchcancel", handleHoldEnd, { passive: true });
    window.addEventListener("zanex:request-motion-sensors", requestMotionPermission);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleHoldStart);
      window.removeEventListener("mouseup", handleHoldEnd);
      window.removeEventListener("touchstart", handleHoldStart);
      window.removeEventListener("touchend", handleHoldEnd);
      window.removeEventListener("touchcancel", handleHoldEnd);
      window.removeEventListener("zanex:request-motion-sensors", requestMotionPermission);
    };
  }, [handleMotion, onOpenMatrixTakeover, requestMotionPermission]);

  // Click & Tap Counter with Binary Ripple Visuals & 10-14 Crimson Micro-Glitch
  // Uses pointerdown so mobile phone taps register 1:1 without double-tap zoom coalescing
  useEffect(() => {
    const handlePointerClick = (e: PointerEvent | MouseEvent | TouchEvent) => {
      if (pausedRef.current) return;

      let clientX = 0;
      let clientY = 0;
      if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if ("touches" in e && e.touches && e.touches[0]) {
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
        // Secret hint button unlocks after 8 clicks
        if (next === 8) {
          sound.playSuccess();
          setShowSecretButton(true);
        }
        // Clicks 10 to 14: 80ms crimson micro-glitch
        if (next >= 10 && next <= 14) {
          setCrimsonGlitch(true);
          window.setTimeout(() => setCrimsonGlitch(false), 80);
        }
        // Click 15: Pause counter and summon the Shinigami Realm Confirmation Modal
        if (next === 15) {
          pausedRef.current = true;
          sound.playSuccess();
          setShowClickExploit(true);
        }
        return next;
      });
    };

    const handleOpenRyukModal = () => {
      pausedRef.current = true;
      sound.playSuccess();
      setShowClickExploit(true);
    };

    window.addEventListener("pointerdown", handlePointerClick, { passive: true });
    window.addEventListener("zanex:open-ryuk-deal", handleOpenRyukModal);
    return () => {
      window.removeEventListener("pointerdown", handlePointerClick);
      window.removeEventListener("zanex:open-ryuk-deal", handleOpenRyukModal);
    };
  }, []);

  const makeShinigamiDeal = () => {
    sound.playBoot();
    document.cookie = "ZaneClickExploit=15_CLICKS_MASTER; max-age=86400; path=/";
    setHasClaimed(true);
    setShinigamiDealUnlocked(true);
    setShowClickExploit(false);
    setRyukActive(true);
  };

  const stepBackCancel = () => {
    sound.playClick();
    setShowClickExploit(false);
    setHasClaimed(false);
    setClickCount(0);
    window.setTimeout(() => {
      pausedRef.current = false;
    }, 150);
  };

  const handleRyukComplete = useCallback(() => {
    setRyukActive(false);
    setHasClaimed(false);
    setClickCount(0);
    pausedRef.current = false;
  }, []);

  return (
    <>
      {/* Full-Screen Procedural Ryuk + MSI GF63 ASCII Animation Overlay */}
      <RyukAsciiOverlay isOpen={ryukActive} onComplete={handleRyukComplete} />

      {/* 80ms Crimson Micro-Glitch Overlay (Clicks 10 to 14) */}
      {crimsonGlitch && (
        <div
          className="fixed inset-0 pointer-events-none z-[99990]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,17,43,0.18) 0%, rgba(5,5,8,0.05) 50%, rgba(255,17,43,0.22) 100%)",
            mixBlendMode: "screen",
            transform: "translateX(2px)"
          }}
        />
      )}

      {/* Visual Click Binary Particles */}
      <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 0, scale: 0.5, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ left: p.x - 8, top: p.y - 12 }}
            className={`absolute text-xs font-mono font-bold select-none ${
              clickCount >= 10
                ? "text-[#ff112b] drop-shadow-[0_0_8px_#ff112b]"
                : "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
            }`}
          >
            {p.char}
          </motion.div>
        ))}
      </div>

      {/* 15 Clicks: Death Note // Shinigami Realm Confirmation Modal */}
      <AnimatePresence>
        {showClickExploit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            style={{
              backgroundColor: "rgba(5, 5, 8, 0.88)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)"
            }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 16, opacity: 0 }}
              style={{
                backgroundColor: "#050507",
                border: "1px solid #ff112b",
                boxShadow: "0 0 65px rgba(255, 17, 43, 0.35), inset 0 0 28px rgba(255, 17, 43, 0.08)"
              }}
              className="p-6 sm:p-8 rounded-2xl text-center max-w-md w-full relative overflow-hidden"
            >
              {/* Crimson Corner Accents */}
              <div className="w-14 h-14 rounded-full bg-[#ff112b]/15 border border-[#ff112b]/60 text-[#ff112b] mx-auto mb-4 flex items-center justify-center shadow-[0_0_25px_rgba(255,17,43,0.45)]">
                <Eye className="w-7 h-7 text-[#ff112b] animate-pulse" />
              </div>

              <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#ff112b] mb-1.5">
                MSI GF63 // 15-CLICK OVERCLOCK
              </div>

              <h3
                style={{ fontFamily: "'Cinzel', 'Georgia', 'Times New Roman', serif" }}
                className="text-xl sm:text-2xl font-black tracking-[0.14em] text-[#f0f0f5] uppercase mb-3 drop-shadow-[0_0_12px_rgba(255,17,43,0.5)]"
              >
                SHINIGAMI REALM DETECTED
              </h3>

              <p className="text-[#f0f0f5]/90 text-sm leading-relaxed mb-2 font-serif italic">
                &ldquo;You have knocked 15 times. Do you wish to make the Shinigami Eye Deal?&rdquo;
              </p>

              <p className="text-[#686875] font-mono text-[11px] mb-6">
                [+] &quot;Wow u good at clicking like me u clicked 15 times&quot; · Cookie &amp; Ryuk Sticker Construct Ready
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={makeShinigamiDeal}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#ff112b] hover:bg-[#ff2940] text-[#f0f0f5] font-mono font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_28px_rgba(255,17,43,0.55)] cursor-pointer"
                >
                  [ Make the Deal (Confirm) ]
                </button>
                <button
                  type="button"
                  onClick={stepBackCancel}
                  className="py-3 px-4 rounded-xl bg-transparent hover:bg-white/5 border border-[#686875]/50 hover:border-[#f0f0f5]/60 text-[#686875] hover:text-[#f0f0f5] font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  [ Step Back (Cancel) ]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Hint Button (Desktop only so it never overlaps mobile Cyberdeck FAB) */}
      <AnimatePresence>
        {showSecretButton && (
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              sound.playClick();
              setShowSecretButton(false);
              setShowHint(true);
            }}
            className="hidden md:flex fixed bottom-6 right-6 bg-black/90 border-2 border-primary text-primary px-5 py-3 rounded-xl font-mono text-xs font-bold z-[9999] items-center gap-2 shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
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
                    [!] Select your interface to initialize the secret terminal construct:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setHintPlatform("pc")}
                      className="p-3 border border-primary/30 rounded-lg hover:bg-primary/20 text-primary text-xs font-bold cursor-pointer"
                    >
                      Desktop / PC
                    </button>
                    <button
                      onClick={() => setHintPlatform("phone")}
                      className="p-3 border border-primary/30 rounded-lg hover:bg-primary/20 text-primary text-xs font-bold cursor-pointer"
                    >
                      Mobile / Phone
                    </button>
                  </div>
                </div>
              ) : hintPlatform === "pc" ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl text-center">
                    <div className="text-base text-primary font-bold tracking-widest mb-1">
                      ↑ ↑ ↓ ↓ ← → ← → B A
                    </div>
                    <p className="text-[10px] text-primary/70 uppercase">
                      Type Konami sequence to unleash Full Matrix Construct
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playMatrixDrop();
                      onOpenMatrixTakeover();
                      setShowHint(false);
                    }}
                    className="w-full py-2.5 bg-primary text-background font-bold text-xs rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    TRIGGER CONSTRUCT DIRECTLY →
                  </button>
                  <button
                    onClick={() => setHintPlatform("none")}
                    className="text-[11px] text-primary/60 hover:text-primary block cursor-pointer"
                  >
                    {"<"} Back to selection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl text-center">
                    <div className="text-base text-primary font-bold tracking-widest mb-1">
                      HOLD SCREEN + SHAKE
                    </div>
                    <p className="text-[10px] text-primary/70 uppercase mb-3">
                      Press & hold finger on display, then shake your device
                    </p>

                    {/* Sensor Permission Button / Status */}
                    {isIosDevice && permissionStatus !== "granted" ? (
                      <button
                        onClick={requestMotionPermission}
                        className="w-full py-2.5 bg-primary text-background text-xs font-bold rounded-lg shadow-[0_0_15px_hsl(var(--primary)/0.5)] flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>ALLOW SENSORS (TAP HERE)</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-primary font-bold flex items-center justify-center gap-1.5 py-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>SENSORS ONLINE · READY TO SHAKE</span>
                      </div>
                    )}
                  </div>

                  {/* Direct Launch Override */}
                  <button
                    onClick={() => {
                      sound.playMatrixDrop();
                      onOpenMatrixTakeover();
                      setShowHint(false);
                    }}
                    className="w-full py-2.5 border border-primary/50 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>LAUNCH MATRIX OVERRIDE NOW</span>
                  </button>

                  <button
                    onClick={() => setHintPlatform("none")}
                    className="text-[11px] text-primary/60 hover:text-primary block cursor-pointer"
                  >
                    {"<"} Back to selection
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowHint(false)}
                className="mt-6 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg cursor-pointer"
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
