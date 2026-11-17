import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Regole WCAG 2.0/2.1 A e AA, più le buone pratiche di axe. */
async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();
  const summary = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n   ${v.nodes.map((n) => n.target.join(" ")).join("\n   ")}`,
  );
  expect(summary, summary.join("\n")).toEqual([]);
}

async function fillCart(page: Page) {
  await page.goto("/restaurant/salt-and-lime");
  await page.getByRole("button", { name: "Add Baja fish taco" }).click();
  await page.getByRole("button", { name: "Add Hibiscus agua fresca" }).click();
}

test.describe("accessibility (axe)", () => {
  test("home, card layout", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("12 places")).toBeVisible();
    await expectNoViolations(page);
  });

  test("home, list layout", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "List layout" }).click();
    await expect(page.getByText("12 places")).toBeVisible();
    await expectNoViolations(page);
  });

  test("home, filters applied with no results", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("12 places")).toBeVisible();
    await page.getByRole("button", { name: "Vegan" }).click();
    await page.getByRole("button", { name: "Under 30 min" }).click();
    await page.getByRole("button", { name: "Free delivery" }).click();
    await expect(page.getByText("No places match these filters.")).toBeVisible();
    await expectNoViolations(page);
  });

  test("filter sheet", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Filters" }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("restaurant page", async ({ page }) => {
    await page.goto("/restaurant/salt-and-lime");
    await expect(page.getByRole("heading", { level: 1, name: "Salt & Lime" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("restaurant page with the 'new order' dialog", async ({ page }) => {
    await fillCart(page);
    await page.goto("/restaurant/green-table");
    await page.getByRole("button", { name: "Add Harvest salad" }).click();
    await expect(page.getByRole("dialog", { name: "Start a new order?" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("search, before and after typing", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("Popular searches")).toBeVisible();
    await expectNoViolations(page);
    await page.getByRole("searchbox").fill("bowl");
    await expect(page.getByRole("heading", { name: /^Dishes/ })).toBeVisible();
    await expectNoViolations(page);
  });

  test("empty cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expectNoViolations(page);
  });

  test("cart", async ({ page }) => {
    await fillCart(page);
    await page.getByRole("button", { name: /View cart/ }).click();
    await expect(page.getByLabel("Order summary")).toBeVisible();
    await expectNoViolations(page);
  });

  test("checkout, valid and with an error", async ({ page }) => {
    await fillCart(page);
    await page.getByRole("button", { name: /View cart/ }).click();
    await page.getByRole("button", { name: /Go to checkout/ }).click();
    await expect(page.getByRole("textbox", { name: "Address" })).toBeVisible();
    await expectNoViolations(page);
    await page.getByRole("textbox", { name: "Address" }).fill("");
    await expect(page.getByRole("alert")).toBeVisible();
    await expectNoViolations(page);
  });

  test("order tracking", async ({ page }) => {
    await fillCart(page);
    await page.getByRole("button", { name: /View cart/ }).click();
    await page.getByRole("button", { name: /Go to checkout/ }).click();
    await page.getByRole("button", { name: /Place order/ }).click();
    await expect(page.getByRole("progressbar", { name: "Order progress" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("orders list and account", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByText("No orders yet")).toBeVisible();
    await expectNoViolations(page);
    await page.goto("/account");
    await expect(page.getByRole("heading", { level: 1, name: "Account" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("unknown restaurant", async ({ page }) => {
    await page.goto("/restaurant/does-not-exist");
    await expect(page.getByText("We couldn't find this place")).toBeVisible();
    await expectNoViolations(page);
  });
});
