import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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

  const themeRef = useRef<UniverseTheme>(theme);
  themeRef.current = theme;

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
      themeRef.current = next;
      setThemeState(prev => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((next: UniverseTheme) => {
    themeRef.current = next;
    if (next === "matrix") {
      setZoomPortal(prev => (prev.active ? { ...prev, active: false } : prev));
    }

    setThemeState(next);
    syncDomTheme(next);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, next);
    } catch {}

    sound.playClick();
    sound.haptic(20);
  }, []);

  const toggleTheme = useCallback(() => {
    const current =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "existence"
        ? "existence"
        : themeRef.current;
    setTheme(current === "existence" ? "matrix" : "existence");
  }, [setTheme]);

  const triggerLogoThemeShift = useCallback(
    (target?: UniverseTheme) => {
      const domIsExistence =
        typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme") === "existence";
      const current: UniverseTheme = domIsExistence ? "existence" : themeRef.current;
      const next: UniverseTheme = target ?? (current === "existence" ? "matrix" : "existence");

      if (next === current && target !== undefined) return;

      // Returning from EXISTENCE -> MATRIX HUD: switch immediately with NO fullscreen ASCII animation
      if (current === "existence" || next === "matrix") {
        setTheme("matrix");
        return;
      }

      // Entering EXISTENCE from MATRIX HUD: launch the Fullscreen Procedural ASCII Logo Portal
      setZoomPortal(prev => {
        if (prev.active) return prev;
        return {
          active: true,
          fromTheme: "matrix",
          toTheme: "existence",
        };
      });
    },
    [setTheme]
  );

  const handlePeakFlip = useCallback(() => {
    setTheme("existence");
  }, [setTheme]);

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

      {/* Fullscreen 3D Rolling & Zooming ASCII Brand Logo Theme Portal (EXISTENCE entry only) */}
      <AsciiLogoZoomPortal
        active={zoomPortal.active}
        fromTheme={zoomPortal.fromTheme}
        toTheme={zoomPortal.toTheme}
        onPeakFlip={handlePeakFlip}
        onComplete={handlePortalComplete}
      />
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
