import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./App";

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Home", () => {
  it("shows the best match first with its badge", async () => {
    renderApp();
    const first = (await screen.findAllByRole("article"))[0]!;
    expect(within(first).getByText("Best match")).toBeInTheDocument();
  });

  it("updates the place count when a quick filter is toggled", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("12 places");

    await user.click(screen.getByRole("button", { name: "Free delivery" }));
    expect(screen.getByText("6 places")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Free delivery" }));
    expect(screen.getByText("12 places")).toBeInTheDocument();
  });

  it("filters by category and offers a way out of an empty state", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("12 places");

    await user.click(screen.getByRole("button", { name: "Vegan" }));
    await user.click(screen.getByRole("button", { name: "Under 30 min" }));
    await user.click(screen.getByRole("button", { name: "Free delivery" }));
    expect(screen.getByText("No places match these filters.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("12 places")).toBeInTheDocument();
  });

  it("switches between card and list layout", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("12 places");

    await user.click(screen.getByRole("button", { name: "List layout" }));
    expect(screen.getByRole("button", { name: "List layout" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Filter sheet", () => {
  async function openSheet() {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("12 places");
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const dialog = await screen.findByRole("dialog", { name: "Filters" });
    return { user, dialog };
  }

  it("opens over the results and shows the live count on the main button", async () => {
    const { dialog } = await openSheet();
    expect(within(dialog).getByRole("button", { name: "Show 12 places" })).toBeInTheDocument();
  });

  it("shows how many places each option would return before choosing it", async () => {
    const { dialog } = await openSheet();
    // 6 locali hanno consegna gratuita, 4 hanno rating 4.7+ e la fascia €€€ ne ha 2.
    expect(within(dialog).getByRole("button", { name: "Free 6" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "4.7+ 4" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "€€€ 2" })).toBeInTheDocument();
  });

  it("updates the main button as options are chosen, and applies them only on confirm", async () => {
    const { user, dialog } = await openSheet();

    await user.click(within(dialog).getByRole("button", { name: /^Free/ }));
    expect(within(dialog).getByRole("button", { name: "Show 6 places" })).toBeInTheDocument();
    // il conteggio nella lista sotto non cambia finché non si conferma
    expect(screen.getByText("12 places")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Show 6 places" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("6 places")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filters, 1 active" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Free delivery" })).toHaveAttribute("aria-pressed", "true");
  });

  it("combines options and recomputes the counts of the others", async () => {
    const { user, dialog } = await openSheet();
    await user.click(within(dialog).getByRole("button", { name: /^Free/ }));
    await user.click(within(dialog).getByRole("button", { name: /^4\.5\+/ }));
    // gratis AND 4.5+: Salt & Lime, Sweet Crumb, Poke Harbour, Root & Sprout
    expect(within(dialog).getByRole("button", { name: "Show 4 places" })).toBeInTheDocument();
  });

  it("discards the draft when closed with Escape", async () => {
    const { user, dialog } = await openSheet();
    await user.click(within(dialog).getByRole("button", { name: /^Free/ }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("12 places")).toBeInTheDocument();
  });

  it("resets the draft without closing", async () => {
    const { user, dialog } = await openSheet();
    await user.click(within(dialog).getByRole("button", { name: /^Free/ }));
    await user.click(within(dialog).getByRole("button", { name: "Reset" }));
    expect(within(dialog).getByRole("button", { name: "Show 12 places" })).toBeInTheDocument();
  });

  it("keeps the quick chips and the sheet in sync", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("12 places");
    await user.click(screen.getByRole("button", { name: "Free delivery" }));
    await user.click(screen.getByRole("button", { name: "Filters, 1 active" }));
    const dialog = await screen.findByRole("dialog", { name: "Filters" });
    expect(within(dialog).getByRole("button", { name: "Free 6" })).toHaveAttribute("aria-pressed", "true");
  });
});
