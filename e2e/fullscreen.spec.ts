import { test, expect } from '@playwright/test';
import { isFullscreenMode } from './helpers';

const FULLSCREEN_BUTTON = '#fullscreen-button';

test.describe('fullscreen (focus mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the fullscreen button in its initial state', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toContainText('Full screen');
    await expect(button).toHaveAttribute('title', /Alt\+3/);

    // Not in focus mode; page chrome is still visible.
    expect(await isFullscreenMode(page)).toBe(false);
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('#info')).toBeVisible();
    await expect(page.locator('.app-footer')).toBeVisible();
  });

  test('toggling hides page chrome and reveals it again', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    // Enter focus mode: non-editor chrome is hidden, editor remains visible.
    await button.click();
    expect(await isFullscreenMode(page)).toBe(true);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toContainText('Exit full screen');
    await expect(page.locator('.app-header')).toBeHidden();
    await expect(page.locator('#info')).toBeHidden();
    await expect(page.locator('.app-footer')).toBeHidden();
    await expect(page.locator('#wrapper')).toBeVisible();

    // Exit focus mode: chrome is restored.
    await button.click();
    expect(await isFullscreenMode(page)).toBe(false);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toContainText('Full screen');
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.app-footer')).toBeVisible();
  });

  test('Alt+3 keyboard shortcut toggles focus mode', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    await page.keyboard.press('Alt+Digit3');
    expect(await isFullscreenMode(page)).toBe(true);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.app-header')).toBeHidden();

    await page.keyboard.press('Alt+Digit3');
    expect(await isFullscreenMode(page)).toBe(false);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.app-header')).toBeVisible();
  });

  test('Escape exits focus mode without switching back to the Edit tab', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    // Switch to Preview, then enter focus mode.
    await page.click('.tab-button[data-tab="preview"]');
    await button.click();
    expect(await isFullscreenMode(page)).toBe(true);

    // Escape exits focus mode; the active tab must remain Preview.
    await page.keyboard.press('Escape');
    expect(await isFullscreenMode(page)).toBe(false);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.tab-button[data-tab="preview"]')).toHaveAttribute('aria-selected', 'true');
  });
});
