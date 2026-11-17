import { useState, type ReactNode } from "react";
import { HistogramSlider, OptionChip, Sheet } from "@portfolio/ui";
import type { PriceLevel, Restaurant } from "@/data/types";
import { useOverlayRoot } from "@/layout/OverlayContext";
import { formatEuro } from "@/lib/format";
import {
  ETA_SLIDER,
  countWith,
  etaHistogram,
  initialFilters,
  type FilterState,
} from "./filters";

const feeOptions: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "Free", value: 0 },
  { label: `Up to ${formatEuro(1.5)}`, value: 1.5 },
  { label: `Up to ${formatEuro(2.5)}`, value: 2.5 },
];

const ratingOptions: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "4.0+", value: 4 },
  { label: "4.5+", value: 4.5 },
  { label: "4.7+", value: 4.7 },
];

const priceOptions: { label: string; value: PriceLevel }[] = [
  { label: "€", value: 1 },
  { label: "€€", value: 2 },
  { label: "€€€", value: 3 },
];

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-5 first:border-t-0 first:pt-2">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {aside && <span className="text-sm text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/**
 * Lavora su una bozza: "Show N places" la applica, chiudere la scarta.
 * Ogni opzione mostra quanti risultati darebbe prima di sceglierla.
 */
export function FilterSheet({
  open,
  onClose,
  filters,
  restaurants,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  restaurants: Restaurant[];
  onApply: (next: FilterState) => void;
}) {
  const overlayRoot = useOverlayRoot();
  return (
    <Sheet open={open} onClose={onClose} title="Filters" container={overlayRoot}>
      {/* Il Sheet smonta il contenuto da chiuso: la bozza riparte dai filtri correnti a ogni apertura. */}
      <FilterSheetBody
        filters={filters}
        restaurants={restaurants}
        onApply={(next) => {
          onApply(next);
          onClose();
        }}
      />
    </Sheet>
  );
}

function FilterSheetBody({
  filters,
  restaurants,
  onApply,
}: {
  filters: FilterState;
  restaurants: Restaurant[];
  onApply: (next: FilterState) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const count = countWith(restaurants, draft, {});
  const patch = (p: Partial<FilterState>) => setDraft((d) => ({ ...d, ...p }));

  const sliderValue = draft.maxEta ?? ETA_SLIDER.max;
  const togglePrice = (level: PriceLevel) =>
    patch({
      prices: draft.prices.includes(level)
        ? draft.prices.filter((p) => p !== level)
        : [...draft.prices, level],
    });

  return (
    <>
      <Section
        title="Delivery time"
        aside={draft.maxEta === null ? "Any time" : `Under ${draft.maxEta} min`}
      >
        <HistogramSlider
          label="Maximum delivery time"
          buckets={etaHistogram(restaurants)}
          {...ETA_SLIDER}
          value={sliderValue}
          valueText={draft.maxEta === null ? "Any time" : `Under ${draft.maxEta} minutes`}
          onChange={(v) => patch({ maxEta: v >= ETA_SLIDER.max ? null : v })}
        />
      </Section>

      <Section title="Delivery fee">
        <div className="flex flex-wrap gap-2.5">
          {feeOptions.map((o) => (
            <OptionChip
              key={o.label}
              label={o.label}
              count={countWith(restaurants, draft, { maxFee: o.value })}
              selected={draft.maxFee === o.value}
              onClick={() => patch({ maxFee: o.value })}
            />
          ))}
        </div>
      </Section>

      <Section title="Rating">
        <div className="flex flex-wrap gap-2.5">
          {ratingOptions.map((o) => (
            <OptionChip
              key={o.label}
              label={o.label}
              count={countWith(restaurants, draft, { minRating: o.value })}
              selected={draft.minRating === o.value}
              onClick={() => patch({ minRating: o.value })}
            />
          ))}
        </div>
      </Section>

      <Section title="Price">
        <div className="flex flex-wrap gap-2.5">
          {priceOptions.map((o) => (
            <OptionChip
              key={o.value}
              label={o.label}
              count={countWith(restaurants, draft, { prices: [o.value] })}
              selected={draft.prices.includes(o.value)}
              onClick={() => togglePrice(o.value)}
            />
          ))}
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-6 mt-2 flex gap-3 border-t border-line bg-cream px-6 pt-4 pb-1">
        <button
          type="button"
          onClick={() =>
            setDraft((d) => ({ ...initialFilters, category: d.category, sort: d.sort }))
          }
          className="h-12 rounded-pill px-5 font-medium text-ink underline-offset-4 hover:underline"
        >
          Reset
        </button>
        <button
          type="button"
          disabled={count === 0}
          onClick={() => onApply(draft)}
          className="h-12 flex-1 rounded-pill bg-forest font-semibold text-cream transition-opacity disabled:opacity-40"
        >
          {count === 0 ? "No places match" : `Show ${count} ${count === 1 ? "place" : "places"}`}
        </button>
      </div>
    </>
  );
}
