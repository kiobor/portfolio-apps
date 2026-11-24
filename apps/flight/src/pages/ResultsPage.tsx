import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { FilterIcon, FilterPill, Skeleton, useDocumentTitle } from "@portfolio/ui";
import { fetchFlights } from "@/api/flights";
import { airportByCode } from "@/data/airports";
import type { LegQuery } from "@/data/types";
import { PageHeader } from "@/components/PageHeader";
import { tripTotal } from "@/features/booking/pricing";
import { FilterSheet } from "@/features/results/FilterSheet";
import { FlightCard } from "@/features/results/FlightCard";
import { SortTabs } from "@/features/results/SortTabs";
import { parseOutbound, parseSort } from "@/features/results/leg";
import {
  applyFilters,
  countActive,
  initialFilters,
  mergeFilterParams,
  parseFilters,
  type FlightFilters,
} from "@/features/results/filters";
import { bestFlightId, sortFlights, type SortKey } from "@/features/results/sort";
import { parseSearch, serializeSearch, validateSearch } from "@/features/search/params";
import { formatCents, formatDay } from "@/lib/format";

const cityOf = (code: string) => airportByCode.get(code)?.city ?? code;

export function ResultsPage() {
  const [params, setParams] = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const search = parseSearch(params, today);
  const validation = validateSearch(search, today);
  const filters = parseFilters(params);
  const sort = parseSort(params);
  const outbound = parseOutbound(params, search);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Andata e ritorno si scelgono in sequenza: scelta l'andata, la stessa pagina mostra i ritorni.
  const leg: LegQuery = outbound
    ? { from: search.to, to: search.from, date: search.ret!, cabin: search.cabin }
    : { from: search.from, to: search.to, date: search.depart, cabin: search.cabin };

  useDocumentTitle(`Flights ${leg.from} → ${leg.to} — Skylark`);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["flights", leg],
    queryFn: () => fetchFlights(leg),
    enabled: validation.ok,
  });

  if (!validation.ok) {
    return (
      <div>
        <PageHeader title="Invalid search" backTo="/" />
        <div className="px-6 pt-6">
          <div role="alert" className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">{validation.message}</p>
            <Link to="/" className="mt-3 inline-block rounded-pill bg-forest px-5 py-2.5 font-medium text-cream">
              Change your search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const update = (mutate: (next: URLSearchParams) => URLSearchParams | void) => {
    const next = new URLSearchParams(params);
    setParams(mutate(next) ?? next, { replace: true });
  };
  const applyFiltersToUrl = (f: FlightFilters) => setParams(mergeFilterParams(params, f), { replace: true });
  const setSort = (key: SortKey) =>
    update((next) => {
      if (key === "best") next.delete("sort");
      else next.set("sort", key);
    });

  const filtered = data ? applyFilters(data, filters) : [];
  const sorted = sortFlights(filtered, sort);
  const bestId = bestFlightId(filtered);
  const active = countActive(filters);

  // Parametri che le schermate successive devono conservare: la ricerca e, per il ritorno, l'andata scelta.
  const carry = serializeSearch(search);
  if (outbound) {
    carry.set("out", outbound.flight.id);
    carry.set("outFare", outbound.fare);
  }

  const passengers = `${search.adults} ${search.adults === 1 ? "adult" : "adults"} · ${search.cabin === "business" ? "Business" : "Economy"}`;
  const backToOutbound = new URLSearchParams(params);
  backToOutbound.delete("out");
  backToOutbound.delete("outFare");

  return (
    <div className="pb-8">
      {outbound ? (
        <PageHeader
          title="Choose your return"
          subtitle={`${cityOf(leg.from)} → ${cityOf(leg.to)} · ${formatDay(leg.date)} · Total so far ${formatCents(
            tripTotal([{ baseCents: outbound.flight.baseCents, fare: outbound.fare }], search.adults),
          )}`}
          backTo={`/results?${backToOutbound}`}
        />
      ) : (
        <PageHeader
          title={`${cityOf(leg.from)} → ${cityOf(leg.to)}`}
          subtitle={`${formatDay(leg.date)} · ${passengers}`}
          backTo="/"
        />
      )}

      <div className="mt-4 px-6">
        <SortTabs flights={filtered} value={sort} onChange={setSort} />
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-6">
        <FilterPill
          pressed={filters.stops === "direct"}
          onClick={() => applyFiltersToUrl({ ...filters, stops: filters.stops === "direct" ? "any" : "direct" })}
        >
          Direct
        </FilterPill>
        <FilterPill
          pressed={filters.bands.length === 1 && filters.bands[0] === "morning"}
          onClick={() =>
            applyFiltersToUrl({
              ...filters,
              bands: filters.bands.length === 1 && filters.bands[0] === "morning" ? [] : ["morning"],
            })
          }
        >
          Morning
        </FilterPill>
        <FilterPill pressed={active > 0} icon={<FilterIcon size={18} />} onClick={() => setSheetOpen(true)}>
          Filters
          {active > 0 && <span className="ml-0.5 text-sm">{active}</span>}
        </FilterPill>
      </div>

      <div className="mt-4 flex items-baseline justify-between px-6">
        <h2 className="sr-only">Flights</h2>
        {data && (
          <span className="text-sm text-muted" aria-live="polite">
            {sorted.length} {sorted.length === 1 ? "flight" : "flights"}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3 px-6">
        {isPending && (
          <div role="status" aria-label="Loading flights" className="flex flex-col gap-3">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        )}

        {isError && (
          <div role="alert" className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">We couldn&apos;t load flights.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-pill bg-forest px-5 py-2.5 font-medium text-cream"
            >
              Try again
            </button>
          </div>
        )}

        {data && sorted.length === 0 && (
          <div className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">No flights match these filters.</p>
            {active > 0 && (
              <button
                type="button"
                onClick={() => applyFiltersToUrl(initialFilters)}
                className="mt-3 rounded-pill bg-forest px-5 py-2.5 font-medium text-cream"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {sorted.map((flight) => (
          <FlightCard key={flight.id} flight={flight} search={carry.toString()} best={flight.id === bestId} />
        ))}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        flights={data ?? []}
        onApply={applyFiltersToUrl}
      />
    </div>
  );
}
