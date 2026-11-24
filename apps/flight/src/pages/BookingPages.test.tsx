import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { formatCents } from "@/lib/format";
import { useTripsStore } from "@/features/trips/tripsStore";
import { makeBooking, sampleFlight } from "@/test/bookings";
import { AccountPage } from "./AccountPage";
import { ConfirmationPage } from "./ConfirmationPage";
import { TripsPage } from "./TripsPage";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/booking/:ref" element={<ConfirmationPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/" element={<p>Search page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ConfirmationPage", () => {
  it("shows the booking reference, the itinerary, the passengers and the total", () => {
    const booking = makeBooking({ passengers: ["Ada Lovelace", "Grace Hopper"], adults: 2, totalCents: 25600 });
    useTripsStore.setState({ bookings: [booking] });
    renderAt(`/booking/${booking.ref}`);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/confirmed/i);
    expect(screen.getByText(booking.ref)).toBeInTheDocument();
    expect(screen.getByText(/London/)).toBeInTheDocument();
    expect(screen.getByText(/Athens/)).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText(formatCents(25600))).toBeInTheDocument();
  });

  it("finds the booking whatever the case of the ref in the URL", () => {
    useTripsStore.setState({ bookings: [makeBooking({ ref: "ABC234" })] });
    renderAt("/booking/abc234");
    expect(screen.getByText("ABC234")).toBeInTheDocument();
  });

  it('shows "Booking not found" with a way out for an unknown ref', () => {
    renderAt("/booking/NOPE00");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Booking not found");
    expect(screen.getByRole("link", { name: /trips|search/i })).toBeInTheDocument();
  });

  it("does not crash when a stored leg points to a flight that can no longer be built", () => {
    useTripsStore.setState({ bookings: [makeBooking({ legs: [{ flightId: "XX-YY-bad", fare: "basic" }] })] });
    renderAt("/booking/ABC234");
    expect(screen.getByText("ABC234")).toBeInTheDocument();
  });
});

describe("TripsPage", () => {
  it("lists bookings newest first", () => {
    useTripsStore.setState({
      bookings: [
        makeBooking({ ref: "OLD111", createdAt: 1_000 }),
        makeBooking({ ref: "NEW222", createdAt: 3_000 }),
        makeBooking({ ref: "MID333", createdAt: 2_000 }),
      ],
    });
    renderAt("/trips");
    const items = screen.getAllByRole("link").map((l) => l.textContent ?? "");
    const order = ["NEW222", "MID333", "OLD111"].map((ref) => items.findIndex((t) => t.includes(ref)));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.every((i) => i >= 0)).toBe(true);
  });

  it("each trip links to its confirmation and shows the route and total", () => {
    const booking = makeBooking({ totalCents: 12345 });
    useTripsStore.setState({ bookings: [booking] });
    renderAt("/trips");
    const link = screen.getByRole("link", { name: new RegExp(booking.ref) });
    expect(link).toHaveAttribute("href", `/booking/${booking.ref}`);
    expect(within(link).getByText(/London/)).toBeInTheDocument();
    expect(within(link).getByText(formatCents(12345))).toBeInTheDocument();
    expect(sampleFlight.id).toContain("LHR");
  });

  it("shows an empty state with a way to search", () => {
    renderAt("/trips");
    expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /search flights/i })).toHaveAttribute("href", "/");
  });
});

describe("AccountPage", () => {
  it('"Reset demo data" clears Trips', async () => {
    useTripsStore.setState({ bookings: [makeBooking()] });
    renderAt("/account");
    expect(screen.getByRole("status")).toHaveTextContent("1 trip");
    await userEvent.click(screen.getByRole("button", { name: "Reset demo data" }));
    expect(useTripsStore.getState().bookings).toEqual([]);
    expect(screen.getByRole("status")).toHaveTextContent(/cleared/i);
  });

  it("says this is a demo", () => {
    renderAt("/account");
    expect(screen.getByText(/portfolio project/i)).toBeInTheDocument();
  });
});
