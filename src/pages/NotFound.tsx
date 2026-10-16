import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MatrixRain } from "../components/MatrixRain";
import { Terminal, ShieldAlert, ArrowLeft } from "lucide-react";
import { sound } from "@/lib/sound";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    sound.playError();
    console.error("404 Error: Unauthorized access attempt to:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#050816] font-mono text-primary px-4">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <MatrixRain />
      </div>
      <div className="scanlines fixed inset-0 pointer-events-none z-10 opacity-40" />

      {/* Content Layer */}
      <div className="container relative z-20 max-w-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/90 backdrop-blur-2xl border-2 border-primary/50 p-6 sm:p-10 rounded-2xl shadow-[0_0_60px_rgba(0,255,158,0.3)] relative text-center"
        >
          {/* Status Header */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full text-xs font-bold uppercase mb-6 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>404 // DATA_SEGMENT_NULL</span>
          </div>

          <motion.div
            animate={{
              textShadow: [
                "0 0 20px rgba(0,255,158,0.5)",
                "0 0 40px rgba(0,255,158,0.8)",
                "0 0 20px rgba(0,255,158,0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl sm:text-9xl font-black italic tracking-tighter mb-4 text-primary"
          >
            404
          </motion.div>

          <div className="p-4 bg-black/60 border border-primary/20 rounded-xl text-left text-xs mb-6 font-mono space-y-1">
            <div className="flex items-center gap-2 text-primary/70 border-b border-primary/10 pb-1.5 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>kernel@zane:~$ locate {location.pathname}</span>
            </div>
            <p className="text-red-400">FATAL: Path resolution failed.</p>
            <p className="text-muted-foreground">The requested memory block does not exist or requires Level 99 authorization.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => sound.playClick()}
              className="group relative flex items-center justify-center gap-2 w-full py-4 bg-primary text-background font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,158,0.4)]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-base uppercase tracking-wider">RETURN TO MAINFRAME</span>
            </Link>

            <p className="text-[11px] text-primary/60 font-mono mt-2">
              Hint: 15 taps trigger the speed-click exploit, 40 taps reveal root memo.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
