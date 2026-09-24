import type { Page } from '@playwright/test';

/**
 * Simulates a paste event on the hidden #pastebin element by dispatching a
 * ClipboardEvent carrying a synthetic DataTransfer. Browsers do not allow
 * tests to write to the system clipboard directly, so we inject the event.
 */
export async function pasteIntoPastebin(
  page: Page,
  data: { html?: string; text?: string; rtf?: string },
): Promise<void> {
  await page.evaluate((payload) => {
    const pastebin = document.querySelector('#pastebin');
    if (!pastebin) {
      throw new Error('#pastebin element not found');
    }

    const dt = new DataTransfer();
    if (payload.rtf != null) dt.setData('text/rtf', payload.rtf);
    if (payload.html != null) dt.setData('text/html', payload.html);
    if (payload.text != null) dt.setData('text/plain', payload.text);

    const event = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });
    pastebin.dispatchEvent(event);
  }, data);
}

/**
 * Whether the editor is currently in "focus mode" (page chrome hidden). The
 * app tracks this state with a `is-fullscreen` class on <body>.
 */
export function isFullscreenMode(page: Page): Promise<boolean> {
  return page.evaluate(() => document.body.classList.contains('is-fullscreen'));
}
