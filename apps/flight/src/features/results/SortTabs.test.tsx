import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeFlight } from "@/test/factories";
import { SortTabs } from "./SortTabs";

const A = makeFlight({ baseCents: 10000, durationMin: 180, stops: 0 });
const B = makeFlight({ baseCents: 8000, durationMin: 330, stops: 1 });
const C = makeFlight({ baseCents: 14000, durationMin: 150, stops: 0 });

describe("SortTabs", () => {
  it("shows the best price and duration, the cheapest price and the fastest duration", () => {
    render(<SortTabs flights={[A, B, C]} value="best" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Best/ })).toHaveTextContent("€100");
    expect(screen.getByRole("button", { name: /Best/ })).toHaveTextContent("3h");
    expect(screen.getByRole("button", { name: /Cheapest/ })).toHaveTextContent("€80");
    expect(screen.getByRole("button", { name: /Fastest/ })).toHaveTextContent("2h 30m");
  });

  it("marks the active sort and reports clicks", async () => {
    const onChange = vi.fn();
    render(<SortTabs flights={[A, B, C]} value="cheapest" onChange={onChange} />);
    expect(screen.getByRole("button", { name: /Cheapest/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Best/ })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(screen.getByRole("button", { name: /Fastest/ }));
    expect(onChange).toHaveBeenCalledWith("fastest");
  });

  it("shows dashes instead of numbers for an empty list", () => {
    render(<SortTabs flights={[]} value="best" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Best/ })).toHaveTextContent("—");
  });
});
