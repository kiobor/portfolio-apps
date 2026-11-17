import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SearchField, SearchIcon, Skeleton } from "@portfolio/ui";
import { fetchCatalog } from "@/api/restaurants";
import { RestaurantCard } from "@/features/restaurants/RestaurantCard";
import { MIN_QUERY_LENGTH, searchCatalog } from "@/features/search/search";
import { formatEuro } from "@/lib/format";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

const suggestions = ["Poke", "Brunch", "Vegan", "Smoothies", "Tacos", "Salad"];

export function SearchPage() {
  useDocumentTitle("Search — Nosh");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: catalog, isPending } = useQuery({ queryKey: ["catalog"], queryFn: fetchCatalog });

  useEffect(() => inputRef.current?.focus(), []);

  const ready = deferred.trim().length >= MIN_QUERY_LENGTH;
  const results = catalog && ready ? searchCatalog(catalog, deferred) : null;
  const total = results ? results.places.length + results.dishes.length : 0;

  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="text-[28px] leading-8 font-bold tracking-tight">Search</h1>

      <div className="pt-4">
        <SearchField
          ref={inputRef}
          aria-label="Search places, dishes or cuisines"
          placeholder="Search places, dishes or cuisines"
          icon={<SearchIcon size={20} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!ready && (
        <section aria-labelledby="sugg-title" className="pt-6">
          <h2 id="sugg-title" className="text-base font-semibold">
            Popular searches
          </h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="h-10 rounded-pill border border-line bg-surface px-4 text-[15px] font-medium transition-colors hover:bg-tile"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {ready && isPending && <Skeleton className="mt-6 h-32 w-full" />}

      {results && (
        <>
          <p role="status" className="sr-only">
            {total === 0 ? "No results" : `${total} results`}
          </p>

          {total === 0 && (
            <div className="pt-12 text-center">
              <h2 className="text-xl font-bold tracking-tight">
                No results for &ldquo;{deferred.trim()}&rdquo;
              </h2>
              <p className="mt-1.5 text-muted">Try a cuisine, a dish or a restaurant name.</p>
            </div>
          )}

          {results.places.length > 0 && (
            <section aria-labelledby="places-title" className="pt-6">
              <h2 id="places-title" className="text-xl font-bold tracking-tight">
                Places{" "}
                <span className="text-base font-normal text-muted">{results.places.length}</span>
              </h2>
              <div className="mt-3 space-y-3">
                {results.places.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} variant="row" bestMatch={false} />
                ))}
              </div>
            </section>
          )}

          {results.dishes.length > 0 && (
            <section aria-labelledby="dishes-title" className="pt-6">
              <h2 id="dishes-title" className="text-xl font-bold tracking-tight">
                Dishes{" "}
                <span className="text-base font-normal text-muted">{results.dishes.length}</span>
              </h2>
              <ul className="mt-1 divide-y divide-line">
                {results.dishes.map(({ item, restaurant }) => (
                  <li key={item.id}>
                    <Link
                      to={`/restaurant/${restaurant.id}`}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold">{item.name}</h3>
                        <p className="mt-0.5 text-[13px] text-muted">
                          {restaurant.name} · {restaurant.etaMin} min
                        </p>
                      </div>
                      <span className="shrink-0 text-[15px] font-semibold">
                        {formatEuro(item.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
