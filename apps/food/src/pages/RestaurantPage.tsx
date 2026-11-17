import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BagIcon,
  IconButton,
  QuantityStepper,
  Sheet,
  Skeleton,
  StarIcon,
  cx,
} from "@portfolio/ui";
import { fetchRestaurantDetail } from "@/api/restaurants";
import { cartCount, cartSubtotal, useCart } from "@/features/cart/cartStore";
import { RestaurantPhoto } from "@/features/restaurants/RestaurantPhoto";
import type { DishTag, MenuItem, Restaurant } from "@/data/types";
import { useOverlayRoot } from "@/layout/OverlayContext";
import { formatCount, formatEuro } from "@/lib/format";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

const tagLabels: Record<DishTag, string> = { popular: "Popular", vegan: "Vegan", spicy: "Spicy" };
const priceLabel = (level: number) => "€".repeat(level);
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function scrollToSection(title: string) {
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(`menu-${slug(title)}`)
    ?.scrollIntoView?.({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function InfoCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex-1 px-4 py-3 text-center">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={cx("mt-0.5 text-[15px] font-semibold", accent && "text-forest")}>{value}</dd>
    </div>
  );
}

function Dish({
  item,
  quantity,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold">{item.name}</h3>
        <p className="mt-0.5 text-[13px] leading-5 text-muted">{item.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[15px] font-semibold">{formatEuro(item.price)}</span>
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={cx(
                "rounded-pill px-2 py-0.5 text-[11px] font-semibold",
                tag === "popular" ? "bg-forest-soft text-forest" : "bg-tile text-muted",
              )}
            >
              {tagLabels[tag]}
            </span>
          ))}
        </div>
      </div>
      <QuantityStepper quantity={quantity} name={item.name} onAdd={onAdd} onRemove={onRemove} />
    </li>
  );
}

function NotFound() {
  return (
    <div className="px-6 pt-10 text-center">
      <h1 className="text-xl font-bold tracking-tight">We couldn&apos;t find this place</h1>
      <p className="mt-2 text-muted">It may have closed, or the link is out of date.</p>
      <Link
        to="/"
        className="mt-5 inline-block rounded-pill bg-forest px-5 py-2.5 font-medium text-cream"
      >
        Back to places near you
      </Link>
    </div>
  );
}

