import { test, expect } from '@playwright/test';

/**
 * First run asks one thing at a time (FINDINGS B3).
 *
 * The welcome tour and the consent notice used to open together. The tour is a modal,
 * so its scrim sat over the notice and Playwright's click on "Essential only" was
 * intercepted -- a real user could not answer consent until they dismissed the tour.
 * Consent comes first now, and the tour follows once it is answered.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('consent is answerable on first load, and the tour follows it', async ({ page }) => {
  await page.goto('/index.html');

  const notice = page.getByRole('dialog', { name: 'Cookies and storage' });
  const tour = page.getByRole('dialog', { name: 'Product tour' });
  await expect(notice).toBeVisible({ timeout: 15_000 });
  await expect(tour).toHaveCount(0);

  // A plain click: it fails if anything intercepts it, which is the defect.
  await notice.getByRole('button', { name: 'Essential only' }).click({ timeout: 5_000 });

  await expect(notice).toHaveCount(0);
  await expect(tour).toBeVisible();
  await tour.getByRole('button', { name: 'Skip' }).click();
  await expect(tour).toHaveCount(0);
});

test('an answered consent does not hold back a replayed tour', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ichava.browser.v2', JSON.stringify({ state: { tourSeen: false, consent: 'all' }, version: 3 }));
  });
  await page.goto('/index.html');
  await expect(page.getByRole('dialog', { name: 'Product tour' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('dialog', { name: 'Cookies and storage' })).toHaveCount(0);
});
