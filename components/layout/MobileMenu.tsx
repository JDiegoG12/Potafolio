"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { PortalCard } from "@/components/layout/PortalCard";
import { useTheme } from "@/lib/hooks/useTheme";
import { NAV_LINKS } from "@/components/layout/nav-links";

/**
 * Overlay móvil: aquí los portales se despliegan como 3 tarjetas grandes
 * (CLAUDE.md §4), más los enlaces de navegación y el toggle de idioma.
 */
export function MobileMenu({
  onClose,
}: {
  /** `instant = true` desmonta sin animación de salida (viajes de tema). */
  onClose: (instant?: boolean) => void;
}) {
  const { theme, themes, travelTo } = useTheme();
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Bloquea el scroll de fondo, cierra con Escape y mueve el foco al
  // botón de cierre (a11y: el diálogo recibe el foco al abrirse).
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const stagger = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.worlds")}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto lg:hidden"
      style={{
        background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        backdropFilter: "blur(14px)",
      }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: reduced ? 0.1 : 0.25 },
        },
        // Variant dinámica: AnimatePresence pasa el ref `instantClose` del
        // Navbar vía su prop `custom`.
        exit: (instant: React.RefObject<boolean> | undefined) =>
          instant?.current
            ? { opacity: 0, transition: { duration: 0 } }
            : { opacity: 0, transition: { duration: reduced ? 0.1 : 0.25 } },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Cierre dentro del overlay: el hamburger del navbar queda debajo
          (z-40 < z-50), así que el overlay trae su propia X en la misma
          posición para que parezca el mismo botón. */}
      <button
        ref={closeRef}
        type="button"
        onClick={() => onClose()}
        aria-label={t("nav.closeMenu")}
        className="fixed top-3 right-4 z-10 flex size-10 cursor-pointer items-center justify-center"
      >
        <motion.span
          className="absolute block h-0.5 w-6 bg-text"
          initial={{ rotate: 0 }}
          animate={{ rotate: 45 }}
        />
        <motion.span
          className="absolute block h-0.5 w-6 bg-text"
          initial={{ rotate: 0 }}
          animate={{ rotate: -45 }}
        />
      </button>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pt-24 pb-10">
        <section className="flex flex-col gap-4">
          <h2 className="font-sub text-sm tracking-[0.25em] text-text-muted uppercase">
            {t("nav.worlds")}
          </h2>
          <div className="flex flex-col gap-4">
            {themes.map((meta, index) => (
              <motion.div
                key={meta.id}
                {...stagger}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 28,
                  delay: reduced ? 0 : 0.06 * index,
                }}
              >
                <PortalCard
                  meta={meta}
                  active={meta.id === theme}
                  onSelect={(origin) => {
                    // El cierre instantáneo corre dentro del callback de la
                    // View Transition: el coste del unmount cae mientras la
                    // pantalla muestra el snapshot congelado (cero jank).
                    travelTo(meta.id, origin, () => onClose(true));
                  }}
                />
              </motion.div>
            ))}
          </div>
        </section>

        <nav className="flex flex-col gap-1" aria-label={t("nav.primary")}>
          {NAV_LINKS.map((link, index) => (
            <motion.a
              key={link.href}
              href={link.href}
              onClick={() => onClose()}
              className="rounded-md px-2 py-3 font-sub text-2xl text-text transition-colors hover:text-accent-ink"
              {...stagger}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 28,
                delay: reduced ? 0 : 0.2 + 0.05 * index,
              }}
            >
              {t(link.labelKey)}
            </motion.a>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
          <span className="font-mono text-xs text-text-muted">ES / EN</span>
          <LanguageToggle />
        </div>
      </div>
    </motion.div>
  );
}
