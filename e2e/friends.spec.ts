import { test, expect, type Page, type Locator } from "@playwright/test";
import { loginAsOrfeu, loginAsAmiga } from "./helpers/auth";

// The friend code paragraph starts as "…" until GET /me resolves — wait for
// the real 8-char code before reading it, or tests race the query.
async function getOwnFriendCode(page: Page): Promise<string> {
  const codeLocator = page.locator("p.font-serif.text-lg");
  await expect(codeLocator).toHaveText(/^[A-Z0-9]{8}$/);
  return (await codeLocator.textContent())!.trim();
}

test("shows an inline error when inviting yourself", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/friends");

  const ownCode = await getOwnFriendCode(page);
  await page.getByLabel("Código de amigo").fill(ownCode);
  await page.getByRole("button", { name: "Convidar" }).click();

  await expect(page.getByText(/yourself/i)).toBeVisible();
});

test("rotating the friend code changes it", async ({ page }) => {
  await loginAsOrfeu(page);
  await page.goto("/friends");

  const before = await getOwnFriendCode(page);

  await page.getByRole("button", { name: "Rotacionar" }).click();
  await expect(page.locator("p.font-serif.text-lg")).not.toHaveText(before);
});

// Orfeu is a real dev account that may already have other friends/invites
// from prior manual testing — every lookup below is scoped to the row
// naming "Amiga" specifically, never to "the first button on the page".
function rowFor(page: Page, name: string, buttonName: string): Locator {
  return page
    .locator("div")
    .filter({ hasText: name })
    .filter({ has: page.getByRole("button", { name: buttonName }) })
    .last();
}

test("invite → accept → unfriend, visible on both sides", async ({ browser }) => {
  const orfeuContext = await browser.newContext();
  const amigaContext = await browser.newContext();
  const orfeuPage = await orfeuContext.newPage();
  const amigaPage = await amigaContext.newPage();

  await loginAsOrfeu(orfeuPage);
  await loginAsAmiga(amigaPage);

  await amigaPage.goto("/friends");
  const amigaCode = await getOwnFriendCode(amigaPage);

  // Defensive cleanup: if a prior interrupted run left these two friended or
  // mid-invite, clear it so this run starts from a known state. A successful
  // action invalidates the ["friends"] query and re-renders on its own — no
  // reload needed, and reloading right after the click would race the
  // in-flight mutation.
  await orfeuPage.goto("/friends");
  for (const buttonName of ["Desfazer", "Cancelar", "Recusar"]) {
    const row = rowFor(orfeuPage, "Amiga", buttonName);
    if (await row.isVisible().catch(() => false)) {
      await row.getByRole("button", { name: buttonName }).click();
      await expect(row).not.toBeVisible();
    }
  }

  // Orfeu invites Amiga.
  await orfeuPage.getByLabel("Código de amigo").fill(amigaCode);
  await orfeuPage.getByRole("button", { name: "Convidar" }).click();
  await expect(orfeuPage.getByText("Amiga")).toBeVisible();

  // Amiga sees the incoming invite and accepts.
  await amigaPage.reload();
  await expect(amigaPage.getByText("Orfeu")).toBeVisible();
  await amigaPage.getByRole("button", { name: "Aceitar" }).click();

  // Both sides now list each other as a friend.
  await expect(rowFor(amigaPage, "Orfeu", "Desfazer")).toBeVisible();
  await orfeuPage.reload();
  const orfeuFriendRow = rowFor(orfeuPage, "Amiga", "Desfazer");
  await expect(orfeuFriendRow).toBeVisible();

  // Unfriend from Orfeu's side, leaving state clean for future runs.
  await orfeuFriendRow.getByRole("button", { name: "Desfazer" }).click();
  await expect(orfeuFriendRow).not.toBeVisible();

  await orfeuContext.close();
  await amigaContext.close();
});
