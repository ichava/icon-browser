import { test, expect, type Page } from '@playwright/test';

/**
 * Tooltip behaviour.
 *
 * A tooltip that never opens is invisible to every other check in this repo: typecheck
 * passes, no test touches it, and a screenshot of a page with no tooltip showing looks
 * exactly like a page whose tooltips are broken. Migrating the implementation from Radix
 * to react-aria changes what a valid trigger is -- react-aria needs a child that accepts
 * hover and focus props, where Radix needed one that forwards a ref -- so this is the
 * check that the 14 call sites still function.
 */

const PERSIST_KEY = 'ichava.browser.v2';

async function seed(page: Page) {
  await page.addInitScript(
    ([key]) => {
      localStorage.clear();
      localStorage.setItem(key as string, JSON.stringify({ state: { tourSeen: true, consent: 'essential' }, version: 3 }));
    },
    [PERSIST_KEY] as const,
  );
}


/**
 * Hover by moving the pointer IN from somewhere else.
 *
 * A bare `.hover()` moves the mouse straight to the target, and if it already happens to
 * be there (Playwright starts every page at 0,0 and never moves it otherwise) no
 * `pointerenter` fires and react-aria never sees the hover. The first version of these
 * tests failed for that reason and looked like a broken migration.
 */
async function hoverIn(page: Page, locator: ReturnType<Page['locator']>) {
  const box = (await locator.boundingBox())!;
  await page.mouse.move(box.x - 120, box.y + 60);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
}

test.describe('tooltip', () => {
  test('opens on hover and closes on leave', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // The theme toggle: an icon-only button, which is exactly the case tooltips exist for.
    const trigger = page.getByRole('button', { name: /toggle theme/i }).first();
    await expect(trigger).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await hoverIn(page, trigger);
    const tip = page.getByRole('tooltip');
    await expect(tip).toBeVisible();
    await expect(tip).toContainText(/toggle theme/i);

    // Move away; it must close rather than linger over the UI.
    await page.mouse.move(700, 500);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('opens on keyboard focus, not just hover', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Keyboard users get no hover. This is the half of the contract most likely to break
    // silently, because a pointer-driven manual test never exercises it.
    await page.getByRole('button', { name: /toggle theme/i }).first().focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('renders the shortcut hint alongside the label', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // `shortcut` moved from an inline <kbd> to the design system's description slot; this
    // pins that it still reaches the user rather than being dropped by the prop rename.
    await hoverIn(page, page.getByRole('button', { name: /favorites/i }).first());
    const tip = page.getByRole('tooltip');
    await expect(tip).toBeVisible();
    await expect(tip).toContainText(/favorites/i);
    // The modifier differs by platform, so match the digit rather than the glyph.
    await expect(tip).toContainText('1');
  });
});
