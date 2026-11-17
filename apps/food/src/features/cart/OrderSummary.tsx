import { cx } from "@portfolio/ui";
import { formatEuro } from "@/lib/format";
import type { Totals } from "./pricing";

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 text-[15px]">
      <dt className="text-muted">{label}</dt>
      <dd className={cx("font-medium", accent && "text-forest")}>{value}</dd>
    </div>
  );
}

export function OrderSummary({ totals }: { totals: Totals }) {
  return (
    <dl aria-label="Order summary" className="rounded-tile border border-line bg-surface px-5 py-3">
      <Row label="Subtotal" value={formatEuro(totals.subtotal)} />
      <Row
        label="Delivery"
        value={totals.deliveryFee === 0 ? "Free" : formatEuro(totals.deliveryFee)}
        accent={totals.deliveryFee === 0}
      />
      <Row label="Service fee" value={formatEuro(totals.serviceFee)} />
      <div className="mt-1.5 flex justify-between border-t border-line pt-3 text-base font-bold">
        <dt>Total</dt>
        <dd>{formatEuro(totals.total)}</dd>
      </div>
    </dl>
  );
}
