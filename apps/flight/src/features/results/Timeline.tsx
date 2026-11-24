import { airportByCode } from "@/data/airports";
import type { Flight } from "@/data/types";
import { formatDuration } from "@/lib/format";
import { localTime } from "./generate";

/** Minuti di attesa tra un tratto e il successivo (0 se il volo è diretto). */
export function layoverMinutes(flight: Flight): number[] {
  return flight.segments.slice(1).map((seg, i) => (seg.departUtc - flight.segments[i]!.arriveUtc) / 60_000);
}

/** Orari locali di partenza e arrivo; `dayOffset` > 0 vuol dire che si arriva nei giorni successivi. */
export function flightTimes(flight: Flight) {
  const first = flight.segments[0]!;
  const last = flight.segments[flight.segments.length - 1]!;
  const ref = { utcMs: flight.departUtc, airportCode: first.from };
  const tz = airportByCode.get(first.from)?.tzMin ?? 0;
  return {
    /** Giorno di calendario locale della partenza, YYYY-MM-DD. */
    date: new Date(flight.departUtc + tz * 60_000).toISOString().slice(0, 10),
    from: first.from,
    to: last.to,
    depart: localTime(flight.departUtc, first.from),
    arrive: localTime(flight.arriveUtc, last.to, ref),
  };
}

function Stop({ time, code, dayOffset, align }: { time: string; code: string; dayOffset?: number; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="flex items-baseline gap-1 text-xl leading-6 font-bold tracking-tight" style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        <span>{time}</span>
        {dayOffset ? <span className="text-xs font-semibold text-forest">+{dayOffset}</span> : null}
      </p>
      <p className="text-sm text-muted">{code}</p>
    </div>
  );
}

/** Riga compatta dell'itinerario: partenza, linea con durata e scali, arrivo. */
export function Timeline({ flight }: { flight: Flight }) {
  const t = flightTimes(flight);
  const layovers = layoverMinutes(flight);
  const firstStop = flight.segments[0]?.to;
  const stopCity = firstStop ? (airportByCode.get(firstStop)?.city ?? firstStop) : "";

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Stop time={t.depart.hhmm} code={t.from} align="left" />
        <div className="flex flex-col items-center gap-1 text-xs text-muted">
          <span className="font-medium text-ink">{formatDuration(flight.durationMin)}</span>
          <div aria-hidden="true" className="relative h-px w-full bg-line">
            {layovers.length > 0 && <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-forest" />}
          </div>
          <span>{flight.stops === 0 ? "Direct" : `${flight.stops} ${flight.stops === 1 ? "stop" : "stops"}`}</span>
        </div>
        <Stop time={t.arrive.hhmm} code={t.to} dayOffset={t.arrive.dayOffset} align="right" />
      </div>
      {layovers.map((min, i) => (
        <p key={i} className="mt-2 text-xs text-muted">
          {formatDuration(min)} in {stopCity} ({firstStop})
        </p>
      ))}
    </div>
  );
}
