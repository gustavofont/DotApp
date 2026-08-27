import { test, expect } from "@playwright/test";

test("logs in against the real AuthForge and shows the real profile on Home", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  await page.getByLabel("Email").fill("orfeu@email.com");
  await page.getByLabel("Senha").fill("Admin123");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL("http://localhost:5173/");
  await expect(page.getByText("Orfeu")).toBeVisible();
  await expect(page.getByText("FP8D2LTH")).toBeVisible();

  // Reload — the refresh token in localStorage should keep the session
  // alive instead of bouncing back to /login.
  await page.reload();
  await expect(page).toHaveURL("http://localhost:5173/");
  await expect(page.getByText("Orfeu")).toBeVisible();
});

test("rejects a wrong password with a visible error, no redirect", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  await page.getByLabel("Email").fill("orfeu@email.com");
  await page.getByLabel("Senha").fill("WrongPassword123");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Email ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL("http://localhost:5173/login");
});
