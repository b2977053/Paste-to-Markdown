import { test, expect } from '@playwright/test';

test.describe('tabs and theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('switches between Edit and Preview tabs', async ({ page }) => {
    const editButton = page.locator('.tab-button[data-tab="edit"]');
    const previewButton = page.locator('.tab-button[data-tab="preview"]');

    // Default: Edit tab is active.
    await expect(editButton).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#edit-tab')).toHaveClass(/active/);

    await previewButton.click();
    await expect(previewButton).toHaveAttribute('aria-selected', 'true');
    await expect(editButton).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#preview-tab')).toHaveClass(/active/);
  });

  test('Alt+1 and Alt+2 switch tabs via keyboard', async ({ page }) => {
    await page.keyboard.press('Alt+Digit2');
    await expect(page.locator('.tab-button[data-tab="preview"]')).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Alt+Digit1');
    await expect(page.locator('.tab-button[data-tab="edit"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('theme switcher toggles the data-theme attribute', async ({ page }) => {
    const lightButton = page.locator('.theme-button[data-theme-choice="light"]');
    const darkButton = page.locator('.theme-button[data-theme-choice="dark"]');

    await lightButton.click();
    await expect(lightButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await darkButton.click();
    await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
