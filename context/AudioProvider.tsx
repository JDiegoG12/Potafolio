"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { play, unlock } from "@/lib/audio-engine";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ThemeId } from "@/lib/themes";

/** Clave de persistencia del mute en localStorage. */
export const MUTE_STORAGE_KEY = "portfolio:mute";

/* ── Store externo del mute ─────────────────────────────────
   Mismo patrón que el tema (ThemeProvider): el estado vive fuera de
   React y useSyncExternalStore lo sincroniza sin mismatches de
   hidratación ni setState-en-efecto. SSR pinta el default (muteado);
   el cliente re-renderiza con lo guardado justo tras hidratar. */

const listeners = new Set<() => void>();
let currentMuted: boolean | null = null;

function readStoredMute(): boolean {
  try {
    // Opt-in: muteado salvo que el usuario haya activado el sonido antes.
    return window.localStorage.getItem(MUTE_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function getSnapshot(): boolean {
  if (currentMuted === null) currentMuted = readStoredMute();
  return currentMuted;
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setStoredMute(next: boolean) {
  currentMuted = next;
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(next));
  } catch {
    // Sin persistencia: el toggle sigue funcionando en la sesión.
  }
  listeners.forEach((listener) => listener());
}

/** Tema activo leído del DOM: evita re-suscribir listeners al viajar. */
function themeFromDom(): ThemeId {
  return (document.documentElement.dataset.theme ?? "teyvat") as ThemeId;
}

interface AudioContextValue {
  /** true = sin sonido (default en la primera visita: opt-in). */
  muted: boolean;
  /** Alterna el mute y lo persiste. Desmutear también desbloquea audio. */
  toggleMute: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

/**
 * Sistema de sonido por tema (CLAUDE.md §6). Decisiones clave:
 *
 * - **Opt-in:** arranca MUTEADO en la primera visita; el usuario activa
 *   el sonido explícitamente (MuteToggle) y su elección persiste en
 *   localStorage.
 * - **Autoplay policy:** el AudioContext se crea/reanuda en la primera
 *   interacción (pointerdown/keydown) o al desmutear — siempre gestos.
 * - **Delegación global:** hover/click sobre `a`, `button` y
 *   `[data-cursor-hover]` suenan sin instrumentar cada componente. El
 *   hover solo en dispositivos con hover real (no touch).
 * - **Viaje de mundos:** al cambiar el tema suena el "boot" del mundo
 *   entrante — también respeta el mute, como todo lo demás.
 *
 * @param props.children - Subárbol con acceso a {@link useAudio}.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const muted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const prevTheme = useRef(theme);

  // Desbloqueo del AudioContext en el primer gesto (autoplay policy).
  useEffect(() => {
    const onFirstGesture = () => {
      unlock();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture);
    window.addEventListener("keydown", onFirstGesture);
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, []);

  // Delegación global de hover/click. Lee el mute y el tema del store/DOM
  // (no del render) para suscribirse una sola vez.
  useEffect(() => {
    const INTERACTIVE = "a, button, [data-cursor-hover]";
    let lastHovered: Element | null = null;
    const canHover = window.matchMedia("(hover: hover)").matches;

    const onPointerOver = (event: PointerEvent) => {
      if (getSnapshot() || !canHover) return;
      const target = (event.target as Element | null)?.closest(INTERACTIVE);
      if (!target || target === lastHovered) {
        if (!target) lastHovered = null;
        return;
      }
      lastHovered = target;
      play(themeFromDom(), "hover");
    };

    const onClick = (event: MouseEvent) => {
      if (getSnapshot()) return;
      const target = (event.target as Element | null)?.closest(INTERACTIVE);
      if (target) play(themeFromDom(), "click");
    };

    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    return () => {
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("click", onClick);
    };
  }, []);

  // Sonido de viaje al cambiar de mundo (nunca en el mount inicial).
  useEffect(() => {
    if (prevTheme.current === theme) return;
    prevTheme.current = theme;
    if (!getSnapshot()) play(theme, "travel");
  }, [theme]);

  const toggleMute = useCallback(() => {
    const next = !getSnapshot();
    setStoredMute(next);
    if (!next) {
      // Desmutear es un gesto: momento perfecto para desbloquear y
      // confirmar con el sonido de click del mundo activo.
      unlock();
      play(themeFromDom(), "click");
    }
  }, []);

  return (
    <AudioCtx.Provider value={{ muted, toggleMute }}>
      {children}
    </AudioCtx.Provider>
  );
}

/**
 * Accede al estado de sonido (mute + toggle).
 *
 * @returns El valor del contexto de audio.
 * @throws Error si se llama fuera de un {@link AudioProvider}.
 */
export function useAudio(): AudioContextValue {
  const context = useContext(AudioCtx);
  if (!context) {
    throw new Error("useAudio debe usarse dentro de <AudioProvider>");
  }
  return context;
}
