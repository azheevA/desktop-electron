const { test, expect } = require("@playwright/test");

function getProjectsNavigation(page) {
  return page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("button", { name: "Проекты", exact: true });
}

test("dashboard renders the main navigation and initial workspace", async ({ page }) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("button", { name: "Обзор", exact: true })).toBeVisible();
  await expect(getProjectsNavigation(page)).toBeVisible();
  await expect(navigation.getByRole("button", { name: /^Задачи(?:\s+\d+)?$/ })).toBeVisible();
});

test("user can create a project and keep it after reload", async ({ page }) => {
  const projectName = `E2E project ${Date.now()}`;

  await page.goto("/");
  await getProjectsNavigation(page).click();
  await page.getByRole("button", { name: "Создать проект", exact: true }).first().click();
  await page.getByRole("textbox", { name: /название/i }).fill(projectName);
  await page.getByRole("dialog").getByRole("button", { name: "Создать проект", exact: true }).click();

  await expect(page.getByRole("heading", { name: projectName, exact: true })).toBeVisible();
  await page.reload();
  await getProjectsNavigation(page).click();
  await expect(page.getByRole("heading", { name: projectName, exact: true })).toBeVisible();
});

test("browser version marks the workspace as non-indexable", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
