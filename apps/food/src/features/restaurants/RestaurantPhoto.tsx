import { useState } from "react";
import { cx } from "@portfolio/ui";
import type { Restaurant } from "@/data/types";

/** Larghezze disponibili in public/photos (`<id>-480.jpg`, `<id>-960.jpg`). */
const WIDTHS = [480, 960] as const;

/** Foto del locale con gradiente di riserva se il file manca o non si carica. */
export function RestaurantPhoto({
  restaurant,
  className,
  eager = false,
  decorative = false,
  sizes = "(min-width: 430px) 430px, 100vw",
}: {
  restaurant: Restaurant;
  className: string;
  /** Per la foto che si vede subito (cima pagina, prima card): niente lazy loading, priorità alta. */
  eager?: boolean;
  /** Nelle card il nome del locale è già lì accanto: la foto non va annunciata due volte. */
  decorative?: boolean;
  /** Larghezza con cui la foto si disegna davvero: il browser sceglie il file giusto. */
  sizes?: string;
}) {
  const [broken, setBroken] = useState(false);
  const [from, to] = restaurant.tone;
  const base = `/photos/${restaurant.id}`;
  return (
    <div
      className={cx("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {!broken && (
        <img
          src={`${base}-960.jpg`}
          srcSet={WIDTHS.map((w) => `${base}-${w}.jpg ${w}w`).join(", ")}
          sizes={sizes}
          width={960}
          height={560}
          alt={decorative ? "" : `Dishes from ${restaurant.name}`}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
