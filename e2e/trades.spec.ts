import { test, expect, type APIRequestContext } from "@playwright/test";
import { loginAsOrfeu, loginAsAmiga } from "./helpers/auth";

const AUTHFORGE_URL = "http://localhost:3000";
const DOTCARD_URL = "http://localhost:3001";

function decodeSub(token: string): string {
  const payload = token.split(".")[1];
  const json = Buffer.from(payload, "base64url").toString("utf-8");
  return (JSON.parse(json) as { sub: string }).sub;
}

async function apiLogin(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${AUTHFORGE_URL}/auth/login`, { data: { email, password } });
  const body = (await res.json()) as { accessToken: string };
  return { token: body.accessToken, userId: decodeSub(body.accessToken) };
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Setup lives at the API level, not the UI — it isn't the thing under test,
// and this is a real shared dev account where leftover state (an active
// trade lock, a missing friendship) would otherwise make the test flaky.
async function ensureCleanSlate(
  request: APIRequestContext,
  orfeu: { token: string; userId: string },
  amiga: { token: string; userId: string },
) {
  for (const user of [orfeu, amiga]) {
    const res = await request.get(`${DOTCARD_URL}/trades`, { headers: auth(user.token) });
    const trades = (await res.json()) as { id: string; status: string }[];
    for (const trade of trades) {
      if (trade.status === "AWAITING_COUNTERPART" || trade.status === "AWAITING_CONFIRMATION") {
        await request.post(`${DOTCARD_URL}/trades/${trade.id}/cancel`, {
          headers: auth(user.token),
        });
      }
    }
  }

  const friendsRes = await request.get(`${DOTCARD_URL}/friends`, { headers: auth(orfeu.token) });
  const friendsBody = (await friendsRes.json()) as {
    friends: { userId: string }[];
    pendingInvites: { userId: string; direction: string }[];
  };
  const alreadyFriends = friendsBody.friends.some((f) => f.userId === amiga.userId);
  const pendingFromOrfeu = friendsBody.pendingInvites.some(
    (i) => i.userId === amiga.userId && i.direction === "outgoing",
  );

  if (!alreadyFriends) {
    if (!pendingFromOrfeu) {
      const meRes = await request.get(`${DOTCARD_URL}/me`, { headers: auth(amiga.token) });
      const me = (await meRes.json()) as { friendCode: string };
      await request.post(`${DOTCARD_URL}/friends/invites`, {
        headers: auth(orfeu.token),
        data: { friendCode: me.friendCode },
      });
    }
    await request.post(`${DOTCARD_URL}/friends/invites/${orfeu.userId}/accept`, {
      headers: auth(amiga.token),
    });
  }

  // Both sides need at least one card to offer.
  for (const user of [orfeu, amiga]) {
    const cardsRes = await request.get(`${DOTCARD_URL}/me/cards?limit=1`, {
      headers: auth(user.token),
    });
    const cardsBody = (await cardsRes.json()) as { total: number };
    if (cardsBody.total === 0) {
      await request.post(`${DOTCARD_URL}/collections/1/pulls`, {
        headers: auth(user.token),
        data: { size: 1 },
      });
    }
  }
}

test("propose → counterpart → confirm, and the cards actually swap owners", async ({
  browser,
  request,
}) => {
  const orfeu = await apiLogin(request, "orfeu@email.com", "Admin123");
  const amiga = await apiLogin(request, "amiga@email.com", "Amiga123!");
  await ensureCleanSlate(request, orfeu, amiga);

  const orfeuContext = await browser.newContext();
  const amigaContext = await browser.newContext();
  const orfeuPage = await orfeuContext.newPage();
  const amigaPage = await amigaContext.newPage();

  await loginAsOrfeu(orfeuPage);
  await loginAsAmiga(amigaPage);

  // Orfeu proposes a trade to Amiga.
  await orfeuPage.goto("/trades");
  await orfeuPage.getByRole("button", { name: "Nova troca" }).click();
  await orfeuPage.getByLabel("Amigo").selectOption({ label: "Amiga" });
  const orfeuPicker = orfeuPage.locator("div.max-h-64.overflow-y-auto");
  await expect(orfeuPicker.getByRole("button").first()).toBeVisible();
  const offeredCardName = await orfeuPicker
    .getByRole("button")
    .first()
    .locator("img")
    .getAttribute("alt");
  await orfeuPicker.getByRole("button").first().click();

  // The trade detail opens automatically after creating it.
  await expect(orfeuPage.getByText("Aguardando carta do outro")).toBeVisible();

  // Amiga sees the incoming trade, opens it, and offers her own card back.
  // (Past resolved trades between them stay in the list, so scope to the
  // newest — the list is ordered newest-first — not just any "Orfeu" row.)
  await amigaPage.goto("/trades");
  await amigaPage.getByText("Orfeu").first().click();
  await expect(amigaPage.getByText("Aguardando escolha")).toBeVisible();
  const amigaPicker = amigaPage.locator("div.max-h-64.overflow-y-auto");
  await expect(amigaPicker.getByRole("button").first()).toBeVisible();
  await amigaPicker.getByRole("button").first().click();
  await expect(amigaPage.getByText("Aguardando sua confirmação")).toBeVisible();

  // Orfeu's screen is polling — it should pick up the counterpart and let
  // him confirm, without a manual reload.
  await expect(orfeuPage.getByRole("button", { name: "Confirmar troca" })).toBeVisible({
    timeout: 10_000,
  });
  await orfeuPage.getByRole("button", { name: "Confirmar troca" }).click();
  await expect(orfeuPage.getByText("Concluída")).toBeVisible();

  // Amiga's screen (also polling) reflects the same resolution.
  await expect(amigaPage.getByText("Concluída")).toBeVisible({ timeout: 10_000 });

  // Real backend check: the card Orfeu offered now belongs to Amiga.
  const amigaCardsRes = await request.get(`${DOTCARD_URL}/me/cards?limit=100`, {
    headers: auth(amiga.token),
  });
  const amigaCards = (await amigaCardsRes.json()) as {
    items: { card: { name: string } }[];
  };
  expect(amigaCards.items.some((item) => item.card.name === offeredCardName)).toBe(true);

  await orfeuContext.close();
  await amigaContext.close();
});
