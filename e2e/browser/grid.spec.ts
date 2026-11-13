import { test, expect, type Page } from '@playwright/test';

/**
 * Grid geometry.
 *
 * The reported symptom was that icon-grid spacing changed with the size slider. The gap
 * itself never moved -- it is a density constant. What moved was the grid TRACK: the
 * non-virtualised grid floored its columns at 72px while the tile floored its own width at
 * 86px, so at small icon sizes the tiles were wider than the columns holding them and
 * overlapped instead of honouring the gap. Measured at icon size 16: an observed gap of
 * **-2.7px** against a declared 8px.
 *
 * This asserts the invariant directly -- the observed gap equals the declared gap at every
 * size -- rather than asserting the constants, because the bug was that two constants
 * disagreed and each looked correct on its own.
 */

const PERSIST_KEY = 'ichava.browser.v2';

async function seedSize(page: Page, size: number, density: 'compact' | 'comfy' = 'compact') {
  await page.addInitScript(
    ([key, s, d]) => {
      localStorage.clear();
      localStorage.setItem(
        key as string,
        JSON.stringify({ state: { tourSeen: true, consent: 'essential', size: s, density: d }, version: 3 }),
      );
    },
    [PERSIST_KEY, size, density] as const,
  );
}

/** Declared grid gap, and the gaps actually observed between tiles on one row. */
async function measure(page: Page) {
  return page.evaluate(() => {
    const grid = document.querySelector('[role="grid"]') as HTMLElement | null;
    if (!grid) throw new Error('no grid rendered');
    const declared = parseFloat(getComputedStyle(grid).gap);
    // The cells, not the grid's children: since FINDINGS B4 the grid holds rows of cells,
    // and the rows sit `gap` apart just as the cells do.
    const rects = (Array.from(grid.querySelectorAll('[role="gridcell"]')).slice(0, 16) as HTMLElement[]).map((t) =>
      t.getBoundingClientRect(),
    );
    const gaps: number[] = [];
    for (let i = 1; i < rects.length; i++) {
      // Same row only; a wrap would measure the distance back to the left edge.
      if (Math.abs(rects[i]!.top - rects[i - 1]!.top) < 2) {
        gaps.push(Math.round((rects[i]!.left - (rects[i - 1]!.left + rects[i - 1]!.width)) * 10) / 10);
      }
    }
    return { declared, gaps, tileWidth: Math.round(rects[0]!.width) };
  });
}

test.use({ viewport: { width: 1440, height: 900 } });

for (const density of ['compact', 'comfy'] as const) {
  for (const size of [16, 24, 48, 96]) {
    test(`gap holds at icon size ${size} (${density})`, async ({ page }) => {
      await seedSize(page, size, density);
      await page.goto('/index.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(400);

      const { declared, gaps, tileWidth } = await measure(page);

      // Guards against the measurement silently covering nothing.
      expect(gaps.length, 'no adjacent tile pairs found to measure').toBeGreaterThan(2);

      for (const gap of gaps) {
        // Sub-pixel: fractional column widths land tiles on non-integer boundaries.
        expect(
          Math.abs(gap - declared),
          `observed gap ${gap} != declared ${declared} at size ${size}/${density} (tile ${tileWidth}px)`,
        ).toBeLessThanOrEqual(1);
      }

      // The specific failure mode: tiles wider than their column overlap.
      expect(Math.min(...gaps), 'tiles are overlapping').toBeGreaterThan(0);
    });
  }
}
