import { Link } from "react-router-dom";
import { Badge } from "@portfolio/ui";
import { airlineByCode } from "@/data/airlines";
import type { Flight } from "@/data/types";
import { formatCents } from "@/lib/format";
import { Timeline, flightTimes } from "./Timeline";

/**
 * Il link sta sul nome della compagnia e si estende a tutta la card con ::after:
 * tutta la card è cliccabile, ma per gli screen reader il link ha un nome chiaro
 * (come nelle card di Nosh).
 */
export function FlightCard({ flight, search, best = false }: { flight: Flight; search: string; best?: boolean }) {
  const airline = airlineByCode.get(flight.airlineCode)?.name ?? flight.airlineCode;
  const { from, to } = flightTimes(flight);

  return (
    <article className="relative rounded-card border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          <Link
            to={`/flight/${flight.id}?${search}`}
            className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-forest"
          >
            {airline}
            <span className="sr-only">
              , {from} to {to}
            </span>
          </Link>
        </h3>
        {best && <Badge className="bg-forest-soft">Best</Badge>}
      </div>
      <Timeline flight={flight} />
      <p className="mt-3 flex items-baseline justify-end gap-1.5 border-t border-line pt-3">
        <span className="text-xl font-bold">{formatCents(flight.baseCents)}</span>
        <span className="text-xs text-muted">per person</span>
      </p>
    </article>
  );
}
