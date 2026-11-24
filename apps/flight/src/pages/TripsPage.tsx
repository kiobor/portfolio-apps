import { Link } from "react-router-dom";
import { useDocumentTitle } from "@portfolio/ui";
import { airportByCode } from "@/data/airports";
import { getFlightById } from "@/features/results/generate";
import { flightTimes } from "@/features/results/Timeline";
import { useTripsStore, type Booking } from "@/features/trips/tripsStore";
import { formatCents, formatDay } from "@/lib/format";

const cityOf = (code: string) => airportByCode.get(code)?.city ?? code;

function tripLabel(booking: Booking) {
  const flight = getFlightById(booking.legs[0]?.flightId ?? "");
  if (!flight) return { route: "Trip", when: "" };
  const t = flightTimes(flight);
  return {
    route: `${cityOf(t.from)} → ${cityOf(t.to)}`,
    when: `${formatDay(t.date)} · ${booking.legs.length > 1 ? "Round trip" : "One way"}`,
  };
}

export function TripsPage() {
  useDocumentTitle("Trips — Skylark");
  const bookings = useTripsStore((s) => s.bookings);
  const newestFirst = [...bookings].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="px-6 pt-8 pb-6">
      <h1 className="text-[28px] leading-8 font-bold tracking-tight">Trips</h1>

      {newestFirst.length === 0 ? (
        <div className="mt-6 rounded-tile bg-tile p-6 text-center">
          <p className="font-semibold">No trips yet.</p>
          <p className="mt-1 text-sm text-muted">Bookings you make in this demo show up here.</p>
          <Link to="/" className="mt-3 inline-block rounded-pill bg-forest px-5 py-2.5 font-medium text-cream">
            Search flights
          </Link>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {newestFirst.map((booking) => {
            const { route, when } = tripLabel(booking);
            return (
              <li key={booking.ref}>
                <Link
                  to={`/booking/${booking.ref}`}
                  className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-4"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-bold tracking-tight">{route}</span>
                    <span className="block text-sm text-muted">{when}</span>
                    <span className="mt-1 block text-xs font-semibold tracking-[0.15em] text-muted">{booking.ref}</span>
                  </span>
                  <span className="shrink-0 text-base font-bold">{formatCents(booking.totalCents)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
