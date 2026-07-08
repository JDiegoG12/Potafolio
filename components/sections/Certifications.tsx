"use client";

import { BadgeCheck, Download, ExternalLink, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/effects/Reveal";
import { CiscoIcon, NvidiaIcon } from "@/components/ui/BrandIcons";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CERTIFICATIONS } from "@/data/portfolio";
import type { CertIssuer, Certification } from "@/data/portfolio";

/**
 * Certificaciones / Logros (CLAUDE.md §7.5): sección contenida —
 * complemento de los proyectos, no protagonista. UN solo panel/marco a
 * todo el ancho dividido en dos columnas internas (Cisco | NVIDIA) por
 * un separador hairline: al compartir contenedor, la diferencia 3 vs 5
 * certificaciones no se lee como "dos cajas de distinto tamaño" — es
 * una columna con más filas dentro del mismo marco. En móvil colapsa a
 * una columna con divisor horizontal (styles/certs.css `.cert-col`).
 *
 * Cada fila es un enlace completo al certificado; el tipo se distingue
 * de un vistazo: Cisco → PDF (documento/descarga), NVIDIA → página de
 * verificación (insignia/enlace externo). Los títulos no se traducen;
 * las fechas ISO "YYYY-MM" se formatean legibles con Intl según idioma.
 */
export function Certifications() {
  const { t } = useTranslation();

  return (
    <section id="certs" className="scroll-mt-20 py-24">
      <SectionTitle className="text-3xl sm:text-4xl">
        {t("sections.certs")}
      </SectionTitle>

      <div className="cert-panel mt-10 rounded-lg border border-border bg-surface shadow-card md:grid md:grid-cols-2">
        {CERTIFICATIONS.map((issuer, index) => (
          <Reveal
            key={issuer.id}
            delay={index * 0.08}
            className="cert-col min-w-0"
          >
            <IssuerColumn issuer={issuer} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Marca del emisor, tintada por el tema (uso identificativo, §7.5). */
function IssuerMark({ id }: { id: CertIssuer["id"] }) {
  const Icon = id === "cisco" ? CiscoIcon : NvidiaIcon;
  return (
    <span className="project-emblem" aria-hidden>
      <Icon size={22} />
    </span>
  );
}

/** Columna de un emisor dentro del panel único: cabecera + filas. */
function IssuerColumn({ issuer }: { issuer: CertIssuer }) {
  const { t } = useTranslation();

  return (
    <div>
      <header className="flex items-center gap-3.5 px-5 pt-5 pb-4 sm:px-6">
        <IssuerMark id={issuer.id} />
        <h3 className="text-xl leading-none">{issuer.name}</h3>
        <span className="ml-auto font-mono text-xs text-text-muted">
          {t("certs.count", { count: issuer.certifications.length })}
        </span>
      </header>

      <ul className="cert-list">
        {issuer.certifications.map((cert) => (
          <li key={cert.url}>
            <CertRow cert={cert} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Fila compacta y 100% clicable de una certificación. El título se
 * trunca a 2 líneas (los hay largos) y queda accesible completo vía
 * `title`; área de toque ≥44px y foco visible por el outline global.
 */
function CertRow({ cert }: { cert: Certification }) {
  const { t, i18n } = useTranslation();
  const isPdf = cert.linkType === "pdf";
  const TypeIcon = isPdf ? FileText : BadgeCheck;
  const ActionIcon = isPdf ? Download : ExternalLink;
  const actionLabel = isPdf ? t("certs.view") : t("certs.verify");

  return (
    <a
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      title={cert.title}
      aria-label={`${cert.title} — ${actionLabel}`}
      data-cursor-hover
      className="cert-row"
    >
      <TypeIcon size={18} className="cert-type-icon" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm leading-snug text-text">
          {cert.title}
        </span>
        <span className="mt-0.5 block font-mono text-xs text-text-muted">
          {formatCertDate(cert.date, i18n.language)}
        </span>
      </span>
      <span className="cert-action" aria-hidden>
        <span className="hidden sm:inline">{actionLabel}</span>
        <ActionIcon size={14} />
      </span>
    </a>
  );
}

/**
 * "YYYY-MM" → mes y año legibles en el idioma activo (Intl), con la
 * inicial en mayúscula ("Diciembre de 2025" / "December 2025").
 */
function formatCertDate(isoDate: string, lang: string) {
  const [year, month] = isoDate.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat(lang, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
