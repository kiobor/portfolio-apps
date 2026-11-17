import type { CategoryId, PriceLevel, Restaurant } from "@/data/types";

export type SortKey = "best" | "fastest" | "rating" | "nearest";

export type FilterState = {
  category: CategoryId | null;
  /** Consegna in meno di N minuti. `null` = qualsiasi. */
  maxEta: number | null;
  /** Costo di consegna fino a N euro (0 = gratis). `null` = qualsiasi. */
  maxFee: number | null;
  /** Voto da N in su ("4.5+"): non esclude i voti più alti. `null` = qualsiasi. */
  minRating: number | null;
  /** Fasce di prezzo ammesse. Vuoto = tutte. */
  prices: PriceLevel[];
  sort: SortKey;
};

export const initialFilters: FilterState = {
  category: null,
  maxEta: null,
  maxFee: null,
  minRating: null,
  prices: [],
  sort: "best",
};

export const sortLabels: Record<SortKey, string> = {
  best: "Best match",
  fastest: "Fastest delivery",
  rating: "Top rated",
  nearest: "Nearest",
};

/** Valori usati dai filtri rapidi e dallo slider del tempo di consegna. */
export const QUICK_ETA = 30;
export const ETA_SLIDER = { min: 15, max: 45, step: 5 } as const;

/** Punteggio semplice e spiegabile: qualità, poi tempo, distanza e consegna gratuita. */
export function matchScore(r: Restaurant): number {
  return r.rating * 2 - r.etaMin / 10 - r.distanceKm * 0.3 + (r.deliveryFee === 0 ? 0.3 : 0);
}

export function applyFilters(list: Restaurant[], f: FilterState): Restaurant[] {
  const filtered = list.filter(
    (r) =>
      (f.category === null || r.categories.includes(f.category)) &&
      (f.maxEta === null || r.etaMin < f.maxEta) &&
      (f.maxFee === null || r.deliveryFee <= f.maxFee) &&
      (f.minRating === null || r.rating >= f.minRating) &&
      (f.prices.length === 0 || f.prices.includes(r.priceLevel)),
  );

  const compare: Record<SortKey, (a: Restaurant, b: Restaurant) => number> = {
    best: (a, b) => matchScore(b) - matchScore(a),
    fastest: (a, b) => a.etaMin - b.etaMin,
    rating: (a, b) => b.rating - a.rating,
    nearest: (a, b) => a.distanceKm - b.distanceKm,
  };

  return [...filtered].sort(compare[f.sort]);
}

/**
 * Quanti risultati si avrebbero applicando `patch` ai filtri correnti.
 * È il numero mostrato accanto a ogni opzione e sul pulsante "Show N places".
 */
export function countWith(list: Restaurant[], f: FilterState, patch: Partial<FilterState>): number {
  return applyFilters(list, { ...f, ...patch }).length;
}

/** Quanti filtri del pannello sono attivi (la categoria e il sort hanno i loro controlli). */
export function countActive(f: FilterState): number {
  return (
    Number(f.maxEta !== null) +
    Number(f.maxFee !== null) +
    Number(f.minRating !== null) +
    Number(f.prices.length > 0)
  );
}

export function hasActiveFilters(f: FilterState): boolean {
  return f.category !== null || countActive(f) > 0;
}

/**
 * Distribuzione dei tempi di consegna: una barra per ogni valore dello slider.
 * La barra di `v` conta i locali con tempo in [v - step, v); la prima include tutto ciò che è più veloce.
 */
export function etaHistogram(list: Restaurant[]): number[] {
  const { min, max, step } = ETA_SLIDER;
  const buckets: number[] = [];
  for (let edge = min; edge <= max; edge += step) {
    buckets.push(list.filter((r) => r.etaMin < edge && (edge === min || r.etaMin >= edge - step)).length);
  }
  return buckets;
}

/** Id del ristorante con il punteggio più alto nella lista data. */
export function bestMatchId(list: Restaurant[]): string | null {
  let best: Restaurant | null = null;
  for (const r of list) if (best === null || matchScore(r) > matchScore(best)) best = r;
  return best?.id ?? null;
}
