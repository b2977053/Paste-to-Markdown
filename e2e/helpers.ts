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
 * Reads the id of the element currently in fullscreen (or null).
 */
export function currentFullscreenElementId(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const el = document.fullscreenElement || (document as any).webkitFullscreenElement;
    return el ? (el as HTMLElement).id : null;
  });
}
