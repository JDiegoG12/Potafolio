/**
 * Datos centralizados del portafolio (CLAUDE.md §7). Única fuente de verdad
 * para autor, contacto y proyectos; los componentes de sección solo leen de
 * aquí. Los textos traducibles NO viven en este archivo: se referencian por
 * clave i18n (locales/es.json · en.json). Los nombres propios (proyectos,
 * autor, tecnologías) sí van hardcodeados porque no se traducen.
 */

import type { ThemeId } from "@/lib/themes";

/** Propósito del proyecto: decide el set de iconos alusivos (regla §3.1). */
export type ProjectCategory =
  | "jewelry"
  | "barber"
  | "companion"
  | "piano"
  | "voice";

/**
 * Variante de presentación (regla §3.1: cada proyecto se presenta distinto).
 * - `showcase`: pieza estrella a ancho completo, imagen dominante (KOB).
 * - `ribbon`: card vertical con cinta de poste de barbero (BarberIA).
 * - `chat`: card vertical con burbujas de conversación (Aimo).
 * - `keys`: card ancha con franja de teclas de piano (AirPiano).
 * - `terminal`: card consola sin imagen ni demo, con escena viva (Rein).
 */
export type ProjectPresentation =
  | "showcase"
  | "ribbon"
  | "chat"
  | "keys"
  | "terminal";

/** Enlace a un repositorio. KOB tiene dos (frontend primario + backend). */
export interface RepoLink {
  /** Clave i18n de la etiqueta del enlace ("Código", "Frontend"…). */
  labelKey: string;
  url: string;
  /** El repo destacado visualmente cuando el proyecto tiene varios. */
  primary?: boolean;
}

export interface Project {
  id: "kob" | "barberia" | "aimo" | "airpiano" | "rein";
  /** Nombre propio — no se traduce. */
  name: string;
  /** Clave i18n de la descripción de 1 línea. */
  descKey: string;
  stack: string[];
  repos: RepoLink[];
  /** `null` explícito = no tiene demo y es intencional (Rein es un .exe). */
  demoUrl?: string | null;
  /** `null` explícito = no tiene imagen y es intencional (Rein). */
  image?: string | null;
  category: ProjectCategory;
  presentation: ProjectPresentation;
  /** Clave i18n de un badge especial (Rein: "App de escritorio"). */
  badgeKey?: string;
  /** Clave i18n de una nota de sensibilidad (Aimo: disclaimer no clínico). */
  noteKey?: string;
}

/** Proyectos destacados (§7.2), en orden de aparición. */
export const FEATURED_PROJECTS: Project[] = [
  {
    id: "kob",
    name: "Joyería KOB",
    descKey: "projects.kob.desc",
    stack: [
      "React 19",
      "TypeScript",
      "Vite",
      "Tailwind 4",
      "Zustand",
      "Express 5",
      "Prisma + MySQL",
      "JWT",
      "Google OAuth",
      "Swagger",
      "Sharp",
      "Recharts",
    ],
    repos: [
      {
        labelKey: "projects.links.frontend",
        url: "https://github.com/JDiegoG12/joyeria-kob-frontend",
        primary: true,
      },
      {
        labelKey: "projects.links.backend",
        url: "https://github.com/JDiegoG12/joyeria-kob-backend",
      },
    ],
    demoUrl: "https://www.joyeriakob.com",
    image: "/images/projects/kob.jpg",
    category: "jewelry",
    presentation: "showcase",
  },
  {
    id: "barberia",
    name: "BarberIA",
    descKey: "projects.barberia.desc",
    stack: [
      "Angular 22",
      "TypeScript",
      "RxJS",
      "Chart.js",
      "SCSS",
      "GitHub Pages",
    ],
    repos: [
      {
        labelKey: "projects.links.code",
        url: "https://github.com/JDiegoG12/barberFront",
        primary: true,
      },
    ],
    demoUrl: "https://jdiegog12.github.io/barberFront/",
    image: "/images/projects/barberia.jpg",
    category: "barber",
    presentation: "ribbon",
  },
  {
    id: "aimo",
    name: "Aimo",
    descKey: "projects.aimo.desc",
    stack: [
      "React 18",
      "Vite",
      "Python 3.13",
      "Flask",
      "Groq (LLaMA 3.3-70B)",
      "OpenAI",
      "AWS Bedrock",
    ],
    repos: [
      {
        labelKey: "projects.links.code",
        url: "https://github.com/JDiegoG12/AIMO",
        primary: true,
      },
    ],
    demoUrl: "https://aimo-v2.onrender.com/",
    image: "/images/projects/aimo.jpg",
    category: "companion",
    presentation: "chat",
    // Sensibilidad (§7.2): acompañamiento inicial, nunca promesa clínica.
    noteKey: "projects.aimo.note",
  },
];

/** Proyectos chill (§7.3), en orden de aparición. */
export const CHILL_PROJECTS: Project[] = [
  {
    id: "airpiano",
    name: "AirPiano",
    descKey: "projects.airpiano.desc",
    stack: [
      "React 19",
      "TypeScript",
      "Vite",
      "Tailwind",
      "MediaPipe",
      "Tone.js",
    ],
    repos: [
      {
        labelKey: "projects.links.code",
        url: "https://github.com/JDiegoG12/airpiano",
        primary: true,
      },
    ],
    demoUrl: "https://airpiano-eight.vercel.app/",
    image: "/images/projects/airpiano.jpg",
    category: "piano",
    presentation: "keys",
  },
  {
    id: "rein",
    name: "Rein",
    descKey: "projects.rein.desc",
    stack: [
      "Python 3.11+",
      "openWakeWord",
      "faster-whisper",
      "Piper (TTS)",
      "Groq API",
      "PyInstaller",
    ],
    repos: [
      {
        labelKey: "projects.links.code",
        url: "https://github.com/JDiegoG12/Rein",
        primary: true,
      },
    ],
    // Ejecutable sin UI web: la ausencia de demo e imagen es intencional
    // y la card "terminal" la presenta con su propia escena viva (§3.1).
    demoUrl: null,
    image: null,
    category: "voice",
    presentation: "terminal",
    badgeKey: "projects.rein.badge",
  },
];

/** Autor y contacto (§7.1). Bio corta/larga viven en locales como placeholder. */
export const AUTHOR = {
  name: "DIEGO GOMEZ",
  github: "https://github.com/JDiegoG12",
  githubHandle: "@JDiegoG12",
  email: "juandiego12345512@gmail.com",
  linkedin: "https://www.linkedin.com/in/juan-diego-gomez-garces-823625313",
  /**
   * Foto del autor por mundo (placeholders 900×1200, proporción 3:4).
   * Diego reemplaza cada archivo manteniendo el nombre.
   */
  photos: {
    teyvat: "/images/author-teyvat.jpg",
    gym: "/images/author-gym.jpg",
    cyber: "/images/author-cyber.jpg",
  } satisfies Record<ThemeId, string>,
} as const;
