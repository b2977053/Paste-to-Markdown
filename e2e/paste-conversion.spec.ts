import { test, expect } from '@playwright/test';
import { pasteIntoPastebin } from './helpers';

const OUTPUT = '#output';

test.describe('paste conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('converts pasted HTML into Markdown', async ({ page }) => {
    await pasteIntoPastebin(page, {
      html: '<h1>Hello World</h1><p>This is a <strong>bold</strong> statement with a <a href="https://example.com">link</a>.</p>',
    });

    const output = page.locator(OUTPUT);
    await expect(output).toHaveValue(/# Hello World/);
    await expect(output).toHaveValue(/\*\*bold\*\*/);
    await expect(output).toHaveValue(/\[link\]\(https:\/\/example\.com\)/);

    // The editor panel should become visible once content is pasted.
    await expect(page.locator('#wrapper')).toBeVisible();
  });

  test('converts plain text (no HTML) into Markdown', async ({ page }) => {
    await pasteIntoPastebin(page, {
      text: 'Just some plain text\nwith a second line',
    });

    const output = page.locator(OUTPUT);
    await expect(output).toHaveValue(/Just some plain text/);
    await expect(output).toHaveValue(/with a second line/);
  });

  test('converts HTML lists into Markdown list items', async ({ page }) => {
    await pasteIntoPastebin(page, {
      html: '<ul><li>First item</li><li>Second item</li></ul>',
    });

    const output = page.locator(OUTPUT);
    await expect(output).toHaveValue(/- First item/);
    await expect(output).toHaveValue(/- Second item/);
  });

  test('preview sanitizes raw HTML and strips script tags', async ({ page }) => {
    // Fill the output directly with Markdown that contains a raw <script>.
    await page.fill(OUTPUT, '# Title\n\n<script>window.__xss = true;<\/script>\n\nParagraph');
    await page.click('.tab-button[data-tab="preview"]');

    const preview = page.locator('#preview');
    await expect(preview.locator('h1')).toHaveText('Title');
    await expect(preview.locator('script')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  });
});
