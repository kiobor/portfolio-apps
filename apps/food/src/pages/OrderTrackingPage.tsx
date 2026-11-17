import { Link, useParams } from "react-router-dom";
import { cx } from "@portfolio/ui";
import { PageHeader } from "@/components/PageHeader";
import { OrderSummary } from "@/features/cart/OrderSummary";
import {
  STAGES,
  STAGE_LABELS,
  minutesLeft,
  orderStage,
} from "@/features/orders/orderStatus";
import { paymentLabels, useOrders } from "@/features/orders/orderStore";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useNow } from "@/lib/useNow";

const subtitles = {
  confirmed: "The restaurant has your order.",
  preparing: "The kitchen is on it.",
  "on-the-way": "Your courier is heading to you.",
  delivered: "Enjoy your meal.",
} as const;

export function OrderTrackingPage() {
  useDocumentTitle("Order tracking — Nosh");
  const { id = "" } = useParams();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const live = order ? !orderStage(order.createdAt, Date.now()).delivered : false;
  const now = useNow(live);

  if (!order) {
    return (
      <div>
        <PageHeader title="Order" backTo="/orders" />
        <div className="px-6 pt-14 text-center">
          <h2 className="text-xl font-bold tracking-tight">We couldn&apos;t find this order</h2>
          <Link
            to="/orders"
            className="mt-5 inline-block rounded-pill bg-forest px-5 py-2.5 font-medium text-cream"
          >
            See your orders
          </Link>
        </div>
      </div>
    );
  }

  const { index, stage, progress, delivered } = orderStage(order.createdAt, now);

  return (
    <div className="pb-6">
      <PageHeader title={order.restaurantName} subtitle="Order tracking" backTo="/orders" />

      <section className="px-6 pt-6">
        <div aria-live="polite">
          <h2 className="text-[28px] leading-8 font-bold tracking-tight">{STAGE_LABELS[stage]}</h2>
          <p className="mt-1 text-muted">
            {delivered
              ? subtitles.delivered
              : `${subtitles[stage]} Arriving in about ${minutesLeft(order.etaMin, progress)} min.`}
          </p>
        </div>

        <div
          role="progressbar"
          aria-label="Order progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="mt-5 h-2 overflow-hidden rounded-pill bg-tile"
        >
          <div
            className="h-full rounded-pill bg-forest transition-[width] duration-700"
            style={{ width: `${Math.max(progress * 100, 4)}%` }}
          />
        </div>

        <ol className="mt-6 space-y-4">
          {STAGES.map((s, i) => {
            const done = i < index || delivered;
            const current = i === index && !delivered;
            return (
              <li
                key={s}
                aria-current={current ? "step" : undefined}
                className={cx(
                  "flex items-center gap-3 text-[15px]",
                  done || current ? "text-ink" : "text-muted",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "grid size-6 place-items-center rounded-pill text-xs font-bold",
                    done && "bg-forest text-cream",
                    current && "bg-forest-soft text-forest ring-2 ring-forest",
                    !done && !current && "bg-tile text-muted",
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={cx(current && "font-semibold")}>{STAGE_LABELS[s]}</span>
                {done && <span className="sr-only">(done)</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-label="Order details" className="mt-8 space-y-4 px-6">
        <div className="rounded-tile border border-line bg-surface px-5 py-4">
          <ul className="divide-y divide-line">
            {order.lines.map((l) => (
              <li key={l.name} className="flex justify-between py-2 text-[15px]">
                <span>
                  {l.qty} × {l.name}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
            Delivering to {order.address} · {paymentLabels[order.payment]}
          </p>
          {order.note && <p className="mt-1 text-sm text-muted">Note: {order.note}</p>}
        </div>
        <OrderSummary totals={order.totals} />
      </section>

      <div className="px-6 pt-6">
        <Link
          to="/"
          className="block rounded-pill border border-line bg-surface py-3.5 text-center font-semibold"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
