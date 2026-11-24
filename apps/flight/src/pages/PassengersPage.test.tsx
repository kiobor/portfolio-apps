import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { fareTotals, tripTotal } from "@/features/booking/pricing";
import { generateFlights } from "@/features/results/generate";
import { useTripsStore } from "@/features/trips/tripsStore";
import { formatCents } from "@/lib/format";
import { PassengersPage } from "./PassengersPage";

const SEARCH = "from=LHR&to=ATH&depart=2999-03-15&adults=2&cabin=economy";
const out = generateFlights({ from: "LHR", to: "ATH", date: "2999-03-15", cabin: "economy" })[0]!;
const back = generateFlights({ from: "ATH", to: "LHR", date: "2999-03-22", cabin: "economy" })[0]!;

function Where() {
  const { pathname } = useLocation();
  return <p data-testid="where">{pathname}</p>;
}

function renderPage(query: string) {
  return render(
    <MemoryRouter initialEntries={[`/passengers?${query}`]}>
      <Routes>
        <Route path="/passengers" element={<PassengersPage />} />
        <Route path="*" element={<p>elsewhere</p>} />
      </Routes>
      <Where />
    </MemoryRouter>,
  );
}

const ONE_WAY = `${SEARCH}&out=${out.id}&outFare=standard`;
const name = (n: number) => screen.getByLabelText(`Passenger ${n} full name`);
const email = () => screen.getByLabelText("Email for the confirmation");
const confirm = () => screen.getByRole("button", { name: /Confirm booking/ });

async function fill(names: string[], mail = "ada@example.com") {
  for (const [i, n] of names.entries()) {
    fireEvent.change(name(i + 1), { target: { value: n } });
  }
  fireEvent.change(email(), { target: { value: mail } });
}

describe("PassengersPage", () => {
  it("renders one name field per adult and a total rebuilt from the URL legs", () => {
    renderPage(ONE_WAY);
    expect(name(1)).toBeInTheDocument();
    expect(name(2)).toBeInTheDocument();
    expect(screen.queryByLabelText("Passenger 3 full name")).not.toBeInTheDocument();
    const total = fareTotals({ baseCents: out.baseCents, fare: "standard", adults: 2 }).totalCents;
    expect(confirm()).toHaveTextContent(formatCents(total));
  });

  it("says it is a demo and asks for no document or card number", () => {
    renderPage(ONE_WAY);
    expect(screen.getByText(/demo/i)).toBeInTheDocument();
    expect(screen.getByText(/no passport|no document|no id/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/passport|document|card|expiry|cvv/i)).not.toBeInTheDocument();
  });

  it("blocks submit with an empty or whitespace-only name, and shows an error per field", async () => {
    renderPage(ONE_WAY);
    await fill(["Ada Lovelace", "   "]);
    await userEvent.click(confirm());
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
    expect(name(2)).toHaveAttribute("aria-invalid", "true");
    expect(name(1)).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("where")).toHaveTextContent("/passengers");
    expect(useTripsStore.getState().bookings).toHaveLength(0);
  });

  it("blocks submit with an invalid email", async () => {
    renderPage(ONE_WAY);
    await fill(["Ada Lovelace", "Grace Hopper"], "not-an-email");
    await userEvent.click(confirm());
    expect(email()).toHaveAttribute("aria-invalid", "true");
    expect(useTripsStore.getState().bookings).toHaveLength(0);
  });

  it("accepts a 120-character name and a unicode name, and trims the names it stores", async () => {
    renderPage(ONE_WAY);
    const long = "a".repeat(120);
    await fill([`  ${long}  `, "Zoë Łukasiewicz 李小龍"]);
    await userEvent.click(confirm());
    const booking = useTripsStore.getState().bookings[0]!;
    expect(booking.passengers).toEqual([long, "Zoë Łukasiewicz 李小龍"]);
    expect(screen.getByTestId("where")).toHaveTextContent(`/booking/${booking.ref}`);
  });

  it("rejects a name longer than 120 characters", async () => {
    renderPage(ONE_WAY);
    await fill(["a".repeat(121), "Grace Hopper"]);
    await userEvent.click(confirm());
    expect(name(1)).toHaveAttribute("aria-invalid", "true");
    expect(useTripsStore.getState().bookings).toHaveLength(0);
  });

  it("a valid one-way booking is stored with the recomputed total and goes to the confirmation page", async () => {
    renderPage(ONE_WAY);
    await fill(["Ada Lovelace", "Grace Hopper"]);
    await userEvent.click(confirm());
    const booking = useTripsStore.getState().bookings[0]!;
    expect(booking.legs).toEqual([{ flightId: out.id, fare: "standard" }]);
    expect(booking.adults).toBe(2);
    expect(booking.email).toBe("ada@example.com");
    expect(booking.totalCents).toBe(tripTotal([{ baseCents: out.baseCents, fare: "standard" }], 2));
    expect(screen.getByTestId("where")).toHaveTextContent(`/booking/${booking.ref}`);
  });

  it("a round trip stores both legs and the sum of both totals", async () => {
    renderPage(`${ONE_WAY}&ret=2999-03-22&rtn=${back.id}&rtnFare=flex`);
    await fill(["Ada Lovelace", "Grace Hopper"]);
    await userEvent.click(confirm());
    const booking = useTripsStore.getState().bookings[0]!;
    expect(booking.legs).toEqual([
      { flightId: out.id, fare: "standard" },
      { flightId: back.id, fare: "flex" },
    ]);
    expect(booking.totalCents).toBe(
      tripTotal(
        [
          { baseCents: out.baseCents, fare: "standard" },
          { baseCents: back.baseCents, fare: "flex" },
        ],
        2,
      ),
    );
  });

  it("shows a way back to Search when the trip in the URL is missing or bogus, and still survives garbage fares", () => {
    const { unmount } = renderPage(SEARCH);
    expect(screen.getByText(/trip not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute("href", "/");
    unmount();
    renderPage(`${SEARCH}&out=XX-YY-bad&outFare=free`);
    expect(screen.getByText(/trip not found/i)).toBeInTheDocument();
    unmount();
    renderPage(`${SEARCH}&out=${out.id}&outFare=free`);
    expect(confirm()).toHaveTextContent(
      formatCents(fareTotals({ baseCents: out.baseCents, fare: "basic", adults: 2 }).totalCents),
    );
  });
});
