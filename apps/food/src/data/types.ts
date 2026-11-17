export type CategoryId = "bowls" | "salads" | "poke" | "brunch" | "smoothies" | "vegan";

export type DishTag = "popular" | "vegan" | "spicy";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** In euro. */
  price: number;
  tags: DishTag[];
};

export type MenuSection = { title: string; items: MenuItem[] };

/** 1 = €, 2 = €€, 3 = €€€ */
export type PriceLevel = 1 | 2 | 3;

export type Restaurant = {
  id: string;
  name: string;
  /** Testo mostrato nella card, es. "Tacos and ceviche". */
  cuisine: string;
  categories: CategoryId[];
  rating: number;
  reviews: number;
  etaMin: number;
  distanceKm: number;
  /** In euro; 0 = consegna gratuita. */
  deliveryFee: number;
  priceLevel: PriceLevel;
  /** Fallback a gradiente se la foto manca. */
  tone: [string, string];
};
