import { Link, useNavigate } from "react-router-dom";
import { BagIcon, QuantityStepper, Skeleton } from "@portfolio/ui";
import { PageHeader } from "@/components/PageHeader";
import { useCart } from "@/features/cart/cartStore";
import { OrderSummary } from "@/features/cart/OrderSummary";
import { useCartSummary } from "@/features/cart/useCartRestaurant";
import { formatEuro } from "@/lib/format";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

function EmptyCart() {
  return (
    <div>
      <PageHeader title="Your order" backTo="/" />
      <div className="px-6 pt-16 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-pill bg-tile text-muted">
          <BagIcon size={28} />
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-tight">Your cart is empty</h2>
        <p className="mt-1.5 text-muted">Pick a place you like and add a few dishes.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-pill bg-forest px-6 py-3 font-semibold text-cream"
        >
          Browse places
        </Link>
      </div>
    </div>
  );
}

export function CartPage() {
  useDocumentTitle("Your order — Nosh");
  const navigate = useNavigate();
  const { add, remove } = useCart();
  const { lines, restaurantId, restaurant, totals, isPending } = useCartSummary();
  const items = Object.values(lines);

  if (items.length === 0 || !restaurantId) return <EmptyCart />;

  return (
    <div>
      <PageHeader
        title="Your order"
        subtitle={restaurant?.name}
        backTo={`/restaurant/${restaurantId}`}
      />

      <ul className="mt-4 divide-y divide-line px-6">
        {items.map(({ item, qty }) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{item.name}</h2>
              <p className="mt-0.5 text-[15px] text-muted">{formatEuro(item.price * qty)}</p>
            </div>
            <QuantityStepper
              quantity={qty}
              name={item.name}
              onAdd={() => add(restaurantId, item)}
              onRemove={() => remove(item.id)}
            />
          </li>
        ))}
      </ul>

      <div className="px-6 pt-2">
        <Link
          to={`/restaurant/${restaurantId}`}
          className="text-[15px] font-medium text-forest underline-offset-4 hover:underline"
        >
          Add more items
        </Link>
      </div>

      <div className="px-6 pt-5">
        {totals ? <OrderSummary totals={totals} /> : <Skeleton className="h-36 w-full" />}
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-cream via-cream to-transparent px-6 pt-6 pb-4">
        <button
          type="button"
          disabled={!totals || isPending}
          onClick={() => navigate("/checkout")}
          className="flex h-14 w-full items-center justify-between rounded-pill bg-forest px-6 font-semibold text-cream shadow-soft disabled:opacity-40"
        >
          <span>Go to checkout</span>
          {totals && <span>{formatEuro(totals.total)}</span>}
        </button>
      </div>
    </div>
  );
}
