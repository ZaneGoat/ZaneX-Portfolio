import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Radio,
  Shield,
  Terminal,
  ExternalLink,
  X,
  Server,
  Zap,
  Lock,
  Layers,
  Activity
} from "lucide-react";
import { sound } from "@/lib/sound";

interface RobinThreatMapProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal?: () => void;
}

interface TorNode {
  id: string;
  name: string;
  type: "ORIGIN" | "GUARD" | "MIDDLE" | "EXIT" | "TARGET";
  coords: [number, number]; // Normalized [x: 0..1, y: 0..1] on map
  ip: string;
  bandwidth: string;
  latency: string;
  status: "ACTIVE" | "VERIFIED" | "CRAWLING";
  intelCount: number;
  onionAddress?: string;
}

const TOR_NODES: TorNode[] = [
  {
    id: "casa",
    name: "Casablanca [Zane Base]",
    type: "ORIGIN",
    coords: [0.44, 0.44],
    ip: "127.0.0.1:9050 (Kali Rig)",
    bandwidth: "Local SOCKS5 Ingress",
    latency: "0.2 ms",
    status: "ACTIVE",
    intelCount: 384
  },
  {
    id: "fra",
    name: "Frankfurt Guard Relay",
    type: "GUARD",
    coords: [0.51, 0.33],
    ip: "185.220.101.44:443",
    bandwidth: "85.2 MB/s",
    latency: "28 ms",
    status: "VERIFIED",
    intelCount: 1240
  },
  {
    id: "reyk",
    name: "Reykjavik Middle Node",
    type: "MIDDLE",
    coords: [0.42, 0.22],
    ip: "193.106.191.12:9001",
    bandwidth: "42.0 MB/s",
    latency: "44 ms",
    status: "VERIFIED",
    intelCount: 890
  },
  {
    id: "zrh",
    name: "Zurich Bulletproof Exit",
    type: "EXIT",
    coords: [0.52, 0.36],
    ip: "45.154.255.88:80",
    bandwidth: "68.4 MB/s",
    latency: "35 ms",
    status: "ACTIVE",
    intelCount: 2450
  },
  {
    id: "tky",
    name: "Tokyo Dark Onion Target",
    type: "TARGET",
    coords: [0.84, 0.42],
    ip: "dread6x...onion",
    bandwidth: "Encrypted Onion v3",
    latency: "186 ms",
    status: "CRAWLING",
    intelCount: 612,
    onionAddress: "dread6xbbv7prmdn...onion"
  },
  {
    id: "sao",
    name: "São Paulo Leaked Archive",
    type: "TARGET",
    coords: [0.33, 0.74],
    ip: "breachv4...onion",
    bandwidth: "Encrypted Onion v3",
    latency: "142 ms",
    status: "CRAWLING",
    intelCount: 940,
    onionAddress: "breachv4archive...onion"
  }
];

const CIRCUIT_EDGES: [string, string][] = [
  ["casa", "fra"],
  ["fra", "reyk"],
  ["reyk", "zrh"],
  ["zrh", "tky"],
  ["zrh", "sao"]
];

const INITIAL_LOGS = [
  "[TOR SOCKS5] Multi-threaded proxy daemon online on 127.0.0.1:9050",
  "[CIRCUIT BUILD] Ingress: Casablanca -> Guard: Frankfurt (Hop 1 OK)",
  "[CIRCUIT BUILD] Middle: Reykjavik -> Exit: Zurich (AES-256 Multi-layer Handshake)",
  "[ROBIN HARVESTER] Active crawler dispatched to dread6x...onion",
  "[AI ENGINE] Local Ollama / DeepSeek pipeline ingesting raw PGP keys"
];

