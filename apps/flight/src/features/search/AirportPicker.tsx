import { useState } from "react";
import { SearchField, SearchIcon, Sheet, cx, useOverlayRoot } from "@portfolio/ui";
import { airportByCode, airports } from "@/data/airports";

/** Minuscolo e senza accenti: "Mádrid" trova Madrid. */
function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Campo che mostra l'aeroporto scelto e apre un pannello con ricerca per città o codice. */
export function AirportPicker({
  label,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  label: "From" | "To";
  value: string;
  onChange: (code: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const overlayRoot = useOverlayRoot();
  const airport = airportByCode.get(value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cx(
          "flex min-w-0 flex-1 flex-col items-start rounded-2xl border bg-surface px-4 py-3 text-left",
          invalid ? "border-red-700" : "border-line",
        )}
      >
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="mt-0.5 flex w-full items-baseline gap-2">
          <span className="truncate text-lg font-bold tracking-tight">{airport?.city ?? value}</span>
          <span className="text-sm font-semibold text-muted">{value}</span>
        </span>
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={label === "From" ? "Departure airport" : "Destination airport"}
        container={overlayRoot}
      >
        <PickerBody
          selected={value}
          onPick={(code) => {
            onChange(code);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}

function PickerBody({ selected, onPick }: { selected: string; onPick: (code: string) => void }) {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const matches = airports.filter(
    // Per città e codice, come da spec: cercare nel nome dell'aeroporto farebbe trovare Londra scrivendo "ath".
    (a) => q === "" || normalize(`${a.city} ${a.code}`).includes(q),
  );

  return (
    <div className="pb-2">
      <SearchField
        aria-label="Search airports"
        placeholder="City or airport code"
        icon={<SearchIcon size={20} />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {matches.length === 0 ? (
        <p className="py-8 text-center text-muted">No airports match “{query}”.</p>
      ) : (
        <ul className="mt-3">
          {matches.map((a) => (
            <li key={a.code}>
              <button
                type="button"
                aria-pressed={a.code === selected}
                onClick={() => onPick(a.code)}
                className={cx(
                  "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left",
                  a.code === selected && "bg-forest-soft",
                )}
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{a.city}</span>
                  <span className="block truncate text-sm text-muted">{a.name}</span>
                </span>
                <span className="text-sm font-bold text-muted">{a.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
