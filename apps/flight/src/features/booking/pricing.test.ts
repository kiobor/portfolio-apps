import { fareTotals, parseFare, tripTotal } from "./pricing";

describe("fareTotals", () => {
  it("standard for 2 adults on 10000 base: per person 12500, taxes 1500 per person, total 28000", () => {
    expect(fareTotals({ baseCents: 10000, fare: "standard", adults: 2 })).toEqual({
      perPersonCents: 12500,
      taxesCents: 1500,
      totalCents: 28000,
    });
  });

  it("basic adds nothing and flex adds 6000", () => {
    expect(fareTotals({ baseCents: 10000, fare: "basic", adults: 1 }).perPersonCents).toBe(10000);
    expect(fareTotals({ baseCents: 10000, fare: "flex", adults: 1 }).perPersonCents).toBe(16000);
  });

  it("taxes are 12% of the per-person fare, rounded to whole cents", () => {
    // 9999 * 0.12 = 1199.88 -> 1200
    expect(fareTotals({ baseCents: 9999, fare: "basic", adults: 1 }).taxesCents).toBe(1200);
  });

  it("total always equals adults times (fare + taxes)", () => {
    for (const adults of [1, 3, 6]) {
      const t = fareTotals({ baseCents: 7300, fare: "flex", adults });
      expect(t.totalCents).toBe(adults * (t.perPersonCents + t.taxesCents));
    }
  });
});

describe("tripTotal", () => {
  it("sums the legs", () => {
    const legs = [
      { baseCents: 10000, fare: "standard" as const },
      { baseCents: 8000, fare: "basic" as const },
    ];
    const expected =
      fareTotals({ ...legs[0]!, adults: 2 }).totalCents + fareTotals({ ...legs[1]!, adults: 2 }).totalCents;
    expect(tripTotal(legs, 2)).toBe(expected);
  });

  it("is 0 for no legs", () => {
    expect(tripTotal([], 2)).toBe(0);
  });
});

describe("parseFare", () => {
  it("accepts the three fares and falls back to basic for anything else", () => {
    expect(parseFare("standard")).toBe("standard");
    expect(parseFare("flex")).toBe("flex");
    expect(parseFare("basic")).toBe("basic");
    expect(parseFare("free")).toBe("basic");
    expect(parseFare(null)).toBe("basic");
    expect(parseFare("")).toBe("basic");
  });
});
