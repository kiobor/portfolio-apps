import { restaurants } from "@/data/restaurants";
import {
  applyFilters,
  bestMatchId,
  countActive,
  countWith,
  etaHistogram,
  hasActiveFilters,
  initialFilters,
} from "./filters";

describe("applyFilters", () => {
  it("returns every restaurant with default filters", () => {
    expect(applyFilters(restaurants, initialFilters)).toHaveLength(restaurants.length);
  });

  it("keeps only places faster than the max delivery time", () => {
    const result = applyFilters(restaurants, { ...initialFilters, maxEta: 30 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.etaMin < 30)).toBe(true);
  });

  it("keeps only free delivery when maxFee is 0", () => {
    const result = applyFilters(restaurants, { ...initialFilters, maxFee: 0 });
    expect(result.every((r) => r.deliveryFee === 0)).toBe(true);
  });

  it("allows a fee up to the given amount", () => {
    const result = applyFilters(restaurants, { ...initialFilters, maxFee: 1.5 });
    expect(result.every((r) => r.deliveryFee <= 1.5)).toBe(true);
    expect(result.length).toBeGreaterThan(
      applyFilters(restaurants, { ...initialFilters, maxFee: 0 }).length,
    );
  });

  it("treats a minimum rating as 'N and above'", () => {
    const result = applyFilters(restaurants, { ...initialFilters, minRating: 4.5 });
    expect(result.every((r) => r.rating >= 4.5)).toBe(true);
    expect(result.some((r) => r.rating === 4.8)).toBe(true);
  });

  it("matches any of the selected price levels", () => {
    const result = applyFilters(restaurants, { ...initialFilters, prices: [1, 3] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.priceLevel === 1 || r.priceLevel === 3)).toBe(true);
  });

  it("combines category and other filters", () => {
    const result = applyFilters(restaurants, { ...initialFilters, category: "poke", maxFee: 0 });
    expect(result.map((r) => r.id).sort()).toEqual(["poke-harbour", "salt-and-lime"]);
  });

  it("sorts by fastest delivery", () => {
    const result = applyFilters(restaurants, { ...initialFilters, sort: "fastest" });
    const etas = result.map((r) => r.etaMin);
    expect(etas).toEqual([...etas].sort((a, b) => a - b));
  });

  it("does not mutate the input list", () => {
    const copy = [...restaurants];
    applyFilters(restaurants, { ...initialFilters, sort: "nearest" });
    expect(restaurants).toEqual(copy);
  });
});

describe("countWith", () => {
  it("counts results as if the patch were applied, without changing the filters", () => {
    const base = { ...initialFilters, maxEta: 30 as number | null };
    const withFree = countWith(restaurants, base, { maxFee: 0 });
    expect(withFree).toBe(applyFilters(restaurants, { ...base, maxFee: 0 }).length);
    expect(base.maxEta).toBe(30);
  });

  it("keeps the other active filters in the count", () => {
    const base = { ...initialFilters, minRating: 4.7 as number | null };
    expect(countWith(restaurants, base, { prices: [1] })).toBe(0);
  });

  it("an option's count never exceeds the current total for 'narrowing' options", () => {
    const total = applyFilters(restaurants, initialFilters).length;
    for (const patch of [{ maxFee: 0 }, { minRating: 4.5 }, { maxEta: 20 }, { prices: [3 as const] }]) {
      expect(countWith(restaurants, initialFilters, patch)).toBeLessThanOrEqual(total);
    }
  });
});

describe("countActive / hasActiveFilters", () => {
  it("counts each panel filter once", () => {
    expect(countActive(initialFilters)).toBe(0);
    expect(countActive({ ...initialFilters, maxEta: 30, maxFee: 0, prices: [1, 2] })).toBe(3);
  });

  it("includes the category in hasActiveFilters but not in countActive", () => {
    const f = { ...initialFilters, category: "vegan" as const };
    expect(countActive(f)).toBe(0);
    expect(hasActiveFilters(f)).toBe(true);
    expect(hasActiveFilters(initialFilters)).toBe(false);
  });
});

describe("etaHistogram", () => {
  it("places every restaurant in exactly one bucket (all ETAs are under the slider max)", () => {
    const buckets = etaHistogram(restaurants);
    expect(buckets).toHaveLength(7);
    expect(buckets.reduce((a, b) => a + b, 0)).toBe(restaurants.length);
  });
});

describe("bestMatchId", () => {
  it("is the first result of the default 'best' sort", () => {
    const sorted = applyFilters(restaurants, initialFilters);
    expect(bestMatchId(restaurants)).toBe(sorted[0]?.id);
  });

  it("returns null for an empty list", () => {
    expect(bestMatchId([])).toBeNull();
  });
});
