import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * The pages a user reaches, on a real seeded host: each renders, the browser shows icons,
 * and axe finds nothing serious or critical (WCAG 2.2 A/AA), colour contrast included,
 * which the jsdom suite (pages.a11y.test.tsx) cannot measure.
 */
const prefix = process.env.ICHAVA_E2E_PREFIX ?? 'ichava';
const pages = ['icons', 'favorites', 'collections', 'history', 'command-history', 'packages', 'settings', 'stats'];

test.skip(!process.env.ICHAVA_E2E_URL, 'set ICHAVA_E2E_URL to a seeded host to run these');

for (const page of pages) {
  test(`/${prefix}/${page} renders and passes axe`, async ({ page: p }) => {
    const res = await p.goto(`/${prefix}/${page}`);
    expect(res?.status(), `/${prefix}/${page} status`).toBeLessThan(400);
    await p.waitForLoadState('networkidle');
    const scan = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = scan.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id} (${v.nodes.length})`), `/${prefix}/${page}`).toEqual([]);
  });
}

test('the browser lists icons and opens one', async ({ page: p }) => {
  await p.goto(`/${prefix}/icons`);
  const first = p.locator('[data-ich-tile], [data-ich-row]').first();
  await expect(first).toBeVisible({ timeout: 15_000 });
  await first.click();
  await expect(p.getByRole('dialog')).toBeVisible();
  await expect(p.getByRole('tab', { name: /Blade/ }).first()).toBeVisible();
});
