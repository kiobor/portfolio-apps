import { airports } from "@/data/airports";
import type { Cabin } from "@/data/types";
import { addDays, isoDate, isValidIsoDate } from "@/lib/dates";

export type SearchQuery = {
  from: string;
  to: string;
  /** YYYY-MM-DD */
  depart: string;
  /** YYYY-MM-DD, null = solo andata */
  ret: string | null;
  adults: number;
  cabin: Cabin;
};

export const MAX_ADULTS = 6;
const DEFAULT_DEPARTURE_OFFSET_DAYS = 30;
const DEFAULT_TRIP_LENGTH_DAYS = 7;

export type SearchValidation =
  | { ok: true }
  | { ok: false; field: "from" | "to" | "depart" | "ret"; message: string };

export function validateSearch(q: SearchQuery, today: Date): SearchValidation {
  if (q.from === q.to) {
    return { ok: false, field: "to", message: "Choose a destination different from the departure airport." };
  }
  if (q.depart < isoDate(today)) {
    return { ok: false, field: "depart", message: "The departure date is in the past." };
  }
  if (q.ret !== null && q.ret < q.depart) {
    return { ok: false, field: "ret", message: "The return date is before the departure date." };
  }
  return { ok: true };
}

const knownCode = (code: string | null) => (code && airports.some((a) => a.code === code) ? code : null);

/** Legge la ricerca dall'URL: qualunque valore non valido diventa un default sicuro, mai un errore. */
export function parseSearch(p: URLSearchParams, today: Date): SearchQuery {
  const from = knownCode(p.get("from")) ?? airports[0]!.code;
  const to = knownCode(p.get("to")) ?? airports.find((a) => a.code !== from)!.code;

  const departParam = p.get("depart");
  const depart =
    departParam && isValidIsoDate(departParam)
      ? departParam
      : addDays(isoDate(today), DEFAULT_DEPARTURE_OFFSET_DAYS);

  let ret: string | null = null;
  if (p.has("ret")) {
    const retParam = p.get("ret");
    ret = retParam && isValidIsoDate(retParam) ? retParam : addDays(depart, DEFAULT_TRIP_LENGTH_DAYS);
  }

  const adultsRaw = Number.parseInt(p.get("adults") ?? "", 10);
  const adults = Number.isFinite(adultsRaw) ? Math.min(MAX_ADULTS, Math.max(1, adultsRaw)) : 1;

  const cabin: Cabin = p.get("cabin") === "business" ? "business" : "economy";
  return { from, to, depart, ret, adults, cabin };
}

export function serializeSearch(q: SearchQuery): URLSearchParams {
  const p = new URLSearchParams({ from: q.from, to: q.to, depart: q.depart });
  if (q.ret !== null) p.set("ret", q.ret);
  p.set("adults", String(q.adults));
  p.set("cabin", q.cabin);
  return p;
}
