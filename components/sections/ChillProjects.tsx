"use client";

import Image from "next/image";
import { AppWindow, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/effects/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  ProjectEmblem,
  ProjectLinks,
  StackChips,
} from "@/components/ui/ProjectMeta";
import { CHILL_PROJECTS } from "@/data/portfolio";
import type { Project } from "@/data/portfolio";

/**
 * Proyectos chill (CLAUDE.md §3.4 + §3.1): AirPiano y Rein, cada uno
 * con su presentación propia:
 * - AirPiano `keys`: card ancha con franja de teclas de piano que se
 *   "pulsan" en onda al hover.
 * - Rein `terminal`: SIN demo ni imagen (es un .exe sin UI web) y debe
 *   verse intencional — escena viva de orbe Jarvis + onda de voz,
 *   badge "App de escritorio · ejecutable" y solo el link a GitHub.
 */
export function ChillProjects() {
  const { t } = useTranslation();
  const [airpiano, rein] = CHILL_PROJECTS;

  return (
    <section id="chill" className="scroll-mt-20 py-24">
      <SectionTitle className="text-3xl sm:text-4xl">
        {t("sections.chill")}
      </SectionTitle>

      <div className="mt-10 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <Reveal className="min-w-0">
          <KeysCard project={airpiano} />
        </Reveal>
        <Reveal delay={0.08} className="min-w-0">
          <TerminalCard project={rein} />
        </Reveal>
      </div>
    </section>
  );
}

/** AirPiano — "Keys": teclas de piano CSS en el borde inferior. */
function KeysCard({ project }: { project: Project }) {
  const { t } = useTranslation();
  // Dos octavas de teclas blancas; llevan tecla negra las posiciones
  // C D F G A del patrón real de octava (índices 0,1,3,4,5).
  const BLACK_AFTER = new Set([0, 1, 3, 4, 5]);
  const keys = Array.from({ length: 14 }, (_, i) => ({
    i,
    black: BLACK_AFTER.has(i % 7) && i !== 13,
  }));

  return (
    <article className="project-card keys-card flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="grid grow sm:grid-cols-2">
        <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-full">
          <Image
            src={project.image ?? ""}
            alt={project.name}
            fill
            sizes="(min-width: 640px) 380px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-4 p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <ProjectEmblem category={project.category} />
            <h3 className="text-2xl">{project.name}</h3>
          </div>
          <p className="leading-relaxed text-text-muted">
            {t(project.descKey)}
          </p>
          <StackChips stack={project.stack} />
          <div className="mt-auto pt-2">
            <ProjectLinks project={project} />
          </div>
        </div>
      </div>

      {/* Firma: franja de teclas; onda de pulsación al hover de la card */}
      <div className="piano-strip" aria-hidden>
        {keys.map((key) => (
          <span
            key={key.i}
            className="piano-key"
            data-black={key.black ? "" : undefined}
            style={{ "--i": key.i } as React.CSSProperties}
          />
        ))}
      </div>
    </article>
  );
}

/** Rein — "Terminal": consola con orbe Jarvis y onda de voz, sin imagen. */
function TerminalCard({ project }: { project: Project }) {
  const { t } = useTranslation();
  // Alturas base de la onda (forma estática creíble con reduced-motion)
  // y desfases de la animación, por barra.
  const BARS = [
    30, 55, 40, 75, 58, 90, 48, 82, 62, 95, 52, 70, 38, 60, 28,
  ];

  return (
    <article className="project-card flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      {/* Cabecera tipo ventana de consola */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-solid px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-primary opacity-80" />
          <i className="size-2.5 rounded-full bg-secondary opacity-80" />
          <i className="size-2.5 rounded-full border border-border" />
        </span>
        <span className="font-mono text-xs tracking-wider text-text-muted">
          REIN.EXE
        </span>
        {/* Badge §3.1: deja claro que no hay demo web a propósito */}
        <span className="ml-auto flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 font-mono text-[0.65rem] tracking-wide text-text-muted uppercase">
          <AppWindow size={12} aria-hidden />
          {t("projects.rein.badge")}
        </span>
      </div>

      {/* Firma: escena viva en el hueco donde otras cards tienen imagen */}
      <div className="rein-scene min-h-56 px-6 py-8">
        <span className="rein-orb" aria-hidden />
        <div className="rein-wave" aria-hidden>
          {BARS.map((h, i) => (
            <i
              key={i}
              style={
                {
                  "--h": `${h}%`,
                  "--d": `${(i % 5) * -0.22}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <p className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Mic size={13} aria-hidden />
          {t("projects.rein.listening")}
          <span className="text-accent-ink">{t("projects.rein.wake")}</span>
        </p>
      </div>

      <div className="flex grow flex-col gap-4 border-t border-border p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <ProjectEmblem category={project.category} />
          <h3 className="text-2xl">{project.name}</h3>
        </div>
        <p className="leading-relaxed text-text-muted">{t(project.descKey)}</p>
        <p className="font-mono text-xs text-text-muted">
          {t("projects.rein.noUi")}
        </p>
        <StackChips stack={project.stack} />
        <div className="mt-auto pt-2">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}
