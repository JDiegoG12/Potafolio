"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ThemeId } from "@/lib/themes";

const INTERACTIVE =
  "a, button, [role='button'], input, select, textarea, label, [data-cursor-hover]";

/** Configuración de "personalidad" del cursor por mundo. */
const SPRINGS: Record<ThemeId, { main: object; trail: object }> = {
  teyvat: {
    main: { stiffness: 700, damping: 40 },
    trail: { stiffness: 140, damping: 18, mass: 0.7 },
  },
  gym: {
    main: { stiffness: 1400, damping: 70 },
    trail: { stiffness: 1400, damping: 70 },
  },
  cyber: {
    main: { stiffness: 700, damping: 42 },
    trail: { stiffness: 380, damping: 32 },
  },
};

/**
 * Cursor custom por tema (CLAUDE.md §6): orbe con estela (Teyvat),
 * crosshair (Gym), retícula HUD con coordenadas (Cyber).
 * Solo en punteros finos; se desactiva con prefers-reduced-motion.
 */
export function CustomCursor() {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const coordsRef = useRef<HTMLSpanElement>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springs = SPRINGS[theme];
  const mainX = useSpring(x, springs.main);
  const mainY = useSpring(y, springs.main);
  const trailX = useSpring(x, springs.trail);
  const trailY = useSpring(y, springs.trail);

  const enabled = finePointer && !reduced;

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      if (coordsRef.current) {
        coordsRef.current.textContent = `${event.clientX} : ${event.clientY}`;
      }
    };
    const onOver = (event: Event) => {
      const target = event.target as Element | null;
      setHovering(!!target?.closest?.(INTERACTIVE));
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled, x, y]);

  // Oculta el cursor nativo solo mientras el custom está activo.
  useEffect(() => {
    document.documentElement.classList.toggle("has-custom-cursor", enabled);
    return () => document.documentElement.classList.remove("has-custom-cursor");
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      {theme === "teyvat" && (
        <>
          {/* Estela/glow perezosa */}
          <motion.div
            className="absolute size-9 rounded-full"
            style={{
              x: trailX,
              y: trailY,
              translateX: "-50%",
              translateY: "-50%",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--primary) 45%, transparent) 0%, transparent 70%)",
            }}
            animate={{ scale: hovering ? 1.7 : 1, opacity: hovering ? 0.7 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          />
          {/* Orbe */}
          <motion.div
            className="absolute size-2.5 rounded-full bg-primary"
            style={{
              x: mainX,
              y: mainY,
              translateX: "-50%",
              translateY: "-50%",
              boxShadow: "0 0 12px 2px var(--glow)",
            }}
            animate={{ scale: hovering ? 1.6 : 1 }}
          />
        </>
      )}

      {theme === "gym" && (
        <motion.div
          className="absolute size-7"
          style={{ x: mainX, y: mainY, translateX: "-50%", translateY: "-50%" }}
          animate={{ rotate: hovering ? 45 : 0, scale: hovering ? 1.35 : 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
        >
          <span className="absolute top-0 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-primary" />
          <span className="absolute bottom-0 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-primary" />
          <span className="absolute top-1/2 left-0 h-0.5 w-2 -translate-y-1/2 bg-primary" />
          <span className="absolute top-1/2 right-0 h-0.5 w-2 -translate-y-1/2 bg-primary" />
          <span className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 bg-primary" />
        </motion.div>
      )}

      {theme === "cyber" && (
        <>
          <motion.div
            className="absolute"
            style={{
              x: mainX,
              y: mainY,
              translateX: "-50%",
              translateY: "-50%",
              filter: "drop-shadow(0 0 4px var(--glow))",
            }}
            animate={{
              width: hovering ? 44 : 30,
              height: hovering ? 44 : 30,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          >
            <span className="absolute top-0 left-0 size-2 border-t-2 border-l-2 border-primary" />
            <span className="absolute top-0 right-0 size-2 border-t-2 border-r-2 border-primary" />
            <span className="absolute bottom-0 left-0 size-2 border-b-2 border-l-2 border-primary" />
            <span className="absolute right-0 bottom-0 size-2 border-r-2 border-b-2 border-primary" />
            <span className="absolute top-1/2 left-1/2 h-0.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-primary" />
          </motion.div>
          {/* Coordenadas en vivo (detalle HUD) */}
          <motion.span
            ref={coordsRef}
            className="absolute font-mono text-[9px] text-primary"
            style={{
              x: trailX,
              y: trailY,
              translateX: "14px",
              translateY: "14px",
              textShadow: "0 0 6px var(--glow)",
            }}
          />
        </>
      )}
    </div>
  );
}
