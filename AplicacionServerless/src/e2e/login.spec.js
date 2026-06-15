import { test, expect } from "@playwright/test";

test("login page loads", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await expect(
    page.getByRole("heading", { name: "Crear cuenta" })
  ).toBeVisible();
});