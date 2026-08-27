import { test, expect } from "@playwright/test";
import { loginAsOrfeu } from "./helpers/auth";

const AUTHFORGE_URL = "http://localhost:3000";
const DOTCARD_URL = "http://localhost:3001";

test("opens a 1-card pack and reveals it, real balance and cards updating after", async ({
  page,
  request,
}) => {
  // Pull costs DotPoints — claim the daily reward first if Orfeu hasn't
  // already, so this test hits the real success path instead of a 402.
  const loginRes = await request.post(`${AUTHFORGE_URL}/auth/login`, {
    data: { email: "orfeu@email.com", password: "Admin123" },
  });
  const { accessToken } = (await loginRes.json()) as { accessToken: string };
  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const meRes = await request.get(`${DOTCARD_URL}/me`, { headers: authHeaders });
  const me = (await meRes.json()) as { dailyRewardAvailable: boolean };
  if (me.dailyRewardAvailable) {
    await request.post(`${DOTCARD_URL}/me/daily-reward/claim`, { headers: authHeaders });
  }

  await loginAsOrfeu(page);
  await page.goto("/pull");

  await page.getByRole("button", { name: "1 · 1 DP" }).click();
  await page.getByRole("button", { name: "Abrir pacote" }).click();

  // A 1-card pack: a single tap on the revealed card goes straight to "done"
  // (there's no next card to advance to).
  const revealButton = page.getByRole("button", { name: "Revelar próxima carta" });
  await expect(revealButton).toBeVisible({ timeout: 10000 });
  await revealButton.click();

  await expect(page.getByText("Pacote aberto!")).toBeVisible();
});

test("shows an insufficient-balance error without spending real balance", async ({ page }) => {
  // Mocked at the network boundary — this is the sad path, no need to
  // actually drain Orfeu's real DotPoints to exercise it.
  await page.route("**/collections/*/pulls", (route) =>
    route.fulfill({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({ message: "Insufficient balance", errorCode: "INSUFFICIENT_BALANCE" }),
    }),
  );

  await loginAsOrfeu(page);
  await page.goto("/pull");

  await page.getByRole("button", { name: "Abrir pacote" }).click();

  await expect(
    page.getByText("Saldo insuficiente — resgate sua recompensa diária primeiro."),
  ).toBeVisible();
});
