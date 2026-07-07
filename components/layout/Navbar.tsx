"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { AUTHOR } from "@/data/portfolio";

/**
 * Barra de navegación fija con glassmorphism (CLAUDE.md §4). En desktop
 * centra los 3 portales ({@link ThemeSwitcher}) y muestra enlaces +
 * {@link LanguageToggle}; en móvil/tablet colapsa a una hamburguesa que
 * abre el {@link MobileMenu}.
 *
 * El botón hamburguesa solo ABRE: el overlay lo cubre y trae su propia X.
 * `instantClose` (ref) le indica al menú, vía el `custom` de
 * `AnimatePresence`, cuándo salir sin animación — se activa durante un
 * viaje de tema para que el coste del desmontaje caiga dentro del snapshot
 * congelado de la View Transition y no provoque jank a mitad del reveal.
 */
export function Navbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  // true = desmontaje instantáneo (durante la transición de tema, para que
  // el coste del unmount caiga dentro del snapshot congelado y no a mitad
  // del reveal — jank medido en móvil). El exit del menú lo lee vía
  // `custom` de AnimatePresence.
  const instantClose = useRef(false);

  const closeMenu = useCallback((instant = false) => {
    instantClose.current = instant;
    setMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 border-b border-border"
        style={{
          background: "color-mix(in srgb, var(--bg) 78%, transparent)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#top"
            className="font-display text-lg text-text transition-colors hover:text-accent-ink"
          >
            {AUTHOR.name}
          </a>

          {/* Portales: protagonistas, centrados (desktop) */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ThemeSwitcher />
          </div>

          <div className="flex items-center gap-4">
            <nav
              className="hidden items-center gap-5 lg:flex"
              aria-label={t("nav.primary")}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-sub text-sm tracking-wide text-text-muted transition-colors hover:text-accent-ink"
                >
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>

            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Hamburguesa (móvil/tablet). Solo abre: el overlay lo cubre
                y trae su propio botón de cierre en la misma posición. */}
            <button
              type="button"
              onClick={() => {
                instantClose.current = false;
                setMenuOpen(true);
              }}
              aria-expanded={menuOpen}
              aria-label={t("nav.openMenu")}
              className="relative flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5 lg:hidden"
            >
              <span className="block h-0.5 w-6 bg-text" />
              <span className="block h-0.5 w-6 bg-text" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence custom={instantClose}>
        {menuOpen && <MobileMenu onClose={closeMenu} />}
      </AnimatePresence>
    </>
  );
}
