import { useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { QuantityStepper, SegmentedToggle, SwapIcon, cx } from "@portfolio/ui";
import type { Cabin } from "@/data/types";
import { addDays, isoDate } from "@/lib/dates";
import { AirportPicker } from "./AirportPicker";
import { MAX_ADULTS, serializeSearch, validateSearch, type SearchQuery } from "./params";

type TripType = "round" | "one";
type FieldError = { field: "from" | "to" | "depart" | "ret"; message: string };

const tripOptions: { value: TripType; label: string }[] = [
  { value: "round", label: "Round trip" },
  { value: "one", label: "One way" },
];
const cabinOptions: { value: Cabin; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "business", label: "Business" },
];

function DateField({
  label,
  value,
  min,
  onChange,
  error,
  errorId,
}: {
  label: string;
  value: string;
  min: string;
  onChange: (v: string) => void;
  error: boolean;
  errorId: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-surface px-4 py-3 text-left">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        required
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cx("mt-0.5 w-full bg-transparent text-base font-semibold outline-none", error && "text-red-700")}
      />
    </label>
  );
}

export function SearchForm({ today = new Date() }: { today?: Date }) {
  const navigate = useNavigate();
  const errorId = useId();
  const todayIso = isoDate(today);
  const defaultDepart = addDays(todayIso, 30);

  const [from, setFrom] = useState("LHR");
  const [to, setTo] = useState("ATH");
  const [trip, setTrip] = useState<TripType>("round");
  const [depart, setDepart] = useState(defaultDepart);
  const [ret, setRet] = useState(addDays(defaultDepart, 7));
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState<Cabin>("economy");
  const [error, setError] = useState<FieldError | null>(null);

  /** Cambiare qualunque campo toglie l'errore: si rivalida all'invio successivo. */
  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    setError(null);
    set(v);
  };

  function swap() {
    setError(null);
    setFrom(to);
    setTo(from);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query: SearchQuery = { from, to, depart, ret: trip === "round" ? ret : null, adults, cabin };
    const result = validateSearch(query, today);
    if (!result.ok) {
      setError({ field: result.field, message: result.message });
      return;
    }
    navigate(`/results?${serializeSearch(query)}`);
  }

  const routeError = error && (error.field === "from" || error.field === "to") ? error : null;
  const datesError = error && (error.field === "depart" || error.field === "ret") ? error : null;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <SegmentedToggle variant="text" label="Trip type" options={tripOptions} value={trip} onChange={edit(setTrip)} />

      <div className="relative flex flex-col gap-2">
        <AirportPicker label="From" value={from} onChange={edit(setFrom)} invalid={routeError?.field === "from"} />
        <AirportPicker
          label="To"
          value={to}
          onChange={edit(setTo)}
          invalid={routeError?.field === "to"}
          describedBy={routeError ? errorId : undefined}
        />
        <button
          type="button"
          onClick={swap}
          aria-label="Swap departure and destination"
          className="absolute top-1/2 right-4 grid size-10 -translate-y-1/2 place-items-center rounded-pill border border-line bg-cream text-ink shadow-soft"
        >
          <SwapIcon size={18} className="rotate-90" />
        </button>
      </div>
      {routeError && (
        <p id={errorId} role="alert" className="-mt-2 text-sm font-medium text-red-700">
          {routeError.message}
        </p>
      )}

      <div className="flex gap-2">
        <DateField
          label="Departure"
          value={depart}
          min={todayIso}
          onChange={edit(setDepart)}
          error={datesError?.field === "depart"}
          errorId={errorId}
        />
        {trip === "round" && (
          <DateField
            label="Return"
            value={ret}
            min={depart || todayIso}
            onChange={edit(setRet)}
            error={datesError?.field === "ret"}
            errorId={errorId}
          />
        )}
      </div>
      {datesError && (
        <p id={errorId} role="alert" className="-mt-2 text-sm font-medium text-red-700">
          {datesError.message}
        </p>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
        <div>
          <p className="text-base font-semibold">Adults</p>
          <p className="text-xs text-muted">Up to {MAX_ADULTS} per booking</p>
        </div>
        <QuantityStepper
          quantity={adults}
          name="adult"
          min={1}
          max={MAX_ADULTS}
          labels={{ add: "Add adult", remove: "Remove adult", quantity: "Adults" }}
          onAdd={() => setAdults((n) => Math.min(MAX_ADULTS, n + 1))}
          onRemove={() => setAdults((n) => Math.max(1, n - 1))}
        />
      </div>

      <SegmentedToggle variant="text" label="Cabin class" options={cabinOptions} value={cabin} onChange={edit(setCabin)} />

      <button
        type="submit"
        className="h-14 rounded-pill bg-forest text-base font-semibold text-cream transition-opacity active:opacity-90"
      >
        Search flights
      </button>
    </form>
  );
}
