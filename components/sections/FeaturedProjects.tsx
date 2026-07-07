"use client";

import Image from "next/image";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/effects/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  ProjectEmblem,
  ProjectLinks,
  StackChips,
} from "@/components/ui/ProjectMeta";
import { FEATURED_PROJECTS } from "@/data/portfolio";
import type { Project } from "@/data/portfolio";

/**
 * Proyectos destacados (CLAUDE.md §3.3 + §3.1): KOB, BarberIA y Aimo,
 * cada uno con su presentación propia — no cards idénticas:
 * - KOB `showcase`: pieza estrella a ancho completo, imagen dominante.
 * - BarberIA `ribbon`: card vertical con cinta de poste de barbero.
 * - Aimo `chat`: card vertical con burbujas de conversación y el
 *   disclaimer de sensibilidad (§7.2) siempre visible.
 * Las firmas CSS viven en styles/projects.css y leen los tokens del
 * tema activo, así que las tres se re-skinean al viajar de mundo.
 */
export function FeaturedProjects() {
  const { t } = useTranslation();
  const [kob, barberia, aimo] = FEATURED_PROJECTS;

  return (
    <section id="projects" className="scroll-mt-20 py-24">
      <SectionTitle className="text-3xl sm:text-4xl">
        {t("sections.projects")}
      </SectionTitle>

      <div className="mt-10 flex flex-col gap-8">
        <Reveal>
          <ShowcaseCard project={kob} />
        </Reveal>
        <div className="grid gap-8 md:grid-cols-2">
          <Reveal className="min-w-0">
            <RibbonCard project={barberia} />
          </Reveal>
          <Reveal delay={0.08} className="min-w-0">
            <ChatCard project={aimo} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** KOB — "Showcase": flagship a ancho completo, imagen 55/45 en desktop. */
function ShowcaseCard({ project }: { project: Project }) {
  const { t } = useTranslation();

  return (
    <article className="project-card grid overflow-hidden rounded-lg border border-border bg-surface shadow-card lg:grid-cols-[11fr_9fr]">
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-full">
        <Image
          src={project.image ?? ""}
          alt={project.name}
          fill
          sizes="(min-width: 1024px) 620px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.2em] text-accent-ink uppercase">
          {t("projects.flagship")}
        </p>
        <div className="flex items-center gap-4">
          <ProjectEmblem category={project.category} />
          <h3 className="text-2xl sm:text-3xl">{project.name}</h3>
        </div>
        <p className="leading-relaxed text-text-muted">{t(project.descKey)}</p>
        <StackChips stack={project.stack} />
        <div className="mt-auto pt-2">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

/** BarberIA — "Ribbon": vertical con cinta de poste de barbero girando. */
function RibbonCard({ project }: { project: Project }) {
  const { t } = useTranslation();

  return (
    <article className="project-card relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      {/* Firma: cinta de poste (franjas --primary/--secondary + hueco claro) */}
      <span className="barber-ribbon" aria-hidden />

      <div className="relative aspect-[16/10]">
        <Image
          src={project.image ?? ""}
          alt={project.name}
          fill
          sizes="(min-width: 768px) 540px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex grow flex-col gap-4 p-6 pl-8 sm:p-7 sm:pl-9">
        <div className="flex items-center gap-4">
          <ProjectEmblem category={project.category} />
          <h3 className="text-2xl">{project.name}</h3>
        </div>
        <p className="leading-relaxed text-text-muted">{t(project.descKey)}</p>
        <StackChips stack={project.stack} />
        <div className="mt-auto pt-2">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

/** Aimo — "Chat": la descripción vive en burbujas de conversación. */
function ChatCard({ project }: { project: Project }) {
  const { t } = useTranslation();

  return (
    <article className="project-card flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="relative aspect-[16/10]">
        <Image
          src={project.image ?? ""}
          alt={project.name}
          fill
          sizes="(min-width: 768px) 540px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex grow flex-col gap-4 p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <ProjectEmblem category={project.category} />
          <h3 className="text-2xl">{project.name}</h3>
        </div>

        {/* Firma: hilo de conversación (descripción + respuesta de Aimo) */}
        <div className="chat-thread">
          <p className="chat-bubble chat-bubble--user">
            {t("projects.aimo.bubbleUser")}
          </p>
          <p className="chat-bubble chat-bubble--bot">
            {t("projects.aimo.bubbleBot")}
          </p>
        </div>

        <p className="leading-relaxed text-text-muted">{t(project.descKey)}</p>

        {/* Sensibilidad (§7.2): acompañamiento inicial, no ayuda profesional */}
        {project.noteKey && (
          <p className="flex items-start gap-2 text-sm text-text-muted italic">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
            {t(project.noteKey)}
          </p>
        )}

        <StackChips stack={project.stack} />
        <div className="mt-auto pt-2">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}
