import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "@portfolio/ui";
import { airlineByCode } from "@/data/airlines";
import { airportByCode } from "@/data/airports";
import { PageHeader } from "@/components/PageHeader";
import { Breakdown } from "@/features/booking/Breakdown";
import { FareOptions } from "@/features/booking/FareOptions";
import { Itinerary } from "@/features/booking/Itinerary";
import { fareTotals, type FareId } from "@/features/booking/pricing";
import { getFlightById } from "@/features/results/generate";
import { parseOutbound } from "@/features/results/leg";
import { flightTimes } from "@/features/results/Timeline";
import { parseSearch, serializeSearch } from "@/features/search/params";
import { formatDay } from "@/lib/format";

const cityOf = (code: string) => airportByCode.get(code)?.city ?? code;

export function FlightPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const [fare, setFare] = useState<FareId>("basic");

  const flight = getFlightById(id);
  const search = parseSearch(params, today);
  const chosenOutbound = parseOutbound(params, search);

  useDocumentTitle(flight ? `${cityOf(flightTimes(flight).from)} → ${cityOf(flightTimes(flight).to)} — Skylark` : "Flight not found — Skylark");

  if (!flight) {
    return (
      <div>
        <PageHeader title="Flight not found" backTo="/" />
        <div className="px-6 pt-6">
          <div className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">This flight does not exist, or the link is out of date.</p>
            <Link to="/" className="mt-3 inline-block rounded-pill bg-forest px-5 py-2.5 font-medium text-cream">
              Search flights
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Questo volo è: il ritorno (l'andata è già nell'URL), l'andata di un viaggio di andata e ritorno, o un volo singolo.
  const role: "return" | "outbound" | "single" = chosenOutbound
    ? "return"
    : search.ret !== null && id.startsWith(`${search.from}-${search.to}-${search.depart}-${search.cabin}-`)
      ? "outbound"
      : "single";

  const times = flightTimes(flight);
  const airline = airlineByCode.get(flight.airlineCode)?.name ?? flight.airlineCode;
  const totals = fareTotals({ baseCents: flight.baseCents, fare, adults: search.adults });
  const previousLegCents = chosenOutbound
    ? fareTotals({ baseCents: chosenOutbound.flight.baseCents, fare: chosenOutbound.fare, adults: search.adults }).totalCents
    : undefined;

  function next() {
    const p = serializeSearch(search);
    if (role === "outbound") {
      p.set("out", id);
      p.set("outFare", fare);
      navigate(`/results?${p}`);
    } else if (role === "return" && chosenOutbound) {
      p.set("out", chosenOutbound.flight.id);
      p.set("outFare", chosenOutbound.fare);
      p.set("rtn", id);
      p.set("rtnFare", fare);
      navigate(`/passengers?${p}`);
    } else {
      p.set("out", id);
      p.set("outFare", fare);
      navigate(`/passengers?${p}`);
    }
  }

  return (
    <div className="pb-8">
      <PageHeader
        title={`${cityOf(times.from)} → ${cityOf(times.to)}`}
        subtitle={`${role === "return" ? "Return" : "Outbound"} · ${formatDay(times.date)} · ${airline}`}
        backTo={`/results?${params}`}
      />
      <div className="mt-5 flex flex-col gap-6 px-6">
        <Itinerary flight={flight} />
        <FareOptions value={fare} onChange={setFare} />
        <Breakdown
          perPersonCents={totals.perPersonCents}
          taxesCents={totals.taxesCents}
          adults={search.adults}
          previousLegCents={previousLegCents}
        />
        <button
          type="button"
          onClick={next}
          className="h-14 rounded-pill bg-forest text-base font-semibold text-cream transition-opacity active:opacity-90"
        >
          {role === "outbound" ? "Choose return flight" : "Continue to passengers"}
        </button>
      </div>
    </div>
  );
}
