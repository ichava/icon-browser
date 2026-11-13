import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * axe gate: zero critical or serious WCAG violations on the three surfaces the audit
 * scanned (FINDINGS B4, B5) -- the main view, the icon detail dialog and the command
 * palette -- in both themes.
 *
 * The theme is chosen through `prefers-color-scheme` with no stored preference, so this
 * also exercises L9: a first load follows the system scheme. The structural rules are
 * pinned in jsdom too (resources/js/IchavaBrowser.a11y.test.tsx); colour contrast needs a real
 * renderer, which is why this suite exists.
 *
 * Moderate and minor findings are not gated here. Lower the bar only with a reason.
 *
 * The main view is also scanned in a non-default state -- an icon favourited and both
 * sidebar filters typed into, so the grid is empty -- because the default state hid three
 * failures: the Favorites button's visible count was not in its name, the two filter
 * clear buttons were 17-18px targets, and the active-search chip's text failed contrast
 * in dark. Each of those controls only renders once state exists.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function scan(page: Page, surface: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  const report = blocking
    .map(
      (v) =>
        `${v.impact} ${v.id} x${v.nodes.length} -- ${v.help}\n` +
        v.nodes
          .slice(0, 8)
          .map((n) => `    ${n.target.join(' ')}\n      ${(n.failureSummary ?? '').split('\n').slice(1).join(' | ')}`)
          .join('\n'),
    )
    .join('\n');
  expect(blocking, `${surface}: ${blocking.length} blocking axe violation(s)\n${report}`).toEqual([]);
}

async function firstRun(page: Page) {
  await page.getByRole('button', { name: 'Essential only' }).click({ timeout: 10_000 }).catch(() => {});
  await page.getByRole('button', { name: 'Skip' }).click({ timeout: 10_000 }).catch(() => {});
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe (${scheme})`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 1440, height: 900 } });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => localStorage.clear());
      await page.goto('/index.html');
      await firstRun(page);
      await expect(page.getByRole('grid')).toBeVisible();
      // L9: with nothing stored, the app follows the system scheme.
      const dark = page.locator('[data-app="ichava-browser"].dark-mode');
      await (scheme === 'dark' ? expect(dark).toHaveCount(1) : expect(dark).toHaveCount(0));
      await page.evaluate(() => document.fonts.ready);
    });

    test('main view', async ({ page }) => {
      await scan(page, 'main view');
    });

    test('main view with a favourite and filters that match nothing', async ({ page }) => {
      const tile = page.getByRole('grid').getByRole('gridcell').first();
      await tile.focus();
      await page.keyboard.press('f');
      await expect(page.getByRole('button', { name: /favorites/i }).first()).toContainText('1');
      await page.locator('[data-role="icon-filter"]').fill('zz-no-such-icon-zz');
      // Wait for the (debounced) search to land before typing the category filter: when
      // it lands it resets that filter, so typing first loses the text.
      await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible();
      await page.getByRole('textbox', { name: /filter categories/i }).fill('zz');
      // Both filter clear buttons must be on screen, or the scan proves nothing about them.
      await expect(page.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(2);
      // Let the empty state's entrance animation finish: a fade measured mid-way reads as
      // a contrast failure that no user sees. Infinite animations (spinners) are ignored.
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
      );
      await scan(page, 'main view (favourite, empty filters)');
    });

    test('detail dialog', async ({ page }) => {
      // Scoped to the icon grid: the sidebar's category tree is a react-aria treegrid,
      // whose cells are gridcells too.
      await page.getByRole('grid').getByRole('gridcell').first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('tablist')).toBeVisible();
      await scan(page, 'detail dialog');
    });

    test('command palette', async ({ page }) => {
      await page.keyboard.press('ControlOrMeta+k');
      const input = page.getByRole('combobox', { name: 'Type a command or search icons…' });
      await expect(input).toBeVisible();
      // Empty query first: the action rows, whose shortcut keycaps are visible text that
      // must also be in each option's name (label-content-name-mismatch).
      await expect(page.getByRole('listbox').getByRole('option').first()).toBeVisible();
      await scan(page, 'command palette (actions)');
      await input.fill('ho');
      await expect(page.getByRole('listbox').getByRole('option').first()).toBeVisible();
      await scan(page, 'command palette');
    });
  });
}
