import { expect, test } from "@playwright/test";

test("opens on Search with the three tabs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Search flights" })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Search", "Trips", "Account"]) {
    await expect(nav.getByRole("button", { name })).toBeVisible();
  }
});
