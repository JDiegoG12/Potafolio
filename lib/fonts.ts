/**
 * Fuentes de los 3 temas vía next/font (self-hosted, sin FOUT de Google).
 * Cada tema referencia estas variables desde `styles/themes.css`:
 *   --font-display / --font-sub / --font-body / --font-mono
 * Solo se cargan los pesos necesarios (rendimiento, CLAUDE.md §10).
 */
import {
  Anton,
  Cinzel,
  Cormorant_Garamond,
  Inter,
  Manrope,
  Orbitron,
  Oswald,
  Rajdhani,
  Space_Mono,
} from "next/font/google";

/* ── Teyvat ───────────────────────────────────────────── */

export const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

/* ── Gym ──────────────────────────────────────────────── */

export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

export const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/* ── Cyber ────────────────────────────────────────────── */

export const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

export const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-rajdhani",
});

/** Todas las variables juntas para aplicarlas en <html>. */
export const fontVariables = [
  cinzel,
  cormorantGaramond,
  manrope,
  anton,
  oswald,
  inter,
  orbitron,
  spaceMono,
  rajdhani,
]
  .map((font) => font.variable)
  .join(" ");
