import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { SearchForm } from "./SearchForm";

const today = new Date(2027, 0, 10, 12, 0); // 2027-01-10

function Probe() {
  const { pathname, search } = useLocation();
  return <p data-testid="location">{pathname + search}</p>;
}

function renderForm() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<SearchForm today={today} />} />
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Apre il selettore di un campo aeroporto e sceglie una città. */
async function pick(field: "From" | "To", city: string) {
  await userEvent.click(screen.getByRole("button", { name: new RegExp(`^${field}`) }));
  const dialog = screen.getByRole("dialog");
  await userEvent.click(within(dialog).getByRole("button", { name: new RegExp(city) }));
}

const dateField = (name: string) => screen.getByLabelText(name) as HTMLInputElement;

describe("SearchForm", () => {
  it("defaults to a round trip 30 days out with a 7-day stay", () => {
    renderForm();
    expect(dateField("Departure").value).toBe("2027-02-09");
    expect(dateField("Return").value).toBe("2027-02-16");
    expect(dateField("Departure").min).toBe("2027-01-10");
  });

  it("submits a valid round trip and navigates to /results with the params", async () => {
    renderForm();
    await pick("To", "Madrid");
    await userEvent.click(screen.getByRole("button", { name: "Search flights" }));
    const url = new URL(screen.getByTestId("location").textContent!, "http://x");
    expect(url.pathname).toBe("/results");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      from: "LHR",
      to: "MAD",
      depart: "2027-02-09",
      ret: "2027-02-16",
      adults: "1",
      cabin: "economy",
    });
  });

  it("shows an inline error and does not navigate when origin equals destination", async () => {
    renderForm();
    await pick("To", "London");
    await userEvent.click(screen.getByRole("button", { name: "Search flights" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/different/i);
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  it("shows an error for a return date before the departure date", async () => {
    renderForm();
    fireEvent.change(dateField("Return"), { target: { value: "2027-02-01" } });
    await userEvent.click(screen.getByRole("button", { name: "Search flights" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/before the departure/i);
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  it("shows an error for a departure date in the past", async () => {
    renderForm();
    fireEvent.change(dateField("Departure"), { target: { value: "2027-01-01" } });
    fireEvent.change(dateField("Return"), { target: { value: "2027-01-05" } });
    await userEvent.click(screen.getByRole("button", { name: "Search flights" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/in the past/i);
  });

  it("swap button exchanges origin and destination", async () => {
    renderForm();
    await pick("To", "Madrid");
    const from = () => screen.getByRole("button", { name: /^From/ });
    const to = () => screen.getByRole("button", { name: /^To/ });
    expect(from()).toHaveTextContent("London");
    expect(to()).toHaveTextContent("Madrid");
    await userEvent.click(screen.getByRole("button", { name: /swap/i }));
    expect(from()).toHaveTextContent("Madrid");
    expect(to()).toHaveTextContent("London");
  });

  it("one-way hides the return date and leaves it out of the URL", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "One way" }));
    expect(screen.queryByLabelText("Return")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Search flights" }));
    const url = new URL(screen.getByTestId("location").textContent!, "http://x");
    expect(url.searchParams.has("ret")).toBe(false);
  });

  it("adults stepper stays between 1 and 6", async () => {
    renderForm();
    const group = screen.getByRole("group", { name: "Adults" });
    expect(within(group).getByRole("button", { name: "Remove adult" })).toBeDisabled();
    for (let i = 0; i < 10; i++) {
      const add = within(group).getByRole("button", { name: "Add adult" });
      if (add.hasAttribute("disabled")) break;
      await userEvent.click(add);
    }
    expect(within(group).getByText("6")).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Add adult" })).toBeDisabled();
  });

  it("airport picker filters by city name and code, accent-insensitive", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: /^To/ }));
    const dialog = screen.getByRole("dialog");
    const search = within(dialog).getByRole("searchbox");
    const options = () => within(dialog).getAllByRole("button").filter((b) => b.textContent?.match(/[A-Z]{3}/));

    await userEvent.type(search, "mádr");
    expect(options()).toHaveLength(1);
    expect(options()[0]).toHaveTextContent("Madrid");

    await userEvent.clear(search);
    await userEvent.type(search, "ath");
    expect(options()[0]).toHaveTextContent("Athens");

    await userEvent.clear(search);
    await userEvent.type(search, "zzz");
    expect(within(dialog).getByText(/no airports/i)).toBeInTheDocument();
  });
});
