import { test, expect, type Page } from '@playwright/test';

/**
 * The embedding contract, as a test rather than a promise.
 *
 * Every assertion here corresponds to something the browser previously DID do:
 * it toggled `.dark` on `<html>`, wrote six design tokens plus `data-density` and
 * `data-reduce-motion` to `documentElement`, overwrote `lang` and `dir`, replaced
 * `document.title` and the description `<meta>`, and rebuilt the entire query string
 * on first render -- which erased the `ui=react` flag that selected React in the
 * first place, so the kill switch defeated itself.
 *
 * `embedded.html` is a host page with its own title, lang, dir, meta and chrome.
 * `resources/js/embedded.tsx` mounts through `mountIchavaBrowser` with the defaults.
 */

const HOST = {
  title: 'Host Application — Dashboard',
  description: 'A host page description that the browser must not touch.',
  lang: 'en',
  dir: 'ltr',
};

async function mounted(page: Page) {
  // The fixture sets this once the mount resolves, so assertions never race the boot.
  await expect(page.locator('html[data-ichava-mounted]')).toBeAttached({ timeout: 15_000 });
  await expect(page.locator('[data-ichava-root]')).toBeVisible();
}

/**
 * A fresh mount shows the product tour and the consent notice. They render inside the
 * component root -- which is itself part of the contract -- but they sit over the
 * toolbar, so anything driving the UI has to clear them first.
 */
async function dismissFirstRun(page: Page) {
  // Consent first: the tour waits for it (FINDINGS B3).
  await page
    .getByRole('button', { name: 'Essential only' })
    .click({ timeout: 10_000 })
    .catch(() => {});
  await page
    .getByRole('button', { name: 'Skip' })
    .click({ timeout: 10_000 })
    .catch(() => {});
}

// Storage is shared across specs in a project; a leftover blob would change the
// default filter and make these counts meaningless.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('mounting leaves the host document untouched', async ({ page }) => {
  await page.goto('/embedded.html');
  await mounted(page);

  const html = page.locator('html');
  await expect(page).toHaveTitle(HOST.title);
  await expect(html).toHaveAttribute('lang', HOST.lang);
  await expect(html).toHaveAttribute('dir', HOST.dir);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', HOST.description);

  // No theme class and no design tokens on the document element.
  await expect(html).not.toHaveClass(/\bdark\b/);
  const leaked = await page.evaluate(() => {
    const s = document.documentElement.style;
    return ['--accent', '--accent-soft', '--ring', '--radius', '--app-font'].filter((v) => s.getPropertyValue(v) !== '');
  });
  expect(leaked).toEqual([]);

  // No density or reduced-motion attributes either.
  await expect(html).not.toHaveAttribute('data-density', /.*/);
  await expect(html).not.toHaveAttribute('data-reduce-motion', /.*/);
});

test('the host document keeps scrolling', async ({ page }) => {
  // The library stylesheet used to carry `html, body, #root { overflow: hidden;
  // height: 100% }`, which froze every page of a host that imported it (FINDINGS B1).
  await page.setViewportSize({ width: 1280, height: 400 });
  await page.goto('/embedded.html');
  await mounted(page);

  const doc = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).overflowY,
    body: getComputedStyle(document.body).overflowY,
    bodyHeight: getComputedStyle(document.body).height,
    viewport: window.innerHeight,
  }));
  expect(doc.html).not.toBe('hidden');
  expect(doc.body).not.toBe('hidden');
  expect(doc.bodyHeight).not.toBe(`${doc.viewport}px`);

  // The page is taller than this viewport (header + 70vh mount + copy), so it must scroll.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page.locator('#host-footer-copy')).toBeInViewport();
});

test('the host page chrome survives the mount', async ({ page }) => {
  await page.goto('/embedded.html');
  await mounted(page);

  await expect(page.locator('#host-header')).toBeVisible();
  await expect(page.locator('#host-copy')).toHaveText('Host content above the mount.');
  await expect(page.locator('#host-footer-copy')).toHaveText('Host content below the mount.');
});

