import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

/**
 * Nothing overlaps: no control on another control, no control on its tile's icon, no text
 * cut off without an ellipsis, nothing past the edge of the screen.
 *
 * Each surface is scanned at four widths, because every overlap found so far appeared at
 * one width only: the tile buttons covered the icon at any width, the header search lay
 * over the brand and the first action button at 768px, and the phone header ran its last
 * button off the edge. The detector lives in `fixtures/overlap.js`; its exemptions are
 * listed there.
 */

const DETECTOR = fileURLToPath(new URL('./fixtures/overlap.js', import.meta.url));
const WIDTHS = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
] as const;

interface Finding { kind: string; a: string; [k: string]: unknown }

async function scan(page: Page): Promise<Finding[]> {
  const found = await page.evaluate(() => (window as unknown as { __overlap: () => Finding[] }).__overlap());
  // A tooltip is meant to sit over whatever is next to its trigger.
  return found.filter((f) => !(f.kind === 'occluded' && /tooltip/.test(String(f.by))));
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: DETECTOR });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('ichava.browser.v2', JSON.stringify({ state: { tourSeen: true, consent: 'essential' }, version: 3 }));
  });
});

for (const [width, height] of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height } });

    test('the grid, a hovered tile and its tooltip', async ({ page }) => {
      await page.goto('/index.html');
      const tiles = page.locator('[data-icon-id]');
      await expect(tiles.first()).toBeVisible();
      // The bootsplash stays about a second after the grid is ready, by design (#166), and
      // covers everything while it fades. "At rest" means after it has gone.
      await expect(page.locator('.ichbs')).toHaveCount(0);
      expect(await scan(page), 'at rest').toEqual([]);

      const tile = tiles.nth(1);
      await tile.hover();
      const copy = tile.getByRole('button', { name: 'Copy' });
      await expect(copy).toBeVisible();
      // The detector must have something to judge: the tile's controls and its icon.
      expect(await tile.locator('button').count()).toBeGreaterThanOrEqual(3);
      expect(await scan(page), 'tile hovered').toEqual([]);

      await copy.hover();
      const tip = page.getByRole('tooltip');
      await expect(tip).toBeVisible();
      const box = (await tip.boundingBox())!;
      expect(box.x, 'tooltip past the left edge').toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, 'tooltip past the right edge').toBeLessThanOrEqual(width);
    });

    test('the detail dialog and its motion picker', async ({ page }) => {
      await page.goto('/index.html');
      await page.locator('[data-icon-id]').first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      expect(await scan(page), 'dialog').toEqual([]);
      await dialog.getByRole('button', { name: /Motion/ }).click();
      await expect(page.getByRole('searchbox')).toBeVisible();
      expect(await scan(page), 'motion picker open').toEqual([]);
    });

    test('settings and the library', async ({ page }) => {
      await page.goto('/index.html');
      await expect(page.locator('[data-icon-id]').first()).toBeVisible();
      for (const name of ['Settings', 'Collections']) {
        const open = page.getByRole('button', { name, exact: true }).first();
        await open.scrollIntoViewIfNeeded();
        await open.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        expect(await scan(page), name).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
      }
    });
  });
}

test('the detector reports a tile control over the icon', async ({ page }) => {
  // Proof it can fail: put the actions back in the top corner, where they used to be.
  await page.goto('/index.html');
  const tile = page.locator('[data-icon-id]').nth(1);
  await tile.hover();
  await expect(tile.getByRole('button', { name: 'Copy' })).toBeVisible();
  await tile.evaluate((el) => {
    const row = el.querySelector<HTMLElement>('button[aria-label="Copy"]')!.closest<HTMLElement>('div')!;
    row.style.bottom = 'auto';
    row.style.top = '4px';
  });
  expect((await scan(page)).some((f) => f.kind === 'covers-icon')).toBe(true);
});
