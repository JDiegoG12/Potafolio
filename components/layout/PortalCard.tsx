"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PortalGlow, PortalScene, WORLD_STYLE } from "@/components/ui/PortalScene";
import type { ThemeMeta } from "@/lib/themes";

/**
 * Tarjeta-portal grande del menú móvil (CLAUDE.md §4): la versión donde
 * los portales "realmente lucen" como ventanas a cada mundo.
 */
export function PortalCard({
  meta,
  active,
  onSelect,
}: {
  meta: ThemeMeta;
  active: boolean;
  /** Recibe el centro de la tarjeta (viewport) como origen de la transición. */
  onSelect: (origin: { x: number; y: number }) => void;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const style = WORLD_STYLE[meta.id];

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onSelect({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      aria-pressed={active}
      aria-label={t("themes.switchTo", { world: meta.label })}
      className="relative block w-full cursor-pointer text-left"
      whileTap={reduced ? undefined : { scale: 0.97 }}
    >
      <PortalGlow world={meta.id}>
        <span
          className="portal-frame h-32 w-full sm:h-36"
          data-world={meta.id}
          data-size="card"
          data-active={active}
        >
          <PortalScene world={meta.id} size="card" />
          <span
            className="portal-veil absolute inset-0 flex items-end justify-between gap-3 p-5"
            style={{ background: style.veil, color: style.text }}
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span
                className="text-2xl leading-none sm:text-3xl"
                style={{ fontFamily: style.display }}
              >
                {meta.label}
              </span>
              <span
                className="truncate text-sm opacity-80"
                style={{ fontFamily: style.sub }}
              >
                {t(meta.taglineKey)}
              </span>
            </span>

            <span className="flex shrink-0 flex-col items-end gap-2">
              {active && (
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] tracking-widest uppercase"
                  style={{
                    fontFamily: style.sub,
                    background: meta.preview.primary,
                    color: meta.preview.background,
                    boxShadow: `0 0 12px ${meta.preview.primary}`,
                  }}
                >
                  ● {t("themes.active")}
                </span>
              )}
              <span className="flex gap-1.5">
                {[
                  meta.preview.primary,
                  meta.preview.secondary,
                  meta.preview.accent,
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
        </span>
      </PortalGlow>
    </motion.button>
  );
}
