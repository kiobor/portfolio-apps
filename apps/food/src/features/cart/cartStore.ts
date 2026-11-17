import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MenuItem } from "@/data/types";
import { safeStorage } from "@/lib/storage";

export type CartLine = { item: MenuItem; qty: number };
export type CartLines = Record<string, CartLine>;

type CartState = {
  /** Il carrello contiene sempre articoli di un solo ristorante. */
  restaurantId: string | null;
  lines: CartLines;
  /**
   * Aggiunge un articolo. Se il carrello è di un altro ristorante lo sostituisce:
   * la conferma all'utente ("Start a new order?") va chiesta dalla UI prima di chiamarlo.
   */
  add: (restaurantId: string, item: MenuItem) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      restaurantId: null,
      lines: {},

      add: (restaurantId, item) =>
        set((state) => {
          const base = state.restaurantId === restaurantId ? state.lines : {};
          const qty = (base[item.id]?.qty ?? 0) + 1;
          return { restaurantId, lines: { ...base, [item.id]: { item, qty } } };
        }),

      remove: (itemId) =>
        set((state) => {
          const line = state.lines[itemId];
          if (!line) return state;
          const lines = { ...state.lines };
          if (line.qty > 1) lines[itemId] = { ...line, qty: line.qty - 1 };
          else delete lines[itemId];
          return Object.keys(lines).length === 0
            ? { restaurantId: null, lines: {} }
            : { lines };
        }),

      clear: () => set({ restaurantId: null, lines: {} }),
    }),
    {
      name: "nosh-cart",
      storage: createJSONStorage(() => safeStorage),
      // Persistiamo solo i dati, non le funzioni.
      partialize: (state) => ({ restaurantId: state.restaurantId, lines: state.lines }),
    },
  ),
);

export const cartCount = (lines: CartLines) =>
  Object.values(lines).reduce((sum, l) => sum + l.qty, 0);

export const cartSubtotal = (lines: CartLines) =>
  Object.values(lines).reduce((sum, l) => sum + l.item.price * l.qty, 0);
