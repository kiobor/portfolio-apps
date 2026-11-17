import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@/App";
import { useCart } from "@/features/cart/cartStore";
import { orderTotals } from "@/features/cart/pricing";
import { useOrders } from "@/features/orders/orderStore";

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Search page", () => {
  it("focuses the field and offers popular searches before typing", async () => {
    renderAt("/search");
    const field = await screen.findByRole("searchbox", { name: /Search places, dishes or cuisines/ });
    expect(field).toHaveFocus();
    expect(screen.getByRole("button", { name: "Poke" })).toBeInTheDocument();
  });

  it("fills the field from a popular search and shows places and dishes", async () => {
    const user = userEvent.setup();
    renderAt("/search");
    await user.click(await screen.findByRole("button", { name: "Poke" }));

    expect(await screen.findByRole("heading", { level: 2, name: /^Places/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /^Dishes/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Poke Harbour/ })).toHaveAttribute(
      "href",
      "/restaurant/poke-harbour",
    );
  });

  it("finds a dish and links to the restaurant that serves it", async () => {
    const user = userEvent.setup();
    renderAt("/search");
    await user.type(await screen.findByRole("searchbox"), "shakshuka");

    const link = await screen.findByRole("link", { name: /Shakshuka/ });
    expect(link).toHaveAttribute("href", "/restaurant/sunny-side");
    expect(link).toHaveTextContent("Sunny Side");
  });

  it("says so when nothing matches", async () => {
    const user = userEvent.setup();
    renderAt("/search");
    await user.type(await screen.findByRole("searchbox"), "pizza");
    expect(await screen.findByRole("heading", { name: /No results for/ })).toHaveTextContent("pizza");
    expect(screen.getByRole("status")).toHaveTextContent("No results");
  });

  it("is reachable from the search bar on the home page", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await user.click(await screen.findByRole("link", { name: /Search places/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Search" })).toBeInTheDocument();
  });

  it("does not leave the home page just because the search bar receives focus", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const bar = await screen.findByRole("link", { name: /Search places/ });
    await user.tab(); // address
    await user.tab(); // account
    await user.tab(); // search bar
    expect(bar).toHaveFocus();
    expect(screen.queryByRole("heading", { level: 1, name: "Search" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Open near you" })).toBeInTheDocument();
  });
});

describe("Account page", () => {
  it("explains that this is a demo and clears demo data on request", async () => {
    const user = userEvent.setup();
    useCart.getState().add("salt-and-lime", {
      id: "sl-1",
      name: "Baja fish taco",
      description: "",
      price: 5.5,
      tags: [],
    });
    useOrders.setState({
      orders: [
        {
          id: "ord-1",
          restaurantId: "salt-and-lime",
          restaurantName: "Salt & Lime",
          etaMin: 20,
          lines: [{ name: "Baja fish taco", qty: 1, price: 5.5 }],
          totals: orderTotals(5.5, 0),
          address: "Ceintuurbaan 251",
          note: "",
          payment: "cash",
          createdAt: Date.now(),
        },
      ],
    });

    renderAt("/account");
    const heading = await screen.findByRole("heading", { level: 1, name: "Account" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/portfolio project/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 order saved");

    await user.click(screen.getByRole("button", { name: "Reset demo data" }));
    expect(within(screen.getByRole("status")).getByText("Cart and orders cleared.")).toBeInTheDocument();
    expect(useCart.getState().lines).toEqual({});
    expect(useOrders.getState().orders).toEqual([]);
  });
});
