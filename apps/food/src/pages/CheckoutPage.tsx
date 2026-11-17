import { useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Skeleton, cx } from "@portfolio/ui";
import { PageHeader } from "@/components/PageHeader";
import { useCart } from "@/features/cart/cartStore";
import { OrderSummary } from "@/features/cart/OrderSummary";
import { useCartSummary } from "@/features/cart/useCartRestaurant";
import { paymentLabels, useOrders, type PaymentMethod } from "@/features/orders/orderStore";
import { formatEuro } from "@/lib/format";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

const payments: PaymentMethod[] = ["demo-card", "cash"];

export function CheckoutPage() {
  useDocumentTitle("Checkout — Nosh");
  const navigate = useNavigate();
  const clearCart = useCart((s) => s.clear);
  const placeOrder = useOrders((s) => s.place);
  const { lines, restaurantId, restaurant, totals } = useCartSummary();

  const [address, setAddress] = useState("Ceintuurbaan 251");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("demo-card");
  // Dopo l'ordine il carrello si svuota: non va trattato come "carrello vuoto".
  const placed = useRef(false);

  const items = Object.values(lines);
  if (items.length === 0 && !placed.current) return <Navigate to="/cart" replace />;

  const canSubmit = address.trim().length > 0 && restaurant !== null && totals !== null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || !restaurant || !totals || !restaurantId) return;
    const order = placeOrder({
      restaurantId,
      restaurantName: restaurant.name,
      etaMin: restaurant.etaMin,
      lines: items.map(({ item, qty }) => ({ name: item.name, qty, price: item.price })),
      totals,
      address: address.trim(),
      note: note.trim(),
      payment,
    });
    placed.current = true;
    clearCart();
    navigate(`/orders/${order.id}`, { replace: true });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader title="Checkout" subtitle={restaurant?.name} backTo="/cart" />

      <div className="space-y-6 px-6 pt-5 pb-4">
        <section aria-labelledby="addr-title">
          <h2 id="addr-title" className="text-base font-semibold">
            Delivery address
          </h2>
          <label className="mt-2 block">
            <span className="sr-only">Address</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              aria-invalid={address.trim().length === 0}
              aria-describedby={address.trim().length === 0 ? "addr-error" : undefined}
              className="h-12 w-full rounded-pill border border-line bg-surface px-5 text-[15px] outline-none"
            />
          </label>
          {address.trim().length === 0 && (
            <p id="addr-error" role="alert" className="mt-1.5 px-2 text-sm text-red-700">
              Enter a delivery address.
            </p>
          )}
          <label className="mt-3 block">
            <span className="sr-only">Note for the courier</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note for the courier (optional)"
              className="h-12 w-full rounded-pill border border-line bg-surface px-5 text-[15px] outline-none placeholder:text-muted"
            />
          </label>
          {restaurant && (
            <p className="mt-3 px-2 text-sm text-muted">
              Estimated arrival: {restaurant.etaMin} min
            </p>
          )}
        </section>

        <fieldset>
          <legend className="text-base font-semibold">Payment</legend>
          <p className="mt-1 text-sm text-muted">
            This is a demo: no real payment is taken and no card details are ever asked.
          </p>
          <div className="mt-3 space-y-2.5">
            {payments.map((method) => (
              <label
                key={method}
                className={cx(
                  "flex cursor-pointer items-center gap-3 rounded-tile border bg-surface px-5 py-3.5 text-[15px] font-medium",
                  payment === method ? "border-forest ring-1 ring-forest" : "border-line",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={payment === method}
                  onChange={() => setPayment(method)}
                  className="size-4 accent-forest"
                />
                {paymentLabels[method]}
              </label>
            ))}
          </div>
        </fieldset>

        <section aria-label="Summary">
          {totals ? <OrderSummary totals={totals} /> : <Skeleton className="h-36 w-full" />}
        </section>
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-cream via-cream to-transparent px-6 pt-6 pb-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-14 w-full items-center justify-between rounded-pill bg-forest px-6 font-semibold text-cream shadow-soft disabled:opacity-40"
        >
          <span>Place order</span>
          {totals && <span>{formatEuro(totals.total)}</span>}
        </button>
      </div>
    </form>
  );
}
