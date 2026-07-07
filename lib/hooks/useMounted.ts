"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Indica si el componente ya montó en cliente. Útil para diferir contenido
 * que solo debe renderizarse tras la hidratación (animaciones, acceso a
 * `document`) sin provocar mismatches.
 *
 * Usa el patrón `useSyncExternalStore` (getServerSnapshot → `false`,
 * getSnapshot → `true`): evita el `setState` en efecto que marcaría el lint
 * de React 19 y no genera desajustes de hidratación.
 *
 * @returns `false` en SSR y durante la hidratación; `true` después.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
