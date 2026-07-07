"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";

/**
 * Título de sección con el efecto firma del mundo activo (CLAUDE.md §6.1):
 * Teyvat shimmer dorado, Gym onda de acero + flash al entrar en viewport,
 * Cyber glitch en ráfagas desfasadas por instancia.
 *
 * El texto debe ser un string: los efectos lo clonan en pseudo-elementos
 * via `data-text` (styles/title-effects.css). El color base del texto no
 * se toca. Con prefers-reduced-motion: título estático (el glitch ni se
 * programa; shimmer/onda quedan congelados fuera del texto).
 *
 * @param props.children - Texto del título (obligatoriamente `string`, se
 *   clona en `data-text` para los efectos).
 * @param props.as - Etiqueta a renderizar. @defaultValue `"h2"`
 * @param props.className - Clases extra (tamaño/tipografía) que se añaden a
 *   `title-fx`.
 * @param props.id - `id` del elemento, útil como ancla de sección.
 */
export function SectionTitle({
  children,
  as: Tag = "h2",
  className = "",
  id,
}: {
  children: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}) {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  // Flash de acero de Gym: una sola vez al entrar en viewport.
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [glitching, setGlitching] = useState(false);

  // Cyber: ráfaga de glitch cada N segundos, con offset y periodo
  // aleatorios POR INSTANCIA para que los títulos no glitcheen a la vez.
  useEffect(() => {
    if (theme !== "cyber" || reduced) return;
    let alive = true;
    let timer: number;

    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (!alive) return;
        setGlitching(true);
        timer = window.setTimeout(() => {
          if (!alive) return;
          setGlitching(false);
          schedule(3500 + Math.random() * 4500);
        }, 380);
      }, delay);
    };

    schedule(800 + Math.random() * 4200);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [theme, reduced]);

  return (
    <Tag
      ref={ref}
      id={id}
      data-text={children}
      data-flash={theme === "gym" && inView && !reduced ? "true" : undefined}
      data-glitching={glitching ? "true" : undefined}
      className={`title-fx ${className}`}
    >
      {children}
    </Tag>
  );
}
