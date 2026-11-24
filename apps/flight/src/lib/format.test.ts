import { formatCents, formatDay, formatDuration } from "./format";

describe("formatCents", () => {
  it("drops the decimals for whole euros and keeps two otherwise", () => {
    expect(formatCents(8000)).toBe("€80");
    expect(formatCents(8050)).toBe("€80.50");
    expect(formatCents(123456)).toBe("€1,234.56");
    expect(formatCents(0)).toBe("€0");
  });
});

describe("formatDuration", () => {
  it("writes hours and minutes", () => {
    expect(formatDuration(215)).toBe("3h 35m");
    expect(formatDuration(180)).toBe("3h");
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(125)).toBe("2h 05m");
  });
});

describe("formatDay", () => {
  it("writes weekday, day and month from a calendar date, whatever the machine's time zone", () => {
    expect(formatDay("2027-03-15")).toBe("Mon 15 Mar");
    expect(formatDay("2027-12-31")).toBe("Fri 31 Dec");
  });
});
