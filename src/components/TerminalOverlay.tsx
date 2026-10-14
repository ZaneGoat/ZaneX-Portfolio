import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, CornerDownLeft, ExternalLink } from "lucide-react";
import { systemSpecs, projectsData, skillsData, terminalCommandsHelp } from "@/data/portfolio";
import { sound } from "@/lib/sound";

interface TerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBreach?: () => void;
  onOpenMatrixTakeover?: () => void;
}

interface LogEntry {
  type: "input" | "output" | "error" | "system";
  content: string | JSX.Element;
}

const FORTUNES = [
  "\"There is no spoon.\" – The Matrix",
  "\"The quieter you become, the more you are able to hear.\" – Kali Linux Motto",
  "\"Control is an illusion. We are just steering the chaos.\" – Mr. Robot",
  "\"Hardware doesn't lie. Exit code 0 is the only truth.\" – Zane Goat",
  "\"Automate the repetitive. Engineer the creative. Protect the architecture.\"",
  "\"Talk is cheap. Show me the code.\" – Linus Torvalds"
];

export const TerminalOverlay = ({ isOpen, onClose, onOpenBreach, onOpenMatrixTakeover }: TerminalOverlayProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      sound.playBoot();
      if (logs.length === 0) {
        setLogs([
          {
            type: "system",
            content: (
              <div className="text-primary/70 mb-2">
                <p>ZaneOS Kernel v4.2.0-kali [x86_64] authenticated.</p>
                <p>Welcome, Operator. Type <span className="text-primary font-bold">help</span> to view available system routines.</p>
              </div>
            )
          }
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    sound.playClick();
    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").trim().toLowerCase();

    const newLogs: LogEntry[] = [
      ...logs,
      { type: "input", content: `zane@kali-box:~$ ${trimmed}` }
    ];

    switch (cmd) {
      case "help":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-1.5 my-2">
              <p className="text-primary font-bold mb-2">=== AVAILABLE ZANE_OS ROUTINES ===</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {terminalCommandsHelp.map(item => (
                  <div key={item.cmd} className="flex gap-2">
                    <span className="text-primary font-bold w-24 shrink-0">{item.cmd}</span>
                    <span className="text-muted-foreground text-[11px]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        });
        break;

      case "whoami":
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl my-2 space-y-1 text-xs font-mono">
              <p><span className="text-primary font-bold">OPERATOR:</span> {systemSpecs.realName} ({systemSpecs.handle})</p>
              <p><span className="text-primary font-bold">DESIGNATION:</span> {systemSpecs.role}</p>
              <p><span className="text-primary font-bold">CLEARANCE:</span> LEVEL 99 AUTHORIZED (Root Privilege)</p>
              <p><span className="text-primary font-bold">BASE LOCATION:</span> {systemSpecs.location}</p>
              <p><span className="text-primary font-bold">MAINFRAME:</span> {systemSpecs.os}</p>
            </div>
          )
        });
        break;

      case "neofetch":
        newLogs.push({
          type: "output",
          content: (
            <div className="flex flex-col sm:flex-row gap-6 my-3 font-mono">
              <pre className="text-primary font-bold text-xs leading-none shrink-0">
{`
   /\\_____/\\
  /  o   o  \\
 ( ==  ^  == )   ZANE_GOAT
  )         (    ----------
 (           )   KALI BOX
( (  )   (  ) )
(__(__)___(__)__)
`}
              </pre>
              <div className="space-y-1 text-xs">
                <p><span className="text-primary font-bold">User:</span> {systemSpecs.handle} ({systemSpecs.realName})</p>
                <p><span className="text-primary font-bold">Role:</span> {systemSpecs.role}</p>
                <p><span className="text-primary font-bold">OS:</span> {systemSpecs.os}</p>
                <p><span className="text-primary font-bold">Shell:</span> {systemSpecs.shell}</p>
                <p><span className="text-primary font-bold">Uptime:</span> {systemSpecs.uptime}</p>
                <p><span className="text-primary font-bold">Location:</span> {systemSpecs.location}</p>
                <div className="flex gap-1 pt-2">
                  <span className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span className="w-3 h-3 bg-yellow-500 rounded-sm" />
                  <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span className="w-3 h-3 bg-purple-500 rounded-sm" />
                  <span className="w-3 h-3 bg-cyan-500 rounded-sm" />
                </div>
              </div>
            </div>
          )
        });
        break;

      case "csi":
      case "radar":
        sound.playBoot();
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
              <p className="text-primary font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                [CSI_RADAR v1.4] WI-FI SUBCARRIER PHASE SENSING
              </p>
              <p className="text-muted-foreground text-[11px]">
                Extracting raw 802.11n/ac Channel State Information on <code>wlan0mon</code>...
              </p>
              <div className="p-2 bg-black/60 rounded border border-primary/20 text-primary/90 text-[11px] space-y-0.5">
                <p>• 64 OFDMA Subcarriers Normalized | SNR: 31.8 dB</p>
                <p>• Doppler Phase Velocity Shift: +3.8 Hz [MOTION DETECTED]</p>
                <p>• Presence Target Confidence: 99.1% (Single Subject at 2.1m)</p>
                <p>• Wall Penetration Attenuation: -4.2 dB [CLEAR SIGNAL]</p>
              </div>
              <p className="text-[11px] text-primary/70">
                Source Code: <a href="https://github.com/ZaneGoat/csi_project" target="_blank" rel="noopener noreferrer" className="underline font-bold text-primary">github.com/ZaneGoat/csi_project</a>
              </p>
            </div>
          )
        });
        break;

      case "robin":
      case "osint":
        sound.playBoot();
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-secondary/10 border border-secondary/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
              <p className="text-secondary font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                [ROBIN_OSINT v2.1] AI-POWERED DARK WEB RECON AGENT
              </p>
              <div className="p-2 bg-black/60 rounded border border-secondary/20 text-secondary/90 text-[11px] space-y-0.5">
                <p>• Tor SOCKS5 Proxy: 127.0.0.1:9050 [ACTIVE // 3-HOP RELAY]</p>
                <p>• Onion Crawler: Multi-threaded async scraper initialized</p>
                <p>• Threat Pipeline: PGP Key Extractor, Exposed Artifact Harvester</p>
                <p>• AI Engine: Local Ollama / DeepSeek Threat Synthesis Core</p>
              </div>
              <p className="text-[11px] text-secondary/70">
                Source Code: <a href="https://github.com/ZaneGoat/robin" target="_blank" rel="noopener noreferrer" className="underline font-bold text-secondary">github.com/ZaneGoat/robin</a>
              </p>
            </div>
          )
        });
        break;

      case "hardware":
      case "ec":
      case "megacenter":
        sound.playBoot();
        newLogs.push({
          type: "output",
          content: (
            <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-xl my-2 space-y-2 text-xs font-mono">
              <p className="text-primary font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                [ZANE_MEGA_CENTER] EMBEDDED CONTROLLER (EC) TELEMETRY
              </p>
              <div className="p-2 bg-black/60 rounded border border-primary/20 text-primary/90 text-[11px] space-y-0.5">
                <p>• Host Machine: MSI GF65 Thin (MS-16W1) [Dual-Boot Kali]</p>
                <p>• CPU Temp: 52°C | Fan 1: 4200 RPM (Custom Curve)</p>
                <p>• GPU Temp: 46°C | Fan 2: 3900 RPM (Active ISW Override)</p>
                <p>• EC Port 0x68/0x6C: Direct Register I/O Verified [NO STALLS]</p>
                <p>• Thermal Throttling: BYPASSED via Dynamic EC Governor</p>
              </div>
              <p className="text-[11px] text-primary/70">
                Source Code: <a href="https://github.com/ZaneGoat/ZaneMegaCenter" target="_blank" rel="noopener noreferrer" className="underline font-bold text-primary">github.com/ZaneGoat/ZaneMegaCenter</a>
              </p>
            </div>
          )
        });
        break;

      case "fortune":
      case "quote":
        const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        newLogs.push({
          type: "output",
          content: <p className="italic text-primary/90 my-2">"{quote}"</p>
        });
        break;

      case "cowsay":
        const cowMsg = arg || "ZaneOS: Breaking Things & Fixing Them!";
        const borderLine = "-".repeat(cowMsg.length + 2);
        newLogs.push({
          type: "output",
          content: (
            <pre className="text-primary text-xs leading-none my-2 font-mono">
{`  ${borderLine}
< ${cowMsg} >
  ${borderLine}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
            </pre>
          )
        });
        break;

      case "ping":
        const targetHost = arg || "kali.box";
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-0.5 my-1 text-xs font-mono text-primary/90">
              <p>PING {targetHost} (127.0.0.1) 56(84) bytes of data.</p>
              <p>64 bytes from {targetHost}: icmp_seq=1 ttl=64 time=0.042 ms</p>
              <p>64 bytes from {targetHost}: icmp_seq=2 ttl=64 time=0.038 ms</p>
              <p>64 bytes from {targetHost}: icmp_seq=3 ttl=64 time=0.045 ms</p>
              <p>--- {targetHost} ping statistics: 3 packets transmitted, 0% packet loss ---</p>
            </div>
          )
        });
        break;

      case "skills":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-3 my-2">
              {skillsData.map(cat => (
                <div key={cat.title} className="border-l-2 border-primary/40 pl-3">
                  <p className="text-primary font-bold text-sm">{cat.title}</p>
                  <p className="text-muted-foreground text-xs mb-1">{cat.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map(s => (
                      <span key={s.name} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {s.name} ({s.tag})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        });
        break;

      case "projects":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-2 my-2">
              <p className="text-primary font-bold">=== DEPLOYED & ACTIVE REPOSITORIES ===</p>
              {projectsData.map(p => (
                <div key={p.id} className="text-xs py-1.5 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="text-primary font-bold">[{p.category}]</span>{" "}
                      <span className="text-foreground font-bold">{p.title}</span>
                    </span>
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-[11px] font-bold">
                        [GITHUB REPO]
                      </a>
                    )}
                  </div>
                  <p className="text-muted-foreground text-[11px]">{p.subtitle}</p>
                  <div className="text-[10px] text-primary/60 mt-0.5">
                    ID: <code>{p.id}</code> | inspect: <code>cat {p.id}</code> | open: <code>repo {p.id}</code>
                  </div>
                </div>
              ))}
            </div>
          )
        });
        break;

      case "cat":
        const target = projectsData.find(p => p.id === arg || p.title.toLowerCase().includes(arg));
        if (target) {
          newLogs.push({
            type: "output",
            content: (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 my-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-primary font-bold text-sm">ARCHITECTURAL INSPECT: {target.title}</p>
                  {target.github && (
                    <a href={target.github} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs font-bold flex items-center gap-1">
                      <span>GITHUB</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-muted-foreground">{target.description}</p>
                <p className="text-primary font-bold mt-2">TECHNICAL HIGHLIGHTS:</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  {target.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )
          });
        } else {
          newLogs.push({
            type: "error",
            content: `cat: ${arg || "file"}: No such project file. Type 'projects' to list valid IDs.`
          });
        }
        break;

      case "repo":
        const repoTarget = projectsData.find(p => p.id === arg || p.title.toLowerCase().includes(arg));
        if (repoTarget && repoTarget.github) {
          window.open(repoTarget.github, "_blank");
          newLogs.push({
            type: "output",
            content: `Opening repository: ${repoTarget.github}...`
          });
        } else {
          newLogs.push({
            type: "error",
            content: `repo: ${arg || "id"}: Repository not found. Type 'projects' to see list.`
          });
        }
        break;

      case "theme":
        if (arg === "amber" || arg === "cyan") {
          document.documentElement.setAttribute("data-theme", arg);
          localStorage.setItem("zanex_theme", arg);
          sound.playSuccess();
          newLogs.push({ type: "output", content: `Theme updated to Cyberpunk ${arg.toUpperCase()}.` });
        } else if (arg === "emerald" || arg === "matrix" || arg === "default") {
          document.documentElement.removeAttribute("data-theme");
          localStorage.setItem("zanex_theme", "emerald");
          sound.playSuccess();
          newLogs.push({ type: "output", content: `Theme updated to Matrix EMERALD.` });
        } else {
          newLogs.push({ type: "error", content: "Usage: theme [emerald | amber | cyan]" });
        }
        break;

      case "breach":
        onClose();
        if (onOpenBreach) onOpenBreach();
        break;

      case "matrix":
      case "construct":
        onClose();
        if (onOpenMatrixTakeover) onOpenMatrixTakeover();
        break;

      case "time":
      case "date":
        newLogs.push({
          type: "output",
          content: `Local Time (Morocco GMT+1): ${new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" })}`
        });
        break;

      case "history":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-0.5 text-xs text-primary/80 font-mono my-1">
              {history.map((h, i) => (
                <div key={i}>{i + 1}  {h}</div>
              ))}
            </div>
          )
        });
        break;

      case "clear":
        setLogs([]);
        setInput("");
        return;

      case "sudo":
        sound.playError();
        newLogs.push({
          type: "error",
          content: "Permission Denied: Incident will be reported to santa."
        });
        break;

      case "exit":
        onClose();
        return;

      default:
        sound.playError();
        newLogs.push({
          type: "error",
          content: `Command not recognized: '${trimmed}'. Type 'help' for manual.`
        });
    }

    setLogs(newLogs);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sound.playKeypress();
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInput(history[history.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[history.length - 1 - nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  const quickChips = [
    "help", "neofetch", "whoami", "csi", "robin", "hardware", 
    "projects", "fortune", "breach", "matrix", "clear"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-background/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={`bg-[#050816] border-2 border-primary/50 rounded-2xl shadow-[0_0_80px_hsl(var(--primary)/0.25)] flex flex-col font-mono overflow-hidden transition-all duration-300 ${
              isMaximized ? "w-full h-full rounded-none" : "w-full max-w-4xl h-[85vh] max-h-[820px]"
            }`}
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <TerminalIcon className="w-4 h-4" />
                <span>ZANE_OS Shell :: Root v4.2 [Kali Linux Edition]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 hover:text-primary transition-colors text-primary/60"
                  title="Maximize"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-red-400 transition-colors text-primary/60"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2 text-xs md:text-sm custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className={log.type === "error" ? "text-red-400" : log.type === "input" ? "text-primary/90 font-bold" : "text-foreground/90"}>
                  {log.content}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Mobile / Touch Quick Chips */}
            <div className="px-4 py-2 bg-primary/5 border-t border-primary/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-primary/50 font-bold shrink-0">QUICK:</span>
              {quickChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleCommand(chip)}
                  className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 active:scale-95 text-primary rounded text-[11px] font-bold shrink-0 transition-all border border-primary/20"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-black/50 border-t border-primary/20 flex items-center gap-2">
              <span className="text-primary font-bold text-xs shrink-0">zane@kali:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type command (e.g. 'csi', 'robin', 'hardware', 'whoami', 'fortune', 'help')..."
                className="flex-1 bg-transparent text-primary text-xs md:text-sm outline-none font-mono placeholder:text-primary/30"
                autoFocus
              />
              <button
                onClick={() => handleCommand(input)}
                className="p-1.5 bg-primary text-background rounded hover:scale-105 active:scale-95 transition-all text-xs font-bold"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
