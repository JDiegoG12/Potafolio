"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  Gem,
  Scissors,
  MessageCircleHeart,
  Piano,
  AudioLines,
} from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { ThemedButton } from "@/components/ui/ThemedButton";
import type { Project, ProjectCategory } from "@/data/portfolio";

/**
 * Piezas compartidas por las 5 presentaciones de proyecto (§3.1):
 * emblema de icono por propósito, chips de stack y bloque de enlaces
 * (demo + repos). Las cards las componen de formas distintas; aquí solo
 * vive lo que es idéntico entre todas para no repetirlo.
 */

/** Icono alusivo al propósito de cada categoría de proyecto (§3.1). */
const CATEGORY_ICON: Record<ProjectCategory, LucideIcon> = {
  jewelry: Gem,
  barber: Scissors,
  companion: MessageCircleHeart,
  piano: Piano,
  voice: AudioLines,
};

/**
 * Emblema del proyecto: el icono de su propósito en una caja tintada
 * con el acento del tema (styles/projects.css `.project-emblem`).
 *
 * @param props.category - Categoría que decide el icono.
 */
export function ProjectEmblem({ category }: { category: ProjectCategory }) {
  const Icon = CATEGORY_ICON[category];
  return (
    <span className="project-emblem" aria-hidden>
      <Icon size={22} strokeWidth={1.8} />
    </span>
  );
}

/**
 * Chips del stack tecnológico del proyecto.
 *
 * @param props.stack - Lista de tecnologías (nombres propios, sin i18n).
 */
export function StackChips({ stack }: { stack: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
      {stack.map((tech) => (
        <li key={tech} className="stack-chip">
          {tech}
        </li>
      ))}
    </ul>
  );
}

/**
 * Bloque de enlaces del proyecto: demo como botón temático sobrio
 * compacto (si existe) y repos como links secundarios con icono de
 * GitHub. Rein (sin demo) muestra solo su repo, promovido a botón para
 * que la card no quede sin acción principal.
 *
 * @param props.project - Proyecto del que se pintan los enlaces.
 */
export function ProjectLinks({ project }: { project: Project }) {
  const { t } = useTranslation();
  const hasDemo = Boolean(project.demoUrl);
  const [primaryRepo, ...restRepos] = [...project.repos].sort(
    (a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)),
  );
  // Sin demo (Rein): el repo primario asciende a acción principal.
  const secondaryRepos = hasDemo
    ? [primaryRepo, ...restRepos]
    : restRepos;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {hasDemo && project.demoUrl && (
        <ThemedButton
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm"
        >
          <ExternalLink size={15} aria-hidden />
          {t("projects.links.demo")}
        </ThemedButton>
      )}
      {!hasDemo && primaryRepo && (
        <ThemedButton
          href={primaryRepo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm"
        >
          <GitHubIcon size={15} />
          {t(primaryRepo.labelKey)}
        </ThemedButton>
      )}
      {secondaryRepos.map((repo) => (
        <a
          key={repo.url}
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-link"
          data-cursor-hover
        >
          <GitHubIcon size={15} />
          {t(repo.labelKey)}
        </a>
      ))}
    </div>
  );
}
