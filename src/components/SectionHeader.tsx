interface SectionHeaderProps {
  index: string;
  kicker: string;
  title: string;
  subtitle?: string;
}

/** Consistent numbered section header used across the page. */
export const SectionHeader = ({ index, kicker, title, subtitle }: SectionHeaderProps) => (
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
