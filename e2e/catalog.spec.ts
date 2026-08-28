import { test, expect } from "@playwright/test";
import { loginAsOrfeu } from "./helpers/auth";

// Orfeu is a real, shared dev account — other sessions pull packs against it
// concurrently, so exact ownership (which cards, how many copies) drifts
// between runs. These tests assert on the *mechanism* (some owned card shows
// real art, some locked card shows a silhouette, a duplicate shows one grade
// per copy) instead of hardcoding specific card names/counts.

test("shows owned cards with real art and unowned cards locked", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/catalog");

  // At least one owned card renders as a real <img>.
  await expect(page.getByRole("img").first()).toBeVisible();

  // At least one unowned card renders as a locked silhouette.
  await expect(page.getByLabel(/\(ainda não obtida\)$/).first()).toBeVisible();
});

test("filters the grid by rarity", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/catalog");

  await page.getByRole("button", { name: "EPIC", exact: true }).click();

  await expect(page.getByRole("img", { name: "Young Bronze Dragon" })).toBeVisible();
  await expect(page.getByText("Village Squire")).not.toBeVisible();
});

test("shows a duplicate badge and opens the detail popup with one grade per copy", async ({
  page,
}) => {
  await loginAsOrfeu(page);
  await page.goto("/catalog");

  const tile = page.getByRole("button").filter({ hasText: /×\d+/ }).first();
  await expect(tile).toBeVisible();
  const badgeText = await tile.getByText(/^×\d+$/).textContent();
  const count = Number(badgeText!.replace("×", ""));

  await tile.click();

  const dialog = page.getByRole("dialog");
  // +1: the card's own label also shows a "GR X.X" grade for the best
  // (lowest-float) exemplar, on top of the one row per copy in the list below.
  await expect(dialog.getByText(/^GR /)).toHaveCount(count + 1);
});

test("shows no duplicate badge for a single-copy owned card", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/catalog");

  const ownedTiles = page.getByRole("button").filter({ has: page.getByRole("img") });
  const singleCopyTile = ownedTiles.filter({ hasNotText: /×\d+/ }).first();

  await expect(singleCopyTile).toBeVisible();
  await expect(singleCopyTile.getByText(/^×\d+$/)).toHaveCount(0);
});

test("opens the popup for an unowned card without a grade list", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/catalog");

  const lockedTile = page
    .getByRole("button")
    .filter({ has: page.getByLabel(/\(ainda não obtida\)$/) })
    .first();
  await lockedTile.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Ainda não obtida.")).toBeVisible();
  await expect(dialog.getByText(/^GR /)).toHaveCount(0);
});
