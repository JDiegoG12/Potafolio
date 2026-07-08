/**
 * Metadatos de los 3 temas ("mundos").
 * Los tokens visuales reales viven en `styles/themes.css` bajo [data-theme].
 * Este archivo es la fuente de verdad en TypeScript: ids, labels y datos
 * de preview para el theme-switcher ("3 portales").
 */

/** Los 3 mundos, en el orden en que se muestran en el switcher. */
export const THEME_IDS = ["teyvat", "gym", "cyber"] as const;

/** Id de un mundo: `"teyvat" | "gym" | "cyber"`. */
export type ThemeId = (typeof THEME_IDS)[number];

/** Tema de la primera visita. */
export const DEFAULT_THEME: ThemeId = "gym";

/** Clave de localStorage donde se persiste el tema activo. */
export const THEME_STORAGE_KEY = "portfolio:theme";

/**
 * Type guard para `ThemeId`. Se usa al leer valores no confiables
 * (localStorage, `data-theme`) antes de tratarlos como un mundo válido.
 *
 * @param value - Valor a validar (típicamente un `string | null` externo).
 * @returns `true` si `value` es uno de los {@link THEME_IDS}.
 */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

/** Metadatos en TS de un mundo: identidad no visual del theme-switcher. */
export interface ThemeMeta {
  id: ThemeId;
  /** Nombre visible en el switcher (no se traduce: es el nombre del mundo). */
  label: string;
  /** Clave i18n para la descripción corta del portal. */
  taglineKey: string;
  /** Colores representativos para la mini-card de preview del switcher. */
  preview: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
  };
  /** Foto del autor asociada al tema (placeholder, ver CLAUDE.md §7). */
  authorImage: string;
}

/** Metadatos de los 3 mundos, indexados por id. */
export const THEMES: Record<ThemeId, ThemeMeta> = {
  teyvat: {
    id: "teyvat",
    label: "Teyvat",
    taglineKey: "themes.teyvat.tagline",
    preview: {
      background: "#f6f1e4",
      primary: "#c9a227",
      secondary: "#3aa6a0",
      accent: "#8b7bd8",
    },
    authorImage: "/images/author-teyvat.jpg",
  },
  gym: {
    id: "gym",
    label: "Gym",
    taglineKey: "themes.gym.tagline",
    preview: {
      background: "#0d0d0f",
      primary: "#ff3b30",
      secondary: "#ff9500",
      accent: "#ffd60a",
    },
    authorImage: "/images/author-gym.jpg",
  },
  cyber: {
    id: "cyber",
    label: "Cyber",
    taglineKey: "themes.cyber.tagline",
    preview: {
      background: "#050a14",
      primary: "#00e5ff",
      secondary: "#ff2ec4",
      accent: "#9d7bff",
    },
    authorImage: "/images/author-cyber.jpg",
  },
};

/** {@link THEMES} como array ordenado, listo para iterar en el switcher. */
export const THEME_LIST: ThemeMeta[] = THEME_IDS.map((id) => THEMES[id]);
