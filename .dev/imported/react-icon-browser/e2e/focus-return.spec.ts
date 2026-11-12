import { expect, test } from '@playwright/test';

/**
 * A6-gaps G6: closing a dialog never drops focus to <body> (WCAG 2.4.3).
 *
 * The command palette hands off to the detail dialog when a result is chosen, and then
 * unmounts. The detail used to restore focus to the palette that had opened it, which no
 * longer existed, so Esc left focus on <body> and a keyboard user had to start again
 * from the top of the page.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/index.html');
  await page.getByRole('button', { name: 'Essential only' }).click({ timeout: 10_000 }).catch(() => {});
  await page.getByRole('button', { name: 'Skip' }).click({ timeout: 10_000 }).catch(() => {});
  await expect(page.getByRole('grid')).toBeVisible();
});

const focused = (page: import('@playwright/test').Page) =>
  page.evaluate(() => ({ tag: document.activeElement?.tagName, inRoot: !!document.activeElement?.closest('[data-ichava-root]') }));

test('palette -> open an icon -> Esc returns focus into the browser', async ({ page }) => {
  await page.keyboard.press('ControlOrMeta+k');
  const input = page.getByRole('combobox').first();
  await input.fill('home');
  await expect(page.getByRole('listbox').getByRole('option').first()).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('tablist')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await focused(page)).toEqual({ tag: expect.not.stringMatching(/^BODY$/), inRoot: true });
});

test('tile -> detail -> Esc still returns focus to the tile', async ({ page }) => {
  const tile = page.getByRole('grid').getByRole('gridcell').first();
  await tile.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tile).toBeFocused();
});
