"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/effects/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useTheme } from "@/lib/hooks/useTheme";
import { AUTHOR } from "@/data/portfolio";
import { THEME_LIST } from "@/lib/themes";

/**
 * Sobre mí (CLAUDE.md §3.2): bio + foto del autor que cambia según el
 * mundo activo. Las 3 fotos se montan apiladas y la del tema activo se
 * revela con un crossfade de opacidad — así el cambio de mundo no
 * re-descarga ni re-monta imágenes. Bio corta/larga son placeholders
 * ([BIO_CORTA]/[BIO_LARGA]) que Diego define luego (§7.1).
 */
export function About() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <section id="about" className="scroll-mt-20 py-24">
      <SectionTitle className="text-3xl sm:text-4xl">
        {t("sections.about")}
      </SectionTitle>

      <div className="mt-10 grid items-start gap-10 md:grid-cols-[2fr_3fr] lg:gap-14">
        {/* Foto 3:4 con marco temático; placeholder hasta tener las reales */}
        <Reveal className="relative mx-auto w-full max-w-sm md:mx-0">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border shadow-card">
            {THEME_LIST.map((world) => (
              <Image
                key={world.id}
                src={AUTHOR.photos[world.id]}
                alt={t("about.photoAlt", { world: world.label })}
                fill
                sizes="(min-width: 768px) 340px, 90vw"
                className="object-cover transition-opacity duration-700"
                style={{ opacity: theme === world.id ? 1 : 0 }}
                priority={world.id === theme}
              />
            ))}
          </div>
          {/* Acento decorativo detrás de la foto, con el glow del tema */}
          <div
            aria-hidden
            className="absolute -inset-3 -z-10 rounded-lg opacity-60"
            style={{ boxShadow: "var(--shadow-glow)" }}
          />
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col gap-5">
          <p className="font-sub text-xl leading-relaxed text-text sm:text-2xl">
            {t("about.bioShort")}
          </p>
          <p className="leading-relaxed text-text-muted">
            {t("about.bioLong")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
