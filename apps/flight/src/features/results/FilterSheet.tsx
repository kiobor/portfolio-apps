import { useState, type ReactNode } from "react";
import { HistogramSlider, OptionChip, Sheet, useOverlayRoot } from "@portfolio/ui";
import { airlines } from "@/data/airlines";
import type { Flight } from "@/data/types";
import { formatCents, formatDuration } from "@/lib/format";
import {
  countWith,
  dayBands,
  durationHistogram,
  initialFilters,
  priceHistogram,
  type DayBand,
  type FlightFilters,
  type StopsFilter,
} from "./filters";

const stopsOptions: { label: string; value: StopsFilter }[] = [
  { label: "Any", value: "any" },
  { label: "Direct", value: "direct" },
  { label: "Up to 1 stop", value: "max1" },
];

const bandLabels: Record<DayBand, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};
const bandHints: Record<DayBand, string> = {
  morning: "05:00 – 11:59",
  afternoon: "12:00 – 17:59",
  evening: "18:00 – 21:59",
  night: "22:00 – 04:59",
};

/** Estremi e passo di uno slider, arrotondati in modo che le barre non siano troppe (al massimo ~24). */
function sliderRange(values: number[], unit: number) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = unit * Math.max(1, Math.ceil((hi - lo) / unit / 24));
  const min = Math.floor(lo / step) * step;
  const max = Math.max(Math.ceil(hi / step) * step, min + step);
  return { min, max, step, bars: (max - min) / step + 1 };
}

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
 * Lavora su una bozza: "Show N flights" la applica, chiudere la scarta.
 * Ogni opzione mostra quanti voli darebbe prima di sceglierla.
 */
export function FilterSheet({
  open,
  onClose,
  filters,
  flights,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: FlightFilters;
  /** L'elenco completo della tratta, non quello già filtrato: i conteggi si calcolano sulla bozza. */
  flights: Flight[];
  onApply: (next: FlightFilters) => void;
}) {
  const overlayRoot = useOverlayRoot();
  return (
    <Sheet open={open} onClose={onClose} title="Filters" container={overlayRoot}>
      {/* Il Sheet smonta il contenuto da chiuso: la bozza riparte dai filtri correnti a ogni apertura. */}
      <FilterSheetBody
        filters={filters}
        flights={flights}
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
  flights,
  onApply,
}: {
  filters: FlightFilters;
  flights: Flight[];
  onApply: (next: FlightFilters) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const count = countWith(flights, draft, {});
  const patch = (p: Partial<FlightFilters>) => setDraft((d) => ({ ...d, ...p }));

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  /** Selezionata: il conteggio attuale. Non selezionata: quanti voli ci sarebbero aggiungendola. */
  const bandCount = (band: DayBand) =>
    countWith(flights, draft, { bands: draft.bands.includes(band) ? draft.bands : [...draft.bands, band] });
  const airlineCount = (code: string) =>
    countWith(flights, draft, { airlines: draft.airlines.includes(code) ? draft.airlines : [...draft.airlines, code] });

  const present = airlines.filter((a) => flights.some((f) => f.airlineCode === a.code));
  const price = sliderRange(flights.length ? flights.map((f) => f.baseCents) : [0], 1000);
  const duration = sliderRange(flights.length ? flights.map((f) => f.durationMin) : [0], 30);
  const priceValue = draft.maxPriceCents ?? price.max;
  const durationValue = draft.maxDurationMin ?? duration.max;

  return (
    <>
      <Section title="Stops">
        <div className="flex flex-wrap gap-2.5">
          {stopsOptions.map((o) => (
            <OptionChip
              key={o.value}
              label={o.label}
              count={countWith(flights, draft, { stops: o.value })}
              selected={draft.stops === o.value}
              onClick={() => patch({ stops: o.value })}
            />
          ))}
        </div>
      </Section>

      <Section title="Departure time" aside="Local time at departure">
        <div className="flex flex-wrap gap-2.5">
          {dayBands.map((band) => (
            <OptionChip
              key={band}
              label={bandLabels[band]}
              count={bandCount(band)}
              selected={draft.bands.includes(band)}
              onClick={() => patch({ bands: toggle(draft.bands, band) })}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {dayBands.map((b) => `${bandLabels[b]} ${bandHints[b]}`).join(" · ")}
        </p>
      </Section>

      <Section title="Airlines">
        <div className="flex flex-wrap gap-2.5">
          {present.map((a) => (
            <OptionChip
              key={a.code}
              label={a.name}
              count={airlineCount(a.code)}
              selected={draft.airlines.includes(a.code)}
              onClick={() => patch({ airlines: toggle(draft.airlines, a.code) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Price" aside={draft.maxPriceCents === null ? "Any price" : `Up to ${formatCents(draft.maxPriceCents)}`}>
        <HistogramSlider
          label="Maximum price"
          buckets={priceHistogram(flights, price.bars)}
          min={price.min}
          max={price.max}
          step={price.step}
          value={priceValue}
          valueText={draft.maxPriceCents === null ? "Any price" : `Up to ${formatCents(draft.maxPriceCents)}`}
          onChange={(v) => patch({ maxPriceCents: v >= price.max ? null : v })}
        />
      </Section>

      <Section
        title="Duration"
        aside={draft.maxDurationMin === null ? "Any duration" : `Up to ${formatDuration(draft.maxDurationMin)}`}
      >
        <HistogramSlider
          label="Maximum duration"
          buckets={durationHistogram(flights, duration.bars)}
          min={duration.min}
          max={duration.max}
          step={duration.step}
          value={durationValue}
          valueText={draft.maxDurationMin === null ? "Any duration" : `Up to ${formatDuration(draft.maxDurationMin)}`}
          onChange={(v) => patch({ maxDurationMin: v >= duration.max ? null : v })}
        />
      </Section>

      <div className="sticky bottom-0 -mx-6 mt-2 flex gap-3 border-t border-line bg-cream px-6 pt-4 pb-1">
        <button
          type="button"
          onClick={() => setDraft(initialFilters)}
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
          {count === 0 ? "No flights match" : `Show ${count} ${count === 1 ? "flight" : "flights"}`}
        </button>
      </div>
    </>
  );
}
