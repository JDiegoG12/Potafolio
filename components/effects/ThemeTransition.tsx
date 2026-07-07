"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ThemeTransitionFx } from "@/context/ThemeProvider";

/**
 * Capa A de la transición entre temas (CLAUDE.md §5): textura/partículas
 * del mundo ENTRANTE. Se renderiza dentro del snapshot nuevo de la View
 * Transition, así que el círculo del reveal la recorta y viaja con el
 * frente de onda. Densidad reducida en móvil.
 */
export function ThemeTransition() {
  const { transitionFx } = useTheme();
  if (!transitionFx) return null;
  return <FxLayer key={transitionFx.key} fx={transitionFx} />;
}

function FxLayer({ fx }: { fx: ThemeTransitionFx }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-80 overflow-clip">
      {fx.world === "teyvat" && <TeyvatBurst fx={fx} />}
      {fx.world === "gym" && <GymSlam fx={fx} />}
      {fx.world === "cyber" && <CyberGlitch fx={fx} />}
    </div>
  );
}

/**
 * PRNG determinista (mulberry32): el render debe ser puro para el React
 * Compiler, así que la "aleatoriedad" se siembra con fx.key (distinto en
 * cada viaje) en lugar de llamar a Math.random() durante el render.
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Teyvat: barrido de luz dorada con chispas ───────────── */

function TeyvatBurst({ fx }: { fx: ThemeTransitionFx }) {
  const sparks = useMemo(() => {
    const random = mulberry32(fx.key);
    const count = fx.narrow ? 8 : 18;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + random() * 0.5;
      const distance = 140 + random() * 320;
      return {
        id: i,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 4 + random() * 6,
        // ≤0.8s: las chispas mueren antes del teardown de la View
        // Transition (en móvil la cola de FX + reveal largo daba jank).
        duration: 0.5 + random() * 0.3,
      };
    });
  }, [fx.key, fx.narrow]);

  return (
    <>
      {/* Anillo de luz expandiéndose desde el portal. Sin sombra interior
          y con blur contenido: las sombras desenfocadas en elementos
          escalados son texturas gigantes carísimas en GPU móvil. */}
      <motion.span
        className="absolute rounded-full border-2"
        style={{
          left: fx.x,
          top: fx.y,
          width: 60,
          height: 60,
          x: "-50%",
          y: "-50%",
          borderColor: "#e9c883",
          boxShadow: fx.narrow
            ? "0 0 16px 4px rgba(201,162,39,.4)"
            : "0 0 28px 8px rgba(201,162,39,.5)",
        }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: fx.narrow ? 10 : 14, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Chispas doradas radiando (sin glow de sombra en móvil) */}
      {sparks.map((spark) => (
        <motion.span
          key={spark.id}
          className="absolute rounded-full"
          style={{
            left: fx.x,
            top: fx.y,
            width: spark.size,
            height: spark.size,
            background:
              "radial-gradient(circle, #fff8e0 0%, #ffd766 55%, transparent 80%)",
            boxShadow: fx.narrow ? undefined : "0 0 10px 2px rgba(255,215,102,.7)",
          }}
          initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
          animate={{
            x: `calc(-50% + ${spark.dx}px)`,
            y: `calc(-50% + ${spark.dy}px)`,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: spark.duration, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

/* ── Gym: onda de choque + flash de franjas diagonales ───── */

function GymSlam({ fx }: { fx: ThemeTransitionFx }) {
  return (
    <>
      {/* Onda de choque angular (cuadrado rotado, brutal) */}
      <motion.span
        className="absolute border-4"
        style={{
          left: fx.x,
          top: fx.y,
          width: 70,
          height: 70,
          x: "-50%",
          y: "-50%",
          rotate: 45,
          borderColor: "#ff3b30",
          boxShadow: fx.narrow ? undefined : "0 0 24px rgba(255,59,48,.6)",
        }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: fx.narrow ? 12 : 16, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.5, 0, 0.15, 1] }}
      />
      {/* Flash de impacto: en móvil, color plano (rasterizar un patrón a
          pantalla completa a DPR 3 justo en el arranque de la View
          Transition era parte del jank medido); en desktop, franjas. */}
      <motion.span
        className="absolute inset-0"
        style={
          fx.narrow
            ? { background: "#ff3b30" }
            : {
                backgroundImage:
                  "linear-gradient(-45deg, rgba(255,59,48,.5) 25%, transparent 25% 50%, rgba(255,59,48,.5) 50% 75%, transparent 75%)",
                backgroundSize: "80px 80px",
              }
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: fx.narrow ? [0, 0.18, 0] : [0, 0.45, 0] }}
        transition={{ duration: 0.45, times: [0, 0.3, 1], ease: "easeOut" }}
      />
      {/* Barra que cruza en diagonal, tipo "slam" */}
      <motion.span
        className="absolute w-[150vw]"
        style={{
          left: "-25vw",
          top: fx.y,
          height: fx.narrow ? 56 : 96,
          rotate: -14,
          background: "#ff3b30",
          boxShadow: fx.narrow ? undefined : "0 0 32px rgba(255,59,48,.8)",
        }}
        initial={{ x: "-120%", opacity: 1 }}
        animate={{ x: "120%", opacity: 0.9 }}
        transition={{ duration: 0.45, ease: [0.5, 0, 0.15, 1] }}
      />
    </>
  );
}

/* ── Cyber: scanlines/slices que se ensamblan ────────────── */

function CyberGlitch({ fx }: { fx: ThemeTransitionFx }) {
  const slices = useMemo(() => {
    const random = mulberry32(fx.key);
    const count = fx.narrow ? 6 : 12;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: random() * 100,
      height: 2 + random() * 5,
      width: 30 + random() * 50,
      magenta: i % 3 === 2,
      delay: i * 0.035,
    }));
  }, [fx.key, fx.narrow]);

  return (
    <>
      {/* Slices horizontales ensamblándose desde el origen */}
      {slices.map((slice) => (
        <motion.span
          key={slice.id}
          className="absolute"
          style={{
            top: `${slice.top}%`,
            left: fx.x,
            height: slice.height,
            width: `${slice.width}vw`,
            background: slice.magenta
              ? "rgba(255,46,196,.75)"
              : "rgba(0,229,255,.75)",
            boxShadow: slice.magenta
              ? "0 0 12px rgba(255,46,196,.8)"
              : "0 0 12px rgba(0,229,255,.8)",
            transformOrigin: "left center",
          }}
          initial={{ scaleX: 0, x: "-50%", opacity: 1 }}
          animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
          transition={{
            duration: 0.55,
            times: [0, 0.4, 1],
            delay: slice.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
      {/* Flash de scanlines CRT */}
      <motion.span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,229,255,.18) 0 1px, transparent 1px 4px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.6, times: [0, 0.25, 1] }}
      />
    </>
  );
}
