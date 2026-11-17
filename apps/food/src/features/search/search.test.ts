import { menus } from "@/data/menus";
import { restaurants } from "@/data/restaurants";
import { searchCatalog } from "./search";

const catalog = { restaurants, menus };

describe("searchCatalog", () => {
  it("returns nothing for an empty or too short query", () => {
    expect(searchCatalog(catalog, "")).toEqual({ places: [], dishes: [] });
    expect(searchCatalog(catalog, " a ")).toEqual({ places: [], dishes: [] });
  });

  it("finds places by name, case-insensitively", () => {
    const { places } = searchCatalog(catalog, "SALT");
    expect(places.map((p) => p.id)).toEqual(["salt-and-lime"]);
  });

  it("finds places by cuisine", () => {
    const { places } = searchCatalog(catalog, "brunch");
    expect(places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["sunny-side", "morning-ritual", "sweet-crumb"]),
    );
  });

  it("finds dishes and links them to their restaurant", () => {
    const { dishes } = searchCatalog(catalog, "shakshuka");
    expect(dishes).toHaveLength(1);
    expect(dishes[0]?.item.name).toBe("Shakshuka");
    expect(dishes[0]?.restaurant.id).toBe("sunny-side");
  });

  it("matches all words in any order", () => {
    const { dishes } = searchCatalog(catalog, "avocado eggs");
    expect(dishes.map((d) => d.item.id)).toContain("ss-1");
  });

  it("ignores accents on both sides", () => {
    expect(searchCatalog(catalog, "acai").dishes.map((d) => d.item.id)).toContain("bg-1");
    expect(searchCatalog(catalog, "açaí").dishes.map((d) => d.item.id)).toContain("bg-1");
  });

  it("finds dishes by dietary tag", () => {
    const { dishes } = searchCatalog(catalog, "vegan");
    expect(dishes.length).toBeGreaterThan(0);
    expect(dishes.every((d) => d.item.tags.includes("vegan") || /vegan/i.test(d.item.name + d.item.description))).toBe(true);
  });

  it("returns nothing when no word combination matches", () => {
    expect(searchCatalog(catalog, "pizza")).toEqual({ places: [], dishes: [] });
  });

  it("caps the number of dishes and sorts places by rating", () => {
    const { dishes, places } = searchCatalog(catalog, "an");
    expect(dishes.length).toBeLessThanOrEqual(20);
    const ratings = places.map((p) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });
});
