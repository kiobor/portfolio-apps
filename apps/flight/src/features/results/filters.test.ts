import { generateFlights } from "./generate";
import {
  applyFilters,
  bandOf,
  countActive,
  durationHistogram,
  mergeFilterParams,
  countWith,
  initialFilters,
  parseFilters,
  priceHistogram,
  serializeFilters,
  type FlightFilters,
} from "./filters";
import { makeFlight } from "@/test/factories";

const flights = generateFlights({ from: "LHR", to: "ATH", date: "2027-03-15", cabin: "economy" });

describe("applyFilters", () => {
  it("returns everything with the initial filters", () => {
    expect(applyFilters(flights, initialFilters)).toHaveLength(flights.length);
  });

  it("direct keeps only non-stop flights, max1 keeps up to one stop", () => {
    const direct = applyFilters(flights, { ...initialFilters, stops: "direct" });
    expect(direct.length).toBeGreaterThan(0);
    expect(direct.every((f) => f.stops === 0)).toBe(true);
    expect(applyFilters(flights, { ...initialFilters, stops: "max1" })).toHaveLength(flights.length);
  });

  it("filters by airline and by departure band", () => {
    const code = flights[0]!.airlineCode;
    const byAirline = applyFilters(flights, { ...initialFilters, airlines: [code] });
    expect(byAirline.every((f) => f.airlineCode === code)).toBe(true);
    const morning = applyFilters(flights, { ...initialFilters, bands: ["morning"] });
    expect(morning.every((f) => bandOf(f.departUtc, "LHR") === "morning")).toBe(true);
  });

  it("maxPriceCents below the cheapest returns []", () => {
    const cheapest = Math.min(...flights.map((f) => f.baseCents));
    expect(applyFilters(flights, { ...initialFilters, maxPriceCents: cheapest - 1 })).toEqual([]);
  });

  it("maxDurationMin keeps flights up to and including that duration", () => {
    const shortest = Math.min(...flights.map((f) => f.durationMin));
    const out = applyFilters(flights, { ...initialFilters, maxDurationMin: shortest });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((f) => f.durationMin <= shortest)).toBe(true);
  });
});

describe("countWith", () => {
  it("never exceeds the list length and equals applyFilters(...).length", () => {
    const patches: Partial<FlightFilters>[] = [
      {},
      { stops: "direct" },
      { bands: ["morning", "evening"] },
      { airlines: [flights[0]!.airlineCode] },
      { maxPriceCents: 20000 },
    ];
    for (const patch of patches) {
      const n = countWith(flights, initialFilters, patch);
      expect(n).toBeLessThanOrEqual(flights.length);
      expect(n).toBe(applyFilters(flights, { ...initialFilters, ...patch }).length);
    }
  });

  it("for an option that matches nothing is 0", () => {
    expect(countWith(flights, initialFilters, { maxPriceCents: 1 })).toBe(0);
  });

  it("counts on top of the current filters, not from scratch", () => {
    const current: FlightFilters = { ...initialFilters, stops: "direct" };
    expect(countWith(flights, current, { bands: ["night"] })).toBe(
      applyFilters(flights, { ...current, bands: ["night"] }).length,
    );
  });
});

describe("countActive", () => {
  it("is 0 for the initial filters and counts each changed group once", () => {
    expect(countActive(initialFilters)).toBe(0);
    expect(countActive({ ...initialFilters, stops: "direct", bands: ["morning", "night"] })).toBe(2);
    expect(countActive({ ...initialFilters, maxPriceCents: 5000, maxDurationMin: 300, airlines: ["ALU"] })).toBe(3);
  });
});

describe("priceHistogram", () => {
  it("buckets sum to the number of flights", () => {
    const h = priceHistogram(flights, 8);
    expect(h).toHaveLength(8);
    expect(h.reduce((s, n) => s + n, 0)).toBe(flights.length);
  });

  it("handles an empty list and identical prices", () => {
    expect(priceHistogram([], 5)).toEqual([0, 0, 0, 0, 0]);
    const same = [makeFlight(), makeFlight(), makeFlight()];
    expect(priceHistogram(same, 4).reduce((s, n) => s + n, 0)).toBe(3);
  });
});

describe("bandOf", () => {
  it("uses the local time at the departure airport", () => {
    // 10:30 UTC is 12:30 in Athens (UTC+2): afternoon there, morning in London.
    const t = Date.UTC(2027, 2, 15, 10, 30);
    expect(bandOf(t, "ATH")).toBe("afternoon");
    expect(bandOf(t, "LHR")).toBe("morning");
  });

  it("has the documented boundaries", () => {
    const at = (h: number, m: number) => bandOf(Date.UTC(2027, 2, 15, h, m), "LHR");
    expect(at(4, 59)).toBe("night");
    expect(at(5, 0)).toBe("morning");
    expect(at(11, 59)).toBe("morning");
    expect(at(12, 0)).toBe("afternoon");
    expect(at(17, 59)).toBe("afternoon");
    expect(at(18, 0)).toBe("evening");
    expect(at(21, 59)).toBe("evening");
    expect(at(22, 0)).toBe("night");
  });
});

describe("filter URL params", () => {
  it("parseFilters returns initialFilters for garbage like max=abc&stops=wat", () => {
    expect(parseFilters(new URLSearchParams("max=abc&stops=wat"))).toEqual(initialFilters);
  });

  it("drops unknown bands and airlines and non-positive numbers", () => {
    const f = parseFilters(new URLSearchParams("bands=morning,lunch&airlines=ALU,XXX&max=-5&dur=0"));
    expect(f.bands).toEqual(["morning"]);
    expect(f.airlines).toEqual(["ALU"]);
    expect(f.maxPriceCents).toBeNull();
    expect(f.maxDurationMin).toBeNull();
  });

  it("serialize/parse round trip, and the initial filters serialize to nothing", () => {
    const f: FlightFilters = {
      stops: "max1",
      bands: ["morning", "evening"],
      airlines: ["ALU", "VLC"],
      maxPriceCents: 25000,
      maxDurationMin: 360,
    };
    expect(parseFilters(serializeFilters(f))).toEqual(f);
    expect(serializeFilters(initialFilters).toString()).toBe("");
  });
});

describe("durationHistogram", () => {
  it("buckets sum to the number of flights, and an empty list gives zeros", () => {
    const h = durationHistogram(flights, 6);
    expect(h).toHaveLength(6);
    expect(h.reduce((s, n) => s + n, 0)).toBe(flights.length);
    expect(durationHistogram([], 3)).toEqual([0, 0, 0]);
  });
});

describe("mergeFilterParams", () => {
  it("keeps unrelated params, replaces filter params and drops the ones that were cleared", () => {
    const current = new URLSearchParams("from=LHR&to=ATH&sort=fastest&stops=direct&max=5000&out=abc");
    const next = mergeFilterParams(current, { ...initialFilters, bands: ["morning"], maxPriceCents: 9000 });
    expect(Object.fromEntries(next)).toEqual({
      from: "LHR",
      to: "ATH",
      sort: "fastest",
      out: "abc",
      bands: "morning",
      max: "9000",
    });
    expect(next.has("stops")).toBe(false);
    expect(current.get("stops")).toBe("direct"); // l'originale non cambia
  });
});
