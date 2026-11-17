import { useState } from "react";
import { cx } from "@portfolio/ui";
import type { Restaurant } from "@/data/types";

/** Foto del locale con gradiente di riserva se il file manca o non si carica. */
export function RestaurantPhoto({
  restaurant,
  className,
  eager = false,
  decorative = false,
}: {
  restaurant: Restaurant;
  className: string;
  /** Per la foto in cima alla pagina: niente lazy loading. */
  eager?: boolean;
  /** Nelle card il nome del locale è già lì accanto: la foto non va annunciata due volte. */
  decorative?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [from, to] = restaurant.tone;
  return (
    <div
      className={cx("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {!broken && (
        <img
          src={`/photos/${restaurant.id}.jpg`}
          alt={decorative ? "" : `Dishes from ${restaurant.name}`}
          loading={eager ? "eager" : "lazy"}
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
