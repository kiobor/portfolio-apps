import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { fetchFlights } from "@/api/flights";
import { tripTotal } from "@/features/booking/pricing";
import { generateFlights } from "@/features/results/generate";
import { formatCents } from "@/lib/format";
import { ResultsPage } from "./ResultsPage";

vi.mock("@/api/flights", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/flights")>();
  return { ...actual, fetchFlights: vi.fn(actual.fetchFlights) };
});

const SEARCH = "from=LHR&to=ATH&depart=2999-03-15&adults=1&cabin=economy";

function Where() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function renderResults(query: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/results?${query}`]}>
        <Routes>
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/" element={<p>Search page</p>} />
        </Routes>
        <Where />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const outbound = () => generateFlights({ from: "LHR", to: "ATH", date: "2999-03-15", cabin: "economy" });

describe("ResultsPage", () => {
  it("shows skeletons, then the list with a count", async () => {
    renderResults(SEARCH);
    expect(screen.getByRole("status", { name: /loading flights/i })).toBeInTheDocument();
    const cards = await screen.findAllByRole("article");
    expect(cards.length).toBe(outbound().length);
    expect(screen.queryByRole("status", { name: /loading flights/i })).not.toBeInTheDocument();
    expect(screen.getByText(`${cards.length} flights`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/London/);
  });

  it("marks exactly one flight as Best, and the Best tab is active by default", async () => {
    renderResults(SEARCH);
    await screen.findAllByRole("article");
    const withBadge = screen.getAllByRole("article").filter((a) => within(a).queryByText("Best"));
    expect(withBadge).toHaveLength(1);
    expect(screen.getByRole("button", { name: /^Best/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("reorders when another sort tab is chosen and keeps it in the URL", async () => {
    renderResults(SEARCH);
    await screen.findAllByRole("article");
    await userEvent.click(screen.getByRole("button", { name: /^Cheapest/ }));
    expect(screen.getByTestId("where").textContent).toContain("sort=cheapest");
    const prices = screen
      .getAllByRole("article")
      .map((a) => Number(/€([\d,]+)/.exec(a.textContent ?? "")![1]!.replace(",", "")));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("shows an error with Try again, and recovers", async () => {
    vi.mocked(fetchFlights).mockRejectedValueOnce(new Error("boom"));
    renderResults(SEARCH);
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn.t load/i);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect((await screen.findAllByRole("article")).length).toBeGreaterThan(0);
  });

  it("shows Clear filters on zero results, e.g. a price cap below the cheapest fare from the URL", async () => {
    renderResults(`${SEARCH}&max=1`);
    expect(await screen.findByText(/no flights match/i)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect((await screen.findAllByRole("article")).length).toBeGreaterThan(0);
    expect(screen.getByTestId("where").textContent).not.toContain("max=");
  });

  it("applies a quick filter and writes it to the URL", async () => {
    renderResults(SEARCH);
    await screen.findAllByRole("article");
    await userEvent.click(screen.getByRole("button", { name: "Direct" }));
    expect(screen.getByTestId("where").textContent).toContain("stops=direct");
    for (const card of screen.getAllByRole("article")) {
      expect(within(card).getByText("Direct")).toBeInTheDocument();
    }
  });

  it("confirming the filter sheet writes the filters to the URL, closing it does not", async () => {
    renderResults(SEARCH);
    await screen.findAllByRole("article");
    await userEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    await userEvent.click(screen.getByRole("button", { name: /^Direct \d+$/ }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("where").textContent).not.toContain("stops");

    await userEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    await userEvent.click(screen.getByRole("button", { name: /^Direct \d+$/ }));
    await userEvent.click(screen.getByRole("button", { name: /^Show \d+ flights?$/ }));
    expect(screen.getByTestId("where").textContent).toContain("stops=direct");
    expect(screen.getByRole("button", { name: /^Filters/ })).toHaveTextContent("1");
  });

  it("renders the invalid search state, with a link to Search, for a past date", async () => {
    renderResults("from=LHR&to=ATH&depart=2020-01-01");
    expect(await screen.findByText(/invalid search/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: /search/i }));
    expect(screen.getByText("Search page")).toBeInTheDocument();
  });

  it("survives garbage params by falling back to safe defaults", async () => {
    renderResults("from=ZZZ&to=ZZZ&adults=99&cabin=foo&stops=wat&max=abc&bands=lunch");
    expect((await screen.findAllByRole("article")).length).toBeGreaterThan(0);
  });

  it("round trip: after the outbound is chosen it asks for the return and shows the running total", async () => {
    const out = outbound()[0]!;
    renderResults(`${SEARCH}&ret=2999-03-22&out=${out.id}&outFare=standard`);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Choose your return");
    const total = formatCents(tripTotal([{ baseCents: out.baseCents, fare: "standard" }], 1));
    expect(screen.getByText((content) => content.includes(`Total so far ${total}`))).toBeInTheDocument();
    const cards = await screen.findAllByRole("article");
    const back = generateFlights({ from: "ATH", to: "LHR", date: "2999-03-22", cabin: "economy" });
    expect(cards.length).toBe(back.length);
  });

  it("ignores a bogus out param and shows the outbound flights", async () => {
    renderResults(`${SEARCH}&ret=2999-03-22&out=nonsense`);
    expect(await screen.findByRole("heading", { level: 1 })).not.toHaveTextContent("Choose your return");
  });
});
