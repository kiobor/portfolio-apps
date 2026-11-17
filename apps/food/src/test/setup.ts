import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { useCart } from "@/features/cart/cartStore";
import { useOrders } from "@/features/orders/orderStore";

// Gli store sono singleton di modulo (e persistono su localStorage): li azzeriamo tra i test.
afterEach(() => {
  useCart.getState().clear();
  useOrders.setState({ orders: [] });
  localStorage.clear();
});
