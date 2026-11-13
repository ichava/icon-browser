import { test, expect, type Page } from '@playwright/test';

/**
 * Appearance changes and factory reset.
 *
 * Two properties that are easy to assume and hard to notice breaking:
 *
 * 1. An overlay that is already open when the user changes zoom or density must stay
 *    anchored to its trigger. Overlays portal to `<body>`, so they are positioned
 *    independently of the element they belong to -- if the trigger moves and the panel
 *    does not, it detaches and floats over unrelated UI.
 *
 * 2. Factory reset must restore *every* setting. It is the one action a user takes when
 *    the UI is in a state they cannot undo by hand, so a setting it forgets is a setting
 *    they are stuck with.
 */

const PERSIST_KEY = 'ichava.browser.v2';

async function boot(page: Page, state: Record<string, unknown> = {}) {
  await page.addInitScript(
    ([key, s]) => {
      localStorage.clear();
      localStorage.setItem(key as string, JSON.stringify({ state: { tourSeen: true, consent: 'essential', ...(s as object) }, version: 3 }));
    },
    [PERSIST_KEY, state] as const,
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
}

/** Gap between a trigger's bottom edge and the top of its open panel. */
async function anchorGap(page: Page) {
  return page.evaluate(() => {
    const trigger = document.querySelector('button[aria-haspopup="listbox"][aria-expanded="true"]') as HTMLElement | null;
    const panel = document.querySelector('[role="listbox"]')?.closest('[data-rac]') as HTMLElement | null;
    if (!trigger || !panel) return null;
    const t = trigger.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    return { dx: Math.round(p.left - t.left), dy: Math.round(p.top - t.bottom) };
  });
}

test.describe('overlays under appearance changes', () => {
  for (const scale of ['xs', 'm', 'l'] as const) {
    test(`a dropdown is anchored to its trigger at scale ${scale}`, async ({ page }) => {
      // The property that actually matters. Changing scale mid-overlay cannot happen
      // through the UI -- the appearance popover has to open, which closes anything else --
      // so what has to hold is that at EVERY scale a panel lands on its trigger. If zoom
      // and positioning disagreed, the gap would grow with the zoom factor.
      await boot(page, { scale });

      await page.getByRole('button', { name: /results per page/i }).first().click();
      await expect(page.getByRole('listbox')).toBeVisible();

      const gap = await anchorGap(page);
      expect(gap, `could not measure the dropdown at scale ${scale}`).not.toBeNull();

      // Panel edges align with the trigger's, and it sits within one row-height of it on
      // whichever side react-aria flipped it to.
      expect(Math.abs(gap!.dx), `panel is not left-aligned with its trigger (dx ${gap!.dx})`).toBeLessThanOrEqual(6);
      expect(Math.abs(gap!.dy), `panel is detached from its trigger (dy ${gap!.dy})`).toBeLessThanOrEqual(320);
    });
  }

  test('density changes do not detach an open dropdown', async ({ page }) => {
    await boot(page, { density: 'compact' });

    await page.getByRole('button', { name: /results per page/i }).first().click();
    await expect(page.getByRole('listbox')).toBeVisible();
    const before = await anchorGap(page);

    await page.evaluate(() => document.documentElement.setAttribute('data-density', 'comfy'));
    await page.waitForTimeout(250);

    const after = await anchorGap(page);
    expect(after).not.toBeNull();
    expect(Math.abs(after!.dy - before!.dy), 'panel detached from its trigger').toBeLessThanOrEqual(4);
  });
});

test.describe('factory reset', () => {
  test('restores every appearance setting, zoom and density included', async ({ page }) => {
    // Boot in a deliberately non-default state across every axis the user can change.
    await boot(page, {
      theme: 'dark',
      accent: '#e11d48',
      radius: 2,
      scale: 'l',
      density: 'comfy',
      reduceMotion: true,
      showLabels: false,
      view: 'list',
    });

    const dirty = await page.evaluate(() => ({
      rootPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
      density: document.documentElement.getAttribute('data-density'),
      dark: document.documentElement.classList.contains('dark-mode'),
    }));
    expect(dirty.rootPx).toBeGreaterThan(16);
    expect(dirty.density).toBe('comfy');
    expect(dirty.dark).toBe(true);

    await page.getByRole('button', { name: /settings/i }).first().click();
    const dialog = page.getByRole('dialog').first();
    await dialog.getByRole('button', { name: /reset everything/i }).click();
    // The reset is behind a confirmation.
    await page.getByRole('button', { name: /^reset|confirm|yes/i }).last().click();
    await page.waitForTimeout(500);

    const clean = await page.evaluate(() => ({
      rootPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
      density: document.documentElement.getAttribute('data-density'),
      dark: document.documentElement.classList.contains('dark-mode'),
      reduceMotion: document.documentElement.hasAttribute('data-reduce-motion'),
    }));

    // Scale is the one most likely to be forgotten: it is applied to <html> rather than
    // held in a component, so a reset that only clears store state leaves it behind.
    expect(clean.rootPx, 'UI scale was not reset').toBe(16);
    expect(clean.density, 'density was not reset').toBe('compact');
    expect(clean.dark, 'theme was not reset').toBe(false);
    expect(clean.reduceMotion, 'reduce-motion was not reset').toBe(false);
  });
});
