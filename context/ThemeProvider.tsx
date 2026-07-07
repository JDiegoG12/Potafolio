"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  DEFAULT_THEME,
  isThemeId,
  THEME_LIST,
  THEME_STORAGE_KEY,
  THEMES,
  type ThemeId,
  type ThemeMeta,
} from "@/lib/themes";

/* ── Store externo del tema ─────────────────────────────────
   El tema vive fuera de React (localStorage + <html data-theme>);
   useSyncExternalStore lo sincroniza sin mismatches de hidratación:
   SSR renderiza el default y React re-renderiza con el tema guardado
   justo tras hidratar. */

const listeners = new Set<() => void>();

let currentTheme: ThemeId | null = null;

function readStoredTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function getSnapshot(): ThemeId {
  if (currentTheme === null) currentTheme = readStoredTheme();
  return currentTheme;
}

function getServerSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setStoredTheme(next: ThemeId) {
  currentTheme = next;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // localStorage bloqueado (modo privado): el tema funciona sin persistir.
  }
  listeners.forEach((listener) => listener());
}

/* ── Transición C+A (CLAUDE.md §5) ─────────────────────────
   Radial reveal por View Transitions API + capa de FX del mundo
   entrante. Duración/easing con la personalidad de cada mundo. */

/*
 * Ajustes medidos para móvil real (GPU + DPR 3):
 * - Teyvat: 1s dejaba una cola larga con el círculo casi lleno = re-raster
 *   de toda la pantalla por frame; en móvil se acorta.
 * - Gym: el easing anterior (0.85,0,...) mantenía el círculo en ~0 durante
 *   los primeros ~150ms, que coinciden con la congestión de arranque de la
 *   View Transition → el círculo "teletransportaba". Este arranca ya.
 */
const REVEAL: Record<
  ThemeId,
  { duration: number; mobileDuration: number; easing: string }
> = {
  teyvat: {
    duration: 950,
    mobileDuration: 700,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  gym: {
    duration: 450,
    mobileDuration: 450,
    easing: "cubic-bezier(0.5, 0, 0.15, 1)",
  },
  cyber: {
    duration: 650,
    mobileDuration: 600,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
};

export interface ThemeTransitionFx {
  world: ThemeId;
  x: number;
  y: number;
  /** Cambia en cada viaje: remonta el FX y siembra su PRNG. */
  key: number;
  /** Viewport estrecho → menos partículas (degradación móvil). */
  narrow: boolean;
}

export interface TravelOrigin {
  x: number;
  y: number;
}

/* ── Context ───────────────────────────────────────────────── */

interface ThemeContextValue {
  /** Tema activo. */
  theme: ThemeId;
  /** Metadatos del tema activo (label, colores de preview, foto). */
  themeMeta: ThemeMeta;
  /** Lista ordenada de los 3 mundos, para el switcher. */
  themes: ThemeMeta[];
  /** Cambio directo de tema (sin transición). Persiste en localStorage. */
  setTheme: (theme: ThemeId) => void;
  /**
   * Viaja a otro mundo con la transición C+A desde `origin` (centro del
   * portal pulsado, coords de viewport). Degrada a cambio directo si no
   * hay View Transitions API o con prefers-reduced-motion.
   * `onCommit` corre de forma síncrona dentro del callback de la View
   * Transition (pantalla congelada en el snapshot viejo): es el momento
   * gratis para trabajo pesado de React, p. ej. desmontar el menú móvil.
   */
  travelTo: (theme: ThemeId, origin?: TravelOrigin, onCommit?: () => void) => void;
  /** Estado de la capa de FX de la transición (para <ThemeTransition/>). */
  transitionFx: ThemeTransitionFx | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Raíz del theming (CLAUDE.md §2/§5). Sincroniza `<html data-theme>` con el
 * store externo del tema, expone {@link ThemeContextValue} vía Context y
 * orquesta la transición C+A entre mundos. Debe envolver a todo componente
 * que use {@link useTheme}; se monta una sola vez en `app/layout.tsx`.
 *
 * @param props.children - Subárbol con acceso al tema.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [transitionFx, setTransitionFx] = useState<ThemeTransitionFx | null>(null);
  const traveling = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setStoredTheme(next);
  }, []);

  const travelTo = useCallback(
    (next: ThemeId, origin?: TravelOrigin, onCommit?: () => void) => {
    if (next === getSnapshot() || traveling.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof document.startViewTransition !== "function") {
      onCommit?.();
      setStoredTheme(next);
      return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? 32;
    const narrow = window.innerWidth < 768;
    traveling.current = true;

    const viewTransition = document.startViewTransition(() => {
      // El callback corre tras capturar el snapshot viejo: aplicamos el
      // tema de forma síncrona para que el snapshot nuevo ya sea el
      // mundo entrante, con su capa de FX dentro (viaja con el círculo).
      document.documentElement.dataset.theme = next;
      flushSync(() => {
        onCommit?.();
        setStoredTheme(next);
        setTransitionFx({
          world: next,
          x,
          y,
          key: Date.now(),
          narrow,
        });
      });
    });

    const config = REVEAL[next];
    const duration = narrow ? config.mobileDuration : config.duration;
    const easing = config.easing;

    viewTransition.ready
      .then(() => {
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );
        const reveal = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing,
            pseudoElement: "::view-transition-new(root)",
          },
        );
        return reveal.finished;
      })
      .catch(() => {
        // El navegador puede abortar la transición (p. ej. otra en curso);
        // el tema ya quedó aplicado, solo se pierde el efecto.
      })
      .finally(() => {
        traveling.current = false;
      });

    // La capa de FX vive un poco más que el reveal y se autolimpia.
    window.setTimeout(() => setTransitionFx(null), duration + 400);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMeta: THEMES[theme],
        themes: THEME_LIST,
        setTheme,
        travelTo,
        transitionFx,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Accede al tema activo y a las acciones de theming ({@link ThemeContextValue}).
 * Se re-exporta desde `@/lib/hooks/useTheme` para el consumo público.
 *
 * @returns El valor del contexto de tema.
 * @throws Error si se llama fuera de un {@link ThemeProvider}.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return context;
}

/**
 * Script anti-flash: se inyecta al inicio de <body> y aplica el tema guardado
 * de forma síncrona, antes del primer paint, para que no haya parpadeo
 * del tema default al guardado.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="teyvat"&&t!=="gym"&&t!=="cyber")t=${JSON.stringify(
  DEFAULT_THEME,
)};document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme=${JSON.stringify(
  DEFAULT_THEME,
)}}})();`;
