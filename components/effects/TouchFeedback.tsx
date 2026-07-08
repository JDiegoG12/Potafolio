"use client";

import { useEffect } from "react";

/**
 * Habilita los estados :active táctiles (projects.css) en iOS Safari:
 * sin un listener touchstart en el documento, iOS no dispara :active
 * sobre elementos no interactivos como los <article> de las cards.
 * Listener vacío y pasivo: cero coste durante el scroll.
 */
export function TouchFeedback() {
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  return null;
}
