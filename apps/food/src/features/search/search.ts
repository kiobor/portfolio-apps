import type { MenuItem, MenuSection, Restaurant } from "@/data/types";

export type Catalog = { restaurants: Restaurant[]; menus: Record<string, MenuSection[]> };

export type DishResult = { item: MenuItem; restaurant: Restaurant };
export type SearchResults = { places: Restaurant[]; dishes: DishResult[] };

export const MIN_QUERY_LENGTH = 2;
const MAX_DISHES = 20;

/** Minuscolo e senza accenti: "açaí" si trova anche cercando "acai". */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const matchesAll = (haystack: string, terms: string[]) => terms.every((t) => haystack.includes(t));

/** Ogni parola cercata deve comparire (in qualsiasi ordine) nel nome, nella cucina o nella descrizione. */
export function searchCatalog(catalog: Catalog, query: string): SearchResults {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (normalize(query).trim().length < MIN_QUERY_LENGTH) return { places: [], dishes: [] };

  const places = catalog.restaurants
    .filter((r) => matchesAll(normalize(`${r.name} ${r.cuisine} ${r.categories.join(" ")}`), terms))
    .sort((a, b) => b.rating - a.rating);

  const dishes: DishResult[] = [];
  for (const restaurant of catalog.restaurants) {
    for (const section of catalog.menus[restaurant.id] ?? []) {
      for (const item of section.items) {
        if (matchesAll(normalize(`${item.name} ${item.description} ${item.tags.join(" ")}`), terms)) {
          dishes.push({ item, restaurant });
        }
      }
    }
  }
  dishes.sort((a, b) => b.restaurant.rating - a.restaurant.rating);

  return { places, dishes: dishes.slice(0, MAX_DISHES) };
}
