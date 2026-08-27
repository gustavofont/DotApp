import { test, expect } from "@playwright/test";
import { loginAsOrfeu } from "./helpers/auth";

test("shows owned cards with real art and unowned cards locked", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/catalog");

  // Owned (Orfeu has this one) — real art, not locked.
  await expect(page.getByRole("img", { name: "Village Squire" })).toBeVisible();

  // Not owned — locked silhouette, no <img> for it.
  await expect(page.getByLabel("Rusted Sword (ainda não obtida)")).toBeVisible();
});

test("filters the grid by rarity", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/catalog");

  await page.getByRole("button", { name: "EPIC", exact: true }).click();

  await expect(page.getByRole("img", { name: "Young Bronze Dragon" })).toBeVisible();
  await expect(page.getByText("Village Squire")).not.toBeVisible();
});
