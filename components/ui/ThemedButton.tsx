import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Botón/CTA temático (CLAUDE.md §6.2). El estilo por mundo vive en
 * styles/buttons.css seleccionado por [data-theme]: Teyvat píldora con
 * aura y shimmer, Gym bloque pesado con press de impacto, Cyber HUD
 * biselado con corchetes y glow pulsante. CSS puro: se transforma al
 * instante al viajar de mundo, sin JS.
 *
 * `showpiece` (solo el CTA del hero): variante elaborada de §6.2 en
 * styles/hero-cta.css — reposo con vida propia, superficie con
 * profundidad/textura y hover rico. Aporta el markup extra que los
 * efectos necesitan: label con data-text (clones del glitch Cyber),
 * chispas fuera del overflow del botón (Teyvat) y micro-texto HUD.
 *
 * Renderiza `<a>` si se pasa `href`, o `<button type="button">` si no; el
 * resto de props HTML del elemento correspondiente se reenvían.
 *
 * @param props.children - Contenido del botón. Debe ser `string` para que la
 *   variante `showpiece` pueble `data-text` (glitch de Cyber).
 * @param props.className - Clases extra añadidas tras `btn`.
 * @param props.showpiece - Activa la variante showpiece del hero. Úsala solo
 *   en el CTA del hero; el resto de botones deben quedarse sobrios.
 *   @defaultValue `false`
 * @param props.href - Si está presente, se renderiza un enlace `<a>`.
 */

type AnchorProps = { href: string } & ComponentPropsWithoutRef<"a">;
type ButtonProps = { href?: undefined } & ComponentPropsWithoutRef<"button">;

export function ThemedButton({
  children,
  className = "",
  showpiece = false,
  ...props
}: (AnchorProps | ButtonProps) & { children: ReactNode; showpiece?: boolean }) {
  const classes = `btn ${showpiece ? "btn-showpiece" : ""} ${className}`;
  const wrapperClasses = showpiece ? "btn-glow btn-glow-showpiece" : "btn-glow";

  const content = showpiece ? (
    <>
      <span
        className="btn-label"
        data-text={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
      <span className="btn-sys" aria-hidden>
        SYS//OK
      </span>
    </>
  ) : (
    children
  );

  const sparks = showpiece ? (
    <span className="btn-sparks" aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  ) : null;

  if (props.href !== undefined) {
    const anchorProps = props as AnchorProps;
    return (
      <span className={wrapperClasses}>
        <a data-cursor-hover {...anchorProps} className={classes}>
          {content}
        </a>
        {sparks}
      </span>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <span className={wrapperClasses}>
      <button type="button" data-cursor-hover {...buttonProps} className={classes}>
        {content}
      </button>
      {sparks}
    </span>
  );
}
