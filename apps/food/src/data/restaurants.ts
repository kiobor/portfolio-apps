import type { Restaurant } from "./types";

/** Ristoranti inventati: nessun marchio reale. */
export const restaurants: Restaurant[] = [
  { id: "salt-and-lime", name: "Salt & Lime", cuisine: "Tacos and ceviche", categories: ["poke"], rating: 4.8, reviews: 3201, etaMin: 20, distanceKm: 0.8, deliveryFee: 0, priceLevel: 2, tone: ["#c9785a", "#e8b48a"] },
  { id: "sweet-crumb", name: "Sweet Crumb", cuisine: "Bakery and desserts", categories: ["brunch"], rating: 4.7, reviews: 1840, etaMin: 25, distanceKm: 1.2, deliveryFee: 0, priceLevel: 2, tone: ["#d9a7a0", "#f1d3c8"] },
  { id: "green-table", name: "Green Table", cuisine: "Salads and bowls", categories: ["salads", "bowls", "vegan"], rating: 4.6, reviews: 980, etaMin: 18, distanceKm: 0.6, deliveryFee: 1.49, priceLevel: 2, tone: ["#6f9a6c", "#c5d9b7"] },
  { id: "poke-harbour", name: "Poke Harbour", cuisine: "Poke bowls", categories: ["poke", "bowls"], rating: 4.7, reviews: 2210, etaMin: 22, distanceKm: 1.5, deliveryFee: 0, priceLevel: 2, tone: ["#3b7f80", "#a9d0c8"] },
  { id: "sunny-side", name: "Sunny Side", cuisine: "All-day brunch", categories: ["brunch"], rating: 4.5, reviews: 1320, etaMin: 28, distanceKm: 2.1, deliveryFee: 1.99, priceLevel: 2, tone: ["#e0b04a", "#f5dd9b"] },
  { id: "press-and-pour", name: "Press & Pour", cuisine: "Smoothies and juices", categories: ["smoothies", "vegan"], rating: 4.4, reviews: 760, etaMin: 12, distanceKm: 0.4, deliveryFee: 0.99, priceLevel: 1, tone: ["#8a4f93", "#d9b3d9"] },
  { id: "root-and-sprout", name: "Root & Sprout", cuisine: "Plant-based kitchen", categories: ["vegan", "bowls"], rating: 4.8, reviews: 1505, etaMin: 32, distanceKm: 2.8, deliveryFee: 0, priceLevel: 3, tone: ["#5b8a5a", "#b9d3a4"] },
  { id: "bowl-theory", name: "Bowl Theory", cuisine: "Grain bowls", categories: ["bowls"], rating: 4.3, reviews: 640, etaMin: 24, distanceKm: 1.1, deliveryFee: 1.49, priceLevel: 2, tone: ["#a07a52", "#dcc0a0"] },
  { id: "leaf-society", name: "Leaf Society", cuisine: "Salad bar", categories: ["salads"], rating: 4.2, reviews: 410, etaMin: 35, distanceKm: 3.2, deliveryFee: 0, priceLevel: 1, tone: ["#7ba463", "#cfe0b0"] },
  { id: "morning-ritual", name: "Morning Ritual", cuisine: "Brunch cafe", categories: ["brunch", "smoothies"], rating: 4.6, reviews: 2090, etaMin: 27, distanceKm: 1.7, deliveryFee: 1.99, priceLevel: 2, tone: ["#c28a5c", "#ecd2b0"] },
  { id: "tokyo-tide", name: "Tokyo Tide", cuisine: "Poke and sushi", categories: ["poke"], rating: 4.5, reviews: 1750, etaMin: 29, distanceKm: 2.4, deliveryFee: 2.49, priceLevel: 3, tone: ["#2f6b73", "#9cc7c4"] },
  { id: "berry-good", name: "Berry Good", cuisine: "Smoothie bowls", categories: ["smoothies", "bowls"], rating: 4.4, reviews: 530, etaMin: 16, distanceKm: 0.9, deliveryFee: 0, priceLevel: 1, tone: ["#9a4a7a", "#e2b3cc"] },
];
