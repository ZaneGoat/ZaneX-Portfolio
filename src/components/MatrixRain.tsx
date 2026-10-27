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
    const fps = 26;
    const frameInterval = 1000 / fps;

    const matrix = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンZANEX$◈";
    const fontSize = 15;
    let columns = Math.max(1, Math.floor(window.innerWidth / fontSize));
    let drops: number[] = [];

    // Canonical Matrix Emerald color
    const themeColor = "#00ff9e";

    const stepRain = (tiltRatio: number) => {
      ctx.fillStyle = "rgba(5, 8, 22, 0.075)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px 'IBM Plex Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        const yPos = drops[i] * fontSize;
        const xPos = i * fontSize + yPos * tiltRatio;

        // Crisp bright white leading tip + vivid emerald trail
        ctx.fillStyle = "#d8fff0";
        ctx.fillText(text, xPos, yPos);

        if (drops[i] > 1) {
          const prevChar = matrix[(i * 7 + Math.floor(drops[i])) % matrix.length];
          const prevY = (drops[i] - 1) * fontSize;
          ctx.fillStyle = themeColor;
          ctx.fillText(prevChar, i * fontSize + prevY * tiltRatio, prevY);
        }

        if (yPos > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -8;
        }
        drops[i]++;
      }
    };

    const initDrops = () => {
      columns = Math.max(1, Math.floor(canvas.width / fontSize));
      const maxRows = Math.max(20, Math.ceil(canvas.height / fontSize));
      drops = [];
      for (let i = 0; i < columns; i++) {
        // Scatter across full viewport height immediately so rain is visible on frame 1
        drops[i] = Math.floor(Math.random() * maxRows);
      }

      // Base fill + pre-warm trails so full Matrix streams appear immediately
      ctx.fillStyle = "#050816";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let w = 0; w < 20; w++) {
        stepRain(0);
      }
    };

    const resize = () => {
      canvas.width = Math.max(1, window.innerWidth);
      canvas.height = Math.max(1, window.innerHeight);
      initDrops();
    };

    resize();

    // Gyroscope Tilt Physics (Smooth physical slanting on phone tilt)
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
      className="fixed inset-0 pointer-events-none opacity-[0.34] sm:opacity-[0.40] z-0"
    />
  );
};
