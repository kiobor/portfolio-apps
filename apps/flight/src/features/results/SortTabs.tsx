import { cx } from "@portfolio/ui";
import type { Flight } from "@/data/types";
import { formatCents, formatDuration } from "@/lib/format";
import { sortSummary, type SortKey } from "./sort";

/** Tre schede che mostrano subito il valore migliore di ciascun criterio: aiutano a decidere, non solo a ordinare. */
export function SortTabs({
  flights,
  value,
  onChange,
}: {
  flights: Flight[];
  value: SortKey;
  onChange: (key: SortKey) => void;
}) {
  const { best, cheapest, fastest } = sortSummary(flights);
  const tabs: { key: SortKey; label: string; detail: string }[] = [
    {
      key: "best",
      label: "Best",
      detail: best ? `${formatCents(best.baseCents)} · ${formatDuration(best.durationMin)}` : "—",
    },
    { key: "cheapest", label: "Cheapest", detail: cheapest ? formatCents(cheapest.baseCents) : "—" },
    { key: "fastest", label: "Fastest", detail: fastest ? formatDuration(fastest.durationMin) : "—" },
  ];

  return (
    <div role="group" aria-label="Sort flights by" className="grid grid-cols-3 gap-2">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.key)}
            className={cx(
              "flex flex-col items-start rounded-2xl border px-3 py-2.5 text-left transition-colors",
              active ? "border-forest bg-forest text-cream" : "border-line bg-surface text-ink",
            )}
          >
            <span className="text-sm font-semibold">{tab.label}</span>
            <span className={cx("text-xs", active ? "text-cream/80" : "text-muted")}>{tab.detail}</span>
          </button>
        );
      })}
    </div>
  );
}
