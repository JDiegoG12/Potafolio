"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useTheme } from "@/lib/hooks/useTheme";

/**
 * Smooth scroll con Lenis (CLAUDE.md §6). Se instancia sobre `window`
 * (no un wrapper) para que `whileInView`/`useInView` de Framer Motion
 * sigan leyendo el scroll nativo sin adaptadores; Lenis solo suaviza.
 *
 * Integraciones:
 * - Anchors (`#about`…) resueltos por Lenis con offset del navbar
 *   (h-16 + margen = el `scroll-mt-20` que ya usan las secciones).
 * - Se detiene durante el viaje de tema: la View Transition congela la
 *   pantalla en un snapshot y el rAF de scroll solo añadiría jank.
 * - El overlay del menú móvil escapa del secuestro de rueda con
 *   `data-lenis-prevent` (scroll interno propio).
 * - Con prefers-reduced-motion NO se inicializa: scroll 100% nativo.
 *
 * La clase `lenis-smooth` en <html> desactiva el `scroll-behavior:
 * smooth` CSS (globals.css) para no suavizar dos veces.
 */
export function SmoothScroll() {
  const { transitionFx } = useTheme();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // -80px = altura del navbar (64) + respiro, igual que scroll-mt-20.
      anchors: { offset: -80 },
    });
    lenisRef.current = lenis;

    let frame = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pausa/reanuda con el viaje de tema (transitionFx ≠ null = viajando).
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (transitionFx) lenis.stop();
    else lenis.start();
  }, [transitionFx]);

  return null;
}
