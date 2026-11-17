import { createContext, useContext } from "react";

/** Nodo dentro il frame telefono dove montare sheet e overlay (così non escono dalla cornice su desktop). */
export const OverlayContext = createContext<HTMLElement | null>(null);

export function useOverlayRoot() {
  return useContext(OverlayContext);
}
