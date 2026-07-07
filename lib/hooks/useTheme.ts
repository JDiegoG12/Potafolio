/**
 * Punto de entrada público del hook de tema (CLAUDE.md §9). La
 * implementación vive junto a {@link ThemeProvider} para compartir el
 * Context; se re-exporta aquí para que los componentes importen desde
 * `@/lib/hooks/useTheme` sin acoplarse a la ubicación del provider.
 *
 * @see {@link useTheme} para el valor devuelto (tema activo, `travelTo`, etc.).
 */
export { useTheme } from "@/context/ThemeProvider";
