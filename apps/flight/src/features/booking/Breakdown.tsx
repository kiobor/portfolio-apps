import { formatCents } from "@/lib/format";

/** Il prezzo prima di prenotare: tariffa, tasse a parte, eventuale andata già scelta e totale per tutti gli adulti. */
export function Breakdown({
  perPersonCents,
  taxesCents,
  adults,
  previousLegCents,
}: {
  perPersonCents: number;
  /** Tasse per persona. */
  taxesCents: number;
  adults: number;
  /** Totale (tasse incluse) dell'andata già scelta, in un viaggio di andata e ritorno. */
  previousLegCents?: number;
}) {
  const legTotal = adults * (perPersonCents + taxesCents);
  const total = legTotal + (previousLegCents ?? 0);
  return (
    <section aria-label="Price breakdown" className="rounded-2xl border border-line bg-surface p-4">
      <dl className="flex flex-col gap-2 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">
            Fare · {adults} × {formatCents(perPersonCents)}
          </dt>
          <dd>{formatCents(adults * perPersonCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">
            Taxes and fees · {adults} × {formatCents(taxesCents)}
          </dt>
          <dd>{formatCents(adults * taxesCents)}</dd>
        </div>
        {previousLegCents !== undefined && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Outbound flight, taxes included</dt>
            <dd>{formatCents(previousLegCents)}</dd>
          </div>
        )}
        <div className="mt-1 flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold">
          <dt>Total</dt>
          <dd>{formatCents(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
