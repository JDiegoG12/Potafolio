"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";

/**
 * Efectos de fondo por tema (CLAUDE.md §6), en capa fixed detrás del
 * contenido (encima del gradiente --scene de body::before). Cada mundo
 * usa la técnica más barata que logra su efecto:
 * - Teyvat: canvas 2D con chispas doradas flotantes + parallax de scroll
 *   (el único mundo con rAF).
 * - Gym: textura estática CSS — concreto (ruido SVG), líneas diagonales
 *   tenues, viñeta y tipografía gigante de fondo. Cero animación.
 * - Cyber: grid en perspectiva desplazándose en loop + scanline ocasional,
 *   solo transforms compositados (styles/backgrounds.css).
 *
 * Guardas: el canvas pausa con document.hidden y durante el viaje de
 * tema; DPR cap 2 (1.5 en viewport estrecho); menos partículas en móvil.
 * Con prefers-reduced-motion: Teyvat pinta un frame estático (sin rAF)
 * y los loops CSS los congela el kill-switch global.
 */
export function ThemeBackground() {
  const { theme, transitionFx } = useTheme();

  return (
    <div aria-hidden className="theme-bg">
      {theme === "teyvat" && <TeyvatSparks paused={transitionFx !== null} />}
      {theme === "gym" && (
        <div className="bg-gym">
          <span className="bg-gym-word">GYM</span>
        </div>
      )}
      {theme === "cyber" && (
        <div className="bg-cyber">
          <div className="bg-cyber-plane" />
          <span className="bg-cyber-scan" />
        </div>
      )}
    </div>
  );
}

/** Estado mutable de una chispa del canvas de Teyvat. */
interface Spark {
  x: number;
  y: number;
  /** Tamaño (px CSS); también decide su profundidad de parallax. */
  size: number;
  /** Velocidad de ascenso (px/frame @60fps). */
  rise: number;
  /** Fase para la deriva horizontal y el parpadeo. */
  phase: number;
  alpha: number;
}

/**
 * Chispas doradas de Teyvat en canvas 2D. Las partículas se dibujan con
 * un sprite pregenerado (gradiente radial) — mucho más barato que
 * shadowBlur por partícula. El parallax lee window.scrollY (que Lenis
 * mueve de forma nativa) dentro del mismo rAF: las chispas grandes
 * (cercanas) se desplazan más que las pequeñas.
 *
 * @param props.paused - true durante el viaje de tema (pantalla congelada).
 */
function TeyvatSparks({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const narrow = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2);
    const count = narrow ? 12 : 26;

    // Sprite: disco dorado con halo, dibujado una vez.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255, 244, 214, 0.95)");
      g.addColorStop(0.25, "rgba(232, 197, 100, 0.55)");
      g.addColorStop(1, "rgba(232, 197, 100, 0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
    }

    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const sparks: Spark[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 2 + Math.random() * 5,
      rise: 0.08 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.5,
    }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      // Parallax: la capa entera responde al scroll según profundidad.
      const scroll = window.scrollY;
      for (const s of sparks) {
        const depth = s.size / 7; // 0..1: grande = cercano = más parallax
        const twinkle = 0.6 + 0.4 * Math.sin(t / 900 + s.phase);
        const px = s.x + Math.sin(t / 2200 + s.phase) * 14;
        const py =
          (((s.y - t * 0.001 * s.rise * 60 - scroll * depth * 0.12) % height) +
            height) %
          height;
        const r = s.size * 2.6;
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.drawImage(sprite, px - r, py - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    };

    // Reduced-motion: un solo frame estático, sin bucle.
    if (reduced) {
      draw(0);
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }

    let frame = 0;
    let running = false;
    const loop = (t: number) => {
      draw(t);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || paused || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, [paused, reduced]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" />;
}
