"use client";

import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/effects/Reveal";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { AUTHOR } from "@/data/portfolio";

/**
 * Footer (CLAUDE.md §3.6): créditos, links rápidos de navegación,
 * iconos sociales y el toggle de idioma — que en móvil solo existe
 * aquí y en el menú overlay (el navbar lo oculta bajo `sm:`).
 */
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border">
      <Reveal className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            aria-label={t("nav.primary")}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-sub text-sm text-text-muted transition-colors hover:text-accent-ink"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <a
              href={AUTHOR.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              data-cursor-hover
              className="text-text-muted transition-colors hover:text-accent-ink"
            >
              <GitHubIcon size={20} />
            </a>
            <a
              href={AUTHOR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              data-cursor-hover
              className="text-text-muted transition-colors hover:text-accent-ink"
            >
              <LinkedInIcon size={20} />
            </a>
            <LanguageToggle />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-xs text-text-muted">
            {t("footer.credits")}
          </p>
          <a
            href="#top"
            data-cursor-hover
            className="flex items-center gap-1.5 font-sub text-xs text-text-muted transition-colors hover:text-accent-ink"
          >
            <ArrowUp size={14} aria-hidden />
            {t("footer.backToTop")}
          </a>
        </div>
      </Reveal>
    </footer>
  );
}
