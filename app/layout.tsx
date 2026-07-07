import type { Metadata, Viewport } from "next";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { Preloader } from "@/components/effects/Preloader";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { ThemeBackground } from "@/components/effects/ThemeBackground";
import { ThemeTransition } from "@/components/effects/ThemeTransition";
import { MuteToggle } from "@/components/layout/MuteToggle";
import { Navbar } from "@/components/layout/Navbar";
import { SkipLink } from "@/components/layout/SkipLink";
import { AudioProvider } from "@/context/AudioProvider";
import { I18nProvider } from "@/context/I18nProvider";
import { ThemeProvider, themeInitScript } from "@/context/ThemeProvider";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_THEME } from "@/lib/themes";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Diego Gomez — Portfolio",
  description:
    "Desarrollador con IA — Building the future, one prompt at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Overrides de la View Transitions API para el radial reveal (CLAUDE.md §5).
 * Van como <style> inline porque LightningCSS (pipeline de Tailwind v4)
 * descarta los selectores ::view-transition-* de los archivos CSS.
 * Sin esto, el crossfade default del UA (con mix-blend-mode plus-lighter)
 * pisa el efecto del círculo dirigido por WAAPI desde el ThemeProvider.
 */
const viewTransitionStyles = `
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; }
`;

/**
 * Layout raíz del App Router. Aplica las variables de fuentes y el tema
 * default en `<html>`, inyecta el script anti-flash y los overrides de la
 * View Transition antes de hidratar, y monta los proveedores
 * ({@link ThemeProvider} → {@link I18nProvider}) junto a los elementos
 * globales de UI: preloader, capa de transición, cursor custom y navbar.
 *
 * @param props.children - Contenido de la página activa.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: el script anti-flash puede cambiar data-theme
    // antes de que React hidrate.
    <html
      lang="es"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${fontVariables} antialiased`}
    >
      <body id="top">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <style dangerouslySetInnerHTML={{ __html: viewTransitionStyles }} />
        <ThemeProvider>
          <I18nProvider>
            <AudioProvider>
              <SkipLink />
              <Preloader />
              <ThemeTransition />
              <CustomCursor />
              <SmoothScroll />
              <ThemeBackground />
              <Navbar />
              {children}
              <MuteToggle />
            </AudioProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
