import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { makeFlight } from "@/test/factories";
import { FlightCard } from "./FlightCard";

const MIN = 60_000;

function renderCard(flight: ReturnType<typeof makeFlight>, props: { best?: boolean } = {}) {
  return render(
    <MemoryRouter>
      <FlightCard flight={flight} search="from=LHR&to=ATH&depart=2027-03-15" {...props} />
    </MemoryRouter>,
  );
}

describe("FlightCard", () => {
  it("shows times, +1 for a next-day arrival, a direct label, the price, and links to the detail", () => {
    // 21:00 in London, 5 h later: 02:00 UTC = 04:00 in Athens, the next day.
    const flight = makeFlight({ departUtc: Date.UTC(2027, 2, 15, 21, 0), durationMin: 300, baseCents: 10000 });
    renderCard(flight);
    const card = screen.getByRole("article");
    expect(within(card).getByText("21:00")).toBeInTheDocument();
    expect(within(card).getByText("04:00")).toBeInTheDocument();
    expect(within(card).getByText("+1")).toBeInTheDocument();
    expect(within(card).getByText("Direct")).toBeInTheDocument();
    expect(within(card).getByText("5h")).toBeInTheDocument();
    expect(within(card).getByText("€100")).toBeInTheDocument();
    const link = within(card).getByRole("link");
    expect(link).toHaveAccessibleName(/Aerolume/);
    expect(link).toHaveAttribute("href", `/flight/${flight.id}?from=LHR&to=ATH&depart=2027-03-15`);
  });

  it("shows no +1 for a same-day arrival", () => {
    renderCard(makeFlight({ departUtc: Date.UTC(2027, 2, 15, 8, 0), durationMin: 180 }));
    expect(screen.queryByText("+1")).not.toBeInTheDocument();
  });

  it("shows the number of stops and the layover with its city", () => {
    const depart = Date.UTC(2027, 2, 15, 8, 0);
    const flight = makeFlight({
      stops: 1,
      departUtc: depart,
      arriveUtc: depart + 420 * MIN,
      segments: [
        { from: "LHR", to: "MAD", flightNo: "ALU100", departUtc: depart, arriveUtc: depart + 120 * MIN },
        { from: "MAD", to: "ATH", flightNo: "ALU200", departUtc: depart + 225 * MIN, arriveUtc: depart + 420 * MIN },
      ],
    });
    renderCard(flight);
    const card = screen.getByRole("article");
    expect(within(card).getByText("1 stop")).toBeInTheDocument();
    expect(within(card).getByText(/1h 45m in Madrid/)).toBeInTheDocument();
    expect(within(card).getByText("17:00")).toBeInTheDocument(); // 15:00 UTC in Athens
  });

  it("shows the Best badge only when asked", () => {
    const { unmount } = renderCard(makeFlight(), { best: true });
    expect(screen.getByText("Best")).toBeInTheDocument();
    unmount();
    renderCard(makeFlight());
    expect(screen.queryByText("Best")).not.toBeInTheDocument();
  });
});
