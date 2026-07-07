"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LANGS } from "@/lib/i18n";

/**
 * Toggle discreto ES/EN, separado del theme-switcher (CLAUDE.md §4),
 * con píldora deslizante (layout animation de Framer Motion).
 *
 * El `layoutId` de la píldora lleva un `useId` por instancia: hay
 * varios toggles montados a la vez (navbar, footer, menú móvil) y un
 * layoutId compartido hace que Framer los trate como EL MISMO elemento
 * — la píldora se "muda" a una sola instancia y las demás quedan sin
 * indicador (bug del navbar vs footer).
 */
export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const instanceId = useId();

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="flex rounded-full border border-border bg-surface p-0.5 font-mono text-[11px]"
    >
      {LANGS.map((lang) => {
        const active = i18n.language === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => void i18n.changeLanguage(lang)}
            aria-pressed={active}
            className="relative cursor-pointer rounded-full px-2.5 py-1 uppercase"
          >
            {active && (
              <motion.span
                layoutId={`lang-pill-${instanceId}`}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                active ? "text-on-primary" : "text-text-muted hover:text-text"
              }`}
            >
              {lang}
            </span>
          </button>
        );
      })}
    </div>
  );
}
