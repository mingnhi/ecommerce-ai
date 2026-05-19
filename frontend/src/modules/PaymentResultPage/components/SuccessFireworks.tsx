"use client";

import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

const COLORS = ["#2563eb", "#059669", "#d97706", "#db2777", "#7c3aed", "#0d9488"];
const DURATION_MS = 3000;

function burst(x: number, y: number): Spark[] {
  const count = 36 + Math.floor(Math.random() * 16);
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 1.8 + Math.random() * 3.2;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40 + Math.random() * 25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 1.5 + Math.random() * 1.5,
    };
  });
}

export function SuccessFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let sparks: Spark[] = [];
    const timeouts: number[] = [];
    const startedAt = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const launch = (rx: number, ry: number, delay: number) => {
      timeouts.push(
        window.setTimeout(() => {
          if (performance.now() - startedAt >= DURATION_MS) return;
          sparks.push(...burst(canvas.width * rx, canvas.height * ry));
        }, delay),
      );
    };

    [0, 500, 1000, 1500, 2000, 2500].forEach((delay, i) => {
      const points = [
        [0.28, 0.32],
        [0.72, 0.28],
        [0.5, 0.22],
        [0.38, 0.38],
        [0.62, 0.35],
        [0.5, 0.3],
      ] as const;
      const [rx, ry] = points[i];
      launch(rx, ry, delay);
    });

    const draw = () => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= DURATION_MS) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparks = sparks.filter((s) => {
        s.life += 1;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.06;
        s.vx *= 0.985;

        const t = 1 - s.life / s.maxLife;
        if (t <= 0) return false;

        ctx.globalAlpha = t;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * t, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ctx.globalAlpha = 1;

      if (sparks.length > 0 || elapsed < DURATION_MS) {
        frameId = requestAnimationFrame(draw);
      }
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      timeouts.forEach(clearTimeout);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20"
      aria-hidden
    />
  );
}
