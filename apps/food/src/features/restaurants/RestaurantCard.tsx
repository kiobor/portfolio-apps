import { Link } from "react-router-dom";
import { Badge, StarIcon, cx } from "@portfolio/ui";
import type { Restaurant } from "@/data/types";
import { formatCount, formatEuro } from "@/lib/format";
import { RestaurantPhoto } from "./RestaurantPhoto";

export type CardVariant = "card" | "row";

const feeText = (r: Restaurant) => (r.deliveryFee === 0 ? "Free" : formatEuro(r.deliveryFee));

/**
 * Il link sta sul nome del locale e si estende a tutta la card con ::after.
 * Così tutta la card è cliccabile, ma per gli screen reader il link si chiama "Salt & Lime"
 * (un link che racchiude un <article> non ha un nome accessibile affidabile).
 * Il focus da tastiera si disegna sul pezzo esteso, non sul solo testo.
 */
function CardLink({ restaurant, radius }: { restaurant: Restaurant; radius: string }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className={cx(
        "outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-forest",
        radius,
      )}
    >
      {restaurant.name}
    </Link>
  );
}

/** Vista card: c'è spazio, quindi tutte le informazioni stanno su due righe. */
function CardDetails({ restaurant }: { restaurant: Restaurant }) {
  const free = restaurant.deliveryFee === 0;
  return (
    <div className="px-0.5 pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="truncate text-xl leading-7 font-bold tracking-tight">
          <CardLink restaurant={restaurant} radius="after:rounded-card" />
        </h3>
        <span className="shrink-0 text-base font-bold">{restaurant.etaMin} min</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-3 text-[13px] text-muted">
        <p className="flex min-w-0 items-center gap-1.5">
          <StarIcon size={14} className="shrink-0 text-ink" />
          <span className="font-semibold text-ink">{restaurant.rating.toFixed(1)}</span>
          <span className="italic">({formatCount(restaurant.reviews)})</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{restaurant.cuisine}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{restaurant.distanceKm.toFixed(1)} km</span>
        </p>
        <span className={cx("shrink-0 font-semibold", free ? "text-forest" : "text-muted")}>
          {feeText(restaurant)}
        </span>
      </div>
    </div>
  );
}

/**
 * Vista lista: poco spazio, quindi una riga per informazione.
 * La cucina ha la sua riga e non viene tagliata; tempo e costo (dati di consegna) stanno
 * insieme a destra; il numero di recensioni, il dato meno utile qui, resta solo nella vista card.
 */
function RowDetails({ restaurant }: { restaurant: Restaurant }) {
  const free = restaurant.deliveryFee === 0;
  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-2 min-[360px]:gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-[15px] leading-6 font-bold tracking-tight min-[360px]:text-base">
          <CardLink restaurant={restaurant} radius="after:rounded-tile" />
        </h3>
        <p className="text-[13px] leading-5 text-muted">{restaurant.cuisine}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-5 text-muted">
          <StarIcon size={13} className="shrink-0 text-ink" />
          <span className="font-semibold text-ink">{restaurant.rating.toFixed(1)}</span>
          <span aria-hidden="true">·</span>
          <span>{restaurant.distanceKm.toFixed(1)} km</span>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-base leading-6 font-bold">{restaurant.etaMin} min</p>
        <p className={cx("text-[13px] leading-5 font-semibold", free ? "text-forest" : "text-muted")}>
          {feeText(restaurant)}
        </p>
      </div>
    </div>
  );
}

export function RestaurantCard({
  restaurant,
  variant,
  bestMatch,
  priority = false,
}: {
  restaurant: Restaurant;
  variant: CardVariant;
  bestMatch: boolean;
  /** Prima card della lista: la foto si carica subito, perché è la prima cosa che si vede. */
  priority?: boolean;
}) {
  if (variant === "row") {
    return (
      <article className="relative flex items-center gap-2.5 rounded-tile border border-line bg-surface p-2 min-[360px]:gap-4 min-[360px]:p-3">
        {/* Sotto i 360px (schermi molto stretti) foto e margini si riducono per non tagliare il testo. */}
        <RestaurantPhoto
          decorative
          restaurant={restaurant}
          sizes="80px"
          eager={priority}
          className="size-14 shrink-0 rounded-xl min-[360px]:size-20"
        />
        <RowDetails restaurant={restaurant} />
      </article>
    );
  }

  return (
    <article className="relative">
      <div className="relative">
        <RestaurantPhoto
          decorative
          eager={priority}
          restaurant={restaurant}
          className="aspect-[1.75] w-full rounded-card"
        />
        {bestMatch && <Badge className="absolute top-3 left-3">Best match</Badge>}
      </div>
      <CardDetails restaurant={restaurant} />
    </article>
  );
}
