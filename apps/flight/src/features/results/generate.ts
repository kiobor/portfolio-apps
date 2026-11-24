import { airlines } from "@/data/airlines";
import { airportByCode, airports } from "@/data/airports";
import type { Airport, Cabin, Flight, LegQuery, Segment } from "@/data/types";

const DAY_MS = 86_400_000;
const MIN_MS = 60_000;
const BUSINESS_MULTIPLIER = 2.4;

export { airlines, airports };

/** Generatore pseudo-casuale piccolo e deterministico (mulberry32). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function distanceKm(a: Airport, b: Airport) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Minuti di volo: crociera a ~800 km/h più 35 minuti tra rullaggio, salita e discesa. */
function flightMinutes(a: Airport, b: Airport) {
  return Math.round((distanceKm(a, b) / 800) * 60 + 35);
}

function parseDate(date: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return ms;
}

function priceFor(economyCents: number, cabin: Cabin) {
  return cabin === "business" ? Math.round((economyCents * BUSINESS_MULTIPLIER) / 100) * 100 : economyCents;
}

export function generateFlights(q: LegQuery): Flight[] {
  const from = airportByCode.get(q.from);
  const to = airportByCode.get(q.to);
  const dayStart = parseDate(q.date);
  if (!from || !to || from.code === to.code || dayStart === null) return [];

  // Il seme non dipende dalla classe: stesso volo, prezzo diverso.
  const rand = mulberry32(hashString(`${q.from}${q.to}${q.date}`));
  const count = 20 + Math.floor(rand() * 11);
  const layovers = airports.filter((a) => a.code !== from.code && a.code !== to.code);
  const flights: Flight[] = [];

  for (let n = 0; n < count; n++) {
    // I primi due sono uno diretto e uno con scalo, così ci sono sempre entrambi i tipi.
    const stops = n === 0 ? 0 : n === 1 ? 1 : rand() < 0.45 ? 0 : 1;
    const airline = airlines[Math.floor(rand() * airlines.length)]!;
    const localDepartMin = 5 * 60 + 30 + Math.floor(rand() * 17 * 60);
    const departUtc = dayStart + localDepartMin * MIN_MS - from.tzMin * MIN_MS;
    const jitter = () => Math.floor(rand() * 21) - 10;

    const hops: Airport[] = [from];
    if (stops === 1) hops.push(layovers[Math.floor(rand() * layovers.length)]!);
    hops.push(to);

    const segments: Segment[] = [];
    let clock = departUtc;
    for (let i = 0; i < hops.length - 1; i++) {
      const a = hops[i]!;
      const b = hops[i + 1]!;
      const arriveUtc = clock + (flightMinutes(a, b) + jitter()) * MIN_MS;
      segments.push({
        from: a.code,
        to: b.code,
        flightNo: `${airline.code}${100 + Math.floor(rand() * 900)}`,
        departUtc: clock,
        arriveUtc,
      });
      clock = arriveUtc + (60 + Math.floor(rand() * 121)) * MIN_MS; // scalo 60-180 min
    }

    // Prezzo: coda lunga (pochi molto economici, qualche costoso), i diretti costano un po' di più.
    const direct = stops === 0 ? 1.15 : 1;
    const longTail = Math.min(4, 0.7 + 0.5 * -Math.log(1 - rand()));
    const economyCents = Math.round(((3000 + distanceKm(from, to) * 4) * longTail * direct) / 100) * 100;
    const arriveUtc = segments[segments.length - 1]!.arriveUtc;

    flights.push({
      id: `${q.from}-${q.to}-${q.date}-${q.cabin}-${n}`,
      airlineCode: airline.code,
      segments,
      stops,
      departUtc,
      arriveUtc,
      durationMin: (arriveUtc - departUtc) / MIN_MS,
      baseCents: priceFor(economyCents, q.cabin),
      cabin: q.cabin,
    });
  }
  return flights;
}

const ID_PATTERN = /^([A-Z]{3})-([A-Z]{3})-(\d{4}-\d{2}-\d{2})-(economy|business)-(\d{1,3})$/;

/** Ricostruisce un volo dal suo id (il generatore è deterministico). Null per qualunque id non valido. */
export function getFlightById(id: string): Flight | null {
  const m = ID_PATTERN.exec(id);
  if (!m) return null;
  const flights = generateFlights({ from: m[1]!, to: m[2]!, date: m[3]!, cabin: m[4] as Cabin });
  return flights.find((f) => f.id === id) ?? null;
}

function localDay(utcMs: number, tzMin: number) {
  return Math.floor((utcMs + tzMin * MIN_MS) / DAY_MS);
}

/**
 * Orario locale ("HH:MM") di un istante UTC in un aeroporto. `dayOffset` conta i giorni di
 * calendario locali trascorsi rispetto a `ref` (di solito la partenza): 0 senza riferimento.
 */
export function localTime(
  utcMs: number,
  airportCode: string,
  ref?: { utcMs: number; airportCode: string },
): { hhmm: string; dayOffset: number } {
  const tz = airportByCode.get(airportCode)?.tzMin ?? 0;
  const local = utcMs + tz * MIN_MS;
  const minutes = ((Math.floor(local / MIN_MS) % 1440) + 1440) % 1440;
  const hhmm = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  let dayOffset = 0;
  if (ref) {
    const refTz = airportByCode.get(ref.airportCode)?.tzMin ?? 0;
    dayOffset = localDay(utcMs, tz) - localDay(ref.utcMs, refTz);
  }
  return { hhmm, dayOffset };
}
