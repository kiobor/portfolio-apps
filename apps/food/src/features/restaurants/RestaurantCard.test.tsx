import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { restaurants } from "@/data/restaurants";
import { RestaurantCard } from "./RestaurantCard";

const saltAndLime = restaurants.find((r) => r.id === "salt-and-lime")!;
const sunnySide = restaurants.find((r) => r.id === "sunny-side")!;

function renderCard(variant: "card" | "row", restaurant = saltAndLime) {
  render(
    <MemoryRouter>
      <RestaurantCard restaurant={restaurant} variant={variant} bestMatch={false} />
    </MemoryRouter>,
  );
  return screen.getByRole("article");
}

describe("RestaurantCard — row (list) variant", () => {
  it("shows the cuisine on its own line, never truncated", () => {
    const article = renderCard("row");
    const cuisine = within(article).getByText("Tacos and ceviche");
    expect(cuisine.tagName).toBe("P");
    expect(cuisine).not.toHaveClass("truncate");
    // è l'unico contenuto della sua riga: niente rating o distanza accanto
    expect(cuisine.textContent).toBe("Tacos and ceviche");
  });

  it("groups the delivery data (time and fee) together", () => {
    const article = renderCard("row");
    const time = within(article).getByText("20 min");
    const fee = within(article).getByText("Free");
    expect(time.parentElement).toBe(fee.parentElement);
  });

  it("drops the review count, keeping rating and distance", () => {
    const article = renderCard("row");
    expect(within(article).queryByText("(3,201)")).not.toBeInTheDocument();
    expect(within(article).getByText("4.8")).toBeInTheDocument();
    expect(within(article).getByText("0.8 km")).toBeInTheDocument();
  });

  it("shows a paid delivery fee as a price", () => {
    const article = renderCard("row", sunnySide);
    expect(within(article).getByText("€1.99")).toBeInTheDocument();
  });
});

describe.each(["card", "row"] as const)("RestaurantCard — link (%s)", (variant) => {
  it("is named after the restaurant and sits on the heading", () => {
    renderCard(variant);
    const link = screen.getByRole("link", { name: "Salt & Lime" });
    expect(link).toHaveAttribute("href", "/restaurant/salt-and-lime");
    expect(link.closest("h3")).not.toBeNull();
  });

  it("does not wrap the whole article, which has no reliable accessible name", () => {
    const article = renderCard(variant);
    expect(article.closest("a")).toBeNull();
  });

  it("leaves the photo decorative because the name is right next to it", () => {
    const article = renderCard(variant);
    // alt="" → ruolo "presentation": non compare tra le immagini annunciate
    expect(within(article).queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("RestaurantCard — card variant", () => {
  it("keeps the review count and the single-line details", () => {
    const article = renderCard("card");
    expect(within(article).getByText("(3,201)")).toBeInTheDocument();
    expect(within(article).getByText("Tacos and ceviche")).toBeInTheDocument();
    expect(within(article).getByText("20 min")).toBeInTheDocument();
  });

  it("shows the best match badge only when asked", () => {
    const { unmount } = render(
      <MemoryRouter>
        <RestaurantCard restaurant={saltAndLime} variant="card" bestMatch />
      </MemoryRouter>,
    );
    expect(screen.getByText("Best match")).toBeInTheDocument();
    unmount();
  });
});