export function RestaurantPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRoot = useOverlayRoot();
  const { data, isPending } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => fetchRestaurantDetail(id),
  });
  useDocumentTitle(data ? `${data.restaurant.name} — Nosh` : "Nosh");

  const { lines, restaurantId, add, remove, clear } = useCart();
  const [pending, setPending] = useState<{ restaurant: Restaurant; item: MenuItem } | null>(null);

  // Se la pagina è stata aperta direttamente non c'è una cronologia a cui tornare.
  const goBack = () => (location.key === "default" ? navigate("/") : navigate(-1));

  if (isPending) {
    return (
      <div>
        <Skeleton className="aspect-[1.6] w-full rounded-t-none" />
        <div className="space-y-3 px-6 pt-5">
          <Skeleton className="h-8 w-2/3 rounded-xl" />
          <Skeleton className="h-5 w-full rounded-xl" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!data) return <NotFound />;

  const { restaurant, menu } = data;
  const inThisCart = restaurantId === restaurant.id;
  const count = inThisCart ? cartCount(lines) : 0;
  const subtotal = inThisCart ? cartSubtotal(lines) : 0;
  const free = restaurant.deliveryFee === 0;

  function handleAdd(item: MenuItem) {
    // Un solo ristorante per ordine: se il carrello è di un altro locale si chiede prima.
    if (restaurantId && restaurantId !== restaurant.id) setPending({ restaurant, item });
    else add(restaurant.id, item);
  }

  return (
    <div>
      <div className="relative">
        <RestaurantPhoto restaurant={restaurant} eager className="aspect-[1.6] w-full" />
        <IconButton aria-label="Back" className="absolute top-4 left-4 shadow-soft" onClick={goBack}>
          <ArrowLeftIcon size={20} />
        </IconButton>
      </div>

      <header className="px-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
          <StarIcon size={14} className="text-ink" />
          <span className="font-semibold text-ink">{restaurant.rating.toFixed(1)}</span>
          <span className="italic">({formatCount(restaurant.reviews)})</span>
          <span aria-hidden="true">·</span>
          <span>{restaurant.cuisine}</span>
          <span aria-hidden="true">·</span>
          <span aria-label={`Price level ${restaurant.priceLevel} of 3`}>
            {priceLabel(restaurant.priceLevel)}
          </span>
        </p>
        <dl className="mt-4 flex divide-x divide-line rounded-tile border border-line bg-surface">
          <InfoCell label="Delivery" value={`${restaurant.etaMin} min`} />
          <InfoCell label="Fee" value={free ? "Free" : formatEuro(restaurant.deliveryFee)} accent={free} />
          <InfoCell label="Distance" value={`${restaurant.distanceKm.toFixed(1)} km`} />
        </dl>
      </header>

      <nav
        aria-label="Menu sections"
        className="no-scrollbar sticky top-0 z-10 mt-4 flex gap-2 overflow-x-auto bg-cream px-6 py-3"
      >
        {menu.map((section) => (
          <button
            key={section.title}
            type="button"
            onClick={() => scrollToSection(section.title)}
            className="h-9 shrink-0 rounded-pill border border-line bg-surface px-4 text-sm font-medium transition-colors hover:bg-tile"
          >
            {section.title}
          </button>
        ))}
      </nav>

      <div className="px-6">
        {menu.map((section) => (
          <section
            key={section.title}
            id={`menu-${slug(section.title)}`}
            aria-labelledby={`menu-title-${slug(section.title)}`}
            className="scroll-mt-16 pt-3"
          >
            <h2 id={`menu-title-${slug(section.title)}`} className="text-xl font-bold tracking-tight">
              {section.title}
            </h2>
            <ul className="divide-y divide-line">
              {section.items.map((item) => (
                <Dish
                  key={item.id}
                  item={item}
                  quantity={inThisCart ? (lines[item.id]?.qty ?? 0) : 0}
                  onAdd={() => handleAdd(item)}
                  onRemove={() => remove(item.id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {count > 0 && (
        <div className="sticky bottom-0 bg-gradient-to-t from-cream via-cream to-transparent px-6 pt-6 pb-4">
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="flex h-14 w-full items-center justify-between rounded-pill bg-forest px-6 font-semibold text-cream shadow-soft"
          >
            <span className="flex items-center gap-2.5">
              <BagIcon size={20} />
              View cart
              <span className="font-normal text-cream/80">
                {count} {count === 1 ? "item" : "items"}
              </span>
            </span>
            <span>{formatEuro(subtotal)}</span>
          </button>
        </div>
      )}
      {count === 0 && <div className="h-6" />}

      <Sheet
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Start a new order?"
        container={overlayRoot}
      >
        <p className="text-[15px] leading-6 text-muted">
          Your cart has items from another restaurant. You can only order from one place at a time,
          so adding {pending?.item.name ?? "this dish"} will empty your current cart.
        </p>
        <div className="mt-5 flex gap-3 pb-2">
          <button
            type="button"
            onClick={() => setPending(null)}
            className="h-12 flex-1 rounded-pill border border-line bg-surface font-medium"
          >
            Keep current cart
          </button>
          <button
            type="button"
            onClick={() => {
              if (pending) {
                clear();
                add(pending.restaurant.id, pending.item);
              }
              setPending(null);
            }}
            className="h-12 flex-1 rounded-pill bg-forest font-semibold text-cream"
          >
            Start new cart
          </button>
        </div>
      </Sheet>
    </div>
  );
}
