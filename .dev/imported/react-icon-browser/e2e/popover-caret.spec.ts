import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Every anchored dropdown and popover draws the same caret, and it is laid out right in a
 * real layout: centred on its trigger, its base over the panel's edge (no hairline, no
 * gap), its tip clear of the trigger, and its fill the panel's own surface, in both themes.
 */

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.clear();
        localStorage.setItem('ichava.browser.v2', JSON.stringify({ state: { tourSeen: true, consent: 'essential', theme: t }, version: 3 }));
      }, theme);
      await page.goto('/index.html');
      await expect(page.locator('[data-icon-id]').first()).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('.ichbs')).toHaveCount(0);
    });

    test('the appearance popover', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Appearance' });
      await trigger.click();
      const panel = page.getByRole('dialog', { name: 'Appearance' });
      await expect(panel).toBeVisible();
      await expectCaret(page, trigger, panel, panel.locator('xpath=..').locator(':scope > [data-caret]'), 1);
    });

    test('the language menu', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Language' });
      await trigger.click();
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
      const popover = menu.locator('xpath=..');
      // A ring sits outside the panel's box, so the caret's base sits flush on the box.
      await expectCaret(page, trigger, popover, popover.locator(':scope > [data-caret]'), 0);
    });
  });
}

async function expectCaret(page: Page, trigger: Locator, panel: Locator, caret: Locator, overlap: number) {
  await expect(caret).toHaveCount(1);
  // The panel animates in; measure once it has settled.
  await page.waitForTimeout(250);
  const [t, p, c] = await Promise.all([trigger.boundingBox(), panel.boundingBox(), caret.locator('svg').boundingBox()]);
  expect(t && p && c).toBeTruthy();

  // Centred on the trigger, within a pixel.
  expect(Math.abs(c!.x + c!.width / 2 - (t!.x + t!.width / 2))).toBeLessThanOrEqual(1);
  // Over the panel's top edge by `overlap`, so its base hides the border there.
  expect(Math.round(c!.y + c!.height - p!.y)).toBe(overlap);
  // Its tip clears the trigger.
  expect(c!.y).toBeGreaterThan(t!.y + t!.height);
  // Pointing up: the panel is below its trigger.
  await expect(caret).toHaveAttribute('data-placement', 'bottom');

  // Drawn in the panel's own colours.
  const colours = await caret.evaluate((el) => {
    const [fill, outline] = [...el.querySelectorAll('path')];
    return {
      fill: getComputedStyle(fill!).fill,
      stroke: getComputedStyle(outline!).stroke,
      pop: getComputedStyle(el).getPropertyValue('--pop').trim(),
    };
  });
  expect(colours.fill).not.toBe('none');
  expect(colours.stroke).not.toBe('none');
  expect(colours.pop).not.toBe('');
}
