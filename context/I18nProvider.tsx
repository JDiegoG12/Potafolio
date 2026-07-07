"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { isLang, LANG_STORAGE_KEY } from "@/lib/i18n";

/**
 * Provee la instancia de i18next al árbol y sincroniza el idioma con
 * localStorage (CLAUDE.md §1). Tras el mount aplica el idioma guardado
 * (SSR siempre renderiza el default para no romper la hidratación) y, en
 * cada `languageChanged`, persiste la elección y actualiza `<html lang>`.
 * Si localStorage está bloqueado (modo privado) el idioma sigue funcionando
 * en memoria, solo no se recuerda entre visitas.
 *
 * @param props.children - Subárbol que consumirá las traducciones.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (isLang(stored) && stored !== i18n.language) {
        void i18n.changeLanguage(stored);
      }
    } catch {
      // localStorage bloqueado: seguimos con el idioma default.
    }

    const persist = (lang: string) => {
      document.documentElement.lang = lang;
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {
        // Sin persistencia, pero el cambio de idioma funciona igual.
      }
    };

    i18n.on("languageChanged", persist);
    return () => {
      i18n.off("languageChanged", persist);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
