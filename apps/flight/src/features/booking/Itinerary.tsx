import { airlineByCode } from "@/data/airlines";
import { airportByCode } from "@/data/airports";
import type { Flight } from "@/data/types";
import { formatDuration } from "@/lib/format";
import { layoverMinutes } from "@/features/results/Timeline";
import { localTime } from "@/features/results/generate";

const cityOf = (code: string) => airportByCode.get(code)?.city ?? code;

/** Itinerario completo: un blocco per tratto, con l'attesa evidenziata tra un volo e l'altro. */
export function Itinerary({ flight }: { flight: Flight }) {
  const airline = airlineByCode.get(flight.airlineCode)?.name ?? flight.airlineCode;
  const first = flight.segments[0]!;
  const ref = { utcMs: flight.departUtc, airportCode: first.from };
  const layovers = layoverMinutes(flight);

  return (
    <ol className="flex flex-col">
      {flight.segments.map((seg, i) => {
        const dep = localTime(seg.departUtc, seg.from, ref);
        const arr = localTime(seg.arriveUtc, seg.to, ref);
        return (
          <li key={seg.flightNo + i}>
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="flex items-baseline gap-2 text-lg font-bold tracking-tight">
                <span>
                  {dep.hhmm}
                  {dep.dayOffset > 0 && <span className="ml-1 text-xs font-semibold text-forest">+{dep.dayOffset}</span>}{" "}
                  {seg.from}
                </span>
                <span aria-hidden="true">→</span>
                <span className="sr-only">to</span>
                <span>
                  {arr.hhmm}
                  {arr.dayOffset > 0 && <span className="ml-1 text-xs font-semibold text-forest">+{arr.dayOffset}</span>}{" "}
                  {seg.to}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted">
                {cityOf(seg.from)} → {cityOf(seg.to)} · {airline} {seg.flightNo} ·{" "}
                {formatDuration((seg.arriveUtc - seg.departUtc) / 60_000)}
              </p>
            </div>
            {layovers[i] !== undefined && (
              <p className="my-2 flex items-center gap-2 px-2 text-sm text-muted">
                <span aria-hidden="true" className="h-4 w-px bg-line" />
                <span>
                  Layover {formatDuration(layovers[i]!)} · {cityOf(seg.to)} ({seg.to})
                </span>
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
