import { test, expect, type Page } from '@playwright/test';

/**
 * UI scale resizes the whole interface, not just the type.
 *
 * The previous implementation scaled `--spacing` and `font-size`, which covers Tailwind
 * utilities and text but not the inline pixel literals the chrome is built from. Measured
 * from scale `m` to `l`: the root font went 13.5px to 15.12px while the header stayed at
 * exactly 48px and the sidebar at 248px — type growing inside furniture that did not.
 *
 * A unit test cannot catch that, because the arithmetic was correct; what was wrong was
 * how much of the UI the arithmetic could reach. So this measures real boxes.
 */

const PERSIST_KEY = 'ichava.browser.v2';

async function measure(page: Page, scale: 'xs' | 'm' | 'l') {
  await page.addInitScript(
    ([key, s]) => {
      localStorage.clear();
      localStorage.setItem(key as string, JSON.stringify({ state: { tourSeen: true, consent: 'essential', scale: s }, version: 3 }));
    },
    [PERSIST_KEY, scale] as const,
  );
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  return page.evaluate(() => {
    const box = (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    };
    return {
      // Scale is applied as root font-size, not zoom -- see the comment in scale's
      // implementation for why zoom had to be reverted.
      rootPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
      header: box('header'),
      sidebar: box('.ich-sidebar'),
    };
  });
}

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('ui scale', () => {
  test('the chrome grows and shrinks with the setting, not only the text', async ({ page }) => {
    const small = await measure(page, 'xs');
    const base = await measure(page, 'm');
    const large = await measure(page, 'l');

    for (const m of [small, base, large]) {
      expect(m.header, 'no header measured').not.toBeNull();
      expect(m.sidebar, 'no sidebar measured').not.toBeNull();
    }

    // The specific regression: these were byte-identical across every scale.
    expect(large.header!.h, 'header did not grow at the larger scale').toBeGreaterThan(base.header!.h);
    expect(small.header!.h, 'header did not shrink at the smaller scale').toBeLessThan(base.header!.h);
    expect(large.sidebar!.w, 'sidebar did not grow').toBeGreaterThan(base.sidebar!.w);
    expect(small.sidebar!.w, 'sidebar did not shrink').toBeLessThan(base.sidebar!.w);

    // And it scales proportionally rather than by some unrelated amount -- within a pixel
    // of the declared multiplier, allowing for sub-pixel rounding.
    expect(Math.abs(large.sidebar!.w - base.sidebar!.w * (large.rootPx / base.rootPx))).toBeLessThanOrEqual(2);
    expect(Math.abs(small.sidebar!.w - base.sidebar!.w * (small.rootPx / base.rootPx))).toBeLessThanOrEqual(2);
  });

  test('the default scale leaves the root font size untouched', async ({ page }) => {
    // A user who never opened the appearance menu must get the app at 1:1.
    const base = await measure(page, 'm');
    expect(base.rootPx).toBe(16);
  });
});
