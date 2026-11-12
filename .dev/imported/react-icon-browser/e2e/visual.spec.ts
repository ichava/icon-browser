import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression.
 *
 * Pulled forward from R-P12 because R-P7 silently dropped 84 lines of base CSS --
 * box-sizing, the layout reset, the global focus-visible ring, all scrollbar styling and
 * every range-input rule including the colour picker's gradient tracks -- and typecheck,
 * 101 unit tests and 14 behavioural e2e specs all stayed green for two phases. Nothing
 * asserted appearance. This is that missing control.
 *
 * It is not a pixel-perfection exercise. It is a tripwire for the class of change where
 * behaviour is untouched and the UI is quietly wrong.
 *
 * Baselines live in `visual.spec.ts-snapshots/`. Update deliberately with
 * `npm run visual:update` and review the diff -- a baseline refreshed without looking is
 * worse than no baseline, because it converts a caught regression into a committed one.
 */

/** The persist key and schema version the store writes. */
const PERSIST_KEY = 'ichava.browser.v2';

/**
 * Seed a fixed, first-run-free state.
 *
 * Screenshots are worthless if the inputs move, and three things move by default: the
 * product tour and consent banner cover the UI, and the accent/theme are user state.
 * Seeding beats click-dismissal here -- no animation to race, and the appearance knobs
 * land on known values.
 */
async function seed(page: Page, overrides: Record<string, unknown> = {}) {
  await page.addInitScript(
    ([key, state]) => {
      localStorage.clear();
      localStorage.setItem(key as string, JSON.stringify({ state, version: 5 }));
    },
    [
      PERSIST_KEY,
      {
        theme: 'light',
        accent: '#0e7c66',
        radius: 6,
        scale: 'm',
        density: 'compact',
        reduceMotion: false,
        showLabels: true,
        view: 'grid',
        tourSeen: true,
        consent: 'essential',
        ...overrides,
      },
    ] as const,
  );
}

/**
 * Every face these pages paint with, as `document.fonts` specifiers.
 *
 * Geist ships as one variable file per family spanning `100 900`, so all four sans weights
 * resolve to the same face -- they are listed individually anyway, because `check()` is
 * answered per specifier and a future switch back to static instances would otherwise pass
 * here while shipping four faces and loading one.
 *
 * Weights are the ones the pages use: 400 default, 500 `font-medium`, 600 `font-semibold`,
 * 700 `font-bold`, and mono 400/500 for the hero install button and code samples.
 */
const REQUIRED_FONTS: string[] = [
  '400 16px "Geist"',
  '500 16px "Geist"',
  '600 16px "Geist"',
  '700 16px "Geist"',
  '400 16px "Geist Mono"',
  '500 16px "Geist Mono"',
];

/**
 * Webfonts are the one input here that used to arrive after the shot.
 *
 * `await document.fonts.ready` was the guard, and it is not one. It settles when every
 * face the document CURRENTLY KNOWS ABOUT has finished loading -- so while the faces came
 * from a `<link>` to fonts.googleapis.com, the set was empty until that stylesheet landed
 * and `ready` resolved instantly against nothing. Playwright logged "fonts loaded" and shot
 * `landing.html` in a fallback face: a 4,639-pixel diff, stable across both attempts,
 * which is what made it read as a real regression rather than a race.
 *
 * The fix is in `src/styles/theme.css` -- the faces are self-hosted and declared in the
 * render-blocking bundle, so they exist before first paint. This is the matching barrier:
 * `load()` forces each fetch rather than waiting to be told about it, and `check()` then
 * confirms the face is genuinely usable. Asserting the result matters as much as awaiting
 * it. A missing woff2, a renamed family or a `public/fonts` that failed to copy would
 * otherwise reproduce exactly the original failure -- a silent fallback face baked into a
 * baseline -- and this suite exists to catch changes that nothing else notices.
 */
