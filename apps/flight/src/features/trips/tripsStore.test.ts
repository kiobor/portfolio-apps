import { makeRef, useTripsStore } from "./tripsStore";

const input = {
  legs: [{ flightId: "LHR-ATH-2999-03-15-economy-0", fare: "basic" as const }],
  adults: 1,
  passengers: ["Ada Lovelace"],
  email: "ada@example.com",
  totalCents: 11200,
};

describe("makeRef", () => {
  it("returns 6 uppercase alphanumerics and differs for different times", () => {
    const a = makeRef(1_700_000_000_000);
    const b = makeRef(1_700_000_000_001);
    expect(a).toMatch(/^[A-Z0-9]{6}$/);
    expect(b).toMatch(/^[A-Z0-9]{6}$/);
    expect(a).not.toBe(b);
  });

  it("is deterministic for the same instant", () => {
    expect(makeRef(1234567890123)).toBe(makeRef(1234567890123));
  });
});

describe("useTripsStore", () => {
  it("addBooking stores a booking, newest first, with a ref and a timestamp; reset empties the store", () => {
    const first = useTripsStore.getState().addBooking(input);
    const second = useTripsStore.getState().addBooking({ ...input, email: "b@example.com" });
    expect(first.ref).toMatch(/^[A-Z0-9]{6}$/);
    expect(first.createdAt).toBeGreaterThan(0);
    expect(useTripsStore.getState().bookings.map((b) => b.ref)).toEqual([second.ref, first.ref]);
    useTripsStore.getState().reset();
    expect(useTripsStore.getState().bookings).toEqual([]);
  });

  it("never gives two bookings the same ref, even in the same millisecond", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const a = useTripsStore.getState().addBooking(input);
    const b = useTripsStore.getState().addBooking(input);
    vi.restoreAllMocks();
    expect(a.ref).not.toBe(b.ref);
  });

  it("works when localStorage throws (in-memory fallback, no crash)", () => {
    const boom = () => {
      throw new Error("storage disabled");
    };
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(boom);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(boom);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(boom);
    expect(() => useTripsStore.getState().addBooking(input)).not.toThrow();
    expect(useTripsStore.getState().bookings).toHaveLength(1);
    expect(() => useTripsStore.getState().reset()).not.toThrow();
    vi.restoreAllMocks();
  });
});
