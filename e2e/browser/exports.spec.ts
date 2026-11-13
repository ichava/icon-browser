import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

/**
 * Schema 1.6.0 in the real app, one of each kind: a Tier 3 code tab (Qwik), an asset export
 * built in the browser (CSS mask, downloaded and read back) and a native entry (a link to the
 * generator's release, not a download the browser cannot make).
 */

async function dismissFirstRun(page: Page) {
  await page.getByRole('button', { name: 'Essential only' }).click({ timeout: 10_000 }).catch(() => {});
  await page.getByRole('button', { name: 'Skip' }).click({ timeout: 10_000 }).catch(() => {});
}

const FIXTURE_ICON_COUNT = JSON.parse(readFileSync(new URL('../../.dev/browser/public/data/icons.json', import.meta.url), 'utf8')).icons.length;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/index.html');
  await dismissFirstRun(page);
  await expect(page.getByText(new RegExp(`${FIXTURE_ICON_COUNT} icons`))).toBeVisible();
  await page.getByPlaceholder('Filter icons…').fill('home');
  await expect(page.getByText(/^2 icons$/)).toBeVisible();
});

test('the Qwik tab copies the generated component import', async ({ page }) => {
  await page.getByRole('gridcell', { name: /^home —/ }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('tab', { name: 'Qwik' }).click();
  await expect(dialog.getByRole('tabpanel')).toContainText("from '@ichava/js-icon-components/qwik/tabler'");
});

test('the CSS mask export downloads one sanitised class per selected icon', async ({ page }) => {
  const tile = page.getByRole('gridcell', { name: /^home —/ }).first();
  await tile.hover();
  await tile.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('button', { name: /^Export/ }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /^CSS mask/ }).click()]);
  expect(download.suggestedFilename()).toBe('ichava-icons.css');
  const css = readFileSync((await download.path())!, 'utf8');
  expect(css.match(/^\.i-tabler-home[\w-]* \{$/gm)).toHaveLength(1);
  expect(css).toContain('mask: url("data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22');
  expect(decodeURIComponent(css)).not.toMatch(/<script|on\w+=/i);
});

test('the native entries link to the generator docs instead of offering a download', async ({ page }) => {
  const tile = page.getByRole('gridcell', { name: /^home —/ }).first();
  await tile.hover();
  await tile.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('button', { name: /^Export/ }).click();
  // The generator has no release yet (re-audit F-03), so each links its export's docs page on main.
  for (const [name, id] of [['Download for Flutter', 'flutter'], ['Download for SwiftUI', 'swiftui']] as const) {
    const link = page.getByRole('link', { name: new RegExp(`^${name}`) });
    await expect(link).toHaveAttribute('href', `https://github.com/ichava/js-icon-components/blob/main/docs/tools/${id}.md`);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).not.toHaveAttribute('download');
  }
});
