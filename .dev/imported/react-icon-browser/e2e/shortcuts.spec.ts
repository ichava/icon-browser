import { test, expect } from '@playwright/test';

/**
 * Keyboard shortcuts that depend on a DOM contract.
 *
 * `useShortcuts` focuses the sidebar filter by querying
 * `input[data-role="icon-filter"]` against the document. That is a runtime contract
 * between a hook and a component's rendered markup, and nothing checked it.
 *
 * It is specifically fragile under the Untitled UI migration: the `Input` wrapper spreads
 * unrecognised props onto react-aria's `TextField`, which renders a `div`. Migrating this
 * field to `Input` rather than `InputBase` would move `data-role` off the `<input>`, the
 * selector would return null, and `/` would silently stop working -- no error, no failing
 * unit test, nothing visible in a screenshot.
 */

const PERSIST_KEY = 'ichava.browser.v2';

/** Past the tour and consent banner, which otherwise swallow the keypress. */
async function seed(page: import('@playwright/test').Page) {
  await page.addInitScript(
    ([key]) => {
      localStorage.clear();
      localStorage.setItem(
        key as string,
        JSON.stringify({ state: { tourSeen: true, consent: 'essential' }, version: 3 }),
      );
    },
    [PERSIST_KEY] as const,
  );
}

test.describe('keyboard shortcuts', () => {
  test('"/" focuses the sidebar icon filter', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // The contract itself: the attribute must be on an <input>, because that is what the
    // hook's selector requires. Asserted separately from the behaviour so a failure says
    // which half broke.
    const filter = page.locator('input[data-role="icon-filter"]');
    await expect(filter).toHaveCount(1);

    // Start from a known-unfocused state; body focus is the page default but be explicit.
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await expect(filter).not.toBeFocused();

    await page.keyboard.press('/');
    await expect(filter).toBeFocused();

    // And the keypress must not leak into the field it just focused.
    await expect(filter).toHaveValue('');
  });

  test('"/" is inert while already typing in a field', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const filter = page.locator('input[data-role="icon-filter"]');
    await filter.click();
    await filter.fill('arrow');
    await page.keyboard.press('/');

    // The guard in the hook is `!typing`. Without it, "/" would be swallowed as a
    // shortcut and never reach the field, so a user could not type a path separator.
    await expect(filter).toHaveValue('arrow/');
  });
});
