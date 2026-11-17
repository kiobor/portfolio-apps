import { Link } from "react-router-dom";
import { OrdersIcon } from "@portfolio/ui";
import { STAGE_LABELS, orderStage } from "@/features/orders/orderStatus";
import { useOrders } from "@/features/orders/orderStore";
import { formatEuro } from "@/lib/format";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useNow } from "@/lib/useNow";

export function OrdersPage() {
  useDocumentTitle("Orders — Nosh");
  const orders = useOrders((s) => s.orders);
  const anyLive = orders.some((o) => !orderStage(o.createdAt, Date.now()).delivered);
  const now = useNow(anyLive);

  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="text-[28px] leading-8 font-bold tracking-tight">Orders</h1>

      {orders.length === 0 ? (
        <div className="pt-16 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-pill bg-tile text-muted">
            <OrdersIcon size={28} />
          </span>
          <h2 className="mt-5 text-xl font-bold tracking-tight">No orders yet</h2>
          <p className="mt-1.5 text-muted">Your orders will show up here.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-pill bg-forest px-6 py-3 font-semibold text-cream"
          >
            Browse places
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((order) => {
            const { stage, delivered } = orderStage(order.createdAt, now);
            const qty = order.lines.reduce((sum, l) => sum + l.qty, 0);
            return (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="block rounded-tile border border-line bg-surface px-5 py-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="truncate text-base font-bold">{order.restaurantName}</h2>
                    <span
                      className={
                        delivered
                          ? "shrink-0 text-sm text-muted"
                          : "shrink-0 text-sm font-semibold text-forest"
                      }
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {qty} {qty === 1 ? "item" : "items"} · {formatEuro(order.totals.total)} ·{" "}
                    {new Date(order.createdAt).toLocaleString("en", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
