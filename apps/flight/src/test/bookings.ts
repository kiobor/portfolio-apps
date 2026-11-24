import { fareTotals } from "@/features/booking/pricing";
import { generateFlights } from "@/features/results/generate";
import type { Booking } from "@/features/trips/tripsStore";

export const sampleFlight = generateFlights({ from: "LHR", to: "ATH", date: "2999-03-15", cabin: "economy" })[0]!;

/** Prenotazione di prova; sovrascrivi solo ciò che serve. */
export function makeBooking(over: Partial<Booking> = {}): Booking {
  return {
    ref: "ABC234",
    createdAt: 1_700_000_000_000,
    legs: [{ flightId: sampleFlight.id, fare: "basic" }],
    adults: 1,
    passengers: ["Ada Lovelace"],
    email: "ada@example.com",
    totalCents: fareTotals({ baseCents: sampleFlight.baseCents, fare: "basic", adults: 1 }).totalCents,
    ...over,
  };
}
