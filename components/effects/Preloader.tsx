"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useReducedMotion,
  type TargetAndTransition,
} from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMounted } from "@/lib/hooks/useMounted";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "@/lib/themes";

/** Salida del preloader con la identidad de cada mundo. */
const EXIT: Record<ThemeId, TargetAndTransition> = {
  teyvat: {
    opacity: 0,
    scale: 1.06,
    filter: "blur(10px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  gym: {
    y: "-100%",
    transition: { duration: 0.45, ease: [0.85, 0, 0.15, 1] },
  },
  cyber: {
    clipPath: "inset(0 0 100% 0)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Preloader por tema (CLAUDE.md §6): el primer WOW al cargar.
 * El cobertor se renderiza en SSR con los tokens del tema (aplicados por el
 * script anti-flash), así cubre la página desde el primer paint; el contenido
 * animado entra tras la hidratación.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  const mounted = useMounted();
  // Mundo leído directamente del data-theme (ya correcto pre-hidratación).
  const [world] = useState<ThemeId>(() => {
    if (typeof document === "undefined") return DEFAULT_THEME;
    const current = document.documentElement.dataset.theme;
    return isThemeId(current) ? current : DEFAULT_THEME;
  });
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Progreso fake 0→100 sin re-renders (actualiza el DOM directamente).
  useEffect(() => {
    if (!mounted) return;
    const controls = animate(0, 100, {
      duration: reduced ? 0.3 : 1.7,
      ease: [0.3, 0.1, 0.3, 1],
      onUpdate: (value) => {
        const pct = `${Math.round(value)}`;
        if (pctRef.current) pctRef.current.textContent = pct;
        if (barRef.current) barRef.current.style.width = `${value}%`;
      },
      onComplete: () => setShow(false),
    });
    return () => controls.stop();
  }, [mounted, reduced]);

  // Sin scroll mientras el preloader cubre la página.
  useEffect(() => {
    if (!show) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          role="status"
          aria-label={t("preloader.loading")}
          className="fixed inset-0 z-90 flex items-center justify-center"
          style={{ background: "var(--scene)", backgroundColor: "var(--bg)" }}
          exit={reduced ? { opacity: 0, transition: { duration: 0.2 } } : EXIT[world]}
        >
          {mounted && (
            <>
              {world === "teyvat" && <TeyvatLoader pctRef={pctRef} barRef={barRef} />}
              {world === "gym" && <GymLoader pctRef={pctRef} barRef={barRef} />}
              {world === "cyber" && <CyberLoader pctRef={pctRef} barRef={barRef} />}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LoaderRefs {
  pctRef: React.RefObject<HTMLSpanElement | null>;
  barRef: React.RefObject<HTMLDivElement | null>;
}

/** Teyvat: emblema de diamantes rotando con glow dorado. */
function TeyvatLoader({ pctRef, barRef }: LoaderRefs) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative size-20">
        <span
          className="absolute inset-0 border border-primary"
          style={{
            rotate: "45deg",
            animation: "preloader-spin 3.4s linear infinite",
            boxShadow: "0 0 18px var(--glow), inset 0 0 12px var(--glow)",
          }}
        />
        <span
          className="absolute inset-2.5 border border-accent opacity-70"
          style={{
            rotate: "45deg",
            animation: "preloader-spin 3.4s linear infinite reverse",
          }}
        />
        <span
          className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{ boxShadow: "0 0 16px 4px var(--glow)" }}
        />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="h-px w-44 overflow-hidden bg-[color-mix(in_srgb,var(--primary)_25%,transparent)]">
          <div ref={barRef} className="h-full w-0 bg-primary" />
        </div>
        <span className="font-sub text-lg text-text-muted italic">
          <span ref={pctRef}>0</span>%
        </span>
      </div>
    </div>
  );
}

/** Gym: contador gigante + barra roja, sin contemplaciones. */
function GymLoader({ pctRef, barRef }: LoaderRefs) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-5 px-6">
      <span className="font-display text-8xl text-text sm:text-9xl">
        <span ref={pctRef}>0</span>
        <span className="text-primary">%</span>
      </span>
      <div className="h-1.5 w-64 max-w-full bg-[color-mix(in_srgb,var(--text)_15%,transparent)]">
        <div ref={barRef} className="h-full w-0 bg-primary" />
      </div>
      <span className="font-sub text-sm tracking-[0.5em] text-text-muted uppercase">
        {t("preloader.loading")}
      </span>
    </div>
  );
}

/** Cyber: secuencia de boot con líneas mono + barra neón. */
function CyberLoader({ pctRef, barRef }: LoaderRefs) {
  const { t } = useTranslation();
  const lines = [t("preloader.init"), `${t("preloader.world")}: CYBER`];
  return (
    <div className="flex w-72 max-w-[85vw] flex-col gap-2 font-mono text-xs text-primary">
      {lines.map((line, index) => (
        <motion.span
          key={line}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 + index * 0.3 }}
          style={{ textShadow: "0 0 8px var(--glow)" }}
        >
          {line}
        </motion.span>
      ))}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1 flex-1 bg-[color-mix(in_srgb,var(--primary)_20%,transparent)]">
          <div
            ref={barRef}
            className="h-full w-0 bg-primary"
            style={{ boxShadow: "0 0 8px var(--glow)" }}
          />
        </div>
        <span className="font-display text-sm">
          <span ref={pctRef}>0</span>%
        </span>
      </div>
    </div>
  );
}
