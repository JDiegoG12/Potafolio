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
    // min-h-svh (no dvh): dvh crece al ocultarse la barra del navegador
    // móvil y el hero empujaba todo el contenido hacia abajo a mitad de
    // scroll — los "tirones" entre secciones. svh es estable.
    <section className="flex min-h-svh flex-col items-center justify-center gap-6 text-center">
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
