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
 * - En dispositivos touch (pointer: coarse) TAMPOCO: Lenis no suaviza
 *   el gesto táctil (syncTouch off) pero su rAF sincroniza contra el
 *   scroll nativo y peleaba con la inercia del navegador — tirones
 *   medidos en móvil. Sin la clase .lenis-smooth, los anchors los
 *   resuelve el scroll-behavior: smooth nativo + scroll-mt-20.
 *
 * La clase `lenis-smooth` en <html> desactiva el `scroll-behavior:
 * smooth` CSS (globals.css) para no suavizar dos veces.
 */
export function SmoothScroll() {
  const { transitionFx } = useTheme();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Puntero primario grueso = móvil/tablet táctil. Los híbridos con
    // pantalla táctil y ratón (pointer: fine) conservan Lenis.
    if (window.matchMedia("(pointer: coarse)").matches) return;

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
