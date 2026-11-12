import { test, expect } from '@playwright/test';

/**
 * W1 P1 — pre-change SVG rendering baseline.
 *
 * The plan calls for capturing every pack's current rendering *before* P3-P5 change how
 * SVGs are served, sanitised and id-normalised, and marks it time-critical because it
 * cannot be recreated afterwards. It was to be captured from the Vue app; that is not
 * possible in this checkout, because `browser/vite.config.js` imports
 * `../../../.scripts/vite/vite-configurator.js`, which resolves outside the repo and is
 * absent. The Vue frontend cannot be built here at all.
 *
 * What the baseline is actually protecting is not the Vue chrome but the *icons*: whether
 * a sanitiser strips something a glyph needed, or id normalisation breaks a `<use>`
 * reference or a `clipPath`. Rendering the SVGs directly captures exactly that, and has
 * the side benefit of isolating the thing under test from an app that is being replaced
 * anyway.
 *
 * The sample is by FEATURE, not by pack, because a pack is not an archetype -- 4,000
 * tabler icons are all the same monochrome shape, while five metronic files contain
 * `foreignObject`/`script`/`image`, which is precisely what S1/S2 exist to strip. Sampling
 * three per feature per pack covers every way an SVG here can be structured.
 *
 * Regenerate the fixture with `node scripts/sample-svg-archetypes.mjs`. Do NOT refresh
 * these baselines to make a diff go away: a change here means the pipeline started
 * rendering an icon differently, which is the entire question this suite exists to answer.
 */

type Manifest = { pack: string; feature: string; file: string; bytes: number }[];

test.use({ viewport: { width: 1200, height: 900 } });

test.describe('svg archetype rendering', () => {
  test('the sample covers every feature class', async ({ page }) => {
    await page.goto('/baseline/manifest.json');
    const manifest = JSON.parse(await page.locator('body').innerText()) as Manifest;

    // A baseline over an empty or truncated sample would pass forever while covering
    // nothing, which is the failure mode that makes a suite worse than none.
    expect(manifest.length, 'sample is suspiciously small').toBeGreaterThan(40);
    const features = new Set(manifest.map((m) => m.feature));
    for (const required of ['style_block', 'defs_ids', 'use_ref', 'gradient', 'clip_or_mask', 'own_colour', 'current_color', 'foreign']) {
      expect(features, `no sample for the ${required} archetype`).toContain(required);
    }
  });

  // Directory names, matching `scripts/sample-svg-archetypes.mjs`'s PACKS and the
  // `pack` field it writes into the manifest. All three move together or this
  // loop filters to zero and fails with `no samples for <pack>`.
  for (const pack of ['icon-sets-tabler', 'icon-sets-bundled', 'icon-sets-metronic', 'icon-sets-flag']) {
    test(`${pack} renders as it does today`, async ({ page }) => {
      await page.goto('/baseline/manifest.json');
      const manifest = JSON.parse(await page.locator('body').innerText()) as Manifest;
      const mine = manifest.filter((m) => m.pack === pack);
      expect(mine.length, `no samples for ${pack}`).toBeGreaterThan(0);

      // A contact sheet: every sample at a fixed size on a neutral field, labelled by
      // feature so a diff says which archetype moved rather than just "something changed".
      await page.setContent(`
        <html><body style="margin:0;background:#fff;font:12px/1.4 system-ui">
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:12px">
            ${mine
              .map(
                (m) => `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:4px">
                    <img src="/baseline/${m.file}" width="48" height="48" style="display:block;color:#111"/>
                    <figcaption style="font-size:9px;color:#555;text-align:center;word-break:break-all">${m.feature}</figcaption>
                  </figure>`,
              )
              .join('')}
          </div>
        </body></html>
      `);
      // Same-origin so the <img> sources resolve against the preview server.
      await page.waitForLoadState('networkidle');
      await page.evaluate(async () => {
        await Promise.all(
          Array.from(document.images).map((i) => (i.complete ? null : i.decode().catch(() => null))),
        );
      });

      await expect(page).toHaveScreenshot(`svg-${pack}.png`, {
        animations: 'disabled',
        threshold: 0.02,
        maxDiffPixels: 0,
        fullPage: true,
      });
    });
  }
});
