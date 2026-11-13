import { expect, test, type Page } from '@playwright/test';
import { loadLocale, translate, type Locale } from '../src/core/i18n';

/**
 * B8: the header at phone width, left-to-right and right-to-left.
 *
 * At 390px the header's thirteen controls needed 636px. The search trigger sat in a
 * zero-width flex cell and painted over the brand mark and the favourites and history
 * buttons, and the rest of the toolbar ran off the edge -- to the right in English, to
 * the left in Arabic. This pins the boxes that collided: none of them may overlap
 * another, each sits inside the header, and the page does not scroll sideways.
 */

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

type Box = { name: string; left: number; right: number; top: number; bottom: number };

async function boxes(page: Page, locale: Locale): Promise<{ boxes: Box[]; header: Box; scrollWidth: number }> {
  // Catalogs other than English load on demand, here as in the browser.
  await loadLocale(locale);
  const names = {
    sidebar: translate(locale, 'header.toggleSidebar'),
    favorites: translate(locale, 'header.favorites'),
    history: translate(locale, 'header.history'),
  };
  return page.evaluate((n) => {
    const header = document.querySelector('[data-ichava-root] header')!;
    const rect = (name: string, el: Element | null | undefined): Box => {
      if (!el) throw new Error(`header: ${name} not found`);
      const r = el.getBoundingClientRect();
      return { name, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    };
    const byLabel = (label: string) => [...header.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === label);
    // The brand group: the mark and the product name, found by the name's text.
    const brandName = [...header.querySelectorAll('span')].find((s) => s.textContent === 'Ichava');
    const search = [...header.querySelectorAll('button')].find((b) => b.querySelector('kbd'));
    return {
      boxes: [
        rect('sidebar toggle', byLabel(n.sidebar)),
        rect('brand', brandName?.parentElement?.parentElement),
        rect('search', search),
        rect('favorites', byLabel(n.favorites)),
        rect('history', byLabel(n.history)),
      ],
      header: rect('header', header),
      scrollWidth: document.documentElement.scrollWidth,
    };
  }, names);
}

const overlaps = (a: Box, b: Box) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

for (const locale of ['en', 'ar'] as const) {
  test(`at 390px the header's brand, search, favourites and history do not overlap (${locale})`, async ({ page }) => {
    await page.addInitScript((l) => {
      localStorage.clear();
      localStorage.setItem('ichava.locale', l);
    }, locale);
    await page.goto('/index.html');
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    await expect(page.locator('[data-ichava-root] header')).toBeVisible();

    const { boxes: list, header, scrollWidth } = await boxes(page, locale);
    expect(list).toHaveLength(5);
    for (const b of list) {
      expect(b.right - b.left, `${b.name} has no width`).toBeGreaterThan(0);
      expect(b.left, `${b.name} starts outside the header`).toBeGreaterThanOrEqual(header.left - 0.5);
      expect(b.right, `${b.name} ends outside the header`).toBeLessThanOrEqual(header.right + 0.5);
    }
    list.forEach((a, i) =>
      list.slice(i + 1).forEach((b) => expect(overlaps(a, b), `${a.name} overlaps ${b.name}: ${JSON.stringify([a, b])}`).toBe(false)),
    );
    expect(scrollWidth, 'the page scrolls sideways').toBeLessThanOrEqual(390);
  });
}
