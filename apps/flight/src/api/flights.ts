import type { Flight, LegQuery } from "@/data/types";
import { generateFlights } from "@/features/results/generate";

/** Latenza simulata: zero nei test, percepibile altrove per mostrare gli stati di caricamento. */
const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchFlights(q: LegQuery): Promise<Flight[]> {
  await wait(LATENCY_MS);
  return generateFlights(q);
}
