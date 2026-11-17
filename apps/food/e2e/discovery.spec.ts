import { expect, test } from "@playwright/test";

test("filters places with the filter sheet and live counts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("12 places")).toBeVisible();

  await page.getByRole("button", { name: "Filters" }).click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog.getByRole("button", { name: "Show 12 places" })).toBeVisible();

  await dialog.getByRole("button", { name: "Free 6" }).click();
  await expect(dialog.getByRole("button", { name: "Show 6 places" })).toBeVisible();
  // la lista sotto non cambia finché non si conferma
  await expect(page.getByText("12 places")).toBeVisible();

  await dialog.getByRole("button", { name: "Show 6 places" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("6 places")).toBeVisible();
  await expect(page.getByRole("button", { name: "Filters, 1 active" })).toBeVisible();
});

test("closes the filter sheet with Escape and discards the draft", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Filters" }).click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await dialog.getByRole("button", { name: "Free 6" }).click();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByText("12 places")).toBeVisible();
  // il focus torna al pulsante che ha aperto il pannello
  await expect(page.getByRole("button", { name: "Filters" })).toBeFocused();
});

test("keeps keyboard focus inside the open sheet", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Filters" }).click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog).toBeFocused();

  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[role="dialog"]')),
    );
    expect(inside).toBe(true);
  }
});

test("keyboard focus on a card draws a visible ring around the whole card", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Salt & Lime", exact: true });
  await expect(link).toBeVisible();

  // Si arriva al link con Tab, come farebbe chi usa la tastiera.
  for (let i = 0; i < 40 && !(await link.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(link).toBeFocused();

  const ring = await link.evaluate((el) => {
    const after = getComputedStyle(el, "::after");
    const own = getComputedStyle(el);
    const card = el.closest("article")!.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return {
      afterOutlineWidth: after.outlineWidth,
      afterOutlineStyle: after.outlineStyle,
      ownOutlineStyle: own.outlineStyle,
      linkIsSmallerThanCard: box.height < card.height / 2,
    };
  });
  expect(ring.afterOutlineStyle).toBe("solid");
  expect(ring.afterOutlineWidth).toBe("2px");
  expect(ring.ownOutlineStyle).toBe("none"); // niente anello doppio sul solo testo
  expect(ring.linkIsSmallerThanCard).toBe(true); // il testo è piccolo, l'anello copre la card
});

test("switches between card and list layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("article").first()).toBeVisible();
  await page.getByRole("button", { name: "List layout" }).click();
  await expect(page.getByRole("button", { name: "List layout" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  // nella lista la cucina ha la sua riga e non è mai tagliata
  const cuisine = page.getByRole("article").first().getByText("Tacos and ceviche");
  const cut = await cuisine.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(cut).toBe(false);
});

test("searches for a dish and opens the restaurant that serves it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Search places/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Search" })).toBeVisible();

  await page.getByRole("searchbox").fill("shakshuka");
  await page.getByRole("link", { name: /Shakshuka/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sunny Side" })).toBeVisible();
});

test("shows an empty state for a search without results", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox").fill("pizza");
  await expect(page.getByRole("heading", { name: /No results for/ })).toBeVisible();
});
