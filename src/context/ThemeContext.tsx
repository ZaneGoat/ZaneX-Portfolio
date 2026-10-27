import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sound } from "@/lib/sound";
import { AsciiLogoZoomPortal } from "@/components/AsciiLogoZoomPortal";

export type UniverseTheme = "matrix" | "existence";

interface ThemeContextType {
  theme: UniverseTheme;
  isExistence: boolean;
  setTheme: (next: UniverseTheme) => void;
  toggleTheme: () => void;
  triggerLogoThemeShift: (target?: UniverseTheme) => void;
}

const STORAGE_THEME_KEY = "zanex_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const syncDomTheme = (theme: UniverseTheme) => {
  if (typeof document === "undefined") return;
  if (theme === "existence") {
    document.documentElement.setAttribute("data-theme", "existence");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<UniverseTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === "existence") return "existence";
    } catch {}
    return "matrix";
  });

  const [shutterActive, setShutterActive] = useState(false);
  const [zoomPortal, setZoomPortal] = useState<{
    active: boolean;
    fromTheme: UniverseTheme;
    toTheme: UniverseTheme;
  }>({
    active: false,
    fromTheme: "matrix",
    toTheme: "existence",
  });

  useEffect(() => {
    syncDomTheme(theme);
  }, [theme]);

  // Keep React state synced if TerminalOverlay or external script mutates data-theme
  useEffect(() => {
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute("data-theme");
      const next: UniverseTheme = attr === "existence" ? "existence" : "matrix";
      setThemeState(prev => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((next: UniverseTheme) => {
    setShutterActive(true);
    window.setTimeout(() => setShutterActive(false), 220);

    setThemeState(next);
    syncDomTheme(next);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, next);
    } catch {}

    sound.playBoot();
    sound.haptic([25, 35, 25]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "existence" ? "matrix" : "existence");
  }, [theme, setTheme]);

  const triggerLogoThemeShift = useCallback(
    (target?: UniverseTheme) => {
      const next: UniverseTheme =
        target ?? (theme === "existence" ? "matrix" : "existence");
      if (next === theme && target !== undefined) return;

      // Only trigger the fullscreen ASCII animation when entering EXISTENCE;
      // when clicking MATRIX HUD (returning to matrix), switch immediately without the animation.
      if (next === "matrix") {
        setTheme("matrix");
        return;
      }

      setZoomPortal(prev => {
        if (prev.active) return prev;
        return {
          active: true,
          fromTheme: theme,
          toTheme: "existence",
        };
      });
    },
    [theme, setTheme]
  );

  const handlePeakFlip = useCallback(() => {
    setTheme(zoomPortal.toTheme);
  }, [setTheme, zoomPortal.toTheme]);

  const handlePortalComplete = useCallback(() => {
    setZoomPortal(prev => ({ ...prev, active: false }));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isExistence: theme === "existence",
        setTheme,
        toggleTheme,
        triggerLogoThemeShift,
      }}
    >
      {children}

      {/* Fullscreen 3D Rolling & Zooming ASCII Brand Logo Theme Portal */}
      <AsciiLogoZoomPortal
        active={zoomPortal.active}
        fromTheme={zoomPortal.fromTheme}
        toTheme={zoomPortal.toTheme}
        onPeakFlip={handlePeakFlip}
        onComplete={handlePortalComplete}
      />

      {/* Dimensional Shutter Flash on Universe Shift */}
      {shutterActive && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[10050] pointer-events-none bg-white/15 mix-blend-difference animate-pulse"
        />
      )}
    </ThemeContext.Provider>
  );
};

export const useUniverseTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useUniverseTheme must be used within a ThemeProvider");
  }
  return ctx;
};
