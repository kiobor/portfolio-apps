import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "@portfolio/ui";
import type { FareId } from "@/features/booking/pricing";

export type Booking = {
  /** Codice di 6 caratteri, solo per la demo. */
  ref: string;
  createdAt: number;
  legs: { flightId: string; fare: FareId }[];
  adults: number;
  passengers: string[];
  email: string;
  totalCents: number;
};

type TripsState = {
  /** Dalla più recente alla più vecchia. */
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "ref" | "createdAt">) => Booking;
  reset: () => void;
};

// Senza 0/O e 1/I: il codice si legge e si detta senza equivoci.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Sei caratteri derivati dall'istante dell'ordine: stesso istante, stesso codice (mulberry32). */
export function makeRef(nowMs: number): string {
  let a = ((nowMs >>> 0) ^ Math.imul(Math.floor(nowMs / 2 ** 32), 0x9e3779b1)) >>> 0;
  let ref = "";
  for (let i = 0; i < 6; i++) {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    ref += ALPHABET[((t ^ (t >>> 14)) >>> 0) % ALPHABET.length];
  }
  return ref;
}

export const useTripsStore = create<TripsState>()(
  persist(
    (set, get) => ({
      bookings: [],
      addBooking: (input) => {
        const createdAt = Date.now();
        const taken = new Set(get().bookings.map((b) => b.ref));
        // Due prenotazioni nello stesso millisecondo non devono avere lo stesso codice.
        let bump = 0;
        while (taken.has(makeRef(createdAt + bump))) bump += 1;
        const booking: Booking = { ...input, ref: makeRef(createdAt + bump), createdAt };
        set((state) => ({ bookings: [booking, ...state.bookings] }));
        return booking;
      },
      reset: () => set({ bookings: [] }),
    }),
    {
      name: "skylark-trips",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ bookings: state.bookings }),
    },
  ),
);
