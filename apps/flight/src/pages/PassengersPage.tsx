import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { cx, useDocumentTitle } from "@portfolio/ui";
import { airportByCode } from "@/data/airports";
import { PageHeader } from "@/components/PageHeader";
import { fareTotals, parseFare, tripTotal, type FareId } from "@/features/booking/pricing";
import { getFlightById } from "@/features/results/generate";
import { flightTimes } from "@/features/results/Timeline";
import { parseSearch } from "@/features/search/params";
import { useTripsStore } from "@/features/trips/tripsStore";
import { formatCents, formatDay } from "@/lib/format";

const MAX_NAME = 120;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cityOf = (code: string) => airportByCode.get(code)?.city ?? code;
const fareName: Record<FareId, string> = { basic: "Basic", standard: "Standard", flex: "Flex" };

type Errors = { names: (string | null)[]; email: string | null };

function validate(names: string[], email: string): Errors | null {
  const nameErrors = names.map((n) => {
    const t = n.trim();
    if (t === "") return "Enter the passenger's full name.";
    if (t.length > MAX_NAME) return `Names can have up to ${MAX_NAME} characters.`;
    return null;
  });
  const emailError = EMAIL.test(email.trim()) ? null : "Enter a valid email address.";
  return nameErrors.some(Boolean) || emailError ? { names: nameErrors, email: emailError } : null;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | null;
  children: (props: { id: string; "aria-invalid": true | undefined; "aria-describedby": string | undefined }) => React.ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined })}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function PassengersPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const addBooking = useTripsStore((s) => s.addBooking);
  const today = useMemo(() => new Date(), []);
  const adults = parseSearch(params, today).adults;

  const outId = params.get("out");
  const rtnId = params.get("rtn");
  const out = outId ? getFlightById(outId) : null;
  const rtn = rtnId ? getFlightById(rtnId) : null;
  const valid = out !== null && (rtnId === null || rtn !== null);

  const [names, setNames] = useState<string[]>(() => Array.from({ length: adults }, () => ""));
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors | null>(null);

  useDocumentTitle("Passengers — Skylark");

  if (!valid || !out) {
    return (
      <div>
        <PageHeader title="Trip not found" backTo="/" />
        <div className="px-6 pt-6">
          <div className="rounded-tile bg-tile p-6 text-center">
            <p className="font-semibold">Pick a flight first, then add the passengers.</p>
            <Link to="/" className="mt-3 inline-block rounded-pill bg-forest px-5 py-2.5 font-medium text-cream">
              Search flights
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Il totale si ricostruisce sempre dai voli e dalle tariffe nell'URL: non ci si fida di un importo salvato.
  const legs = [
    { flight: out, fare: parseFare(params.get("outFare")), label: rtn ? "Outbound" : "Flight" },
    ...(rtn ? [{ flight: rtn, fare: parseFare(params.get("rtnFare")), label: "Return" }] : []),
  ];
  const totalCents = tripTotal(
    legs.map((l) => ({ baseCents: l.flight.baseCents, fare: l.fare })),
    adults,
  );

  const backParams = new URLSearchParams(params);
  if (rtn) {
    backParams.delete("rtn");
    backParams.delete("rtnFare");
  } else {
    backParams.delete("out");
    backParams.delete("outFare");
  }
  const lastFlight = rtn ?? out;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(names, email);
    setErrors(found);
    if (found) {
      const firstId = found.names.findIndex(Boolean) >= 0 ? `passenger-${found.names.findIndex(Boolean)}` : "email";
      document.getElementById(firstId)?.focus();
      return;
    }
    const booking = addBooking({
      legs: legs.map((l) => ({ flightId: l.flight.id, fare: l.fare })),
      adults,
      passengers: names.map((n) => n.trim()),
      email: email.trim(),
      totalCents,
    });
    navigate(`/booking/${booking.ref}`, { replace: true });
  }

  const inputClass = (invalid: boolean) =>
    cx(
      "h-12 w-full rounded-2xl border bg-surface px-4 text-base outline-none focus-visible:border-forest",
      invalid ? "border-red-700" : "border-line",
    );

  return (
    <div className="pb-8">
      <PageHeader title="Passengers" subtitle={`${adults} ${adults === 1 ? "adult" : "adults"}`} backTo={`/flight/${lastFlight.id}?${backParams}`} />

      <ul className="mt-5 flex flex-col gap-2 px-6">
        {legs.map((l) => {
          const t = flightTimes(l.flight);
          const per = fareTotals({ baseCents: l.flight.baseCents, fare: l.fare, adults });
          return (
            <li key={l.flight.id} className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                {l.label} · {fareName[l.fare]}
              </p>
              <p className="mt-0.5 font-bold">
                {cityOf(t.from)} → {cityOf(t.to)}
              </p>
              <p className="text-sm text-muted">
                {formatDay(t.date)} · {t.depart.hhmm} – {t.arrive.hhmm}
                {t.arrive.dayOffset > 0 ? ` +${t.arrive.dayOffset}` : ""} · {formatCents(per.totalCents)}
              </p>
            </li>
          );
        })}
      </ul>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4 px-6">
        {names.map((value, i) => (
          <Field key={i} id={`passenger-${i}`} label={`Passenger ${i + 1} full name`} error={errors?.names[i] ?? null}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="name"
                maxLength={MAX_NAME + 20}
                value={value}
                onChange={(e) => setNames((all) => all.map((n, j) => (j === i ? e.target.value : n)))}
                className={inputClass(Boolean(errors?.names[i]))}
              />
            )}
          </Field>
        ))}
        <Field id="email" label="Email for the confirmation" error={errors?.email ?? null}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass(Boolean(errors?.email))}
            />
          )}
        </Field>

        <p className="rounded-2xl bg-forest-soft p-4 text-sm leading-5">
          Demo only: no passport or ID number is needed, no card is needed and nothing is charged or sent.
        </p>

        <button
          type="submit"
          className="h-14 rounded-pill bg-forest text-base font-semibold text-cream transition-opacity active:opacity-90"
        >
          Confirm booking · {formatCents(totalCents)}
        </button>
      </form>
    </div>
  );
}
