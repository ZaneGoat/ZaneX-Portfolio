import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { systemSpecsByPersona, contactLinks } from "@/data/portfolio";
import { usePersona } from "@/context/PersonaContext";
import { useOperatorClearance } from "@/context/OperatorClearanceContext";
import { useMusic } from "@/context/MusicContext";
import { useGitHubRepos } from "@/services/github";
import { sound } from "@/lib/sound";

/**
 * EXISTENCE.EXE — game-style world map that replaces the whole card layout
 * when the ASCII universe is active. Walk the "@" between zones, read the
 * dialogue box, and trigger each zone's action.
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
  tag: string;
  lore: string;
  actions: ZoneAction[];
}

const VISITED_KEY = "zanex_existence_visited";
const CELEBRATED_KEY = "zanex_existence_celebrated";

// Winding path positions (percent of map box): wide map on desktop, vertical zigzag on phone
const DESKTOP_POS: [number, number][] = [
  [9, 68], [24, 30], [39, 70], [53, 28], [67, 70], [80, 30], [91, 66]
];
const MOBILE_POS: [number, number][] = [
  [28, 7], [72, 21], [28, 36], [72, 50], [28, 64], [72, 79], [28, 93]
];

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

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
  const isDesktop = useIsDesktop();
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
        tag: identityLocked ? "████ ████" : specs.handle,
        lore: identityLocked
          ? "Identity encrypted. The operative who walks this map is sealed behind Node 01. Declassify the dossier to learn who they are."
          : `${specs.realName} — ${specs.role}. ${specs.bio}`,
        actions: identityLocked
          ? [
              { label: "DECLASSIFY", run: onOpenInfiltration },
              { label: "OPEN SHELL", run: onOpenTerminal }
            ]
          : [{ label: "OPEN SHELL", run: onOpenTerminal }]
      },
      {
        id: "megacenter",
        glyph: "∇",
        name: "ZANEMEGACENTER",
        tag: "EC GOVERNOR",
        lore: "A low-level Linux governor that talks straight to MSI Embedded Controller registers: custom fan curves, thermal telemetry, and hardware truth read directly from the silicon.",
        actions: [
          { label: "LAUNCH SIM", run: onOpenMegaCenter },
          { label: "SOURCE", href: "https://github.com/ZaneGoat/ZaneMegaCenter" }
        ]
      },
      {
        id: "csi",
        glyph: "Ψ",
        name: "CSI RADAR",
        tag: "WI-FI SENSING",
        lore: "Wi-Fi as a sense organ. Raw 802.11 Channel State Information across 64 OFDM subcarriers, turned into Doppler motion recognition. Seeing movement with nothing but radio.",
        actions: [
          { label: "OPEN RADAR", run: onOpenCsi },
          { label: "SOURCE", href: "https://github.com/ZaneGoat/csi_project" }
        ]
      },
      {
        id: "controler",
        glyph: "◎",
        name: "CONTROLER-SPACE",
        tag: "HID SUITE",
        lore: "Low-latency DualSense & HID gamepad calibration suite. Dead-zones, stick drift, and input timing: measured, tuned, and made honest.",
        actions: [{ label: "SOURCE", href: "https://github.com/ZaneGoat/Controler-space" }]
      },
      {
        id: "archive",
        glyph: "∞",
        name: "ARCHIVE",
        tag: `${archiveRepos.length} REPOS`,
        lore: "Every repository is a fossil of a 3 AM idea. Live-synced from github.com/ZaneGoat, flagships first.",
        actions: [{ label: "ALL REPOS", href: "https://github.com/ZaneGoat?tab=repositories" }]
      },
      {
        id: "arena",
        glyph: "✦",
        name: "ARENA",
        tag: "BREACH · CTF",
        lore: "Training grounds. Slip past Arasaka ICE in Breach Protocol, or hunt the three flags hidden across this portfolio.",
        actions: [
          { label: "BREACH ICE", run: onOpenBreach },
          { label: "CTF BOARD", run: onOpenCtf }
        ]
      },
      {
        id: "comms",
        glyph: "λ",
        name: "COMMS",
        tag: "OPEN CHANNEL",
        lore: "Every signal needs a receiver. ERP builds, automation pipelines, or a second pair of eyes on your stack: open a channel.",
        actions: [
          { label: "SEND MAIL", href: "mailto:azizmaaizat@outlook.com" },
          { label: "CONTRACTS ($199–$899)", run: onOpenTerminal }
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

  // Persist visited zones & fire the "all mapped" achievement once
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
        const id = window.setTimeout(() => setShowAchievement(false), 4200);
        return () => window.clearTimeout(id);
      }
    }
  }, [visited, zones.length]);

  const goTo = useCallback(
    (idx: number, fromTap = false) => {
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
      if (fromTap && !isDesktop) {
        window.setTimeout(() => {
          dialogueRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 60);
      }
    },
    [zones, isDesktop]
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

  // Keyboard: arrows / WASD walk the path, Enter triggers the primary action
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

  // Typewriter dialogue
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
    }, 14);
    return () => window.clearInterval(id);
  }, [zone.lore]);

  const positions = isDesktop ? DESKTOP_POS : MOBILE_POS;
  const pathAll = positions.map(([x, y]) => `${x},${y}`).join(" ");
  const pathTravelled = positions
    .slice(0, selected + 1)
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  const mappedCount = visited.size;
  const mappedBar = zones.map(z => (visited.has(z.id) ? "▓" : "░")).join("");

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 pb-28 font-mono text-white select-none">
      {/* Player HUD */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border border-white/30 bg-black/85 px-3 py-2 text-[10px] sm:text-[11px] tracking-wider">
        <span>
          <span className="text-white font-bold">@ {identityLocked ? "OPERATOR_UNKNOWN" : "ZANE_GOAT"}</span>
          <span className="text-white/50"> · LVL 99 · {persona.toUpperCase()}</span>
        </span>
        <span className="text-white/80">
          MAPPED <span className="tracking-[0.15em]">{mappedBar}</span> {mappedCount}/{zones.length}
        </span>
        {persona === "operator" && (
          <span className="text-white/60">CLEARANCE {clearanceLevel}/3</span>
        )}
        <span className="text-white/60">
          CASABLANCA <CasablancaClock />
        </span>
      </div>

      {/* Title */}
      <div className="mt-5 mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-white/50 tracking-[0.3em]">EXISTENCE.EXE</p>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">SELECT A ZONE</h1>
        </div>
        <p className="hidden sm:block text-[10px] text-white/50 text-right leading-relaxed">
          ← → / WASD to walk · ENTER to open
          <br />
          click any zone to travel
        </p>
        <p className="sm:hidden text-[10px] text-white/50 text-right">tap a zone</p>
      </div>

      {/* World Map */}
      <div
        className={`relative w-full border border-white/25 bg-black/70 overflow-hidden ${
          isDesktop ? "h-[400px]" : "h-[620px]"
        }`}
      >
        {/* Grid texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        {/* Path lines */}
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

        {/* Zone nodes */}
        {zones.map((z, i) => {
          const [x, y] = positions[i];
          const isSel = i === selected;
          const isVisited = visited.has(z.id);
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => goTo(i, true)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[132px] sm:w-[140px] cursor-pointer group"
              aria-label={`Zone ${i + 1}: ${z.name}`}
            >
              {isSel && (
                <motion.span
                  layoutId="existence-player"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-base font-bold text-white animate-pulse"
                >
                  @
                </motion.span>
              )}
              <div
                className={`border px-2 py-1.5 text-left transition-colors ${
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
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl leading-none">{z.glyph}</span>
                  <span className="text-[10px] sm:text-[11px] font-bold leading-tight break-all">{z.name}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* RPG Dialogue Box */}
      <div ref={dialogueRef} className="relative mt-6 border border-white/50 bg-black/90 p-4 sm:p-5 scroll-mt-24">
        <div className="absolute -top-2.5 left-3 bg-black px-2 text-[10px] tracking-widest text-white">
          [ ZONE 0{selected + 1} :: {zone.name} ]
        </div>
        <div className="absolute -top-2.5 right-3 bg-black px-2 text-[10px] text-white/50">{zone.tag}</div>

        <div className="flex gap-3 sm:gap-4">
          <div className="hidden sm:flex w-14 h-14 shrink-0 border border-white/40 items-center justify-center text-3xl">
            {zone.glyph}
          </div>
          <p
            onClick={() => setTyped(zone.lore)}
            className="text-[13px] sm:text-sm leading-relaxed text-white/90 min-h-[4.5rem] cursor-default"
          >
            {typed}
            {!typingDone && <span className="animate-pulse">▌</span>}
          </p>
        </div>

        {/* Zone-specific extras */}
        {typingDone && zone.id === "origin" && !identityLocked && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {specs.stats.map(s => (
              <div key={s.label} className="border border-white/20 px-2 py-1.5 text-center">
                <div className="text-sm font-bold">{s.value}</div>
                <div className="text-[9px] text-white/50 uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {typingDone && zone.id === "archive" && (
          <ul className="mt-3 space-y-1 text-[12px]">
            {archiveRepos.map(r => (
              <li key={r.id}>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-between gap-3 px-2 py-1 border border-transparent hover:border-white/40 hover:bg-white/5"
                >
                  <span className="truncate">&gt; {r.name}</span>
                  <span className="shrink-0 text-white/45 text-[10px]">
                    {r.language || "—"} · ★{r.stargazers_count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {typingDone && zone.id === "comms" && (
          <ul className="mt-3 grid sm:grid-cols-2 gap-1.5 text-[12px]">
            {contactLinks.map(c => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-between gap-3 px-2 py-1.5 border border-white/20 hover:border-white hover:bg-white/5"
                >
                  <span className="font-bold">{c.label}</span>
                  <span className="truncate text-white/50 text-[10px]">{c.display}</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
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
              {i === 0 ? `▶ ${a.label}` : a.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => goTo(selected - 1)}
              className="px-2.5 py-1.5 text-[11px] border border-white/30 hover:border-white cursor-pointer active:scale-95"
              aria-label="Previous zone"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => goTo(selected + 1)}
              className="px-2.5 py-1.5 text-[11px] border border-white/30 hover:border-white cursor-pointer active:scale-95"
              aria-label="Next zone"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Achievement toast */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-white text-black border border-white px-4 py-2.5 text-[11px] font-bold tracking-wider shadow-[0_0_40px_rgba(255,255,255,0.35)]"
          >
            ★ ACHIEVEMENT UNLOCKED :: ALL ZONES MAPPED // Ω
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
