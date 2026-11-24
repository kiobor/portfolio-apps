import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { airportByCode } from "@/data/airports";
import { fareTotals } from "@/features/booking/pricing";
import { generateFlights } from "@/features/results/generate";
import { layoverMinutes } from "@/features/results/Timeline";
import { formatCents, formatDuration } from "@/lib/format";
import { FlightPage } from "./FlightPage";

const DATE = "2999-03-15";
const RETURN_DATE = "2999-03-22";
const SEARCH = `from=LHR&to=ATH&depart=${DATE}&adults=2&cabin=economy`;

const outbound = generateFlights({ from: "LHR", to: "ATH", date: DATE, cabin: "economy" });
const direct = outbound.find((f) => f.stops === 0)!;
const oneStop = outbound.find((f) => f.stops === 1)!;
const inbound = generateFlights({ from: "ATH", to: "LHR", date: RETURN_DATE, cabin: "economy" })[0]!;

function Where() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function renderFlight(id: string, query: string) {
  return render(
    <MemoryRouter initialEntries={[`/flight/${id}?${query}`]}>
      <Routes>
        <Route path="/flight/:id" element={<FlightPage />} />
        <Route path="*" element={<p>elsewhere</p>} />
      </Routes>
      <Where />
    </MemoryRouter>,
  );
}

const where = () => new URL(screen.getByTestId("where").textContent!, "http://x");

describe("FlightPage", () => {
  it("shows the itinerary with the layover duration and city", () => {
    renderFlight(oneStop.id, SEARCH);
    const [minutes] = layoverMinutes(oneStop);
    const city = airportByCode.get(oneStop.segments[0]!.to)!.city;
    const layover = screen.getByText(/Layover/);
    expect(layover).toHaveTextContent(formatDuration(minutes!));
    expect(layover).toHaveTextContent(city);
    expect(screen.getAllByText(/→/).length).toBeGreaterThanOrEqual(2); // un tratto per riga
  });

  it("shows a price breakdown (fare, taxes, total for N adults) that follows the chosen fare", async () => {
    renderFlight(direct.id, SEARCH);
    const basic = fareTotals({ baseCents: direct.baseCents, fare: "basic", adults: 2 });
    const breakdown = screen.getByRole("region", { name: "Price breakdown" });
    expect(within(breakdown).getByText(/Fare/)).toHaveTextContent(`2 × ${formatCents(basic.perPersonCents)}`);
    expect(within(breakdown).getByText(/Taxes/)).toHaveTextContent(`2 × ${formatCents(basic.taxesCents)}`);
    expect(within(breakdown).getByText(formatCents(basic.totalCents))).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: /Flex/ }));
    const flex = fareTotals({ baseCents: direct.baseCents, fare: "flex", adults: 2 });
    expect(within(breakdown).getByText(formatCents(flex.totalCents))).toBeInTheDocument();
  });

  it("Standard and Flex show the extra amounts: +€25 and +€60 per person, Basic is included", () => {
    renderFlight(direct.id, SEARCH);
    expect(screen.getByRole("radio", { name: /Basic/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Basic/ })).toHaveAccessibleName(/Included/);
    expect(screen.getByRole("radio", { name: /Standard/ })).toHaveAccessibleName(/\+€25/);
    expect(screen.getByRole("radio", { name: /Flex/ })).toHaveAccessibleName(/\+€60/);
  });

  it("an unknown id shows Flight not found with a link to Search", () => {
    renderFlight("XX-YY-bad", SEARCH);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Flight not found");
    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute("href", "/");
  });

  it("an id generated for another cabin and date renders its own flight, not a crash", () => {
    const business = generateFlights({ from: "FCO", to: "MAD", date: "2998-01-02", cabin: "business" })[0]!;
    renderFlight(business.id, SEARCH);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Rome");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Madrid");
  });

  it("garbage search params fall back to safe defaults without a crash", () => {
    renderFlight(direct.id, "from=ZZZ&adults=99&cabin=foo&depart=nope");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("choosing a fare on a round-trip outbound returns to results in return mode", async () => {
    renderFlight(outbound[0]!.id, `${SEARCH}&ret=${RETURN_DATE}`);
    await userEvent.click(screen.getByRole("radio", { name: /Flex/ }));
    await userEvent.click(screen.getByRole("button", { name: "Choose return flight" }));
    const url = where();
    expect(url.pathname).toBe("/results");
    expect(url.searchParams.get("out")).toBe(outbound[0]!.id);
    expect(url.searchParams.get("outFare")).toBe("flex");
    expect(url.searchParams.get("ret")).toBe(RETURN_DATE);
  });

  it("on a one-way trip the CTA goes straight to passengers with the chosen leg", async () => {
    renderFlight(direct.id, SEARCH);
    await userEvent.click(screen.getByRole("radio", { name: /Standard/ }));
    await userEvent.click(screen.getByRole("button", { name: "Continue to passengers" }));
    const url = where();
    expect(url.pathname).toBe("/passengers");
    expect(url.searchParams.get("out")).toBe(direct.id);
    expect(url.searchParams.get("outFare")).toBe("standard");
    expect(url.searchParams.has("rtn")).toBe(false);
  });

  it("on the return leg it shows the outbound in the total and goes to passengers with both legs", async () => {
    const out = outbound[0]!;
    renderFlight(inbound.id, `${SEARCH}&ret=${RETURN_DATE}&out=${out.id}&outFare=standard`);
    const outTotal = fareTotals({ baseCents: out.baseCents, fare: "standard", adults: 2 }).totalCents;
    const inTotal = fareTotals({ baseCents: inbound.baseCents, fare: "basic", adults: 2 }).totalCents;
    const breakdown = screen.getByRole("region", { name: "Price breakdown" });
    expect(within(breakdown).getByText(formatCents(outTotal + inTotal))).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: /Flex/ }));
    await userEvent.click(screen.getByRole("button", { name: "Continue to passengers" }));
    const url = where();
    expect(url.pathname).toBe("/passengers");
    expect(url.searchParams.get("out")).toBe(out.id);
    expect(url.searchParams.get("outFare")).toBe("standard");
    expect(url.searchParams.get("rtn")).toBe(inbound.id);
    expect(url.searchParams.get("rtnFare")).toBe("flex");
  });
});
