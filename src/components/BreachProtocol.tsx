import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, X, Trophy, CheckCircle, RotateCcw } from "lucide-react";
import { sound } from "@/lib/sound";

interface BreachProtocolProps {
  isOpen: boolean;
  onClose: () => void;
}

const HEX_POOL = ["1C", "55", "BD", "E9", "7A"];

export const BreachProtocol = ({ isOpen, onClose }: BreachProtocolProps) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetSeq, setTargetSeq] = useState<string[]>([]);
  const [buffer, setBuffer] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [activeRow, setActiveRow] = useState<number | null>(0); // Start on Row 0
  const [activeCol, setActiveCol] = useState<number | null>(null);
  const [timer, setTimer] = useState(35);
  const [isWon, setIsWon] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const initGame = () => {
    // Generate 5x5 Matrix
    const newGrid: string[][] = [];
    for (let r = 0; r < 5; r++) {
      const row: string[] = [];
      for (let c = 0; c < 5; c++) {
        row.push(HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
      }
      newGrid.push(row);
    }
    setGrid(newGrid);

    // Pick random target sequence of length 3
    const seq: string[] = [];
    for (let i = 0; i < 3; i++) {
      seq.push(HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
    }
    setTargetSeq(seq);

    setBuffer([]);
    setSelectedCells([]);
    setActiveRow(0); // Starts restricted to first row
    setActiveCol(null);
    setTimer(35);
    setIsWon(false);
    setIsFailed(false);
  };

  useEffect(() => {
    if (isOpen) {
      initGame();
      sound.playBoot();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isWon || isFailed) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          setIsFailed(true);
          sound.playError();
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isWon, isFailed]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon || isFailed) return;

    // Must match active row or active column
    if (activeRow !== null && r !== activeRow) return;
    if (activeCol !== null && c !== activeCol) return;

    // Cannot click already selected cell
    if (selectedCells.some(cell => cell.r === r && cell.c === c)) return;

    sound.playClick();
    sound.haptic(25);
    const val = grid[r][c];
    const newBuffer = [...buffer, val];
    setBuffer(newBuffer);
    setSelectedCells([...selectedCells, { r, c }]);

    // Alternate: If row was active, next turn column is active. If column was active, next turn row is active.
    if (activeRow !== null) {
      setActiveRow(null);
      setActiveCol(c);
    } else {
      setActiveRow(r);
      setActiveCol(null);
    }

    // Check Win Condition (does buffer contain target sequence?)
    const bufferStr = newBuffer.join(",");
    const targetStr = targetSeq.join(",");
    if (bufferStr.includes(targetStr)) {
      setIsWon(true);
      sound.playSuccess();
      sound.haptic([50, 40, 80, 40, 140]);
    } else if (newBuffer.length >= 6) {
      // Buffer capacity exceeded without matching
      setIsFailed(true);
      sound.playError();
      sound.haptic([120, 50, 120]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10002] bg-background/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-[#050816] border-2 border-secondary/60 rounded-2xl shadow-[0_0_100px_hsl(var(--secondary)/0.3)] p-6 font-mono relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-secondary/30 pb-4 mb-6">
              <div className="flex items-center gap-2 text-secondary">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span className="font-bold text-sm tracking-widest uppercase">BREACH_PROTOCOL.exe</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-sm font-bold ${timer <= 10 ? "text-red-400 animate-ping" : "text-secondary"}`}>
                  TIME: {timer}s
                </div>
                <button onClick={onClose} className="text-secondary/60 hover:text-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Target Sequence & Buffer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl">
                <span className="text-xs text-secondary/70 block mb-1">TARGET SEQUENCE:</span>
                <div className="flex gap-2">
                  {targetSeq.map((hex, i) => (
                    <span key={i} className="px-3 py-1 bg-secondary text-background font-black rounded text-sm">
                      {hex}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl">
                <span className="text-xs text-secondary/70 block mb-1">BUFFER MEMORY ({buffer.length}/6):</span>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-8 h-7 flex items-center justify-center font-bold text-xs rounded border ${
                        buffer[i] ? "border-secondary text-secondary bg-secondary/20" : "border-secondary/20 text-secondary/30"
                      }`}
                    >
                      {buffer[i] || "--"}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 5x5 Hex Matrix */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 max-w-sm mx-auto mb-6">
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
                  const isSelectable = (activeRow === r || activeCol === c) && !isSelected && !isWon && !isFailed;
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      disabled={!isSelectable}
                      className={`h-11 sm:h-12 flex items-center justify-center font-bold text-sm rounded-lg transition-all touch-manipulation select-none ${
                        isSelected
                          ? "bg-secondary/20 text-secondary/30 border border-secondary/20 line-through cursor-not-allowed"
                          : isSelectable
                          ? "bg-secondary/20 border-2 border-secondary text-secondary hover:scale-105 active:scale-95 shadow-[0_0_15px_hsl(var(--secondary)/0.5)] animate-pulse cursor-pointer"
                          : "bg-black/40 border border-secondary/10 text-secondary/30 cursor-not-allowed"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })
              )}
            </div>

            {/* Status Footer */}
            {isWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-secondary/10 border border-secondary p-4 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-center gap-2 text-secondary font-bold text-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>BREACH SUCCESSFUL! ICE BYPASSED.</span>
                </div>
                <p className="text-xs text-secondary/80">Buffer match verified. Full authorization token granted.</p>
                <button
                  onClick={initGame}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-secondary text-background font-bold text-xs rounded hover:scale-105"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> REPLAY MATRIX
                </button>
              </motion.div>
            )}

            {isFailed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-red-500/10 border border-red-500/50 p-4 rounded-xl space-y-2"
              >
                <p className="text-red-400 font-bold text-sm">BREACH FAILED: BUFFER OVERFLOW OR TIMEOUT.</p>
                <button
                  onClick={initGame}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold text-xs rounded hover:scale-105"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> RETRY INTRUSION
                </button>
              </motion.div>
            )}

            {!isWon && !isFailed && (
              <p className="text-center text-[11px] text-secondary/50">
                Rule: Alternate clicking along the highlighted row or column to match target sequence.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
