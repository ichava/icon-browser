import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

// The first-run product tour and the cookie-consent notice now render as proper
// modals (the tour is a focus-trapping Radix dialog that makes the rest of the
// page inert). Dismiss both before driving the app underneath, or every
// getByRole against the header/grid times out behind the tour.
//
// Consent first: the tour now waits until consent is answered (FINDINGS B3), so
// clicking Skip first would wait out its timeout and then leave the tour open.
async function dismissFirstRun(page: Page) {
  const consent = page.getByRole('button', { name: 'Essential only' });
  await consent.click({ timeout: 10_000 }).catch(() => {});
  const skip = page.getByRole('button', { name: 'Skip' });
  await skip.click({ timeout: 10_000 }).catch(() => {});
}

// Every icon in the generated fixture, read from the fixture rather than written
// down. The catalog is generated from the real installed packs (`npm run fixture`),
// so the sample size moves whenever a pack gains or loses assets -- and a literal
// here goes stale in the direction that fails loudly much later.
//
// It was `/160 icons/`, with a comment explaining that emoji shipped no SVGs and
// was installed-but-not-loaded. That stopped being true when the pack got its
// assets; the next regeneration made it 200 and every spec in this file failed on
// a `beforeEach` that had nothing to do with what they test.
const FIXTURE_ICON_COUNT = JSON.parse(
  readFileSync(new URL('../../.dev/browser/public/data/icons.json', import.meta.url), 'utf8'),
).icons.length;
const ALL_FIXTURE_ICONS = new RegExp(`${FIXTURE_ICON_COUNT} icons`);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/index.html');
  await dismissFirstRun(page);
  await expect(page.getByText(ALL_FIXTURE_ICONS)).toBeVisible();
});

test('renders the catalog and filters by search', async ({ page }) => {
  // By role, not by text: "Packages" also appears as an option in the scope select, which
  // react-aria mirrors into a hidden native <select>, so a text match hits two elements.
  await expect(page.getByRole('heading', { name: 'Packages' })).toBeVisible();
  const filter = page.getByPlaceholder('Filter icons…');
  await filter.fill('home');
  // Two, not one: the fixture carries `home` in both tabler variants, outline and
  // filled. Asserting the exact count is deliberate -- it pins that variants are
  // distinct catalog entries rather than being collapsed by name.
  await expect(page.getByText(/^2 icons$/)).toBeVisible();
  await filter.fill('');
  await expect(page.getByText(ALL_FIXTURE_ICONS)).toBeVisible();
});

/**
 * Bring a known tile onto the current page.
 *
 * The grid paginates at 60, so whether a given tile is on page one depends on
 * where its name sorts within the current selection. Filtering first makes these
 * tests independent of both the page size and the default package selection,
 * rather than relying on "home" happening to fall inside the first page.
 */
async function focusTile(page: Page, name: string) {
  await page.getByPlaceholder('Filter icons…').fill(name);
  // A gridcell, not a button: the grid is rows of cells since FINDINGS B4.
  const tile = page.getByRole('gridcell', { name: new RegExp(`^${name} —`) }).first();
  await expect(tile).toBeVisible();
  return tile;
}

test('opens the icon detail dialog and deep-links via the URL', async ({ page }) => {
  await (await focusTile(page, 'home')).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Copy SVG')).toBeVisible();
  await expect(page).toHaveURL(/icon=\d+/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('command palette opens with the keyboard shortcut', async ({ page }) => {
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.getByPlaceholder('Type a command or search icons…')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByPlaceholder('Type a command or search icons…')).toBeHidden();
});

test('theme toggles to dark', async ({ page }) => {
  await page.getByRole('button', { name: /Toggle theme/ }).click();
  await expect(page.locator('[data-app="ichava-browser"].dark-mode')).toBeVisible();
});

test('grid tile keyboard shortcut F favorites', async ({ page }) => {
  const tile = await focusTile(page, 'home');
  await tile.focus();
  await page.keyboard.press('f');
  // the tile's own accessible name reflects the favorited state
  await expect(page.getByRole('gridcell', { name: /^home —.*favorited/ })).toBeVisible();
});

// The prepaint loader is plain HTML in index.html, so it paints before the bundle; the
// bootsplash takes it down as it mounts, and nothing is left over the app.
test('the prepaint loader is served first and leaves once the app mounts', async ({ page, request }) => {
  const html = await (await request.get('/index.html')).text();
  const at = html.indexOf('id="ichava-prepaint"');
  expect(at, 'prepaint missing or not in <body>').toBeGreaterThan(html.indexOf('</head>'));
  expect(at).toBeLessThan(html.indexOf('<div id="root">'));
  await page.goto('/index.html');
  await dismissFirstRun(page);
  await expect(page.getByRole('grid')).toBeVisible();
  await expect(page.locator('#ichava-prepaint')).toHaveCount(0);
});
