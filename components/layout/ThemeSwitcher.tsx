"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PortalGlow, PortalScene, WORLD_STYLE } from "@/components/ui/PortalScene";
import { useTheme } from "@/lib/hooks/useTheme";
import type { ThemeId, ThemeMeta } from "@/lib/themes";

/**
 * Theme-switcher "3 portales" de desktop (CLAUDE.md §4/§4.1).
 * Triggers compactos pero vivos en el navbar; preview en hover/focus;
 * el activo queda "encendido" con aura y un punto que se desliza entre mundos.
 */
export function ThemeSwitcher() {
  const { theme, themes, travelTo } = useTheme();
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<ThemeId | null>(null);

  return (
    <div
      className="relative flex items-center gap-3"
      onMouseLeave={() => setHovered(null)}
      role="group"
      aria-label={t("nav.worlds")}
    >
      {themes.map((meta) => {
        const active = meta.id === theme;
        return (
          <div key={meta.id} className="relative">
            <motion.button
              type="button"
              onClick={(event) => {
                setHovered(null); // que la preview no fantasmee en el snapshot
                const rect = event.currentTarget.getBoundingClientRect();
                travelTo(meta.id, {
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                });
              }}
              onHoverStart={() => setHovered(meta.id)}
              onFocus={() => setHovered(meta.id)}
              onBlur={() => setHovered(null)}
              aria-pressed={active}
              aria-label={t("themes.switchTo", { world: meta.label })}
              className="relative block cursor-pointer p-0.5"
              whileHover={reduced ? undefined : { scale: 1.08, y: -2 }}
              whileTap={reduced ? undefined : { scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <PortalGlow world={meta.id}>
                <span
                  className="portal-frame h-10 w-16"
                  data-world={meta.id}
                  data-size="trigger"
                  data-active={active}
                >
                  <PortalScene world={meta.id} size="trigger" />
                </span>
              </PortalGlow>
              {active && (
                <motion.span
                  layoutId="portal-active-dot"
                  className="absolute -bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary shadow-glow"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>

            <AnimatePresence>
              {hovered === meta.id && !active && (
                <PortalPreview meta={meta} reduced={!!reduced} />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Mini-card de preview que se despliega bajo el trigger en hover/focus. */
function PortalPreview({ meta, reduced }: { meta: ThemeMeta; reduced: boolean }) {
  const { t } = useTranslation();
  const style = WORLD_STYLE[meta.id];

  return (
    <motion.div
      className="pointer-events-none absolute top-full left-1/2 z-50 mt-3 w-56 -translate-x-1/2"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.92 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <PortalGlow world={meta.id}>
        <span
          className="portal-frame h-36 w-full"
          data-world={meta.id}
          data-size="preview"
          data-active="true"
        >
          <PortalScene world={meta.id} size="preview" />
          {/* Velo de legibilidad + contenido, en la identidad del mundo */}
          <span
            className="portal-veil absolute inset-0 flex flex-col justify-end gap-1 p-4"
            style={{ background: style.veil, color: style.text }}
          >
            <span
              className="text-lg leading-none"
              style={{ fontFamily: style.display }}
            >
              {meta.label}
            </span>
            <span className="text-xs opacity-80" style={{ fontFamily: style.sub }}>
              {t(meta.taglineKey)}
            </span>
            <span className="mt-1.5 flex gap-1.5">
              {[
                meta.preview.primary,
                meta.preview.secondary,
                meta.preview.accent,
                meta.preview.background,
              ].map((color) => (
                <span
                  key={color}
                  className="size-2.5 rounded-full"
                  style={{
                    background: color,
                    boxShadow: "0 0 0 1px rgba(128,128,128,.35)",
                  }}
                />
              ))}
            </span>
          </span>
        </span>
      </PortalGlow>
    </motion.div>
  );
}
