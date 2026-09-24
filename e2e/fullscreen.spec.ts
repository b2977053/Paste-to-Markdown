import { test, expect } from '@playwright/test';
import { currentFullscreenElementId } from './helpers';

const FULLSCREEN_BUTTON = '#fullscreen-button';
const WRAPPER = '#wrapper';

test.describe('fullscreen toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the fullscreen button in its initial (non-fullscreen) state', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toContainText('Full screen');
    await expect(button).toHaveAttribute('title', /Alt\+3/);

    // Editor wrapper should not be fullscreen and should not carry the class.
    await expect(page.locator(WRAPPER)).not.toHaveClass(/is-fullscreen/);
    expect(await currentFullscreenElementId(page)).toBeNull();
  });

  test('clicking the button enters and exits fullscreen', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    // Enter fullscreen.
    await button.click();
    await expect(page.locator(WRAPPER)).toHaveClass(/is-fullscreen/);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toContainText('Exit full screen');
    expect(await currentFullscreenElementId(page)).toBe('wrapper');

    // Exit fullscreen.
    await button.click();
    await expect(page.locator(WRAPPER)).not.toHaveClass(/is-fullscreen/);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toContainText('Full screen');
    expect(await currentFullscreenElementId(page)).toBeNull();
  });

  test('Alt+3 keyboard shortcut toggles fullscreen', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    await page.keyboard.press('Alt+Digit3');
    await expect(page.locator(WRAPPER)).toHaveClass(/is-fullscreen/);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(await currentFullscreenElementId(page)).toBe('wrapper');

    await page.keyboard.press('Alt+Digit3');
    await expect(page.locator(WRAPPER)).not.toHaveClass(/is-fullscreen/);
    expect(await currentFullscreenElementId(page)).toBeNull();
  });

  test('Escape while fullscreen does not reset back to the Edit tab', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    // Switch to Preview, then enter fullscreen.
    await page.click('.tab-button[data-tab="preview"]');
    await button.click();
    await expect(page.locator(WRAPPER)).toHaveClass(/is-fullscreen/);
    expect(await currentFullscreenElementId(page)).toBe('wrapper');

    // In a real browser, Escape exits fullscreen natively. The app's keydown
    // handler must NOT also switch back to the Edit tab while fullscreen is
    // still active.
    await page.keyboard.press('Escape');
    await expect(page.locator('.tab-button[data-tab="preview"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('fullscreenchange syncs button state when fullscreen is exited', async ({ page }) => {
    const button = page.locator(FULLSCREEN_BUTTON);

    await button.click();
    await expect(page.locator(WRAPPER)).toHaveClass(/is-fullscreen/);
    await expect(button).toHaveAttribute('aria-pressed', 'true');

    // Exit fullscreen programmatically (equivalent to the browser exiting it,
    // e.g. via the native Escape key behavior).
    await page.evaluate(() => document.exitFullscreen());
    await expect(page.locator(WRAPPER)).not.toHaveClass(/is-fullscreen/);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toContainText('Full screen');
    expect(await currentFullscreenElementId(page)).toBeNull();
  });
});