async function fonts(page: Page) {
  const missing = await page.evaluate(async (specs: string[]) => {
    await Promise.all(specs.map((spec) => document.fonts.load(spec)));
    await document.fonts.ready;
    return specs.filter((spec) => !document.fonts.check(spec));
  }, REQUIRED_FONTS);

  expect(
    missing,
    `Self-hosted faces did not load, so this shot would bake in a fallback font. ` +
      `Check public/fonts/*.woff2 and the @font-face block in src/styles/theme.css. ` +
      `Unavailable: ${missing.join(', ')}`,
  ).toEqual([]);
}

/** Wait until nothing is still arriving or animating. */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await fonts(page);
  // `.first()` because the app root and body both match, and a multi-match locator is a
  // strict-mode violation rather than an "any of these" assertion.
  await expect(page.locator('[data-ichava-root], body').first()).toBeVisible();
  await page.waitForTimeout(250);
}

// A fixed viewport: the grid is responsive, and the sidebar becomes a drawer below 860px.
test.use({ viewport: { width: 1440, height: 900 } });

/**
 * Nothing in a baseline may come off the network.
 *
 * Typography is self-hosted now, so this changes no rendering today -- it is here so that
 * reintroducing a Google Fonts `<link>` fails the suite instead of quietly reopening the
 * race it just cost a day to diagnose. Without it, a re-added CDN face would load *most*
 * of the time, and the failure would resurface as unreproducible flake on someone else's
 * branch.
 */
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
});

/**
 * `animations: 'disabled'` freezes CSS animations and transitions for the shot.
 *
 * `threshold` is the important one, and it defaults to 0.2. It is a PER-PIXEL colour
 * distance in YIQ space, applied before `maxDiffPixelRatio` — a pixel whose colour moved
 * less than the threshold is counted as identical, so it never reaches the ratio at all.
 *
 * At the default, this suite was blind to precisely the change it was added to catch.
 * Raising the icon tiles from `#0a0a0a` to `#171717` moved ~590k pixels, 46% of the
 * viewport, and every spec still passed: that delta is about 0.05 in YIQ, well under 0.2.
 * A control that painted the tiles red *did* fail, which made the gate look healthy while
 * it was silently ignoring every subtle colour, contrast and elevation change.
 *
 * 0.02 is tight enough to catch a one-step token remap and still absorb the sub-pixel
 * text antialiasing that varies run to run.
 *
 * The budget is ZERO differing pixels, and that is not aspirational -- it is measured.
 * With `animations: 'disabled'` and `document.fonts.ready` awaited, three consecutive runs
 * against a freshly written baseline differ by nothing at all, so any tolerance is pure
 * blind spot rather than noise headroom.
 *
 * A ratio was tried first and scaled with the frame: 1% of the 940x548 detail dialog
 * allowed 5,150 pixels, more than many whole components, and a bright red tooltip passed.
 * An absolute 400 was better but still too loose -- adding a close button to a dialog, a
 * plainly visible change, registers as **16 pixels**, because the icon is a thin glyph.
 * Anything above zero was going to miss a control of that size somewhere.
 *
 * If this ever flakes on another platform, raise it with the measured number rather than a
 * round one, and record what produced the noise.
 */
const shot = { animations: 'disabled', threshold: 0.02, maxDiffPixels: 0 } as const;

test.describe('browser', () => {
  test('light theme', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await settle(page);
    await expect(page).toHaveScreenshot('browser-light.png', { ...shot, fullPage: false });
  });

  test('dark theme', async ({ page }) => {
    await seed(page, { theme: 'dark' });
    await page.goto('/index.html');
    await settle(page);
    // Both themes, because the token layer defines them independently and a change to
    // one does not imply the other.
    await expect(page).toHaveScreenshot('browser-dark.png', { ...shot, fullPage: false });
  });

  test('toolbar', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await settle(page);
    // Scoped: the toolbar carries the migrated sliders and selects, so it is the surface
    // most likely to shift under R-P9. Unconditional -- an earlier version fell back to
    // the whole app root when the selector missed, which silently duplicated
    // browser-light and asserted nothing about the toolbar.
    const toolbar = page.locator('[data-region="toolbar"]');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveScreenshot('toolbar.png', shot);
  });

  test('sidebar', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await settle(page);
    const sidebar = page.locator('.ich-sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveScreenshot('sidebar.png', shot);
  });
});

