import type { ThemeId } from "@/lib/themes";

/** Contexto de tamaño del portal: trigger de navbar, preview o tarjeta móvil. */
export type PortalSize = "trigger" | "preview" | "card";

/**
 * Mini-escena viva de un mundo (CLAUDE.md §4.1). Puro CSS (styles/portals.css):
 * Teyvat = cielo dorado con chispas; Gym = metal + franjas + tipografía masiva;
 * Cyber = grid neón con scanline. Siempre pinta SU mundo, no el tema activo.
 *
 * @param props.world - Mundo que representa la escena.
 * @param props.size - Contexto de tamaño, que ajusta densidad/escala vía CSS.
 */
export function PortalScene({ world, size }: { world: ThemeId; size: PortalSize }) {
  return (
    <span aria-hidden className="portal-scene" data-world={world} data-size={size}>
      {world === "teyvat" && (
        <>
          <span className="ps-spark" />
          <span className="ps-spark" />
          <span className="ps-spark" />
        </>
      )}
      {world === "gym" && <span className="ps-word">GYM</span>}
      {world === "cyber" && <span className="ps-scan" />}
    </span>
  );
}

/**
 * Identidad visual fija de cada mundo para usar FUERA de la escena
 * (preview de hover, tarjetas móviles): tipografías y velo de legibilidad
 * propios del mundo aunque el tema activo sea otro.
 */
export const WORLD_STYLE: Record<
  ThemeId,
  { display: string; sub: string; text: string; veil: string }
> = {
  teyvat: {
    display: "var(--font-cinzel), serif",
    sub: "var(--font-cormorant), serif",
    text: "#2b2a33",
    veil: "linear-gradient(to top, rgba(250,245,230,0.94) 0%, rgba(250,245,230,0.55) 55%, transparent 100%)",
  },
  gym: {
    display: "var(--font-anton), sans-serif",
    sub: "var(--font-oswald), sans-serif",
    text: "#f4f4f5",
    veil: "linear-gradient(to top, rgba(10,10,12,0.94) 0%, rgba(10,10,12,0.55) 55%, transparent 100%)",
  },
  cyber: {
    display: "var(--font-orbitron), sans-serif",
    sub: "var(--font-space-mono), monospace",
    text: "#dff4ff",
    veil: "linear-gradient(to top, rgba(4,8,16,0.95) 0%, rgba(4,8,16,0.6) 55%, transparent 100%)",
  },
};

/**
 * Envuelve el marco del portal. Solo en Cyber añade el glow exterior con
 * `drop-shadow` en un wrapper aparte, porque el `clip-path` octogonal del
 * marco recortaría un `box-shadow` propio.
 *
 * @param props.world - Mundo del portal envuelto (activa el glow si es Cyber).
 * @param props.children - El marco `.portal-frame` a envolver.
 * @param props.className - Clases extra para el wrapper.
 */
export function PortalGlow({
  world,
  children,
  className,
}: {
  world: ThemeId;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`${world === "cyber" ? "portal-glow-cyber " : ""}block ${className ?? ""}`}>
      {children}
    </span>
  );
}
