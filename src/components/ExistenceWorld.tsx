import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { systemSpecsByPersona, contactLinks } from "@/data/portfolio";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { useMusic } from "@/context/MusicContext";
import { useGitHubRepos } from "@/services/github";
import { sound } from "@/lib/sound";

/**
 * EXISTENCE.EXE — game-style world map that replaces the card layout
 * when ASCII mode is active. Desktop renders a winding SVG node map;
 * phones render a crisp 2-column handheld zone deck right above the dialogue box.
 */

interface ExistenceWorldProps {
  inputEnabled: boolean;
  onOpenTerminal: () => void;
  onOpenBreach: () => void;
  onOpenCsi: () => void;
  onOpenCtf: () => void;
  onOpenMegaCenter: () => void;
  onOpenInfiltration: () => void;
}

interface ZoneAction {
  label: string;
  run?: () => void;
  href?: string;
}

interface Zone {
  id: string;
  glyph: string;
  name: string;
  shortName: string;
  tag: string;
  lore: string;
  actions: ZoneAction[];
}

const VISITED_KEY = "zanex_existence_visited";
const CELEBRATED_KEY = "zanex_existence_celebrated";

const DESKTOP_POS: [number, number][] = [
  [9, 68], [24, 30], [39, 70], [53, 28], [67, 70], [80, 30], [91, 66]
];

const CasablancaClock = () => {
  const fmt = () =>
    new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Casablanca", hour12: false });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setTime(fmt());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
};

