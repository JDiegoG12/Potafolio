"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/effects/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { useAudio } from "@/context/AudioProvider";
import { play } from "@/lib/audio-engine";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ThemeId } from "@/lib/themes";

/** Duración de una ronda. */
const GAME_MS = 30_000;
/** Vida de cada objetivo antes de desvanecerse. */
const TARGET_LIFE_MS = 1_400;
/** Máximo de objetivos simultáneos (pantallas móviles pequeñas). */
const MAX_TARGETS = 4;
/** Paso del bucle de juego. */
const TICK_MS = 100;
/** Rampa de dificultad: intervalo entre spawns al inicio → al final. */
const SPAWN_START_MS = 900;
const SPAWN_END_MS = 460;
/** Prefijo de la clave del récord (uno por mundo). */
const BEST_KEY_PREFIX = "portfolio:arcade:best:";

interface Target {
  id: number;
  /** Posición en % del escenario (translate -50% centra el objetivo). */
  x: number;
  y: number;
  born: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
}

type Phase = "idle" | "playing" | "over";

function readBest(theme: ThemeId): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY_PREFIX + theme)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(theme: ThemeId, score: number) {
  try {
    window.localStorage.setItem(BEST_KEY_PREFIX + theme, String(score));
  } catch {
    // Sin persistencia (modo privado): el récord vive solo en la sesión.
  }
}

/**
 * Posición aleatoria dentro del escenario, con unos reintentos para no
 * solapar objetivos vivos (con ≤4 simultáneos casi siempre acierta a la
 * primera). La `y` pesa menos en la distancia porque el escenario es
 * más ancho que alto.
 */
function makeTarget(id: number, existing: Target[]): Target {
  let x = 50;
  let y = 50;
  for (let attempt = 0; attempt < 6; attempt++) {
    x = 10 + Math.random() * 80;
    y = 16 + Math.random() * 68;
    const clear = existing.every(
      (t) => Math.hypot(t.x - x, (t.y - y) * 0.6) > 18,
    );
    if (clear) break;
  }
  return { id, x, y, born: performance.now() };
}

/**
 * Sección arcade: minijuego de reflejos de 30s que se re-skinea por
 * mundo — cazas chispas doradas (Teyvat), golpeas discos (Gym) o
 * interceptas nodos de un hackeo (Cyber). Una sola mecánica (tocar
 * objetivos antes de que expiren) con récord por mundo en localStorage;
 * el carácter lo ponen las skins de styles/arcade.css y los sonidos del
 * mundo activo. Touch es input de primera clase (objetivos ≥44px,
 * touch-action: manipulation en el escenario).
 */
