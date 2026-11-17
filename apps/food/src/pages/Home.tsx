import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  BagIcon,
  CardLayoutIcon,
  CategoryTile,
  ChevronDownIcon,
  ClockIcon,
  FilterIcon,
  FilterPill,
  IconButton,
  ListLayoutIcon,
  SearchIcon,
  SegmentedToggle,
  Skeleton,
  SortIcon,
  UserIcon,
} from "@portfolio/ui";
import { fetchRestaurants } from "@/api/restaurants";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { CategoryIllustration, categories } from "@/features/categories/categories";
import { RestaurantCard, type CardVariant } from "@/features/restaurants/RestaurantCard";
import { FilterSheet } from "@/features/restaurants/FilterSheet";
import {
  QUICK_ETA,
  applyFilters,
  bestMatchId,
  countActive,
  hasActiveFilters,
  initialFilters,
  sortLabels,
  type FilterState,
  type SortKey,
} from "@/features/restaurants/filters";

export function Home() {
  useDocumentTitle("Nosh — Food delivery");
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [layout, setLayout] = useState<CardVariant>("card");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });

  const results = data ? applyFilters(data, filters) : [];
  const bestId = bestMatchId(results);
  const activeCount = countActive(filters);

  return (
    <div className="pb-6">
      <h1 className="sr-only">Nosh, food delivery</h1>
      <header className="flex items-center justify-between px-6 pt-6">
        <button type="button" className="flex items-center gap-1.5 text-[15px]">
          <span className="text-muted">Deliver to</span>
          <strong className="font-semibold">Ceintuurbaan 251</strong>
          <ChevronDownIcon size={16} />
          <span className="sr-only">Change delivery address</span>
        </button>
        <IconButton aria-label="Open account" onClick={() => navigate("/account")}>
          <UserIcon size={20} />
        </IconButton>
      </header>

      <div className="px-6 pt-4">
        {/*
          Sembra un campo ma è un link: aprire la ricerca al solo focus cambierebbe pagina
          a chi naviga con Tab senza che l'abbia chiesto (WCAG 3.2.1).
        */}
        <Link
          to="/search"
          className="flex h-12 items-center gap-3 rounded-pill border border-line bg-surface px-4 text-[15px] text-muted"
        >
          <SearchIcon size={20} />
          Search places, dishes or cuisines
        </Link>
      </div>

      <section aria-label="Categories" className="flex gap-2.5 px-6 pt-4">
        {categories.map((c) => (
          <CategoryTile
            key={c.id}
            label={c.label}
            illustration={<CategoryIllustration id={c.id} />}
            selected={filters.category === c.id}
            onClick={() =>
              setFilters((f) => ({ ...f, category: f.category === c.id ? null : c.id }))
            }
          />
        ))}
      </section>

      <section aria-label="Filters" className="no-scrollbar flex gap-2.5 overflow-x-auto px-6 pt-4">
        <div className="relative">
          <IconButton
            aria-label={activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"}
            aria-haspopup="dialog"
            onClick={() => setSheetOpen(true)}
          >
            <FilterIcon size={20} />
          </IconButton>
          {activeCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-pill bg-forest text-[11px] font-bold text-cream"
            >
              {activeCount}
            </span>
          )}
        </div>
        <div className="relative">
          <IconButton aria-label={`Sort: ${sortLabels[filters.sort]}`} tabIndex={-1}>
            <SortIcon size={20} />
          </IconButton>
          <select
            aria-label="Sort by"
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortKey }))}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          >
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
        </div>
        <FilterPill
          pressed={filters.maxEta === QUICK_ETA}
          icon={<ClockIcon size={18} />}
          onClick={() =>
            setFilters((f) => ({ ...f, maxEta: f.maxEta === QUICK_ETA ? null : QUICK_ETA }))
          }
        >
          Under 30 min
        </FilterPill>
        <FilterPill
          pressed={filters.maxFee === 0}
          icon={<BagIcon size={18} />}
          onClick={() => setFilters((f) => ({ ...f, maxFee: f.maxFee === 0 ? null : 0 }))}
        >
          Free delivery
        </FilterPill>
      </section>

      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-xl font-bold tracking-tight whitespace-nowrap">Open near you</h2>
          {data && (
            <span className="text-sm whitespace-nowrap text-muted" aria-live="polite">
              {results.length} {results.length === 1 ? "place" : "places"}
            </span>
          )}
        </div>
        <SegmentedToggle<CardVariant>
          label="Layout"
          value={layout}
          onChange={setLayout}
          options={[
            { value: "card", label: "Card layout", icon: <CardLayoutIcon size={18} /> },
            { value: "row", label: "List layout", icon: <ListLayoutIcon size={18} /> },
          ]}
        />
      </div>

      <div className="flex flex-col gap-6 px-6 pt-4">
        {isPending && (
          <>
            <Skeleton className="aspect-[1.75] w-full" />
            <Skeleton className="aspect-[1.75] w-full" />
          </>
        )}

        {isError && (
          <div role="alert" className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">We couldn&apos;t load places near you.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-pill bg-forest px-5 py-2.5 font-medium text-cream"
            >
              Try again
            </button>
          </div>
        )}

        {data && results.length === 0 && (
          <div className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">No places match these filters.</p>
            {hasActiveFilters(filters) && (
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...initialFilters, sort: f.sort }))}
                className="mt-3 rounded-pill bg-forest px-5 py-2.5 font-medium text-cream"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {results.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} variant={layout} bestMatch={r.id === bestId} />
        ))}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        restaurants={data ?? []}
        onApply={setFilters}
      />
    </div>
  );
}
