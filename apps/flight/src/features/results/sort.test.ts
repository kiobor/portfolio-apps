import { bestFlightId, sortFlights, sortSummary } from "./sort";
import { makeFlight } from "@/test/factories";

// A: direct, average price. B: cheapest but one stop with a 2-hour layover. C: fastest but expensive.
const A = makeFlight({ baseCents: 10000, durationMin: 180, stops: 0 });
const B = makeFlight({ baseCents: 8000, durationMin: 330, stops: 1 });
const C = makeFlight({ baseCents: 14000, durationMin: 150, stops: 0 });
const list = [B, C, A];

describe("bestFlightId", () => {
  it("prefers a direct of average price over a cheaper two-hour-layover flight", () => {
    expect(bestFlightId(list)).toBe(A.id);
  });

  it("is null for an empty list and works with a single flight or identical flights", () => {
    expect(bestFlightId([])).toBeNull();
    expect(bestFlightId([A])).toBe(A.id);
    const twin = makeFlight({ baseCents: 10000, durationMin: 180 });
    expect([A.id, twin.id]).toContain(bestFlightId([A, twin]));
  });
});

describe("sortFlights", () => {
  it("cheapest sorts by price, fastest by duration, best by score, without mutating the input", () => {
    const before = [...list];
    expect(sortFlights(list, "cheapest").map((f) => f.id)).toEqual([B.id, A.id, C.id]);
    expect(sortFlights(list, "fastest").map((f) => f.id)).toEqual([C.id, A.id, B.id]);
    expect(sortFlights(list, "best")[0]!.id).toBe(A.id);
    expect(list).toEqual(before);
  });

  it("breaks ties on price by duration", () => {
    const slow = makeFlight({ baseCents: 5000, durationMin: 400 });
    const quick = makeFlight({ baseCents: 5000, durationMin: 200 });
    expect(sortFlights([slow, quick], "cheapest")[0]!.id).toBe(quick.id);
  });
});

describe("sortSummary", () => {
  it("returns the best, cheapest and fastest flights", () => {
    const s = sortSummary(list);
    expect(s.best?.id).toBe(A.id);
    expect(s.cheapest?.id).toBe(B.id);
    expect(s.fastest?.id).toBe(C.id);
  });

  it("is all null for an empty list", () => {
    expect(sortSummary([])).toEqual({ best: null, cheapest: null, fastest: null });
  });
});
