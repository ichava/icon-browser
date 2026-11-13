import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * The theme travels with the component, not with the document (FINDINGS N1, N2).
 *
 * N1: every token used to be declared on `:root` / `.dark-mode`, so in a host the tokens
 * lived on the HOST's <html>. A second package built the same way -- the landing page is
 * one -- declares the same names there, and whichever stylesheet loaded last won.
 *
 * N2: overlays portal out of the component root. In a host they landed in <body>, which
 * carries neither the root's `.dark-mode` nor its runtime accent, so a dark dialog read
 * light tokens and inherited the host's text colour.
 *
 * `embedded.html` is a host page whose <body> sets no colour, mounted with the defaults
 * (manageDocument off). These run there, in dark, where both defects showed.
 */

const LANDING_CSS = fileURLToPath(new URL('./fixtures/react-landingpage-styles.css', import.meta.url));
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Tokens a dialog paints with. Read off the component root and off the dialog. */
const TOKENS = ['--fg', '--bg', '--pop', '--border', '--accent', '--color-text-primary', '--color-bg-primary', '--color-border-secondary', '--color-brand-600'];

test.use({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/embedded.html');
  await expect(page.locator('html[data-ichava-mounted]')).toBeAttached({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Essential only' }).click({ timeout: 10_000 }).catch(() => {});
  await page.getByRole('button', { name: 'Skip' }).click({ timeout: 10_000 }).catch(() => {});
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('[data-ichava-root].dark-mode')).toHaveCount(1);
  // The host page sets no text colour, which is what made inheriting from it visible.
  expect(await page.evaluate(() => getComputedStyle(document.body).color)).toBe('rgb(0, 0, 0)');
});

async function openSettings(page: Page) {
  await page.locator('[data-ichava-root]').getByRole('button', { name: /settings/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function openDetail(page: Page) {
  await page.getByRole('grid').getByRole('gridcell').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('tablist')).toBeVisible();
}

/** The root's resolved tokens and text colour, and the open dialog's. */
async function themeOf(page: Page) {
  return page.evaluate((names) => {
    const read = (el: Element) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, tokens: Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()])) };
    };
    const root = document.querySelector('[data-ichava-root]');
    const dialog = document.querySelector('[role="dialog"]');
    return { root: root ? read(root) : null, dialog: dialog ? read(dialog) : null };
  }, TOKENS);
}

async function scanDialog(page: Page, surface: string) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
  const { violations } = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(TAGS).analyze();
  const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  const report = blocking
    .map((v) => `${v.impact} ${v.id} x${v.nodes.length} -- ${v.help}\n${v.nodes.slice(0, 6).map((n) => `    ${n.target.join(' ')}`).join('\n')}`)
    .join('\n');
  expect(blocking, `${surface}: ${blocking.length} blocking axe violation(s)\n${report}`).toEqual([]);
}

for (const [surface, open] of [['settings', openSettings], ['detail', openDetail]] as const) {
  test(`the ${surface} dialog carries the root's theme in a host whose body sets no colour`, async ({ page }) => {
    await open(page);
    const { root, dialog } = await themeOf(page);
    expect(root && dialog).toBeTruthy();
    // The app's own tokens resolve on the root against the root's dark Untitled UI
    // tokens. Declared on :root they resolved against the host <html>, which is light, so
    // an embedded dark browser painted --bg #fff under light-on-dark component text.
    expect(root!.tokens['--fg']).toBe(root!.tokens['--color-text-primary']);
    expect(root!.tokens['--bg']).toBe(root!.tokens['--color-bg-primary']);
    // Every token the dialog paints with resolves to the root's value, not the host's.
    expect(dialog!.tokens).toEqual(root!.tokens);
    // And its text is the theme's foreground, not the host body's black.
    expect(dialog!.color).toBe(root!.color);
    expect(dialog!.color).not.toBe('rgb(0, 0, 0)');
  });

  test(`a second package's stylesheet loaded after ours does not re-theme the ${surface} dialog`, async ({ page }) => {
    await open(page);
    const before = await themeOf(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // The landing page's built stylesheet, after ours: what a host loading both gets.
    await page.addStyleTag({ path: LANDING_CSS });

    await open(page);
    const after = await themeOf(page);
    expect(after.root, 'the component root changed theme once the landing stylesheet loaded').toEqual(before.root);
    expect(after.dialog, `the ${surface} dialog changed theme once the landing stylesheet loaded`).toEqual(before.dialog);
    await scanDialog(page, `${surface} dialog with the landing stylesheet loaded`);
  });
}

/*
 * Tailwind merges every `@layer utilities` on a page, so a host's own `.px-3` loaded after
 * ours used to beat our `.pl-9` on source order: the sidebar filter lost its leading-icon
 * padding and the search icon sat on the placeholder. Our utilities are wrapped in
 * `@scope ([data-ichava-theme])`, and scope proximity outranks source order.
 */
test("a second package's utilities loaded after ours do not override the browser's", async ({ page }) => {
  const filter = page.locator('input[data-role="icon-filter"]');
  const padding = () => filter.evaluate((el) => parseFloat(getComputedStyle(el).paddingInlineStart));
  const before = await padding();
  expect(before, 'the filter has no room for its leading icon').toBeGreaterThanOrEqual(32);

  await page.addStyleTag({ path: LANDING_CSS });
  // Proof the fixture can override us at all: it carries the same `.px-3` utility.
  expect(await page.evaluate(() => [...document.styleSheets].some((s) => {
    try { return [...s.cssRules].some((r) => r.cssText.includes('.px-3')); } catch { return false; }
  }))).toBe(true);

  expect(await padding(), 'the landing stylesheet overrode the filter padding').toBe(before);
});
