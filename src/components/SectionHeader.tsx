import { useUniverseTheme } from "@/context/ThemeContext";

interface SectionHeaderProps {
  index: string;
  kicker: string;
  title: string;
  subtitle?: string;
}

/** Consistent numbered section header used across the page (adapts across Matrix & Existence universes). */
export const SectionHeader = ({ index, kicker, title, subtitle }: SectionHeaderProps) => {
  const { isExistence } = useUniverseTheme();

  if (isExistence) {
    return (
      <div className="max-w-7xl mx-auto mb-12 reveal font-mono">
        {/* Archival Box-Drawing Telemetry Rule */}
        <div className="flex items-center gap-2 text-[11px] text-white/70 mb-3 select-none overflow-hidden">
          <span className="text-white font-bold shrink-0">┌──[ {index} :: {kicker.toUpperCase()} ]</span>
          <span className="flex-1 border-t border-white/25" />
          <span className="text-white/80 shrink-0 tracking-widest">╡ Ψ · Ω · ∞ ╞──┐</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pl-3 border-l-2 border-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/60 font-mono text-xs sm:text-sm max-w-md md:text-right leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4 reveal">
      <div>
        <div className="flex items-center gap-3 font-mono text-xs text-primary/70 mb-3">
          <span className="text-primary font-bold">{index}</span>
          <span className="h-px w-10 bg-primary/40" />
          <span className="uppercase tracking-[0.3em]">{kicker}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight glow-text">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-muted-foreground font-mono text-sm max-w-md md:text-right leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
