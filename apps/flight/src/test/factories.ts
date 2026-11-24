import type { Flight } from "@/data/types";

let counter = 0;

/** Volo di prova con valori ragionevoli; ogni test sovrascrive solo ciò che gli interessa. */
export function makeFlight(over: Partial<Flight> = {}): Flight {
  counter += 1;
  const departUtc = over.departUtc ?? Date.UTC(2027, 2, 15, 8, 0);
  const durationMin = over.durationMin ?? 180;
  const arriveUtc = over.arriveUtc ?? departUtc + durationMin * 60_000;
  return {
    id: `LHR-ATH-2027-03-15-economy-${counter}`,
    airlineCode: "ALU",
    segments: [{ from: "LHR", to: "ATH", flightNo: "ALU100", departUtc, arriveUtc }],
    stops: 0,
    departUtc,
    arriveUtc,
    durationMin: (arriveUtc - departUtc) / 60_000,
    baseCents: 10000,
    cabin: "economy",
    ...over,
  };
}
