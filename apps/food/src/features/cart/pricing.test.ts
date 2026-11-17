import { SERVICE_FEE, orderTotals } from "./pricing";

describe("orderTotals", () => {
  it("adds subtotal, delivery fee and service fee", () => {
    const t = orderTotals(14.5, 1.49);
    expect(t.total).toBe(16.98);
    expect(t.serviceFee).toBe(SERVICE_FEE);
  });

  it("handles free delivery", () => {
    expect(orderTotals(11, 0).total).toBe(11.99);
  });

  it("does not drift on awkward decimals", () => {
    // 0.1 + 0.2 + 0.99 in floating point is 1.2900000000000003
    expect(orderTotals(0.1, 0.2).total).toBe(1.29);
  });
});
