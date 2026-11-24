import { parseSearch, serializeSearch, validateSearch, type SearchQuery } from "./params";

const today = new Date(2027, 0, 10, 12, 0); // 2027-01-10, ora locale
const base: SearchQuery = {
  from: "LHR",
  to: "ATH",
  depart: "2027-02-09",
  ret: "2027-02-16",
  adults: 2,
  cabin: "economy",
};

describe("validateSearch", () => {
  it("accepts a valid round trip and a valid one-way, and today as departure", () => {
    expect(validateSearch(base, today)).toEqual({ ok: true });
    expect(validateSearch({ ...base, ret: null }, today)).toEqual({ ok: true });
    expect(validateSearch({ ...base, depart: "2027-01-10", ret: null }, today)).toEqual({ ok: true });
  });

  it("rejects the same origin and destination", () => {
    const r = validateSearch({ ...base, to: "LHR" }, today);
    expect(r).toMatchObject({ ok: false, field: "to" });
  });

  it("rejects a past departure date", () => {
    const r = validateSearch({ ...base, depart: "2027-01-09" }, today);
    expect(r).toMatchObject({ ok: false, field: "depart" });
  });

  it("rejects a return before departure, but allows the same day", () => {
    expect(validateSearch({ ...base, ret: "2027-02-08" }, today)).toMatchObject({ ok: false, field: "ret" });
    expect(validateSearch({ ...base, ret: base.depart }, today)).toEqual({ ok: true });
  });

  it("gives a readable message", () => {
    const r = validateSearch({ ...base, to: "LHR" }, today);
    expect(r.ok === false && r.message.length > 0).toBe(true);
  });
});

describe("parseSearch", () => {
  it("clamps adults=99 to 6, and adults=0 / abc to 1", () => {
    expect(parseSearch(new URLSearchParams("adults=99"), today).adults).toBe(6);
    expect(parseSearch(new URLSearchParams("adults=0"), today).adults).toBe(1);
    expect(parseSearch(new URLSearchParams("adults=abc"), today).adults).toBe(1);
  });

  it("falls back on cabin=foo and on the unknown code ZZZ, without ending with the same airport twice", () => {
    const q = parseSearch(new URLSearchParams("cabin=foo&from=ZZZ&to=ZZZ"), today);
    expect(q.cabin).toBe("economy");
    expect(q.from).not.toBe("ZZZ");
    expect(q.to).not.toBe("ZZZ");
    expect(q.from).not.toBe(q.to);
  });

  it("uses today + 30 days for a missing or bad departure date, and depart + 7 for a bad return", () => {
    expect(parseSearch(new URLSearchParams(""), today).depart).toBe("2027-02-09");
    expect(parseSearch(new URLSearchParams("depart=2027-13-45"), today).depart).toBe("2027-02-09");
    expect(parseSearch(new URLSearchParams("depart=nope"), today).depart).toBe("2027-02-09");
    expect(parseSearch(new URLSearchParams("depart=2027-03-01&ret=oops"), today).ret).toBe("2027-03-08");
  });

  it("is one-way when ret is absent", () => {
    expect(parseSearch(new URLSearchParams("from=LHR&to=ATH&depart=2027-03-01"), today).ret).toBeNull();
  });

  it("serialize/parse round trip, for round trip and one-way", () => {
    expect(parseSearch(serializeSearch(base), today)).toEqual(base);
    const oneWay = { ...base, ret: null };
    expect(parseSearch(serializeSearch(oneWay), today)).toEqual(oneWay);
    expect(serializeSearch(oneWay).has("ret")).toBe(false);
  });
});
