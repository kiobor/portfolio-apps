import { airlines } from "@/data/airlines";
import type { Flight } from "@/data/types";
import { localTime } from "./generate";

export type DayBand = "morning" | "afternoon" | "evening" | "night";
export type StopsFilter = "any" | "direct" | "max1";

export type FlightFilters = {
  stops: StopsFilter;
  /** Vuoto = qualsiasi fascia. */
  bands: DayBand[];
  /** Vuoto = qualsiasi compagnia. */
  airlines: string[];
  maxPriceCents: number | null;
  maxDurationMin: number | null;
};

export const initialFilters: FlightFilters = {
  stops: "any",
  bands: [],
  airlines: [],
  maxPriceCents: null,
  maxDurationMin: null,
};

export const dayBands: DayBand[] = ["morning", "afternoon", "evening", "night"];
const stopsValues: StopsFilter[] = ["any", "direct", "max1"];

/** Fascia della partenza nell'ora locale dell'aeroporto: mattina 05-11, pomeriggio 12-17, sera 18-21, notte il resto. */
export function bandOf(departUtc: number, fromCode: string): DayBand {
  const hour = Number(localTime(departUtc, fromCode).hhmm.slice(0, 2));
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 17) return "afternoon";
  if (hour >= 18 && hour <= 21) return "evening";
  return "night";
}

export function applyFilters(flights: Flight[], f: FlightFilters): Flight[] {
  return flights.filter((flight) => {
    if (f.stops === "direct" && flight.stops !== 0) return false;
    if (f.stops === "max1" && flight.stops > 1) return false;
    if (f.bands.length > 0) {
      const from = flight.segments[0]?.from ?? "";
      if (!f.bands.includes(bandOf(flight.departUtc, from))) return false;
    }
    if (f.airlines.length > 0 && !f.airlines.includes(flight.airlineCode)) return false;
    if (f.maxPriceCents !== null && flight.baseCents > f.maxPriceCents) return false;
    if (f.maxDurationMin !== null && flight.durationMin > f.maxDurationMin) return false;
    return true;
  });
}

/** Quanti voli resterebbero applicando `patch` ai filtri correnti: il costo di un'opzione prima di sceglierla. */
export function countWith(flights: Flight[], current: FlightFilters, patch: Partial<FlightFilters>): number {
  return applyFilters(flights, { ...current, ...patch }).length;
}

/** Numero di gruppi di filtri diversi dal valore iniziale (per il badge sul pulsante filtri). */
export function countActive(f: FlightFilters): number {
  return [
    f.stops !== "any",
    f.bands.length > 0,
    f.airlines.length > 0,
    f.maxPriceCents !== null,
    f.maxDurationMin !== null,
  ].filter(Boolean).length;
}

/** Quanti valori cadono in ciascuna delle `buckets` fasce tra il minimo e il massimo. */
function histogram(values: number[], buckets: number): number[] {
  const counts = new Array<number>(buckets).fill(0);
  if (values.length === 0) return counts;
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  for (const value of values) {
    const index = span === 0 ? 0 : Math.min(buckets - 1, Math.floor(((value - min) / span) * buckets));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts;
}

export const priceHistogram = (flights: Flight[], buckets: number) =>
  histogram(flights.map((f) => f.baseCents), buckets);

export const durationHistogram = (flights: Flight[], buckets: number) =>
  histogram(flights.map((f) => f.durationMin), buckets);

const FILTER_KEYS = ["stops", "bands", "airlines", "max", "dur"];

/** Sostituisce nell'URL i parametri dei filtri lasciando intatti tutti gli altri (ricerca, ordinamento, volo scelto). */
export function mergeFilterParams(current: URLSearchParams, f: FlightFilters): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const key of FILTER_KEYS) next.delete(key);
  serializeFilters(f).forEach((value, key) => next.set(key, value));
  return next;
}

function positiveInt(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n > 0 ? n : null;
}

/** Legge i filtri dall'URL; qualunque valore non valido torna al valore iniziale. */
export function parseFilters(p: URLSearchParams): FlightFilters {
  const stops = p.get("stops");
  const knownAirlines = new Set(airlines.map((a) => a.code));
  const list = (key: string) => (p.get(key) ?? "").split(",").filter(Boolean);
  return {
    stops: stopsValues.includes(stops as StopsFilter) ? (stops as StopsFilter) : "any",
    bands: dayBands.filter((b) => list("bands").includes(b)),
    airlines: list("airlines").filter((code, i, all) => knownAirlines.has(code) && all.indexOf(code) === i),
    maxPriceCents: positiveInt(p.get("max")),
    maxDurationMin: positiveInt(p.get("dur")),
  };
}

/** Scrive solo i filtri attivi, così i link senza filtri restano corti. */
export function serializeFilters(f: FlightFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.stops !== "any") p.set("stops", f.stops);
  if (f.bands.length > 0) p.set("bands", f.bands.join(","));
  if (f.airlines.length > 0) p.set("airlines", f.airlines.join(","));
  if (f.maxPriceCents !== null) p.set("max", String(f.maxPriceCents));
  if (f.maxDurationMin !== null) p.set("dur", String(f.maxDurationMin));
  return p;
}
