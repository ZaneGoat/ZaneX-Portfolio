import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MatrixRain } from "../components/MatrixRain";
import { Terminal, ShieldAlert, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Unauthorized access attempt to:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#0a0e27] font-mono text-primary">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <MatrixRain />
      </div>
      
      {/* Content Layer */}
      <div className="container relative z-10 px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/80 backdrop-blur-xl border-2 border-primary/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,255,158,0.3)] relative"
        >
          {/* Status Header */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-background px-6 py-1 rounded-full font-bold flex items-center gap-2 animate-pulse z-20 shadow-[0_0_20px_hsl(var(--primary))]">
            <ShieldAlert className="w-4 h-4" />
            <span className="tracking-widest">ACCESS DENIED</span>
          </div>

          <div className="space-y-8 text-center mt-4">
            {/* Error Code */}
            <motion.div
              animate={{ 
                textShadow: ["0 0 20px rgba(0,255,158,0.5)", "0 0 40px rgba(0,255,158,0.8)", "0 0 20px rgba(0,255,158,0.5)"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl md:text-9xl font-black italic tracking-tighter"
            >
              404
            </motion.div>

            {/* Error Message */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                [SYSTEM ERROR]: DATA_NULL
              </h2>
              
              <div className="p-5 bg-[#050816] border border-primary/30 rounded-lg text-left overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-primary/70 text-sm border-b border-primary/10 pb-2">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold">terminal@zane:~$</span>
                  <span className="animate-pulse">locate {location.pathname}</span>
                </div>
                <div className="text-muted-foreground text-sm leading-relaxed font-mono">
                  <p className="text-red-400 mb-1">FATAL: Path resolution failed.</p>
                  <p>The requested data segment is corrupted, encrypted, or moved to a higher security clearance level.</p>
                </div>
              </div>

              <div className="py-4 text-primary/60 text-sm uppercase tracking-widest font-bold">
                Follow the trail: <span className="text-primary animate-pulse">@zane_goats4s</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="group relative flex items-center justify-center gap-3 w-full py-5 bg-primary text-background font-black rounded-lg hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,255,158,0.4)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <ArrowLeft className="w-6 h-6 relative z-10" />
                <span className="text-xl relative z-10 uppercase tracking-tighter">Initiate Recovery (Home)</span>
              </Link>
              
              <p className="text-[10px] text-muted-foreground/50 uppercase font-bold tracking-widest">
                Hint: 20 clicks unlock the path to the real secrets.
              </p>
            </div>
          </div>

          {/* Glitch Decorative Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
