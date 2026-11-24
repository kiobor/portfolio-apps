import type { Flight } from "@/data/types";

export type SortKey = "best" | "cheapest" | "fastest";

const STOP_PENALTY = 0.15;

function normalizer(values: number[]) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  return (v: number) => (span === 0 ? 0 : (v - min) / span);
}

/** Punteggio più basso = migliore: prezzo e durata normalizzati tra 0 e 1, più 0.15 per ogni scalo. */
function scores(flights: Flight[]): Map<string, number> {
  const price = normalizer(flights.map((f) => f.baseCents));
  const duration = normalizer(flights.map((f) => f.durationMin));
  return new Map(
    flights.map((f) => [f.id, price(f.baseCents) + duration(f.durationMin) + STOP_PENALTY * f.stops]),
  );
}

export function sortFlights(flights: Flight[], key: SortKey): Flight[] {
  const copy = [...flights];
  if (key === "cheapest") return copy.sort((a, b) => a.baseCents - b.baseCents || a.durationMin - b.durationMin);
  if (key === "fastest") return copy.sort((a, b) => a.durationMin - b.durationMin || a.baseCents - b.baseCents);
  const score = scores(flights);
  return copy.sort((a, b) => score.get(a.id)! - score.get(b.id)! || a.baseCents - b.baseCents);
}

export function bestFlightId(flights: Flight[]): string | null {
  return sortFlights(flights, "best")[0]?.id ?? null;
}

export function sortSummary(flights: Flight[]): {
  best: Flight | null;
  cheapest: Flight | null;
  fastest: Flight | null;
} {
  return {
    best: sortFlights(flights, "best")[0] ?? null,
    cheapest: sortFlights(flights, "cheapest")[0] ?? null,
    fastest: sortFlights(flights, "fastest")[0] ?? null,
  };
}
