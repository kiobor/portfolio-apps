import type { Airport } from "./types";

/** Aeroporti reali (fatti pubblici); fusi come offset fissi, senza ora legale. */
export const airports: Airport[] = [
  { code: "LHR", city: "London", name: "Heathrow", tzMin: 0, lat: 51.47, lon: -0.454 },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", tzMin: 60, lat: 49.01, lon: 2.55 },
  { code: "AMS", city: "Amsterdam", name: "Schiphol", tzMin: 60, lat: 52.31, lon: 4.76 },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Airport", tzMin: 60, lat: 50.03, lon: 8.57 },
  { code: "MAD", city: "Madrid", name: "Barajas", tzMin: 60, lat: 40.47, lon: -3.56 },
  { code: "BCN", city: "Barcelona", name: "El Prat", tzMin: 60, lat: 41.3, lon: 2.08 },
  { code: "FCO", city: "Rome", name: "Fiumicino", tzMin: 60, lat: 41.8, lon: 12.25 },
  { code: "CPH", city: "Copenhagen", name: "Kastrup", tzMin: 60, lat: 55.62, lon: 12.65 },
  { code: "LIS", city: "Lisbon", name: "Humberto Delgado", tzMin: 0, lat: 38.78, lon: -9.13 },
  { code: "ATH", city: "Athens", name: "Eleftherios Venizelos", tzMin: 120, lat: 37.94, lon: 23.94 },
];

export const airportByCode = new Map(airports.map((a) => [a.code, a]));