export const ExistenceWorld: React.FC<ExistenceWorldProps> = ({
  inputEnabled,
  onOpenTerminal,
  onOpenBreach,
  onOpenCsi,
  onOpenCtf,
  onOpenMegaCenter,
  onOpenInfiltration
}) => {
  const { persona } = usePersona();
  const { clearance, clearanceLevel } = useOperatorClearance();
  const { isFullPlayerOpen, isMoodMenuOpen } = useMusic();
  const { repos } = useGitHubRepos();
  const dialogueRef = useRef<HTMLDivElement>(null);

  const specs = systemSpecsByPersona[persona] || systemSpecsByPersona.operator;
  const identityLocked = persona === "operator" && !clearance.identityUnlocked;

  const archiveRepos = useMemo(
    () =>
      repos
        .filter(r => !r.fork && r.name.toLowerCase() !== "robin")
        .slice(0, 6),
    [repos]
  );

  const zones: Zone[] = useMemo(
    () => [
      {
        id: "origin",
        glyph: "Ω",
        name: "ORIGIN",
        shortName: "ORIGIN",
        tag: identityLocked ? "LOCKED" : specs.handle,
        lore: identityLocked
          ? "Profile locked behind Node 01. Complete the security challenges or unlock via ZaneOS to read full profile."
          : `${specs.realName} — ${specs.role}. ${specs.bio}`,
        actions: identityLocked
          ? [
              { label: "UNLOCK", run: onOpenInfiltration },
              { label: "OPEN SHELL", run: onOpenTerminal }
            ]
          : [{ label: "OPEN SHELL", run: onOpenTerminal }]
      },
      {
        id: "megacenter",
        glyph: "∇",
        name: "ZANEMEGACENTER",
        shortName: "MEGA CENTER",
        tag: "EC GOVERNOR",
        lore: "Low-level Linux governor that interfaces directly with MSI Embedded Controller registers: custom fan curves, thermal telemetry, and hardware readback.",
        actions: [
          { label: "LAUNCH SIM", run: onOpenMegaCenter },
          { label: "SOURCE", href: "https://github.com/ZaneGoat/ZaneMegaCenter" }
        ]
      },
      {
        id: "csi",
        glyph: "Ψ",
        name: "CSI RADAR",
        shortName: "CSI RADAR",
        tag: "WI-FI SENSING",
        lore: "Raw 802.11 Channel State Information across 64 OFDM subcarriers turned into real-time Doppler motion sensing.",
        actions: [
          { label: "OPEN RADAR", run: onOpenCsi },
          { label: "SOURCE", href: "https://github.com/ZaneGoat/csi_project" }
        ]
      },
      {
        id: "controler",
        glyph: "◎",
        name: "CONTROLER-SPACE",
        shortName: "HID SUITE",
        tag: "1000HZ HID",
        lore: "Low-latency DualSense and USB HID gamepad calibration suite for dead-zone tuning, stick-drift diagnostics, and polling benchmarks.",
        actions: [{ label: "SOURCE", href: "https://github.com/ZaneGoat/Controler-space" }]
      },
      {
        id: "archive",
        glyph: "∞",
        name: "ARCHIVE",
        shortName: "REPOS",
        tag: `${archiveRepos.length} REPOS`,
        lore: "Live-synced open-source repositories from github.com/ZaneGoat, with flagship hardware projects pinned first.",
        actions: [{ label: "ALL REPOS", href: "https://github.com/ZaneGoat?tab=repositories" }]
      },
      {
        id: "arena",
        glyph: "Δ",
        name: "ARENA",
        shortName: "ARENA",
        tag: "BREACH · WIP GAME",
        lore: "Solve the timed 5x5 hex matrix puzzle in Breach Protocol, hunt the three CTF flags, or wait on the full standalone game currently in production — it will take time, if I'm still alive.",
        actions: [
          { label: "BREACH ICE", run: onOpenBreach },
          { label: "CTF BOARD", run: onOpenCtf }
        ]
      },
      {
        id: "comms",
        glyph: "λ",
        name: "COMMS & PLANS",
        shortName: "CONTACT & PLANS",
        tag: "$199–$899/MO",
        lore: "Monthly retainers ($199.98 / $449.98 / $899.98 per month) for ongoing maintenance, custom ERP development, and dedicated Linux/systems engineering.",
        actions: [
          { label: "EMAIL ZANE", href: "mailto:azizmaaizat@outlook.com" },
          { label: "VIEW IN CLI", run: onOpenTerminal }
        ]
      }
    ],
    [identityLocked, specs, archiveRepos.length, onOpenInfiltration, onOpenTerminal, onOpenMegaCenter, onOpenCsi, onOpenBreach, onOpenCtf]
  );

  const [selected, setSelected] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(VISITED_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set(["origin"]);
  });
  const [showAchievement, setShowAchievement] = useState(false);

  const zone = zones[selected];

  useEffect(() => {
    try {
      localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]));
    } catch {}
    if (visited.size >= zones.length) {
      let celebrated = false;
      try {
        celebrated = localStorage.getItem(CELEBRATED_KEY) === "1";
      } catch {}
      if (!celebrated) {
        try {
          localStorage.setItem(CELEBRATED_KEY, "1");
        } catch {}
        setShowAchievement(true);
        sound.playSuccess();
        sound.haptic([40, 30, 60]);
        const id = window.setTimeout(() => setShowAchievement(false), 4000);
        return () => window.clearTimeout(id);
      }
    }
  }, [visited, zones.length]);

  const goTo = useCallback(
    (idx: number) => {
      const next = (idx + zones.length) % zones.length;
      setSelected(next);
      setVisited(prev => {
        if (prev.has(zones[next].id)) return prev;
        const copy = new Set(prev);
        copy.add(zones[next].id);
        return copy;
      });
      sound.playClick();
      sound.haptic(15);
    },
    [zones]
  );

  const runAction = useCallback((action: ZoneAction) => {
    sound.playBoot();
    sound.haptic(30);
    if (action.run) {
      action.run();
    } else if (action.href) {
      if (action.href.startsWith("mailto:")) {
        window.location.href = action.href;
      } else {
        window.open(action.href, "_blank", "noopener,noreferrer");
      }
    }
  }, []);

  useEffect(() => {
    if (!inputEnabled || isFullPlayerOpen || isMoodMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "arrowright" || k === "arrowdown" || k === "d" || k === "s") {
        e.preventDefault();
        goTo(selected + 1);
      } else if (k === "arrowleft" || k === "arrowup" || k === "a" || k === "w") {
        e.preventDefault();
        goTo(selected - 1);
      } else if (k === "enter") {
        e.preventDefault();
        if (zone.actions[0]) runAction(zone.actions[0]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputEnabled, isFullPlayerOpen, isMoodMenuOpen, goTo, selected, zone, runAction]);

  const [typed, setTyped] = useState("");
  const typingDone = typed.length >= zone.lore.length;
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(zone.lore);
      return;
    }
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setTyped(zone.lore.slice(0, i));
      if (i >= zone.lore.length) window.clearInterval(id);
    }, 12);
    return () => window.clearInterval(id);
  }, [zone.lore]);

  const pathAll = DESKTOP_POS.map(([x, y]) => `${x},${y}`).join(" ");
  const pathTravelled = DESKTOP_POS.slice(0, selected + 1)
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  const mappedCount = visited.size;
  const mappedBar = zones.map(z => (visited.has(z.id) ? "▓" : "░")).join("");

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-3.5 sm:px-6 pb-24 font-mono text-white select-none">
      {/* Compact Player Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border border-white/30 bg-black/90 px-3 py-2 text-[10px] sm:text-[11px] tracking-wider">
        <span>
          <span className="text-white font-bold">@ {identityLocked ? "UNKNOWN" : "ZANE_GOAT"}</span>
          <span className="text-white/50"> · {persona.toUpperCase()}</span>
        </span>
        <span className="text-white/80">
          MAP <span className="tracking-[0.12em]">{mappedBar}</span> {mappedCount}/{zones.length}
        </span>
        {persona === "operator" && (
          <span className="hidden sm:inline text-white/60">CLEARANCE {clearanceLevel}/3</span>
        )}
        <span className="hidden md:inline text-white/60">
          CASABLANCA <CasablancaClock />
        </span>
      </div>

      {/* Header */}
      <div className="mt-3 sm:mt-5 mb-2.5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-white/50 tracking-[0.25em]">ASCII WORLD MODE</p>
          <h1 className="text-lg sm:text-3xl font-bold tracking-tight">SELECT A ZONE</h1>
        </div>
        <p className="hidden lg:block text-[10px] text-white/50 text-right leading-relaxed">
          ← → / WASD to travel · ENTER to launch
        </p>
        <p className="lg:hidden text-[10px] text-white/55 text-right">Tap a zone below</p>
      </div>

      {/* MOBILE / TABLET (< lg): Crisp 2-Column Handheld Zone Deck (zero word-chopping, fits above dialogue) */}
      <div className="lg:hidden grid grid-cols-2 gap-2">
        {zones.map((z, i) => {
          const isSel = i === selected;
          const isVisited = visited.has(z.id);
          const isLastOdd = i === zones.length - 1 && zones.length % 2 === 1;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => goTo(i)}
              className={`border px-2.5 py-2 text-left transition-colors cursor-pointer active:scale-[0.98] ${
                isLastOdd ? "col-span-2" : ""
              } ${
                isSel
                  ? "bg-white text-black border-white"
                  : isVisited
                  ? "bg-black/90 text-white border-white/50"
                  : "bg-black/80 text-white/65 border-white/20 border-dashed"
              }`}
            >
              <div className={`flex items-center justify-between text-[9px] ${isSel ? "text-black/70" : "text-white/45"}`}>
                <span>0{i + 1} · {z.tag}</span>
                <span className="font-bold">{isSel ? "[@]" : isVisited ? "[✓]" : "[ ]"}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 min-w-0">
                <span className="text-base leading-none shrink-0">{z.glyph}</span>
                <span className="text-xs font-bold truncate">{z.shortName}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* DESKTOP (lg+): Winding SVG Node Map */}
      <div className="hidden lg:block relative w-full h-[390px] border border-white/25 bg-black/75 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={pathAll}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className="existence-path-flow"
          />
          {selected > 0 && (
            <polyline
              points={pathTravelled}
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {zones.map((z, i) => {
          const [x, y] = DESKTOP_POS[i];
          const isSel = i === selected;
          const isVisited = visited.has(z.id);
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => goTo(i)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[148px] cursor-pointer group"
              aria-label={`Zone ${i + 1}: ${z.name}`}
            >
              {isSel && (
                <motion.span
                  layoutId="existence-player"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-base font-bold text-white"
                >
                  @
                </motion.span>
              )}
              <div
                className={`border px-2.5 py-1.5 text-left transition-colors ${
                  isSel
                    ? "bg-white text-black border-white"
                    : isVisited
                    ? "bg-black text-white border-white/60 group-hover:border-white"
                    : "bg-black text-white/55 border-white/20 border-dashed group-hover:border-white/60 group-hover:text-white"
                }`}
              >
                <div className={`flex justify-between text-[9px] ${isSel ? "text-black/60" : "text-white/45"}`}>
                  <span>ZONE 0{i + 1}</span>
                  <span>{isVisited ? "[✓]" : "[ ]"}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 min-w-0">
                  <span className="text-lg leading-none shrink-0">{z.glyph}</span>
                  <span className="text-[11px] font-bold leading-tight truncate">{z.shortName}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* RPG Dialogue & Action Box */}
      <div ref={dialogueRef} className="relative mt-4 sm:mt-6 border border-white/55 bg-black/95 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/15 text-[10px]">
          <span className="tracking-widest text-white font-bold truncate">
            [ ZONE 0{selected + 1} :: {zone.name} ]
          </span>
          <span className="text-white/55 shrink-0">{zone.tag}</span>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <div className="hidden sm:flex w-12 h-12 shrink-0 border border-white/35 items-center justify-center text-2xl">
            {zone.glyph}
          </div>
          <p
            onClick={() => setTyped(zone.lore)}
            className="text-xs sm:text-sm leading-relaxed text-white/90 min-h-[3.75rem] cursor-default"
          >
            {typed}
            {!typingDone && <span className="animate-pulse">▌</span>}
          </p>
        </div>

        {/* Zone-specific details */}
        {typingDone && zone.id === "origin" && !identityLocked && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {specs.stats.map(s => (
              <div key={s.label} className="border border-white/20 px-2 py-1.5 text-center">
                <div className="text-xs sm:text-sm font-bold">{s.value}</div>
                <div className="text-[9px] text-white/50 uppercase truncate">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {typingDone && zone.id === "archive" && (
          <ul className="mt-3 space-y-1 text-xs">
            {archiveRepos.map(r => (
              <li key={r.id}>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-between gap-3 px-2 py-1.5 border border-white/15 hover:border-white/50 hover:bg-white/5"
                >
                  <span className="truncate">&gt; {r.name}</span>
                  <span className="shrink-0 text-white/50 text-[10px]">
                    {r.language || "Code"} · *{r.stargazers_count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {typingDone && zone.id === "comms" && (
          <ul className="mt-3 grid sm:grid-cols-2 gap-1.5 text-xs">
            {contactLinks.map(c => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-between gap-3 px-2.5 py-1.5 border border-white/20 hover:border-white hover:bg-white/5"
                >
                  <span className="font-bold">{c.label}</span>
                  <span className="truncate text-white/55 text-[10px]">{c.display}</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {zone.actions.map((a, i) => (
            <button
              key={a.label}
              type="button"
              onClick={() => runAction(a)}
              className={`px-3 py-1.5 text-[11px] font-bold border cursor-pointer active:scale-95 transition-colors ${
                i === 0
                  ? "bg-white text-black border-white hover:bg-white/85"
                  : "bg-black text-white border-white/40 hover:border-white"
              }`}
            >
              {i === 0 ? `> ${a.label}` : a.label}
            </button>
          ))}
          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => goTo(selected - 1)}
              className="px-2.5 py-1.5 text-[11px] border border-white/30 hover:border-white cursor-pointer active:scale-95"
              aria-label="Previous zone"
            >
              PREV
            </button>
            <button
              type="button"
              onClick={() => goTo(selected + 1)}
              className="px-2.5 py-1.5 text-[11px] border border-white/30 hover:border-white cursor-pointer active:scale-95"
              aria-label="Next zone"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Achievement banner */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-white text-black border border-white px-4 py-2 text-[11px] font-bold tracking-wider"
          >
            ALL 7 ZONES MAPPED // COMPLETE
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
