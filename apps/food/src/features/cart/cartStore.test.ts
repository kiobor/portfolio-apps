import type { MenuItem } from "@/data/types";
import { cartCount, cartSubtotal, useCart } from "./cartStore";

const taco: MenuItem = { id: "t", name: "Taco", description: "", price: 5, tags: [] };
const juice: MenuItem = { id: "j", name: "Juice", description: "", price: 4.5, tags: [] };

describe("cart store", () => {
  it("adds items and counts quantities", () => {
    const { add } = useCart.getState();
    add("a", taco);
    add("a", taco);
    add("a", juice);
    const { lines, restaurantId } = useCart.getState();
    expect(restaurantId).toBe("a");
    expect(lines["t"]?.qty).toBe(2);
    expect(cartCount(lines)).toBe(3);
    expect(cartSubtotal(lines)).toBeCloseTo(14.5);
  });

  it("decrements, then removes a line, then empties the cart", () => {
    const { add, remove } = useCart.getState();
    add("a", taco);
    add("a", taco);
    remove("t");
    expect(useCart.getState().lines["t"]?.qty).toBe(1);
    remove("t");
    expect(useCart.getState().lines).toEqual({});
    expect(useCart.getState().restaurantId).toBeNull();
  });

  it("ignores removing something that is not in the cart", () => {
    useCart.getState().remove("nope");
    expect(useCart.getState().lines).toEqual({});
  });

  it("starts a new cart when adding from a different restaurant", () => {
    const { add } = useCart.getState();
    add("a", taco);
    add("b", juice);
    const { lines, restaurantId } = useCart.getState();
    expect(restaurantId).toBe("b");
    expect(Object.keys(lines)).toEqual(["j"]);
  });

  it("clears everything", () => {
    useCart.getState().add("a", taco);
    useCart.getState().clear();
    expect(cartCount(useCart.getState().lines)).toBe(0);
  });
});
