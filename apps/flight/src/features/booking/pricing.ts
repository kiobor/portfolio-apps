export type FareId = "basic" | "standard" | "flex";

/** Supplemento per persona sulla tariffa base, in centesimi. */
export const fareAddOnCents: Record<FareId, number> = { basic: 0, standard: 2500, flex: 6000 };

export const TAX_RATE = 0.12;

const FARE_IDS: FareId[] = ["basic", "standard", "flex"];

/** Tariffa letta da un parametro dell'URL: qualunque valore sconosciuto diventa "basic". */
export function parseFare(value: string | null): FareId {
  return FARE_IDS.find((id) => id === value) ?? "basic";
}

export function fareTotals(input: { baseCents: number; fare: FareId; adults: number }) {
  const perPersonCents = input.baseCents + fareAddOnCents[input.fare];
  const taxesCents = Math.round(perPersonCents * TAX_RATE);
  return {
    perPersonCents,
    /** Tasse per persona, mostrate come riga a parte. */
    taxesCents,
    totalCents: input.adults * (perPersonCents + taxesCents),
  };
}

export function tripTotal(legs: { baseCents: number; fare: FareId }[], adults: number): number {
  return legs.reduce((sum, leg) => sum + fareTotals({ ...leg, adults }).totalCents, 0);
}
