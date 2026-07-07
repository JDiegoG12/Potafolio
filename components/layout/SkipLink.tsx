"use client";

import { useTranslation } from "react-i18next";

/**
 * Enlace "saltar al contenido" para teclado/lectores de pantalla:
 * primer elemento enfocable de la página, invisible hasta recibir foco
 * (clase .skip-link en globals.css). Salta el navbar y los portales
 * directo a `<main id="main">`.
 */
export function SkipLink() {
  const { t } = useTranslation();
  return (
    <a href="#main" className="skip-link">
      {t("nav.skip")}
    </a>
  );
}
