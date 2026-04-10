import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalOverlay } from "./TerminalOverlay";
import { ShieldAlert, Zap } from "lucide-react";

export const EasterEggs = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showCookie, setShowCookie] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSecretButton, setShowSecretButton] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const [konamiIndex, setKonamiIndex] = useState(0);
  const isHoldingRef = useRef(false);

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    let lastShakeTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      if (isHoldingRef.current) {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;
        
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (acceleration > 25 && now - lastShakeTime > 1000) {
          lastShakeTime = now;
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setShowTerminal(true);
          setShowHint(false);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Desktop Konami
      if (e.key === konamiCode[konamiIndex]) {
        const newIndex = konamiIndex + 1;
        setKonamiIndex(newIndex);
        
        if (newIndex === konamiCode.length) {
          setShowTerminal(true);
          setShowHint(false);
          setKonamiIndex(0);
        }
      } else {
        setKonamiIndex(0);
      }
    };

    const handleStart = () => { isHoldingRef.current = true; };
    const handleEnd = () => { isHoldingRef.current = false; };

    const handleClick = () => {
      // Request permission for motion sensors on iOS
      if (typeof DeviceMotionEvent !== 'undefined' && 
          typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }

      setClickCount(prev => {
        const newCount = prev + 1;
        if (newCount === 15 && !showCookie) {
          setShowCookie(true);
          setTimeout(() => setShowCookie(false), 10000);
        }
        if (newCount === 40) {
          setShowSecretButton(true);
        }
        return newCount;
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleStart);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchstart', handleStart);
    document.addEventListener('touchend', handleEnd);

    if (!(typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function')) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleStart);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchstart', handleStart);
      document.removeEventListener('touchend', handleEnd);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [konamiIndex, showCookie]);

  const [hintPlatform, setHintPlatform] = useState<"none" | "pc" | "phone">("none");

  const KonamiHint = () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
    >
      <div className="bg-[#050816] border-2 border-primary p-6 md:p-8 rounded-2xl shadow-[0_0_80px_hsl(var(--primary)/0.5)] font-mono w-full max-w-sm pointer-events-auto">
        <div className="flex items-center gap-2 mb-6 text-primary border-b border-primary/30 pb-3">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">ENCRYPTED_MEMO.txt</span>
        </div>

        <AnimatePresence mode="wait">
          {hintPlatform === "none" ? (
            <motion.div
              key="platform-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-primary/90 text-sm leading-relaxed">
                [!] SELECT SYSTEM INTERFACE:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHintPlatform("pc")}
                  className="p-3 border border-primary/30 rounded hover:bg-primary/20 transition-colors text-primary text-[10px] md:text-xs font-bold uppercase"
                >
                  Desktop/PC
                </button>
                <button
                  onClick={() => setHintPlatform("phone")}
                  className="p-3 border border-primary/30 rounded hover:bg-primary/20 transition-colors text-primary text-[10px] md:text-xs font-bold uppercase"
                >
                  Mobile/Phone
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="platform-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-primary/90 text-sm leading-relaxed">
                [!] INSTRUCTION DETECTED FOR {hintPlatform.toUpperCase()}:
              </p>
              <div className="bg-primary/10 p-4 rounded border border-primary/20 text-center space-y-3">
                <div className="text-lg tracking-widest text-primary font-bold">
                  {hintPlatform === "pc" ? "↑ ↑ ↓ ↓ ← → ← → B A" : "HOLD SCREEN + SHAKE"}
                </div>
                <div className="text-[10px] text-primary/70 leading-relaxed uppercase">
                  {hintPlatform === "pc" 
                    ? "USE KEYBOARD ARROWS AND B/A KEYS" 
                    : "LONG PRESS ANYWHERE & SHAKE"}
                </div>
              </div>
              <button
                onClick={() => setHintPlatform("none")}
                className="text-[10px] text-primary/50 hover:text-primary transition-colors uppercase font-bold"
              >
                {"<"} Back to selection
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => { setShowHint(false); setHintPlatform("none"); }}
          className="mt-6 w-full py-1 text-[10px] text-primary/40 hover:text-primary transition-colors uppercase font-bold"
        >
          [ CLOSE MEMO ]
        </button>
      </div>
    </motion.div>
  );

  const [hasClaimed, setHasClaimed] = useState(false);

  const claimCookie = () => {
    document.cookie = "ZaneGoatReward=🍪; max-age=86400; path=/";
    setHasClaimed(true);
    setTimeout(() => {
      setShowCookie(false);
      setHasClaimed(false);
    }, 7000);
  };

  const CookieReward = () => (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
    >
      <div className="relative bg-[#050816]/95 backdrop-blur-2xl border-2 border-primary p-8 md:p-12 rounded-3xl shadow-[0_0_100px_hsl(var(--primary)/0.5)] text-center w-full max-w-sm md:min-w-[400px] pointer-events-auto">
        <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-20 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ y: -20, x: Math.random() * 300 - 150 }}
              animate={{ 
                y: 400, 
                rotate: 360,
                x: (Math.random() * 300 - 150) + (Math.random() * 100 - 50)
              }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear" }}
            >
              🍪
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-6xl md:text-8xl mb-6"
          >
            🍪
          </motion.div>
          <h3 className="text-primary text-2xl md:text-4xl font-black mb-2 tracking-tighter uppercase italic">
            {hasClaimed ? "REWARD INJECTED" : "DATA DECRYPTED"}
          </h3>
          <p className="text-primary/70 text-sm md:text-lg font-mono mb-8">
            {hasClaimed 
              ? "[+] 1x COOKIE ADDED TO SYSTEM STORAGE" 
              : "[+] EXPLOIT SUCCESSFUL. ENJOY YOUR REWARD."}
          </p>
          
          <AnimatePresence mode="wait">
            {!hasClaimed ? (
              <motion.button
                key="claim-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={claimCookie}
                className="bg-primary text-background px-6 py-3 md:px-8 md:py-3 rounded font-black text-lg md:text-xl hover:scale-110 transition-transform shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
              >
                CLAIM_REWARD.exe
              </motion.button>
            ) : (
              <motion.div
                key="success-msg"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="text-primary font-bold flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span>LOCAL_STORAGE UPDATED</span>
                </div>
                <p className="text-[10px] text-primary/40 uppercase tracking-[0.2em] animate-pulse">
                  System Note: There's still a secret button in the bottom right corner...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <div className="w-2 h-2 bg-primary rounded-full animate-ping [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-ping [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <TerminalOverlay isOpen={showTerminal} onClose={() => setShowTerminal(false)} />

      <AnimatePresence>
        {showCookie && <CookieReward />}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && <KonamiHint />}
      </AnimatePresence>

      <AnimatePresence>
        {showSecretButton && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              boxShadow: ["0 0 20px rgba(0,255,158,0.3)", "0 0 50px rgba(0,255,158,0.6)", "0 0 20px rgba(0,255,158,0.3)"]
            }}
            exit={{ y: 100, opacity: 0 }}
            whileHover={{ 
              scale: 1.1, 
              skew: [-1, 1, -1],
              transition: { repeat: Infinity, duration: 0.1 }
            }}
            onClick={() => setShowHint(!showHint)}
            className="fixed bottom-8 right-8 bg-black border-2 border-primary text-primary px-8 py-4 rounded-lg font-mono font-bold cursor-pointer z-[9999] group overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 group-hover:translate-x-full transition-transform duration-500" />
            <div className="relative flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span className="tracking-tighter uppercase italic">GET_HINT.txt</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            
            {/* Glitch Decorative Lines */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/50" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary/50" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
