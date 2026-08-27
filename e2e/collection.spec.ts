import { test, expect } from "@playwright/test";
import { loginAsOrfeu } from "./helpers/auth";

test("groups duplicate copies with a counter and expands to individual floats", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/collection");

  const goldenPlainsRow = page.getByRole("button", { name: /Golden Plains/ });
  await expect(goldenPlainsRow).toBeVisible();
  await expect(goldenPlainsRow.getByText("×2")).toBeVisible();

  // A single-copy card shows no counter badge.
  const villageSquireRow = page.getByRole("button", { name: /Village Squire/ });
  await expect(villageSquireRow.getByText(/^×/)).toHaveCount(0);

  // Expanding reveals both individual exemplars with their own float values.
  await goldenPlainsRow.click();
  await expect(page.getByText("float 0.1673458")).toBeVisible();
  await expect(page.getByText("float 0.5301115")).toBeVisible();
});
