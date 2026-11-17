import { menus } from "@/data/menus";
import { restaurants } from "@/data/restaurants";
import type { MenuSection, Restaurant } from "@/data/types";

/** Latenza simulata: zero nei test, percepibile altrove per mostrare gli stati di caricamento. */
const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 450;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchRestaurants(): Promise<Restaurant[]> {
  await wait(LATENCY_MS);
  return restaurants;
}

/** Tutto ciò che serve per cercare: locali e menu. */
export async function fetchCatalog() {
  await wait(LATENCY_MS);
  return { restaurants, menus };
}

export type RestaurantDetail = { restaurant: Restaurant; menu: MenuSection[] };

/** `null` se l'id non esiste: la pagina mostra uno stato "non trovato". */
export async function fetchRestaurantDetail(id: string): Promise<RestaurantDetail | null> {
  await wait(LATENCY_MS);
  const restaurant = restaurants.find((r) => r.id === id);
  return restaurant ? { restaurant, menu: menus[id] ?? [] } : null;
}
