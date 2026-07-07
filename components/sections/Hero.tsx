"use client";

import { useTranslation } from "react-i18next";
import { ThemedButton } from "@/components/ui/ThemedButton";

/**
 * Hero (CLAUDE.md §3.1): nombre, rol y tagline a pantalla completa con
 * el CTA showpiece (§6.2) como primera impresión. La interactividad
 * específica por tema (parallax de cielo, stats, grid/glitch) se añade
 * en el paso 6 junto a los efectos de fondo.
 */
export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center gap-6 text-center">
      <p className="font-sub text-lg tracking-[0.3em] text-text-muted uppercase">
        {t("hero.kicker")}
      </p>
      <h1 className="text-[clamp(3rem,10vw,7rem)] leading-none">
        {t("hero.name")}
      </h1>
      <p className="max-w-xl font-sub text-xl text-text-muted sm:text-2xl">
        {t("hero.tagline")}
      </p>
      <div className="mt-4">
        <ThemedButton href="#projects" showpiece>
          {t("hero.cta")}
        </ThemedButton>
      </div>
    </section>
  );
}