test.describe('detail dialog', () => {
  test('open on a known icon', async ({ page }) => {
    await seed(page);
    // Deep-link rather than click: no dependence on grid ordering or pagination.
    await page.goto('/index.html?icon=1');
    await settle(page);
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveScreenshot('detail-dialog.png', shot);
  });
});

test.describe('colour picker', () => {
  test('gradient tracks render', async ({ page }) => {
    // The specific surface R-P7 broke. The hue and lightness sliders are native inputs
    // whose entire purpose is the gradient TRACK; when their CSS vanished they rendered
    // as two default grey sliders and every other check stayed green.
    //
    // Nothing here is conditional. The first version of this test wrapped its assertions
    // in `if (await track.count())`, the picker lives inside a toolbar popover it never
    // opened, so the test passed having asserted nothing -- on the one surface it exists
    // to protect.
    await seed(page);
    await page.goto('/index.html');
    await settle(page);

    // Open the toolbar's colour popover, which is where the picker lives.
    await page.getByRole('button', { name: /^Color$/i }).first().click();
    const hue = page.locator('input.ich-hue');
    await expect(hue).toBeVisible();

    // Assert the RULE, not just the pixels: a gradient is easy to miss in a small diff,
    // and this states the intent in a way a reviewer cannot misread.
    const hasGradient = await page.evaluate(() =>
      Array.from(document.styleSheets).some((sheet) => {
        try {
          return Array.from(sheet.cssRules).some(
            (rule) => rule.cssText.includes('.ich-hue') && rule.cssText.includes('linear-gradient'),
          );
        } catch {
          return false; // cross-origin stylesheet
        }
      }),
    );
    expect(hasGradient, 'a linear-gradient rule for .ich-hue must be present').toBe(true);

    await expect(page.locator('input.ich-light')).toBeVisible();

    // Frame the whole popover, not just the hue track. Scoping the shot to `input.ich-hue`
    // meant migrating the picker's hex and opacity fields to the design system changed
    // nothing any baseline could see -- a gap that opened the moment the shot got narrow.
    const panel = page.locator('.ich-pop').filter({ has: page.locator('input.ich-hue') });
    await expect(panel).toHaveScreenshot('colour-picker.png', shot);
  });
});

test.describe('auth', () => {
  test('sign-in email step', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await settle(page);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible();
    // The email step is now a real <form>, so this also frames the submit button that
    // Enter drives. Both were hand-rolled `onKeyDown` before.
    await expect(dialog.locator('form')).toHaveCount(1);
    await expect(dialog).toHaveScreenshot('auth-signin.png', shot);
  });

  test('create-account form uses the design system password toggle', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await settle(page);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: /create account/i }).first().click();
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible();

    // The hand-rolled Show/Hide text button is gone; the design system's eye toggle
    // replaces it, and its accessible name must be the translated string rather than the
    // component's hardcoded English default.
    const toggle = dialog.getByRole('button', { name: 'Toggle password visibility' });
    await expect(toggle).toHaveCount(1);
    await expect(dialog.locator('input[type="password"]')).toHaveCount(1);

    // Shoot the default, masked state -- that is what a user opening this dialog sees.
    // The reveal behaviour is asserted in `forms.spec.ts`, where a locale other than
    // English can also prove the toggle's label is translated rather than the vendored
    // default. Screenshotting after the click baked the revealed state into the baseline.
    await expect(dialog).toHaveScreenshot('auth-create.png', shot);
  });
});

test.describe('embedded', () => {
  test('host page with the browser mounted', async ({ page }) => {
    await seed(page);
    await page.goto('/embedded.html');
    await settle(page);
    // Guards the embedding contract visually: the host chrome must still be there, and
    // the browser must be themed on its own root rather than inheriting nothing.
    await expect(page).toHaveScreenshot('embedded-host.png', { ...shot, fullPage: false });
  });
});
