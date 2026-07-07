/**
 * Configuración de i18next (ES/EN). Se inicializa con el idioma default en
 * SSR y cliente para evitar mismatches de hidratación; el I18nProvider
 * aplica el idioma guardado en localStorage tras el mount.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

/** Idiomas soportados (CLAUDE.md §1). */
export const LANGS = ["es", "en"] as const;

/** Código de idioma: `"es" | "en"`. */
export type Lang = (typeof LANGS)[number];

/** Idioma inicial en SSR y primera visita. */
export const DEFAULT_LANG: Lang = "es";

/** Clave de localStorage donde se persiste el idioma elegido. */
export const LANG_STORAGE_KEY = "portfolio:lang";

/**
 * Type guard para `Lang`. Valida el valor leído de localStorage antes de
 * pasarlo a `i18n.changeLanguage`.
 *
 * @param value - Valor a validar (p. ej. un `string | null` de localStorage).
 * @returns `true` si `value` es uno de los {@link LANGS}.
 */
export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

/** Instancia singleton de i18next, ya inicializada. */
export default i18n;
