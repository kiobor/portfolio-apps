import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const BASE = "from=LHR&to=ATH&depart=2999-03-15&adults=2&cabin=economy";
const DIRECT_ID = "LHR-ATH-2999-03-15-economy-0";

/** Regole WCAG 2.0/2.1 A e AA, più le buone pratiche di axe. Le violazioni si correggono nel codice, non si sopprimono. */
async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();
  const summary = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n   ${v.nodes.map((n) => n.target.join(" ")).join("\n   ")}`,
  );
  expect(summary, summary.join("\n")).toEqual([]);
}

async function makeBooking(page: Page) {
  await page.goto(`/passengers?${BASE}&out=${DIRECT_ID}&outFare=standard`);
  await page.getByLabel("Passenger 1 full name").fill("Ada Lovelace");
  await page.getByLabel("Passenger 2 full name").fill("Grace Hopper");
  await page.getByLabel("Email for the confirmation").fill("ada@example.com");
  await page.getByRole("button", { name: /Confirm booking/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Booking confirmed" })).toBeVisible();
}

test.describe("accessibility (axe)", () => {
  test("search", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Search flights" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("search with an error", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^To/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: /London/ }).click();
    await page.getByRole("button", { name: "Search flights" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expectNoViolations(page);
  });

  test("airport picker", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^To/ }).click();
    await expect(page.getByRole("dialog", { name: "Destination airport" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("results", async ({ page }) => {
    await page.goto(`/results?${BASE}`);
    await expect(page.getByRole("article").first()).toBeVisible();
    await expectNoViolations(page);
  });

  test("results, return leg of a round trip", async ({ page }) => {
    await page.goto(`/results?${BASE}&ret=2999-03-22&out=${DIRECT_ID}&outFare=standard`);
    await expect(page.getByRole("heading", { level: 1, name: "Choose your return" })).toBeVisible();
    await expect(page.getByRole("article").first()).toBeVisible();
    await expectNoViolations(page);
  });

  test("results with no flights", async ({ page }) => {
    await page.goto(`/results?${BASE}&max=1`);
    await expect(page.getByText("No flights match these filters.")).toBeVisible();
    await expectNoViolations(page);
  });

  test("invalid search", async ({ page }) => {
    await page.goto("/results?from=LHR&to=ATH&depart=2020-01-01");
    await expect(page.getByRole("heading", { level: 1, name: "Invalid search" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("filter sheet", async ({ page }) => {
    await page.goto(`/results?${BASE}`);
    await page.getByRole("button", { name: /^Filters/ }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("flight detail, direct and with a stop", async ({ page }) => {
    await page.goto(`/flight/${DIRECT_ID}?${BASE}`);
    await expect(page.getByRole("region", { name: "Price breakdown" })).toBeVisible();
    await expectNoViolations(page);
    // il secondo volo generato ha sempre uno scalo
    await page.goto(`/flight/LHR-ATH-2999-03-15-economy-1?${BASE}`);
    await expect(page.getByText(/Layover/)).toBeVisible();
    await expectNoViolations(page);
  });

  test("flight not found", async ({ page }) => {
    await page.goto("/flight/not-a-flight");
    await expect(page.getByRole("heading", { level: 1, name: "Flight not found" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("passengers, valid and with errors", async ({ page }) => {
    await page.goto(`/passengers?${BASE}&out=${DIRECT_ID}&outFare=standard`);
    await expect(page.getByRole("heading", { level: 1, name: "Passengers" })).toBeVisible();
    await expectNoViolations(page);
    await page.getByRole("button", { name: /Confirm booking/ }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expectNoViolations(page);
  });

  test("passengers, trip not found", async ({ page }) => {
    await page.goto("/passengers");
    await expect(page.getByRole("heading", { level: 1, name: "Trip not found" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("confirmation, and booking not found", async ({ page }) => {
    await makeBooking(page);
    await expectNoViolations(page);
    await page.goto("/booking/NOPE00");
    await expect(page.getByRole("heading", { level: 1, name: "Booking not found" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("trips, empty and with a booking", async ({ page }) => {
    await page.goto("/trips");
    await expect(page.getByText("No trips yet.")).toBeVisible();
    await expectNoViolations(page);
    await makeBooking(page);
    await page.goto("/trips");
    await expect(page.getByRole("link").first()).toBeVisible();
    await expectNoViolations(page);
  });

  test("account", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("heading", { level: 1, name: "Account" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("page not found", async ({ page }) => {
    await page.goto("/nothing/here");
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expectNoViolations(page);
  });
});
