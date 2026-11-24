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

test("the filter sheet and the airport picker open inside the phone frame", async ({ page }) => {
  const main = page.getByRole("main");

  await page.goto("/results?from=LHR&to=ATH&depart=2999-03-15&adults=1&cabin=economy");
  await page.getByRole("button", { name: /^Filters/ }).click();
  const filters = page.getByRole("dialog", { name: "Filters" });
  await expect(filters).toBeVisible();
  const frame = (await main.boundingBox())!;
  const sheet = (await filters.boundingBox())!;
  expect(sheet.x).toBeGreaterThanOrEqual(frame.x - 1);
  expect(sheet.x + sheet.width).toBeLessThanOrEqual(frame.x + frame.width + 1);

  await page.goto("/");
  await page.getByRole("button", { name: /^To/ }).click();
  const picker = page.getByRole("dialog", { name: "Destination airport" });
  await expect(picker).toBeVisible();
  const pickerBox = (await picker.boundingBox())!;
  expect(pickerBox.x).toBeGreaterThanOrEqual(frame.x - 1);
  expect(pickerBox.x + pickerBox.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
});