test('the browser themes itself on its own root, not the document', async ({ page }) => {
  await page.goto('/embedded.html');
  await mounted(page);

  // The tokens must be SOMEWHERE, or the app renders unthemed. They belong on the
  // component root: scoped, so two mounts could differ and the host is unaffected.
  const onRoot = await page.locator('[data-ichava-root]').evaluate((el) => {
    const s = (el as HTMLElement).style;
    return {
      accent: s.getPropertyValue('--accent'),
      radius: s.getPropertyValue('--radius'),
      appFont: s.getPropertyValue('--app-font'),
      density: el.getAttribute('data-density'),
      dir: el.getAttribute('dir'),
      lang: el.getAttribute('lang'),
    };
  });
  expect(onRoot.accent).not.toBe('');
  expect(onRoot.radius).not.toBe('');
  expect(onRoot.appFont).not.toBe('');
  expect(onRoot.density).toBeTruthy();
  expect(onRoot.dir).toBeTruthy();
  expect(onRoot.lang).toBeTruthy();
});

test('the host query string and hash survive — the kill switch cannot erase itself', async ({ page }) => {
  // `ui=react` is exactly the flag an in-Laravel host uses to select this frontend.
  await page.goto('/embedded.html?ui=react&host_page=3#host-anchor');
  await mounted(page);
  await dismissFirstRun(page);

  // Interact enough that the old implementation would have rewritten the URL.
  await page.getByPlaceholder('Filter icons…').fill('home');
  await page.waitForTimeout(900);

  const url = new URL(page.url());
  expect(url.searchParams.get('ui')).toBe('react');
  expect(url.searchParams.get('host_page')).toBe('3');
  expect(url.hash).toBe('#host-anchor');
  // And it added none of its own, because syncUrl is off.
  expect(url.searchParams.get('q')).toBeNull();
});

test('the browser still works while owning nothing', async ({ page }) => {
  // The contract is worthless if the cost is a broken browser.
  await page.goto('/embedded.html');
  await mounted(page);
  await dismissFirstRun(page);

  const root = page.locator('[data-ichava-root]');
  await expect(root.getByText(/\d+ icons?/).first()).toBeVisible();

  const filter = page.getByPlaceholder('Filter icons…');
  await filter.fill('home');
  await expect(page.getByText(/^2 icons$/)).toBeVisible();
  await filter.fill('');
});

test('unmounting restores the host document', async ({ page }) => {
  await page.goto('/embedded.html');
  await mounted(page);

  await page.evaluate(() => {
    (window as unknown as { __ichavaHandle?: { unmount(): void } }).__ichavaHandle?.unmount();
  });

  await expect(page.locator('[data-ichava-root]')).toHaveCount(0);
  await expect(page).toHaveTitle(HOST.title);
  await expect(page.locator('html')).toHaveAttribute('lang', HOST.lang);
  await expect(page.locator('#host-header')).toBeVisible();
});

test('a browser() builder mount keeps the same contract and unmounts cleanly', async ({ page }) => {
  // `?builder` makes the fixture mount through browser().catalog().config().mount(el),
  // with the builder's defaults (no .embedded()), so this checks those defaults too.
  await page.goto('/embedded.html?builder&host_page=3#host-anchor');
  await mounted(page);

  const html = page.locator('html');
  await expect(page).toHaveTitle(HOST.title);
  await expect(html).toHaveAttribute('lang', HOST.lang);
  await expect(html).toHaveAttribute('dir', HOST.dir);
  expect(new URL(page.url()).search).toBe('?builder&host_page=3');
  expect(new URL(page.url()).hash).toBe('#host-anchor');

  await dismissFirstRun(page);
  await page.getByPlaceholder('Filter icons…').fill('home');
  await expect(page.getByText(/^2 icons$/)).toBeVisible();

  const sameStore = await page.evaluate(() => {
    const h = (window as unknown as { __ichavaHandle?: { store: { getState(): { filters: { search: string } } }; unmount(): void } }).__ichavaHandle!;
    const search = h.store.getState().filters.search;
    h.unmount();
    return search;
  });
  expect(sameStore).toBe('home');
  await expect(page.locator('[data-ichava-root]')).toHaveCount(0);
});
