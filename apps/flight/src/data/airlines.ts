import type { Airline } from "./types";

/** Compagnie inventate: nessun marchio reale. */
export const airlines: Airline[] = [
  { code: "ALU", name: "Aerolume" },
  { code: "NRW", name: "Nordwing" },
  { code: "BLF", name: "Bluefern Air" },
  { code: "CRV", name: "Corvo Airways" },
  { code: "SNH", name: "Sunhopper" },
  { code: "VLC", name: "Veloce" },
];

export const airlineByCode = new Map(airlines.map((a) => [a.code, a]));
