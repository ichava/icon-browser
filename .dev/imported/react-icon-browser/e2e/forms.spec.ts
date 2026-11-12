import { test, expect, type Page } from '@playwright/test';

/**
 * Form behaviour introduced by the Untitled UI migration (R-P9).
 *
 * Two things here cannot be checked from an English screenshot:
 *
 * 1. The password toggle's accessible name. The design system hardcodes
 *    "Toggle password visibility", and the English translation is the same string -- so an
 *    English assertion passes whether or not `passwordToggleLabel` is actually threaded
 *    through `Input` -> `InputBase`. It has to be asserted in another locale to mean
 *    anything, and the prop was in fact destructured-but-not-forwarded on the first
 *    attempt, which typechecks and silently does nothing.
 *
 * 2. Enter-to-submit. The email step and the new-collection row were both driven by
 *    `onKeyDown` handlers that are now real `<form>` submits; only a keypress proves the
 *    form is wired rather than merely present.
 */

const PERSIST_KEY = 'ichava.browser.v2';
/**
 * Locale is deliberately NOT in the persist blob -- `partialize` strips it and `merge`
 * forces it from this shared key, so that one key stays authoritative across the app and
 * any sibling embed. Seeding it inside the blob does nothing.
 */
const LOCALE_KEY = 'ichava.locale';

async function seed(page: Page, opts: { locale?: string; state?: Record<string, unknown> } = {}) {
  await page.addInitScript(
    ([key, localeKey, state, locale]) => {
      localStorage.clear();
      localStorage.setItem(key as string, JSON.stringify({ state, version: 3 }));
      if (locale) localStorage.setItem(localeKey as string, locale as string);
    },
    [PERSIST_KEY, LOCALE_KEY, { tourSeen: true, consent: 'essential', ...opts.state }, opts.locale ?? ''] as const,
  );
}

async function openCreateAccount(page: Page) {
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /sign in|anmelden/i }).first().click();
  await page.getByRole('button', { name: /create account|konto erstellen/i }).first().click();
  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('password visibility toggle', () => {
  test('its accessible name is translated, not the vendored English default', async ({ page }) => {
    await seed(page, { locale: 'de' });
    const dialog = await openCreateAccount(page);

    // The German string from `auth.togglePassword`. If `passwordToggleLabel` were dropped
    // anywhere along the way, the button would still exist and still work -- it would just
    // announce itself in English inside a German UI. That is the whole point of this test.
    await expect(dialog.getByRole('button', { name: 'Passwort ein- oder ausblenden' })).toHaveCount(1);
    await expect(dialog.getByRole('button', { name: 'Toggle password visibility' })).toHaveCount(0);
  });

  test('it reveals and re-hides the password', async ({ page }) => {
    await seed(page);
    const dialog = await openCreateAccount(page);
    const toggle = dialog.getByRole('button', { name: 'Toggle password visibility' });

    await expect(dialog.locator('input[type="password"]')).toHaveCount(1);
    await toggle.click();
    await expect(dialog.locator('input[type="password"]')).toHaveCount(0);
    await toggle.click();
    await expect(dialog.locator('input[type="password"]')).toHaveCount(1);
  });

  test('it is a 24px target with a visible keyboard focus ring', async ({ page }) => {
    // Upstream drew a 16px target (axe target-size) and an unlayered `button:focus
    // { outline: none }` in theme.css erased every Untitled UI outline ring, so this
    // control showed no focus at all from the keyboard.
    await seed(page);
    const dialog = await openCreateAccount(page);
    const toggle = dialog.getByRole('button', { name: 'Toggle password visibility' });
    await dialog.locator('input[type="password"]').focus();
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    // offsetWidth, not getBoundingClientRect(): the dialog opens with a zoom-in-95
    // transform, and a rect read during it reported 23.75px for a 24px box (CI, #106).
    const { style, width } = await toggle.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: (el as HTMLElement).offsetWidth }));
    expect(style).not.toBe('none');
    expect(width).toBeGreaterThanOrEqual(24);
  });
});

test.describe('enter-to-submit', () => {
  test('the sign-in email step advances on Enter', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /sign in/i }).first().click();

    const dialog = page.getByRole('dialog').first();
    await dialog.locator('input[type="email"]').fill('someone@example.com');
    await page.keyboard.press('Enter');

    // Reaching the OTP step is the observable effect of the submit handler running.
    await expect(dialog.locator('input[inputmode="numeric"]')).toHaveCount(6);
  });

  test('a collection is created on Enter, and the field clears', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Collections live behind the library dialog's third tab.
    await page.getByRole('button', { name: /collections/i }).first().click();
    const field = page.getByRole('textbox', { name: /collection/i }).first();
    await expect(field).toBeVisible();
    await field.fill('Nav icons');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Nav icons')).toBeVisible();
    // The submit handler also resets the field; previously the click path and the Enter
    // path each had their own copy of these two statements.
    await expect(field).toHaveValue('');
  });
});
