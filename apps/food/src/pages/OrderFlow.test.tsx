import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@/App";
import { useCart } from "@/features/cart/cartStore";
import { orderTotals } from "@/features/cart/pricing";
import { useOrders, type Order } from "@/features/orders/orderStore";

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

function fakeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "ord-test",
    restaurantId: "salt-and-lime",
    restaurantName: "Salt & Lime",
    etaMin: 20,
    lines: [{ name: "Baja fish taco", qty: 2, price: 5.5 }],
    totals: orderTotals(11, 0),
    address: "Ceintuurbaan 251",
    note: "",
    payment: "demo-card",
    createdAt: Date.now(),
    ...overrides,
  };
}

/** Porta l'utente dalla pagina ristorante al carrello con 2 Baja fish taco. */
async function fillCart(user: ReturnType<typeof userEvent.setup>) {
  renderAt("/restaurant/salt-and-lime");
  await screen.findByRole("heading", { level: 1, name: "Salt & Lime" });
  await user.click(screen.getByRole("button", { name: "Add Baja fish taco" }));
  await user.click(screen.getByRole("button", { name: "Add another Baja fish taco" }));
  await user.click(screen.getByRole("button", { name: /View cart/ }));
  await screen.findByRole("heading", { level: 1, name: "Your order" });
}

describe("Cart page", () => {
  it("shows an empty state with a way back to browsing", async () => {
    renderAt("/cart");
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse places" })).toHaveAttribute("href", "/");
  });

  it("lists the dishes with a full price breakdown", async () => {
    const user = userEvent.setup();
    await fillCart(user);

    expect(screen.getByRole("heading", { name: "Baja fish taco" })).toBeInTheDocument();
    const dl = await screen.findByLabelText("Order summary");
    expect(within(dl).getByText("Subtotal").nextSibling).toHaveTextContent("€11.00");
    expect(within(dl).getByText("Delivery").nextSibling).toHaveTextContent("Free");
    expect(within(dl).getByText("Service fee").nextSibling).toHaveTextContent("€0.99");
    expect(within(dl).getByText("Total").nextSibling).toHaveTextContent("€11.99");
  });

  it("updates the totals when quantities change", async () => {
    const user = userEvent.setup();
    await fillCart(user);
    await user.click(screen.getByRole("button", { name: "Remove one Baja fish taco" }));

    const dl = await screen.findByLabelText("Order summary");
    expect(within(dl).getByText("Total").nextSibling).toHaveTextContent("€6.49"); // 5.50 + 0.99
  });

  it("goes back to the empty state when the last dish is removed", async () => {
    const user = userEvent.setup();
    await fillCart(user);
    await user.click(screen.getByRole("button", { name: "Remove one Baja fish taco" }));
    await user.click(screen.getByRole("button", { name: "Remove one Baja fish taco" }));
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
  });

  it("is saved in the browser so it survives a reload", async () => {
    const user = userEvent.setup();
    await fillCart(user);
    const saved = JSON.parse(localStorage.getItem("nosh-cart") ?? "{}") as {
      state?: Record<string, unknown>;
    };
    expect(saved.state?.restaurantId).toBe("salt-and-lime");
    expect(JSON.stringify(saved.state?.lines)).toContain("Baja fish taco");
    // si salvano solo i dati, non le funzioni dello store
    expect(Object.keys(saved.state ?? {}).sort()).toEqual(["lines", "restaurantId"]);
  });
});

describe("Checkout", () => {
  it("redirects to the cart when there is nothing to order", async () => {
    renderAt("/checkout");
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
  });

  it("asks for an address and blocks the order without one", async () => {
    const user = userEvent.setup();
    await fillCart(user);
    await user.click(await screen.findByRole("button", { name: /Go to checkout/ }));

    const address = await screen.findByRole("textbox", { name: "Address" });
    await user.clear(address);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a delivery address.");
    expect(screen.getByRole("button", { name: /Place order/ })).toBeDisabled();

    await user.type(address, "Prinsengracht 12");
    expect(screen.getByRole("button", { name: /Place order/ })).toBeEnabled();
  });

  it("never asks for card details", async () => {
    const user = userEvent.setup();
    await fillCart(user);
    await user.click(await screen.findByRole("button", { name: /Go to checkout/ }));
    await screen.findByRole("textbox", { name: "Address" });

    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Demo card/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Cash/ })).toBeInTheDocument();
  });

  it("places the order, empties the cart and lands on the tracking page", async () => {
    const user = userEvent.setup();
    await fillCart(user);
    await user.click(await screen.findByRole("button", { name: /Go to checkout/ }));
    await user.click(await screen.findByRole("radio", { name: /Cash/ }));
    await user.click(screen.getByRole("button", { name: /Place order/ }));

    expect(await screen.findByRole("heading", { level: 2, name: "Order confirmed" })).toBeInTheDocument();
    expect(useCart.getState().lines).toEqual({});

    const [order] = useOrders.getState().orders;
    expect(order).toMatchObject({
      restaurantName: "Salt & Lime",
      payment: "cash",
      address: "Ceintuurbaan 251",
    });
    expect(order?.totals.total).toBe(11.99);
    expect(screen.getByText(/2 × Baja fish taco/)).toBeInTheDocument();
  });
});

describe("Order tracking", () => {
  it("shows the stage derived from the order time", async () => {
    useOrders.setState({ orders: [fakeOrder({ createdAt: Date.now() - 20_000 })] });
    renderAt("/orders/ord-test");
    expect(await screen.findByRole("heading", { level: 2, name: "On the way" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("On the way");
  });

  it("shows a delivered order as complete", async () => {
    useOrders.setState({ orders: [fakeOrder({ createdAt: Date.now() - 10 * 60_000 })] });
    renderAt("/orders/ord-test");
    expect(await screen.findByRole("heading", { level: 2, name: "Delivered" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Order progress" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("handles an unknown order id", async () => {
    renderAt("/orders/nope");
    expect(await screen.findByText("We couldn't find this order")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See your orders" })).toHaveAttribute("href", "/orders");
  });
});

describe("Orders list", () => {
  it("shows an empty state", async () => {
    renderAt("/orders");
    expect(await screen.findByText("No orders yet")).toBeInTheDocument();
  });

  it("lists orders, newest first, each linking to its tracking page", async () => {
    useOrders.setState({
      orders: [
        fakeOrder({ id: "ord-new", restaurantName: "Green Table", createdAt: Date.now() }),
        fakeOrder({ id: "ord-old", createdAt: Date.now() - 10 * 60_000 }),
      ],
    });
    renderAt("/orders");
    const links = await screen.findAllByRole("link", { name: /Green Table|Salt & Lime/ });
    expect(links[0]).toHaveAttribute("href", "/orders/ord-new");
    expect(links[1]).toHaveAttribute("href", "/orders/ord-old");
    expect(links[1]).toHaveTextContent("Delivered");
    expect(links[1]).toHaveTextContent("2 items");
  });
});
