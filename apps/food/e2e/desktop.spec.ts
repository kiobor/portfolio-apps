import { expect, test } from "@playwright/test";

test("on desktop the app stays in a centered phone frame", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(main).toBeVisible();

  const box = await main.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(430);
  expect(Math.abs(box!.x + box!.width / 2 - 640)).toBeLessThan(2);
});

test("the filter sheet opens inside the phone frame, not across the whole page", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  await page.getByRole("button", { name: "Filters" }).click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog).toBeVisible();

  const frame = await main.boundingBox();
  const sheet = await dialog.boundingBox();
  expect(frame).not.toBeNull();
  expect(sheet).not.toBeNull();
  expect(sheet!.x).toBeGreaterThanOrEqual(frame!.x - 1);
  expect(sheet!.x + sheet!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
});
