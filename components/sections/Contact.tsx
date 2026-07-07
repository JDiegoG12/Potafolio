"use client";

import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/effects/Reveal";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { AUTHOR } from "@/data/portfolio";

/**
 * Contacto (CLAUDE.md §3.5): el perfil de GitHub como pieza destacada
 * (card grande con CTA temático sobrio) y email + LinkedIn como filas
 * secundarias. Los datos vienen centralizados de data/portfolio.ts.
 */
export function Contact() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="scroll-mt-20 py-24">
      <SectionTitle className="text-3xl sm:text-4xl">
        {t("sections.contact")}
      </SectionTitle>

      <Reveal>
        <p className="mt-6 max-w-xl font-sub text-lg text-text-muted">
          {t("contact.pitch")}
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-[3fr_2fr]">
        {/* GitHub: el enlace protagonista */}
        <Reveal className="min-w-0">
          <div className="project-card flex h-full min-w-0 flex-col items-start gap-5 rounded-lg border border-border bg-surface p-7 shadow-card sm:p-9">
            <span className="project-emblem" aria-hidden>
              <GitHubIcon size={22} />
            </span>
            <div>
              <h3 className="text-2xl">{t("contact.githubTitle")}</h3>
              <p className="mt-1 font-mono text-sm text-text-muted">
                {AUTHOR.githubHandle}
              </p>
            </div>
            <div className="mt-auto pt-2">
              <ThemedButton
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon size={16} />
                {t("contact.githubCta")}
              </ThemedButton>
            </div>
          </div>
        </Reveal>

        {/* Email + LinkedIn: filas secundarias. min-w-0: el email es texto
            irrompible y sin esto infla el min-content del grid en móvil. */}
        <Reveal delay={0.08} className="min-w-0">
          <div className="flex h-full min-w-0 flex-col gap-6">
            <a
              href={`mailto:${AUTHOR.email}`}
              data-cursor-hover
              className="project-card flex grow items-center gap-4 rounded-lg border border-border bg-surface p-6 shadow-card"
            >
              <span className="project-emblem" aria-hidden>
                <Mail size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-sub text-sm tracking-wide text-text-muted uppercase">
                  {t("contact.emailLabel")}
                </span>
                <span className="block truncate text-text">{AUTHOR.email}</span>
              </span>
            </a>

            <a
              href={AUTHOR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="project-card flex grow items-center gap-4 rounded-lg border border-border bg-surface p-6 shadow-card"
            >
              <span className="project-emblem" aria-hidden>
                <LinkedInIcon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-sub text-sm tracking-wide text-text-muted uppercase">
                  {t("contact.linkedinLabel")}
                </span>
                <span className="block truncate text-text">
                  Juan Diego Gomez Garces
                </span>
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
