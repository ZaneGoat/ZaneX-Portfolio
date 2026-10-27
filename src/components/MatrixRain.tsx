import { useEffect, useRef } from "react";

/**
 * Sparse Peripheral Matrix Telemetry Rain
 * - 75% sparser column density (42px stride + long staggered intervals) so it never clutters the HUD.
 * - Soft horizontal vignette keeps rain framing the left & right outer edges while center cards stay crisp.
 */
export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 20;
    const frameInterval = 1000 / fps;

    const matrix = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモZANEX$◈";
    const fontSize = 14;
    const colStride = 42;
    let columns = Math.max(1, Math.floor(window.innerWidth / colStride));
    let drops: number[] = [];

    const trailColor = "#00b874";
    const tipColor = "#8ff7cc";

    const stepRain = (tiltRatio: number) => {
      ctx.fillStyle = "rgba(5, 8, 22, 0.11)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px 'IBM Plex Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        if (drops[i] < 0) {
          drops[i]++;
          continue;
        }

        const text = matrix[Math.floor(Math.random() * matrix.length)];
        const yPos = drops[i] * fontSize;
        const xPos = i * colStride + 10 + yPos * tiltRatio;

        ctx.fillStyle = tipColor;
        ctx.fillText(text, xPos, yPos);

        if (drops[i] > 1) {
          const prevChar = matrix[(i * 7 + Math.floor(drops[i])) % matrix.length];
          const prevY = (drops[i] - 1) * fontSize;
          ctx.fillStyle = trailColor;
          ctx.fillText(prevChar, i * colStride + 10 + prevY * tiltRatio, prevY);
        }

        if (yPos > canvas.height && Math.random() > 0.96) {
          drops[i] = -Math.floor(8 + Math.random() * 38);
        } else {
          drops[i]++;
        }
      }
    };

    const initDrops = () => {
      columns = Math.max(1, Math.floor(canvas.width / colStride));
      const maxRows = Math.max(20, Math.ceil(canvas.height / fontSize));
      drops = [];
      for (let i = 0; i < columns; i++) {
        // Half the streams start dormant off-top so rain feels calm and atmospheric
        drops[i] =
          i % 2 === 0
            ? Math.floor(Math.random() * maxRows)
            : -Math.floor(5 + Math.random() * 35);
      }

      ctx.fillStyle = "#050816";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let w = 0; w < 14; w++) {
        stepRain(0);
      }
    };

    const resize = () => {
      canvas.width = Math.max(1, window.innerWidth);
      canvas.height = Math.max(1, window.innerHeight);
      initDrops();
    };

    resize();

    let targetTilt = 0;
    let currentTilt = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (typeof e.gamma === "number") {
        targetTilt = Math.max(-25, Math.min(25, e.gamma));
      }
    };

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    }

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (document.hidden) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = currentTime - (elapsed % frameInterval);

      currentTilt += (targetTilt - currentTilt) * 0.08;
      stepRain(currentTilt / 180);
    };

    animationFrameId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("orientationchange", resize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        maskImage:
          "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.22) 28%, rgba(0,0,0,0.22) 72%, rgba(0,0,0,0.95) 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.22) 28%, rgba(0,0,0,0.22) 72%, rgba(0,0,0,0.95) 100%)",
      }}
      className="fixed inset-0 pointer-events-none opacity-[0.13] sm:opacity-[0.17] z-0"
    />
  );
};
