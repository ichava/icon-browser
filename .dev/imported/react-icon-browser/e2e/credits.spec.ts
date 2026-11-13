import { test, expect, type Page } from '@playwright/test';

/**
 * Open-source credits marquee.
 *
 * The behaviour is specific and easy to lose in a refactor without anything noticing: it
 * auto-scrolls, pauses when the pointer enters so the reader can scroll it by hand, and
 * resumes when the pointer leaves. None of that is visible to a screenshot, a typecheck or
 * any other test in this repo -- a marquee that has silently stopped moving looks exactly
 * like one that is between frames.
 */

const PERSIST_KEY = 'ichava.browser.v2';

async function openAbout(page: Page) {
  await page.addInitScript(
    ([key]) => {
      localStorage.clear();
      localStorage.setItem(key as string, JSON.stringify({ state: { tourSeen: true, consent: 'essential' }, version: 3 }));
    },
    [PERSIST_KEY] as const,
  );
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');
  // Settings footer links to About; that is the shortest deterministic path (the help
  // menu route needs a popover open first).
  await page.getByRole('button', { name: /settings/i }).first().click();
  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /about/i }).first().click();
  const scroller = page.locator('.ich-marquee-scroll');
  await expect(scroller).toBeVisible();
  return scroller;
}

/** Sample scrollTop twice, `ms` apart. */
async function advance(scroller: ReturnType<Page['locator']>, ms: number) {
  const before = await scroller.evaluate((el) => el.scrollTop);
  await scroller.page().waitForTimeout(ms);
  const after = await scroller.evaluate((el) => el.scrollTop);
  return { before, after };
}

test.describe('credits marquee', () => {
  test('scrolls on its own', async ({ page }) => {
    const scroller = await openAbout(page);

    // Duplicated content is what makes the wrap seamless; without it scrollHeight never
    // exceeds the box and the animation has nowhere to go.
    const { sh, ch } = await scroller.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight }));
    expect(sh, 'credits content is not taller than its box, so it cannot scroll').toBeGreaterThan(ch);

    const { before, after } = await advance(scroller, 900);
    expect(after, `scrollTop did not advance (${before} -> ${after})`).toBeGreaterThan(before);
  });

  test('pauses while the pointer is over it, and resumes after it leaves', async ({ page }) => {
    const scroller = await openAbout(page);
    const box = (await scroller.boundingBox())!;

    // Enter from outside so pointerenter actually fires -- a bare hover() can start and
    // end on the target and never cross its boundary.
    await page.mouse.move(box.x - 80, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 });
    await page.waitForTimeout(150);

    const paused = await advance(scroller, 800);
    expect(
      Math.abs(paused.after - paused.before),
      `still scrolling while hovered (${paused.before} -> ${paused.after})`,
    ).toBeLessThan(2);

    // While paused the reader must be able to scroll it by hand, and the animation must
    // pick up from wherever they left it rather than snapping back.
    await scroller.evaluate((el) => { el.scrollTop = el.scrollTop + 40; });
    const manual = await scroller.evaluate((el) => el.scrollTop);
    expect(manual).toBeGreaterThan(paused.after + 30);

    await page.mouse.move(box.x - 80, box.y - 80);
    await page.waitForTimeout(150);
    const resumed = await advance(scroller, 900);
    expect(resumed.after, 'did not resume after the pointer left').toBeGreaterThan(resumed.before);
  });
});
