"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ThemeId } from "@/lib/themes";

/**
 * Variants de entrada por mundo (CLAUDE.md §6: Teyvat flota, Gym hace
 * slam, Cyber glitchea). La variant `visible` es una factory que recibe
 * el `delay` vía el prop `custom` de Framer Motion, para escalonar
 * cascadas sin perder los keyframes/eases propios de cada mundo.
 *
 * IMPORTANTE: cada `visible` resetea el set COMPLETO de propiedades
 * animadas (x, y, scale, opacity) aunque su mundo no las use. El
 * `hidden` inicial puede aplicarse con las variants de OTRO mundo (SSR
 * renderiza el tema default y el guardado llega tras hidratar): si p.
 * ej. quedó el y:28 de Teyvat y las variants pasan a Cyber (que no
 * animaba y), ese desplazamiento se quedaba pegado para siempre —
 * columnas desbordando su panel, medido en /certs.
 */
const REVEAL_VARIANTS: Record<ThemeId, Variants> = {
  // Flota: fade + ascenso suave, easing etéreo.
  teyvat: {
    hidden: { opacity: 0, y: 28 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    }),
  },
  // Slam: cae desde arriba con sobre-escala y se asienta en seco.
  gym: {
    hidden: { opacity: 0, y: -22, scale: 1.045 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.32, ease: [0.6, 0, 0.2, 1], delay },
    }),
  },
  // Glitch-in: parpadeo + jitter horizontal antes de asentarse.
  cyber: {
    hidden: { opacity: 0, x: -14 },
    visible: (delay: number) => ({
      opacity: [0, 1, 0.35, 1],
      x: [-14, 5, -2, 0],
      y: 0,
      scale: 1,
      transition: { duration: 0.42, times: [0, 0.45, 0.6, 1], delay },
    }),
  },
};

/** Fallback con prefers-reduced-motion: fade puro, sin desplazamiento. */
const REDUCED_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, delay },
  }),
};

/**
 * Reveal on scroll con el estilo del mundo activo (CLAUDE.md §6).
 * Anima una sola vez al entrar en viewport (`once`); si se viaja de
 * tema a mitad de página, lo ya revelado permanece visible. Los títulos
 * de sección NO lo necesitan: tienen su propia firma (§6.1).
 *
 * @param props.children - Contenido a revelar.
 * @param props.delay - Segundos de retardo, para cascadas cortas entre
 *   hermanos (usar pasos de ~0.08s; el escalonado debe sentirse ágil).
 *   @defaultValue 0
 * @param props.className - Clases del wrapper; pásale las de layout
 *   (p. ej. `h-full`) cuando envuelva hijos de un grid.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const variants = reduced ? REDUCED_VARIANTS : REVEAL_VARIANTS[theme];

  return (
    <motion.div
      className={className}
      custom={delay}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
    >
      {children}
    </motion.div>
  );
}
