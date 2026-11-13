import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * The consent notice moves by its grip, with the mouse, by touch and from the keyboard,
 * never leaves the window, and keeps its place for the session.
 */

const MARGIN = 8;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // Once per test, not per navigation: a reload must keep the session's position.
    if (sessionStorage.getItem('__seeded')) return;
    sessionStorage.setItem('__seeded', '1');
    localStorage.clear();
    localStorage.setItem('ichava.browser.v2', JSON.stringify({ state: { tourSeen: true }, version: 3 }));
  });
});

async function open(page: Page) {
  await page.goto('/index.html');
  const notice = page.getByRole('dialog', { name: 'Cookies and storage' });
  await expect(notice).toBeVisible({ timeout: 15_000 });
  // The entrance animation moves it 8px; measure after it has settled.
  await page.waitForTimeout(300);
  return { notice, grip: notice.getByRole('button', { name: 'Move notice' }) };
}

async function box(l: Locator) {
  const b = await l.boundingBox();
  expect(b).not.toBeNull();
  return b!;
}

async function expectInside(page: Page, l: Locator) {
  const b = await box(l);
  const vp = page.viewportSize()!;
  expect(b.x).toBeGreaterThanOrEqual(MARGIN - 0.5);
  expect(b.y).toBeGreaterThanOrEqual(MARGIN - 0.5);
  expect(b.x + b.width).toBeLessThanOrEqual(vp.width - MARGIN + 0.5);
  expect(b.y + b.height).toBeLessThanOrEqual(vp.height - MARGIN + 0.5);
}

test('drags by the grip and stays where it is dropped across a reload', async ({ page }) => {
  const { notice, grip } = await open(page);
  const start = await box(notice);
  const g = await box(grip);

  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
  await page.mouse.down();
  await page.mouse.move(g.x + g.width / 2 + 300, g.y + g.height / 2 - 250, { steps: 8 });
  await page.mouse.up();

  const moved = await box(notice);
  expect(Math.round(moved.x - start.x)).toBe(300);
  expect(Math.round(moved.y - start.y)).toBe(-250);

  // The buttons still answer after a drag.
  await page.reload();
  const again = page.getByRole('dialog', { name: 'Cookies and storage' });
  await expect(again).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(300);
  const restored = await box(again);
  expect(Math.round(restored.x)).toBe(Math.round(moved.x));
  expect(Math.round(restored.y)).toBe(Math.round(moved.y));
  await again.getByRole('button', { name: 'Essential only' }).click();
  await expect(again).toHaveCount(0);
});

test('a drag past the edge stops at the edge', async ({ page }) => {
  const { notice, grip } = await open(page);
  const g = await box(grip);
  await page.mouse.move(g.x + 5, g.y + 5);
  await page.mouse.down();
  await page.mouse.move(5000, -5000, { steps: 4 });
  await page.mouse.up();
  await expectInside(page, notice);
  const b = await box(notice);
  expect(Math.round(b.y)).toBe(MARGIN);
  expect(Math.round(b.x + b.width)).toBe(page.viewportSize()!.width - MARGIN);
});

test('moves from the keyboard, and Home puts it back', async ({ page }) => {
  const { notice, grip } = await open(page);
  const start = await box(notice);
  await grip.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Shift+ArrowUp');
  await expect.poll(async () => Math.round((await box(notice)).x - start.x)).toBe(16);
  await expect.poll(async () => Math.round((await box(notice)).y - start.y)).toBe(-64);
  // The page did not scroll on the arrow keys.
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press('Home');
  await expect.poll(async () => Math.round((await box(notice)).x)).toBe(Math.round(start.x));
  // Tab order after the grip is unchanged: the two answers.
  await page.keyboard.press('Tab');
  await expect(notice.getByRole('button', { name: 'Essential only' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(notice.getByRole('button', { name: 'Accept all' })).toBeFocused();
});

test('is pulled back inside when the window shrinks, and reset when it is too small', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { notice, grip } = await open(page);
  const start = await box(notice);
  const g = await box(grip);
  await page.mouse.move(g.x + 5, g.y + 5);
  await page.mouse.down();
  await page.mouse.move(g.x + 5 + 800, g.y + 5 - 500, { steps: 6 });
  await page.mouse.up();

  await page.setViewportSize({ width: 700, height: 600 });
  await expect.poll(async () => Math.round((await box(notice)).x + (await box(notice)).width)).toBeLessThanOrEqual(700 - MARGIN);
  await expectInside(page, notice);

  // Shorter than the notice: it goes back to its anchor and the session forgets it.
  await page.setViewportSize({ width: 700, height: start.height + MARGIN });
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('ichava.consent.position'))).toBeNull();
  await expect.poll(async () => Math.round((await box(notice)).x)).toBe(Math.round(start.x));
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('drags by touch on the grip', async ({ page }) => {
    const { notice, grip } = await open(page);
    const start = await box(notice);
    const g = await box(grip);
    const x = g.x + g.width / 2;
    const y = g.y + g.height / 2;
    // Pointer events from a touch: down, moves, up, through CDP.
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', px: number, py: number) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: px, y: py }] });
    await touch('touchStart', x, y);
    for (let i = 1; i <= 6; i++) await touch('touchMove', x, y - i * 50);
    await touch('touchEnd', x, y - 300);
    await expect.poll(async () => Math.round((await box(notice)).y - start.y)).toBe(-300);
    await expectInside(page, notice);
  });
});
