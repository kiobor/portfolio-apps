import { Link, useParams } from "react-router-dom";
import { useDocumentTitle } from "@portfolio/ui";
import { PageHeader } from "@/components/PageHeader";
import { Itinerary } from "@/features/booking/Itinerary";
import { getFlightById } from "@/features/results/generate";
import { flightTimes } from "@/features/results/Timeline";
import { useTripsStore } from "@/features/trips/tripsStore";
import { formatCents, formatDay } from "@/lib/format";

export function ConfirmationPage() {
  const { ref = "" } = useParams();
  const booking = useTripsStore((s) => s.bookings.find((b) => b.ref === ref.toUpperCase()));
  useDocumentTitle(booking ? `Booking ${booking.ref} — Skylark` : "Booking not found — Skylark");

  if (!booking) {
    return (
      <div>
        <PageHeader title="Booking not found" backTo="/trips" />
        <div className="px-6 pt-6">
          <div className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">There is no booking with this code in this browser.</p>
            <Link to="/trips" className="mt-3 inline-block rounded-pill bg-forest px-5 py-2.5 font-medium text-cream">
              See your trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-8">
      <h1 className="text-[28px] leading-8 font-bold tracking-tight">Booking confirmed</h1>
      <p className="mt-1 text-sm text-muted">Demo booking: nothing was charged or sent.</p>

      <section aria-label="Booking reference" className="mt-5 rounded-2xl bg-forest p-5 text-cream">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase opacity-80">Booking reference</p>
        <p className="mt-1 text-3xl font-bold tracking-[0.25em]">{booking.ref}</p>
      </section>

      <div className="mt-6 flex flex-col gap-6">
        {booking.legs.map((leg, i) => {
          const flight = getFlightById(leg.flightId);
          if (!flight) {
            return (
              <p key={leg.flightId + i} className="rounded-2xl bg-tile p-4 text-sm text-muted">
                Flight details are not available any more.
              </p>
            );
          }
          const t = flightTimes(flight);
          return (
            <section key={leg.flightId} aria-label={booking.legs.length > 1 ? (i === 0 ? "Outbound" : "Return") : "Flight"}>
              <h2 className="mb-2 text-base font-semibold">
                {booking.legs.length > 1 ? (i === 0 ? "Outbound" : "Return") : "Flight"} · {formatDay(t.date)}
              </h2>
              <Itinerary flight={flight} />
            </section>
          );
        })}
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-base font-semibold">Passengers</h2>
        <ul className="rounded-2xl border border-line bg-surface p-4">
          {booking.passengers.map((p, i) => (
            <li key={i} className="py-0.5">
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">Confirmation for {booking.email}</p>
      </section>

      <dl className="mt-6 flex justify-between rounded-2xl border border-line bg-surface p-4 text-lg font-bold">
        <dt>Total</dt>
        <dd>{formatCents(booking.totalCents)}</dd>
      </dl>

      <Link to="/trips" className="mt-6 block rounded-pill border border-line bg-surface py-3.5 text-center font-semibold">
        See your trips
      </Link>
    </div>
  );
}
