import type { Flight } from "@/data/types";
import { parseFare, type FareId } from "@/features/booking/pricing";
import type { SearchQuery } from "@/features/search/params";
import { getFlightById } from "./generate";
import type { SortKey } from "./sort";

/** Andata già scelta in un viaggio di andata e ritorno: `out=<flightId>` e `outFare=<tariffa>` nell'URL. */
export type ChosenOutbound = { flight: Flight; fare: FareId };

/**
 * Valida `out` contro la ricerca: deve essere un volo reale della stessa tratta, data e classe,
 * e la ricerca deve avere un ritorno. Qualunque altra cosa si ignora (si scelgono le andate).
 */
export function parseOutbound(p: URLSearchParams, q: SearchQuery): ChosenOutbound | null {
  const id = p.get("out");
  if (!id || q.ret === null) return null;
  if (!id.startsWith(`${q.from}-${q.to}-${q.depart}-${q.cabin}-`)) return null;
  const flight = getFlightById(id);
  if (!flight) return null;
  return { flight, fare: parseFare(p.get("outFare")) };
}

export function parseSort(p: URLSearchParams): SortKey {
  const sort = p.get("sort");
  return sort === "cheapest" || sort === "fastest" ? sort : "best";
}
