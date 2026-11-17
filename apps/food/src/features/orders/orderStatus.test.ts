import { TOTAL_DEMO_MS, minutesLeft, orderStage } from "./orderStatus";

const T0 = 1_000_000;

describe("orderStage", () => {
  it("starts as confirmed", () => {
    expect(orderStage(T0, T0)).toMatchObject({ index: 0, stage: "confirmed", delivered: false });
  });

  it("moves through the stages at the demo thresholds", () => {
    expect(orderStage(T0, T0 + 5_999).stage).toBe("confirmed");
    expect(orderStage(T0, T0 + 6_000).stage).toBe("preparing");
    expect(orderStage(T0, T0 + 15_999).stage).toBe("preparing");
    expect(orderStage(T0, T0 + 16_000).stage).toBe("on-the-way");
    expect(orderStage(T0, T0 + 29_999).stage).toBe("on-the-way");
    expect(orderStage(T0, T0 + 30_000)).toMatchObject({ stage: "delivered", delivered: true });
  });

  it("stays delivered forever and caps progress at 1", () => {
    const later = orderStage(T0, T0 + TOTAL_DEMO_MS * 100);
    expect(later.stage).toBe("delivered");
    expect(later.progress).toBe(1);
  });

  it("never goes backwards if the clock is behind the order time", () => {
    expect(orderStage(T0, T0 - 5_000)).toMatchObject({ index: 0, progress: 0 });
  });
});

describe("minutesLeft", () => {
  it("shrinks with progress and bottoms out at zero", () => {
    expect(minutesLeft(20, 0)).toBe(20);
    expect(minutesLeft(20, 0.5)).toBe(10);
    expect(minutesLeft(20, 0.99)).toBe(1);
    expect(minutesLeft(20, 1)).toBe(0);
  });
});
