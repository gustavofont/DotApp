import type { Page } from "@playwright/test";

export async function loginAsOrfeu(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill("orfeu@email.com");
  await page.getByLabel("Senha").fill("Admin123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/");
}
