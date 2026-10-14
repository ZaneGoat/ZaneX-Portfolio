import { useEffect, useRef } from "react";

export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 25; // 25 FPS is optimal for cinematic Matrix rain
    const frameInterval = 1000 / fps;

    const matrix = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンZANEX";
    const fontSize = 14;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops: number[] = [];

    // Zero-overhead theme color caching (Eliminates getComputedStyle per-frame layout recalculations)
    let themeColor = "#00ff9e";
    const updateThemeColor = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      if (theme === "amber") themeColor = "#ffb703";
      else if (theme === "cyan") themeColor = "#00f0ff";
      else themeColor = "#00ff9e";
    };
    updateThemeColor();

    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const initDrops = () => {
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops();
    };

    resize();

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      // Pause when tab is not visible to conserve 100% CPU/GPU
      if (document.hidden) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = currentTime - (elapsed % frameInterval);

      // Hardware-accelerated trail fade
      ctx.fillStyle = "rgba(5, 8, 22, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        
        if (Math.random() > 0.88) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = themeColor;
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("orientationchange", resize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-25 z-0"
    />
  );
};