export function Arcade() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { muted } = useAudio();
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const [remainingMs, setRemainingMs] = useState(GAME_MS);
  const [targets, setTargets] = useState<Target[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [shaking, setShaking] = useState(false);

  // Estado del bucle que no debe re-renderizar (tiempos e ids).
  const loop = useRef({ started: 0, lastSpawn: 0, nextId: 1 });
  const shakeTimer = useRef(0);

  // El récord se lee tras montar (localStorage no existe en SSR) y al
  // viajar de mundo (cada mundo guarda el suyo).
  useEffect(() => {
    setBest(readBest(theme));
  }, [theme]);

  // Bucle de juego: un solo intervalo mueve reloj, expiración y spawns.
  useEffect(() => {
    if (phase !== "playing") return;
    const state = loop.current;

    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - state.started;

      if (elapsed >= GAME_MS) {
        setTargets([]);
        setPhase("over");
        return;
      }
      setRemainingMs(GAME_MS - elapsed);
      setTargets((alive) =>
        alive.filter((target) => now - target.born < TARGET_LIFE_MS),
      );

      // Dificultad: el intervalo de spawn se acorta linealmente.
      const spawnEvery =
        SPAWN_START_MS + (SPAWN_END_MS - SPAWN_START_MS) * (elapsed / GAME_MS);
      if (now - state.lastSpawn >= spawnEvery) {
        state.lastSpawn = now;
        setTargets((alive) =>
          alive.length >= MAX_TARGETS
            ? alive
            : [...alive, makeTarget(state.nextId++, alive)],
        );
      }
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [phase]);

  // Fin de ronda: compara contra el récord del mundo y persiste.
  useEffect(() => {
    if (phase !== "over") return;
    const stored = readBest(theme);
    if (score > stored) {
      writeBest(theme, score);
      setBest(score);
      setNewRecord(true);
    }
  }, [phase, score, theme]);

  const start = () => {
    const state = loop.current;
    state.started = performance.now();
    state.lastSpawn = 0; // spawn inmediato en el primer tick
    setScore(0);
    setTargets([]);
    setBursts([]);
    setNewRecord(false);
    setRemainingMs(GAME_MS);
    setPhase("playing");
  };

  const hit = (target: Target) => (event: React.PointerEvent) => {
    // pointerdown (no click): en touch responde al instante, sin los
    // ~100ms extra del tap. preventDefault evita el click fantasma.
    event.preventDefault();
    setTargets((alive) => alive.filter((t) => t.id !== target.id));
    setScore((s) => s + 1);

    const burst: Burst = { id: target.id, x: target.x, y: target.y };
    setBursts((all) => [...all, burst]);
    window.setTimeout(
      () => setBursts((all) => all.filter((b) => b.id !== burst.id)),
      500,
    );

    if (!muted) play(theme, "hover");
    if (theme === "gym" && !reduced) {
      // Impacto Gym: el escenario tiembla un instante.
      setShaking(true);
      window.clearTimeout(shakeTimer.current);
      shakeTimer.current = window.setTimeout(() => setShaking(false), 200);
    }
  };

  const timePct = (remainingMs / GAME_MS) * 100;

  return (
    <section id="arcade" className="scroll-mt-20 py-24">
      <SectionTitle className="text-3xl sm:text-4xl">
        {t("sections.arcade")}
      </SectionTitle>

      <Reveal>
        <p className="mt-6 max-w-xl font-sub text-lg text-text-muted">
          {t("arcade.pitch")}
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className={`arcade-stage mt-10 ${shaking ? "arcade-shake" : ""}`}>
          {phase === "playing" && (
            <>
              <div className="arcade-hud">
                <span className="arcade-score" aria-live="off">
                  {score}
                </span>
                <div className="arcade-timebar" aria-hidden>
                  <i style={{ width: `${timePct}%` }} />
                </div>
                <span className="arcade-hud-best">
                  {t("arcade.best")} {best}
                </span>
              </div>

              {targets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  tabIndex={-1}
                  aria-label={t("arcade.target")}
                  className="arcade-target"
                  style={
                    {
                      left: `${target.x}%`,
                      top: `${target.y}%`,
                      "--arcade-life": `${TARGET_LIFE_MS}ms`,
                    } as React.CSSProperties
                  }
                  onPointerDown={hit(target)}
                >
                  <span className="arcade-target-skin" aria-hidden />
                </button>
              ))}

              {bursts.map((burst) => (
                <span
                  key={burst.id}
                  className="arcade-burst"
                  style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
                  aria-hidden
                />
              ))}
            </>
          )}

          {phase !== "playing" && (
            <div className="arcade-overlay">
              <h3 className="arcade-name text-2xl sm:text-3xl">
                {t(`arcade.${theme}.name`)}
              </h3>

              {phase === "idle" ? (
                <p className="max-w-md text-sm leading-relaxed text-text-muted sm:text-base">
                  {t(`arcade.${theme}.hint`)}
                </p>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <p className="font-sub text-sm tracking-[0.2em] text-text-muted uppercase">
                    {t("arcade.over")}
                  </p>
                  <p className="arcade-final">{score}</p>
                  <p className="font-mono text-xs text-text-muted">
                    {newRecord
                      ? t("arcade.record")
                      : `${t("arcade.best")}: ${best}`}
                  </p>
                </div>
              )}

              <ThemedButton onClick={start} className="btn-sm">
                {t(phase === "idle" ? "arcade.play" : "arcade.again")}
              </ThemedButton>

              {phase === "idle" && best > 0 && (
                <p className="font-mono text-xs text-text-muted">
                  {t("arcade.best")}: {best}
                </p>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
