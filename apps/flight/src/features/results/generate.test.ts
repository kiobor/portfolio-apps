import { airlines } from "@/data/airlines";
import { airports } from "@/data/airports";
import { generateFlights, getFlightById, localTime } from "./generate";
import type { LegQuery } from "@/data/types";

const q: LegQuery = { from: "LHR", to: "ATH", date: "2027-03-15", cabin: "economy" };

describe("generateFlights", () => {
  it("is deterministic for the same query", () => {
    expect(generateFlights(q)).toEqual(generateFlights({ ...q }));
  });

  it("returns between 20 and 30 flights, direct and one-stop", () => {
    const flights = generateFlights(q);
    expect(flights.length).toBeGreaterThanOrEqual(20);
    expect(flights.length).toBeLessThanOrEqual(30);
    expect(flights.some((f) => f.stops === 0)).toBe(true);
    expect(flights.some((f) => f.stops === 1)).toBe(true);
    for (const f of flights) {
      expect(f.segments).toHaveLength(f.stops + 1);
      expect(f.segments[0]?.from).toBe("LHR");
      expect(f.segments.at(-1)?.to).toBe("ATH");
    }
  });

  it("durationMin equals arriveUtc minus departUtc in minutes and is positive", () => {
    for (const f of generateFlights(q)) {
      expect(f.durationMin).toBeGreaterThan(0);
      expect(f.durationMin).toBe((f.arriveUtc - f.departUtc) / 60000);
    }
  });

  it("business baseCents is about 2.4x economy for the same flight index", () => {
    const eco = generateFlights(q);
    const biz = generateFlights({ ...q, cabin: "business" });
    expect(biz).toHaveLength(eco.length);
    eco.forEach((e, i) => {
      const ratio = biz[i]!.baseCents / e.baseCents;
      expect(ratio).toBeGreaterThan(2.35);
      expect(ratio).toBeLessThan(2.45);
      expect(biz[i]!.departUtc).toBe(e.departUtc);
    });
  });

  it("price distribution is long-tailed (median below mean)", () => {
    const prices = airports
      .filter((a) => a.code !== "LHR")
      .flatMap((a) => generateFlights({ ...q, to: a.code }).map((f) => f.baseCents))
      .sort((a, b) => a - b);
    const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
    const median = prices[Math.floor(prices.length / 2)]!;
    expect(median).toBeLessThan(mean);
  });

  it("uses only invented airlines", () => {
    const codes = new Set(airlines.map((a) => a.code));
    for (const f of generateFlights(q)) expect(codes.has(f.airlineCode)).toBe(true);
  });
});

describe("getFlightById", () => {
  it("round-trips every generated id and returns null for malformed ids", () => {
    for (const cabin of ["economy", "business"] as const) {
      for (const f of generateFlights({ ...q, cabin })) {
        expect(getFlightById(f.id)).toEqual(f);
      }
    }
    expect(getFlightById("XX-YY-bad")).toBeNull();
    expect(getFlightById("LHR-ATH-2027-02-31-economy-0")).toBeNull();
    expect(getFlightById("LHR-ZZZ-2027-03-15-economy-0")).toBeNull();
    expect(getFlightById("LHR-ATH-2027-03-15-economy-999")).toBeNull();
    expect(getFlightById("LHR-LHR-2027-03-15-economy-0")).toBeNull();
    expect(getFlightById("")).toBeNull();
  });
});

describe("localTime", () => {
  it("reports dayOffset 1 for an overnight arrival", () => {
    const night = generateFlights({ from: "LHR", to: "ATH", date: "2027-03-15", cabin: "economy" }).find(
      (f) => localTime(f.arriveUtc, "ATH", { utcMs: f.departUtc, airportCode: "LHR" }).dayOffset === 1,
    );
    expect(night).toBeDefined();
  });

  it("converts with the fixed airport offset (Athens is UTC+2) and pads the time", () => {
    const utc = Date.UTC(2027, 2, 15, 7, 5);
    expect(localTime(utc, "ATH").hhmm).toBe("09:05");
    expect(localTime(utc, "LHR").hhmm).toBe("07:05");
    expect(localTime(utc, "LHR").dayOffset).toBe(0);
  });

  it("counts the local date difference against the reference", () => {
    const depart = Date.UTC(2027, 2, 15, 22, 30); // 22:30 in London
    const arrive = depart + 4 * 3600_000; // 02:30 at +60 next day... Paris is UTC+1 → 03:30
    expect(localTime(arrive, "CDG", { utcMs: depart, airportCode: "LHR" })).toEqual({ hhmm: "03:30", dayOffset: 1 });
  });
});
