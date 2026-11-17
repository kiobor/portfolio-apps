import { expect, test } from "@playwright/test";

const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Main" });

test("buys a dish from home to order tracking", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Nosh — Food delivery");
  // il link della card si chiama come il locale (nome esatto, non tutto il contenuto della card)
  await page.getByRole("link", { name: "Salt & Lime", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Salt & Lime" })).toBeVisible();
  await expect(page).toHaveTitle("Salt & Lime — Nosh");

  await page.getByRole("button", { name: "Add Baja fish taco" }).click();
  await page.getByRole("button", { name: "Add another Baja fish taco" }).click();
  await page.getByRole("button", { name: /View cart/ }).click();

  await expect(page.getByLabel("Order summary")).toContainText("€11.99");
  await page.getByRole("button", { name: /Go to checkout/ }).click();

  await page.getByRole("radio", { name: /Cash/ }).check();
  await page.getByRole("button", { name: /Place order/ }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText("2 × Baja fish taco")).toBeVisible();

  await expect(page).toHaveTitle("Order tracking — Nosh");

  await nav(page).getByRole("button", { name: "Orders" }).click();
  await expect(page).toHaveTitle("Orders — Nosh");
  await expect(page.getByRole("link", { name: /Salt & Lime/ })).toBeVisible();
});

test("the cart survives a page reload", async ({ page }) => {
  await page.goto("/restaurant/salt-and-lime");
  await page.getByRole("button", { name: "Add Al pastor taco" }).click();
  await expect(page.getByRole("button", { name: /View cart/ })).toContainText("1 item");

  await page.reload();
  await expect(page.getByRole("button", { name: /View cart/ })).toContainText("1 item");
  await expect(page.getByRole("button", { name: "Remove one Al pastor taco" })).toBeVisible();
});

test("asks before mixing two restaurants in one order", async ({ page }) => {
  await page.goto("/restaurant/salt-and-lime");
  await page.getByRole("button", { name: "Add Al pastor taco" }).click();

  await page.goto("/restaurant/green-table");
  await page.getByRole("button", { name: "Add Harvest salad" }).click();
  const dialog = page.getByRole("dialog", { name: "Start a new order?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Start new cart" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: /View cart/ })).toContainText("1 item");
});

test("checkout blocks an empty address", async ({ page }) => {
  await page.goto("/restaurant/salt-and-lime");
  await page.getByRole("button", { name: "Add Al pastor taco" }).click();
  await page.getByRole("button", { name: /View cart/ }).click();
  await page.getByRole("button", { name: /Go to checkout/ }).click();

  await page.getByRole("textbox", { name: "Address" }).fill("");
  await expect(page.getByRole("alert")).toHaveText("Enter a delivery address.");
  await expect(page.getByRole("button", { name: /Place order/ })).toBeDisabled();
});

test("deep links to unknown pages show a way out", async ({ page }) => {
  await page.goto("/restaurant/does-not-exist");
  await expect(page.getByText("We couldn't find this place")).toBeVisible();
  await page.getByRole("link", { name: "Back to places near you" }).click();
  await expect(page.getByRole("heading", { name: "Open near you" })).toBeVisible();
});