export const RobinThreatMap = ({
  isOpen,
  onClose,
  onOpenTerminal
}: RobinThreatMapProps) => {
  const [selectedNode, setSelectedNode] = useState<TorNode>(TOR_NODES[0]);
  const [logs, setLogs] = useState<string[]>(INITIAL_LOGS);
  const [isRotatingCircuit, setIsRotatingCircuit] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Periodic log stream generator
  useEffect(() => {
    if (!isOpen) return;
    const streamItems = [
      "[INTERCEPT 0x9F] Extracted PGP fingerprint: 4A7F 12B8 D902 C41E",
      "[ROBIN CRAWLER] Discovered 16 hidden service mirror nodes",
      "[CIRCUIT HEARTBEAT] Hop 3 (Zurich Exit) latency stable at 35ms",
      "[EXPLOIT INDEX] 2 zero-day PoC signatures parsed from dark repo",
      "[SOCKS5 ROTATION] Scraped leak payload verified: SHA-256 match",
      "[OLLAMA THREAT CORE] Summarized threat actor forum post in 420ms"
    ];

    const interval = setInterval(() => {
      const nextLog = streamItems[Math.floor(Math.random() * streamItems.length)];
      setLogs(prev => [nextLog, ...prev.slice(0, 7)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Canvas render loop for world map grid & animated circuit arcs
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    let packetT = 0;

    const render = () => {
      packetT = (packetT + 0.008) % 1;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Background
          ctx.fillStyle = "#050914";
          ctx.fillRect(0, 0, w, h);

          // Digital World Grid Lines (Latitude & Longitude)
          ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
          ctx.lineWidth = 1;

          // Lat lines
          for (let y = 0; y < h; y += 24) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }
          // Long lines
          for (let x = 0; x < w; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }

          // Simplified world continent dots (Cyberpunk stippled landmasses)
          ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
          // Africa/Europe
          ctx.fillRect(w * 0.42, h * 0.28, w * 0.14, h * 0.45);
          // Americas
          ctx.fillRect(w * 0.18, h * 0.22, w * 0.18, h * 0.58);
          // Asia/Oceania
          ctx.fillRect(w * 0.62, h * 0.24, w * 0.26, h * 0.48);

          // Draw Circuit Arcs between nodes
          CIRCUIT_EDGES.forEach(([fromId, toId]) => {
            const from = TOR_NODES.find(n => n.id === fromId);
            const to = TOR_NODES.find(n => n.id === toId);
            if (!from || !to) return;

            const x1 = from.coords[0] * w;
            const y1 = from.coords[1] * h;
            const x2 = to.coords[0] * w;
            const y2 = to.coords[1] * h;

            // Curved arc control point
            const midX = (x1 + x2) / 2;
            const midY = Math.min(y1, y2) - 35;

            // Base glowing arc line
            ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(midX, midY, x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Animated packet traveling along quadratic bezier
            const t = packetT;
            const qx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            const qy = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(qx, qy, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
            ctx.beginPath();
            ctx.arc(qx, qy, 6, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Nodes
          TOR_NODES.forEach(node => {
            const nx = node.coords[0] * w;
            const ny = node.coords[1] * h;
            const isSelected = selectedNode.id === node.id;

            // Halo ring
            ctx.strokeStyle = isSelected
              ? "#ff007f"
              : node.type === "TARGET"
              ? "rgba(255, 0, 127, 0.5)"
              : "rgba(0, 229, 255, 0.6)";
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.arc(nx, ny, isSelected ? 9 : 6, 0, Math.PI * 2);
            ctx.stroke();

            // Core
            ctx.fillStyle = isSelected
              ? "#ffffff"
              : node.type === "TARGET"
              ? "#ff007f"
              : "#00e5ff";
            ctx.beginPath();
            ctx.arc(nx, ny, isSelected ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
            ctx.font = isSelected ? "bold 10px monospace" : "9px monospace";
            ctx.fillText(node.name.split(" ")[0], nx + 10, ny - 4);
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedNode]);

  const rotateTorCircuit = () => {
    setIsRotatingCircuit(true);
    sound.playBoot();
    sound.haptic([30, 40, 60]);

    setTimeout(() => {
      setIsRotatingCircuit(false);
      setLogs(prev => [
        `[TOR NEWNYM] Signal NEWNYM sent -> 3-hop circuit refreshed at ${new Date().toLocaleTimeString()}`,
        ...prev
      ]);
      sound.playSuccess();
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10006] bg-background/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 font-mono select-none"
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            className="w-full max-w-5xl bg-[#030611] border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_90px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden max-h-[94vh]"
          >
            {/* Top Bar */}
            <div className="bg-cyan-950/40 border-b border-cyan-500/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-cyan-300 flex items-center gap-2">
                    ROBIN_OSINT // TOR DARK WEB THREAT MAP
                    <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-300">
                      SOCKS5 LIVE
                    </span>
                  </h3>
                  <p className="text-[10px] text-cyan-400/60 hidden sm:inline">
                    Multi-hop onion crawler, PGP artifact harvester, local AI threat synthesis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={rotateTorCircuit}
                  disabled={isRotatingCircuit}
                  className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Radio className={`w-3.5 h-3.5 ${isRotatingCircuit ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">ROTATE CIRCUIT</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1 hover:text-red-400 text-cyan-400/60 transition-colors"
                  title="Close Threat Map"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto custom-scrollbar">
              {/* Threat Map Canvas (8 cols) */}
              <div className="lg:col-span-8 flex flex-col space-y-3">
                <div className="relative w-full aspect-[16/9] bg-black/90 rounded-xl border border-cyan-500/40 overflow-hidden shadow-[inset_0_0_35px_rgba(0,229,255,0.15)]">
                  <canvas
                    ref={canvasRef}
                    width={720}
                    height={405}
                    className="w-full h-full cursor-pointer"
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const xNorm = (e.clientX - rect.left) / rect.width;
                      const yNorm = (e.clientY - rect.top) / rect.height;

                      // Find closest node
                      let closest = TOR_NODES[0];
                      let minDist = Infinity;
                      TOR_NODES.forEach(node => {
                        const dx = node.coords[0] - xNorm;
                        const dy = node.coords[1] - yNorm;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < minDist) {
                          minDist = d;
                          closest = node;
                        }
                      });

                      if (minDist < 0.12) {
                        setSelectedNode(closest);
                        sound.playClick();
                        sound.haptic(20);
                      }
                    }}
                  />

                  {/* Corner Overlay info */}
                  <div className="absolute top-2 left-2 pointer-events-none bg-black/70 border border-cyan-500/30 px-2.5 py-1 rounded text-[10px] text-cyan-300">
                    Active Circuit: <span className="text-white font-bold">Casablanca → Frankfurt → Reykjavik → Zurich</span>
                  </div>

                  <div className="absolute bottom-2 right-2 pointer-events-none bg-black/70 border border-cyan-500/30 px-2 py-0.5 rounded text-[9px] text-cyan-400/70">
                    Click node circles on map to inspect relay telemetry
                  </div>
                </div>

                {/* Live Threat Intelligence Log Ticker */}
                <div className="bg-black/60 border border-cyan-500/25 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-cyan-400 animate-pulse" /> Live Telemetry Feed
                    </span>
                    <span className="text-[9px] text-cyan-400/60 font-mono">ENCRYPTED STREAM</span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-cyan-200/90 max-h-24 overflow-y-auto custom-scrollbar">
                    {logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-500 shrink-0">▸</span>
                        <span className={idx === 0 ? "text-cyan-300 font-bold" : "text-muted-foreground"}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Node Inspector & Specs (4 cols) */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <span className="text-xs text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-cyan-400" /> Relay Inspector
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {selectedNode.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-0.5">{selectedNode.name}</h4>
                    <p className="text-xs text-cyan-400/80 font-mono">{selectedNode.ip}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded bg-black/50 border border-cyan-500/20">
                      <span className="text-cyan-400/70">Hop Latency:</span>
                      <span className="font-bold text-cyan-300">{selectedNode.latency}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded bg-black/50 border border-cyan-500/20">
                      <span className="text-cyan-400/70">Bandwidth:</span>
                      <span className="font-bold text-cyan-300">{selectedNode.bandwidth}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded bg-black/50 border border-cyan-500/20">
                      <span className="text-cyan-400/70">Scraped Artifacts:</span>
                      <span className="font-bold text-cyan-300">{selectedNode.intelCount} artifacts</span>
                    </div>

                    <div className="flex justify-between p-2 rounded bg-black/50 border border-cyan-500/20">
                      <span className="text-cyan-400/70">Relay State:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {selectedNode.status}
                      </span>
                    </div>
                  </div>

                  {selectedNode.onionAddress && (
                    <div className="p-2.5 rounded bg-pink-950/20 border border-pink-500/30 text-[11px] text-pink-300">
                      <span className="block text-[9px] text-pink-400/80 font-bold uppercase mb-0.5">TARGET ONION V3:</span>
                      <code className="text-pink-200 break-all">{selectedNode.onionAddress}</code>
                    </div>
                  )}
                </div>

                {/* Node Quick Switcher */}
                <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-3">
                  <span className="text-[10px] text-cyan-400/70 block uppercase font-bold mb-2">
                    SELECT CIRCUIT RELAY:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TOR_NODES.map(node => (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelectedNode(node);
                          sound.playClick();
                          sound.haptic(15);
                        }}
                        className={`px-2 py-1.5 rounded text-[10px] text-left font-bold transition-all border ${
                          selectedNode.id === node.id
                            ? "bg-cyan-500 text-black border-cyan-400"
                            : "bg-cyan-950/30 text-cyan-300/80 border-cyan-500/20 hover:border-cyan-500/40"
                        }`}
                      >
                        {node.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-cyan-950/30 border-t border-cyan-500/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-cyan-400/70 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Robin Architecture: Async Tor Engine + Ollama DeepSeek Synthesis Core
              </span>

              <a
                href="https://github.com/ZaneGoat/robin"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
              >
                <span>OPEN GITHUB REPO</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
