import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@/App";

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

describe("Restaurant page", () => {
  it("opens from a card on the home page", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await user.click(await screen.findByRole("link", { name: /Salt & Lime/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Salt & Lime" })).toBeInTheDocument();
  });

  it("shows the key facts and the menu sections", async () => {
    renderAt("/restaurant/salt-and-lime");
    await screen.findByRole("heading", { level: 1, name: "Salt & Lime" });

    expect(screen.getByText("20 min")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Tacos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Ceviche" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Baja fish taco" })).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Menu sections" });
    expect(within(nav).getAllByRole("button")).toHaveLength(3);
  });

  it("adds dishes with the stepper and shows the cart bar with count and total", async () => {
    const user = userEvent.setup();
    renderAt("/restaurant/salt-and-lime");
    await screen.findByRole("heading", { level: 1, name: "Salt & Lime" });
    expect(screen.queryByRole("button", { name: /View cart/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add Baja fish taco" }));
    await user.click(screen.getByRole("button", { name: "Add another Baja fish taco" }));
    await user.click(screen.getByRole("button", { name: "Add Hibiscus agua fresca" }));

    const bar = screen.getByRole("button", { name: /View cart/ });
    expect(bar).toHaveTextContent("3 items");
    expect(bar).toHaveTextContent("€14.50"); // 2 × 5.50 + 3.50
  });

  it("removes dishes and hides the cart bar when the cart is empty", async () => {
    const user = userEvent.setup();
    renderAt("/restaurant/salt-and-lime");
    await screen.findByRole("heading", { level: 1, name: "Salt & Lime" });

    await user.click(screen.getByRole("button", { name: "Add Al pastor taco" }));
    expect(screen.getByRole("button", { name: /View cart/ })).toHaveTextContent("1 item");

    await user.click(screen.getByRole("button", { name: "Remove one Al pastor taco" }));
    expect(screen.queryByRole("button", { name: /View cart/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Al pastor taco" })).toBeInTheDocument();
  });

  it("asks before replacing a cart that belongs to another restaurant", async () => {
    const user = userEvent.setup();
    const first = renderAt("/restaurant/salt-and-lime");
    await screen.findByRole("heading", { level: 1, name: "Salt & Lime" });
    await user.click(screen.getByRole("button", { name: "Add Al pastor taco" }));
    first.unmount();

    renderAt("/restaurant/green-table");
    await screen.findByRole("heading", { level: 1, name: "Green Table" });
    await user.click(screen.getByRole("button", { name: "Add Harvest salad" }));

    const dialog = await screen.findByRole("dialog", { name: "Start a new order?" });
    // finché non si conferma, il carrello non cambia
    expect(screen.queryByRole("button", { name: /View cart/ })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Start new cart" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View cart/ })).toHaveTextContent("1 item");
    expect(screen.getByRole("button", { name: "Remove one Harvest salad" })).toBeInTheDocument();
  });

  it("keeps the current cart when the user declines", async () => {
    const user = userEvent.setup();
    const first = renderAt("/restaurant/salt-and-lime");
    await screen.findByRole("heading", { level: 1, name: "Salt & Lime" });
    await user.click(screen.getByRole("button", { name: "Add Al pastor taco" }));
    first.unmount();

    renderAt("/restaurant/green-table");
    await screen.findByRole("heading", { level: 1, name: "Green Table" });
    await user.click(screen.getByRole("button", { name: "Add Harvest salad" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Keep current cart" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Harvest salad" })).toBeInTheDocument();
  });

  it("shows a way out for an unknown restaurant", async () => {
    renderAt("/restaurant/does-not-exist");
    expect(await screen.findByText("We couldn't find this place")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to places near you" })).toHaveAttribute("href", "/");
  });
});
