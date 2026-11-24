import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeFlight } from "@/test/factories";
import { FilterSheet } from "./FilterSheet";
import { initialFilters, type FlightFilters } from "./filters";

const at = (h: number) => Date.UTC(2027, 2, 15, h, 0); // ore a Londra (UTC+0)
const flights = [
  makeFlight({ airlineCode: "ALU", departUtc: at(8), baseCents: 10000, durationMin: 180 }), // diretto, mattina
  makeFlight({ airlineCode: "NRW", departUtc: at(19), baseCents: 12000, durationMin: 200 }), // diretto, sera
  makeFlight({ airlineCode: "ALU", departUtc: at(9), baseCents: 7000, durationMin: 330, stops: 1 }), // 1 scalo, mattina
];

function Harness({
  onApply,
  filters = initialFilters,
}: {
  onApply: (f: FlightFilters) => void;
  filters?: FlightFilters;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open filters
      </button>
      <FilterSheet open={open} onClose={() => setOpen(false)} filters={filters} flights={flights} onApply={onApply} />
    </>
  );
}

describe("FilterSheet", () => {
  it("shows the result count on every option", () => {
    render(<Harness onApply={() => {}} />);
    const expected: Record<string, number> = {
      Any: 3,
      Direct: 2,
      "Up to 1 stop": 3,
      Morning: 2,
      Afternoon: 0,
      Evening: 1,
      Night: 0,
      Aerolume: 2,
      Nordwing: 1,
    };
    for (const [label, count] of Object.entries(expected)) {
      expect(screen.getByRole("button", { name: `${label} ${count}` })).toBeInTheDocument();
    }
  });

  it("only offers the airlines that fly this route", () => {
    render(<Harness onApply={() => {}} />);
    expect(screen.queryByRole("button", { name: /Veloce/ })).not.toBeInTheDocument();
  });

  it('CTA reads "Show N flights" and follows the draft', async () => {
    render(<Harness onApply={() => {}} />);
    expect(screen.getByRole("button", { name: "Show 3 flights" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Direct 2" }));
    expect(screen.getByRole("button", { name: "Show 2 flights" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Nordwing 1" }));
    expect(screen.getByRole("button", { name: "Show 1 flight" })).toBeEnabled();
  });

  it("CTA is disabled at 0 results, e.g. when the URL already carries an impossible price cap", () => {
    render(<Harness onApply={() => {}} filters={{ ...initialFilters, maxPriceCents: 1 }} />);
    const cta = screen.getByRole("button", { name: "No flights match" });
    expect(cta).toBeDisabled();
  });

  it("closing the sheet discards the draft, confirming applies it", async () => {
    const onApply = vi.fn();
    render(<Harness onApply={onApply} />);

    await userEvent.click(screen.getByRole("button", { name: "Direct 2" }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    expect(screen.getByRole("button", { name: "Direct 2" })).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(screen.getByRole("button", { name: "Direct 2" }));
    await userEvent.click(screen.getByRole("button", { name: "Show 2 flights" }));
    expect(onApply).toHaveBeenCalledWith({ ...initialFilters, stops: "direct" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Reset clears the draft", async () => {
    render(<Harness onApply={() => {}} filters={{ ...initialFilters, stops: "direct" }} />);
    expect(screen.getByRole("button", { name: "Show 2 flights" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "Show 3 flights" })).toBeInTheDocument();
  });

  it("the price slider is a labelled range that can lower the cap", () => {
    render(<Harness onApply={() => {}} />);
    expect(screen.getByRole("slider", { name: "Maximum price" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Maximum duration" })).toBeInTheDocument();
  });
});
