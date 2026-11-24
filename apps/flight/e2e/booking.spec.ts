import { expect, test, type Page } from "@playwright/test";

const BASE = "from=LHR&to=ATH&depart=2999-03-15&adults=1&cabin=economy";
/** Il primo volo generato è sempre diretto: serve un id stabile senza passare dalla ricerca. */
const DIRECT_ID = "LHR-ATH-2999-03-15-economy-0";

const nav = (page: Page) => page.getByRole("navigation", { name: "Main" });

async function chooseDestination(page: Page, city: string) {
  await page.getByRole("button", { name: /^To/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: new RegExp(city) }).click();
}

async function fillPassengers(page: Page, names: string[]) {
  for (const [i, name] of names.entries()) {
    await page.getByLabel(`Passenger ${i + 1} full name`).fill(name);
  }
  await page.getByLabel("Email for the confirmation").fill("ada@example.com");
}

test("books a one-way flight from search to Trips", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Search flights — Skylark");
  await page.getByRole("button", { name: "One way" }).click();
  await chooseDestination(page, "Madrid");
  await page.getByRole("button", { name: "Search flights" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("London → Madrid");
  await page.getByRole("article").first().getByRole("link").click();

  await expect(page.getByRole("button", { name: "Continue to passengers" })).toBeVisible();
  await page.getByRole("radio", { name: /Standard/ }).check();
  await page.getByRole("button", { name: "Continue to passengers" }).click();

  await fillPassengers(page, ["Ada Lovelace"]);
  await page.getByRole("button", { name: /Confirm booking/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Booking confirmed" })).toBeVisible();
  const ref = (await page.getByLabel("Booking reference").locator("p").last().textContent())!.trim();
  expect(ref).toMatch(/^[A-Z0-9]{6}$/);

  await nav(page).getByRole("button", { name: "Trips" }).click();
  await expect(page.getByRole("link", { name: new RegExp(ref) })).toBeVisible();
  await expect(page).toHaveTitle("Trips — Skylark");
});

test("books a round trip: outbound, then return, with the running total", async ({ page }) => {
  await page.goto("/");
  await chooseDestination(page, "Rome");
  await page.getByRole("button", { name: "Search flights" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("London → Rome");
  await page.getByRole("article").first().getByRole("link").click();
  await page.getByRole("radio", { name: /Flex/ }).check();
  await page.getByRole("button", { name: "Choose return flight" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Choose your return");
  await expect(page.getByText(/Total so far €/)).toBeVisible();
  await page.getByRole("article").first().getByRole("link").click();
  await expect(page.getByRole("region", { name: "Price breakdown" })).toContainText("Outbound flight");
  await page.getByRole("button", { name: "Continue to passengers" }).click();

  await fillPassengers(page, ["Ada Lovelace"]);
  await page.getByRole("button", { name: /Confirm booking/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Booking confirmed" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Outbound" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Return" })).toBeVisible();
});

test("filters from the sheet change the URL and the count matches the list", async ({ page }) => {
  await page.goto(`/results?${BASE}`);
  const count = page.getByText(/^\d+ flights?$/);
  await expect(count).toBeVisible();
  const total = Number((await count.textContent())!.split(" ")[0]);

  await page.getByRole("button", { name: /^Filters/ }).click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /^Direct \d+$/ }).click();
  const cta = dialog.getByRole("button", { name: /^Show \d+ flights?$/ });
  const promised = Number((await cta.textContent())!.split(" ")[1]);
  expect(promised).toBeLessThan(total);
  await cta.click();

  await expect(page).toHaveURL(/stops=direct/);
  await expect(page.getByRole("article")).toHaveCount(promised);
  await expect(count).toHaveText(new RegExp(`^${promised} flights?$`));
});

test("closing the filter sheet leaves the list and the URL as they were", async ({ page }) => {
  await page.goto(`/results?${BASE}`);
  await expect(page.getByRole("article").first()).toBeVisible();
  const before = await page.getByRole("article").count();
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^Direct \d+$/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(page.url()).not.toContain("stops");
  await expect(page.getByRole("article")).toHaveCount(before);
});

test("opens /results and /flight/:id directly from a pasted URL", async ({ page }) => {
  await page.goto(`/results?${BASE}`);
  await expect(page.getByRole("article").first()).toBeVisible();
  await page.goto(`/flight/${DIRECT_ID}?${BASE}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("London → Athens");
  await expect(page.getByRole("region", { name: "Price breakdown" })).toBeVisible();
});

test("reload on the passengers page keeps the trip, which lives in the URL", async ({ page }) => {
  await page.goto(`/passengers?${BASE}&out=${DIRECT_ID}&outFare=standard`);
  const confirm = page.getByRole("button", { name: /Confirm booking/ });
  const label = await confirm.textContent();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Passengers" })).toBeVisible();
  await expect(confirm).toHaveText(label!);
});

test("garbage params show safe defaults or the invalid-search state, never a crash", async ({ page }) => {
  await page.goto("/results?from=ZZZ&to=ZZZ&adults=99&cabin=foo&depart=nope&stops=wat&max=abc&bands=lunch");
  await expect(page.getByRole("article").first()).toBeVisible();

  await page.goto("/results?from=LHR&to=ATH&depart=2020-01-01");
  await expect(page.getByRole("heading", { level: 1, name: "Invalid search" })).toBeVisible();
  await page.getByRole("link", { name: "Change your search" }).click();
  await expect(page.getByRole("button", { name: "Search flights" })).toBeVisible();

  await page.goto("/flight/not-a-flight");
  await expect(page.getByRole("heading", { level: 1, name: "Flight not found" })).toBeVisible();
});

test("keyboard only: can reach and open the first flight", async ({ page }) => {
  await page.goto(`/results?${BASE}`);
  await expect(page.getByRole("article").first()).toBeVisible();
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const onFlightLink = await page.evaluate(() =>
      document.activeElement?.getAttribute("href")?.startsWith("/flight/"),
    );
    if (onFlightLink) break;
  }
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/flight\//);
  await expect(page.getByRole("radio", { name: /Basic/ })).toBeVisible();
});

test("the booking and the trips list survive a reload", async ({ page }) => {
  await page.goto(`/passengers?${BASE}&out=${DIRECT_ID}&outFare=basic`);
  await fillPassengers(page, ["Ada Lovelace"]);
  await page.getByRole("button", { name: /Confirm booking/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Booking confirmed" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Booking confirmed" })).toBeVisible();
  await nav(page).getByRole("button", { name: "Account" }).click();
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await nav(page).getByRole("button", { name: "Trips" }).click();
  await expect(page.getByText("No trips yet.")).toBeVisible();
});
