import { useMemo } from "react";

/**
 * CSS-only ambient particles.
 * Previously 20 framer-motion nodes with blur() filters + box-shadows, re-randomized on every render.
 * Now: positions are memoized once, animation runs on the compositor (transform/opacity only),
 * and particles are skipped entirely on small screens.
 */
export const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, () => {
        const hue = Math.random() > 0.5 ? 158 : 200;
        const size = 6 + Math.random() * 6;
        return {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size,
          background: `radial-gradient(circle, hsl(${hue} 100% 60%) 0%, transparent 70%)`,
          duration: `${6 + Math.random() * 5}s`,
          delay: `${Math.random() * 3}s`,
        };
      }),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.background,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
