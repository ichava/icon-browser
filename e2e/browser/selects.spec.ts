import { test, expect, type Page } from '@playwright/test';

/**
 * Select and combo-box behaviour.
 *
 * The reported symptoms were dropdowns that would not scroll and long lists with no way to
 * filter. The scroll failure came from nesting: the motion-preset picker was a custom
 * popover (a scroll container) wrapping a cmdk CommandList (another scroll container), so
 * a wheel event went to whichever one the pointer was over and stopped there.
 *
 * These assert the things a screenshot cannot: that the listbox actually scrolls, that
 * typing filters, and that choosing an option changes the app rather than just closing.
 */

const PERSIST_KEY = 'ichava.browser.v2';

async function seed(page: Page) {
  await page.addInitScript(
    ([key]) => {
      localStorage.clear();
      localStorage.setItem(key as string, JSON.stringify({ state: { tourSeen: true, consent: 'essential' }, version: 3 }));
    },
    [PERSIST_KEY] as const,
  );
}

/**
 * Open the detail dialog and return it.
 *
 * Everything below is scoped to this element. The app chrome behind the modal has its own
 * size-unit select named "Size unit", so an unscoped `/unit/i` matched the toolbar's
 * control instead -- which is correctly unclickable behind the overlay, so the test failed
 * on a control it was never meant to touch.
 */
async function openDetail(page: Page) {
  await page.goto('/index.html?icon=1');
  await page.waitForLoadState('networkidle');
  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('motion preset picker', () => {
  /*
   * A select whose popover holds a search field over a grouped list. It was a combo box,
   * which read as a text input with the preset typed into it, and its popover was locked
   * to the field's width, so every preset name was cut short.
   */
  async function openPicker(page: Page) {
    const dialog = await openDetail(page);
    const trigger = dialog.getByRole('button', { name: /Motion/ });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const search = page.getByRole('searchbox');
    await expect(search).toBeFocused();
    return { trigger, search, listbox: page.getByRole('listbox') };
  }

  test('filters as you type and applies the choice', async ({ page }) => {
    await seed(page);
    const { trigger, search, listbox } = await openPicker(page);

    const all = await listbox.getByRole('option').count();
    // The whole point of searching here is that the list is long.
    expect(all, 'expected a long preset list').toBeGreaterThan(10);

    await search.fill('spin subtle');
    const filtered = listbox.getByRole('option');
    await expect.poll(async () => filtered.count()).toBeLessThan(all);
    expect(await filtered.count()).toBeGreaterThan(0);

    // Selecting must change the control's value, not merely close the popover.
    await filtered.first().click();
    await expect(listbox).toHaveCount(0);
    await expect(trigger).toContainText(/Spin.*Subtle/);
  });

  test('labels are readable: grouped by family and never truncated', async ({ page }) => {
    await seed(page);
    const { listbox } = await openPicker(page);
    await expect(listbox.getByText('Spin', { exact: true }).first()).toBeVisible();
    const clipped = await listbox.evaluate((el) =>
      [...el.querySelectorAll('[role="option"] span')]
        .filter((s) => (s as HTMLElement).scrollWidth > (s as HTMLElement).clientWidth + 1)
        .map((s) => s.textContent),
    );
    expect(clipped, 'option labels are cut short').toEqual([]);
  });

  test('stays inside a short window', async ({ page }) => {
    // The select popover pins its max-height with !important, which outranked the limit
    // react-aria computes from the room left, so the list ran past the bottom edge.
    await page.setViewportSize({ width: 1280, height: 600 });
    await seed(page);
    const { listbox } = await openPicker(page);
    const pop = page.locator('[data-trigger="Select"]').filter({ has: listbox });
    const box = (await pop.boundingBox())!;
    expect(box.y, 'picker above the top edge').toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, 'picker past the bottom edge').toBeLessThanOrEqual(600);
  });

  test('its listbox scrolls', async ({ page }) => {
    await seed(page);
    const { listbox } = await openPicker(page);

    const scroller = await listbox.evaluate((el) => {
      for (let n = el as HTMLElement | null; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && n.scrollHeight > n.clientHeight + 1) {
          n.setAttribute('data-scroll-probe', '');
          return { sh: n.scrollHeight, ch: n.clientHeight };
        }
      }
      return null;
    });
    expect(scroller, 'no scrolling ancestor found: the list cannot be scrolled').not.toBeNull();

    const probe = page.locator('[data-scroll-probe]');
    await probe.evaluate((el) => { el.scrollTop = 120; });
    expect(await probe.evaluate((el) => el.scrollTop), 'the list did not scroll').toBeGreaterThan(0);
  });
});

test.describe('select popovers', () => {
  test('an option wider than its trigger is shown whole', async ({ page }) => {
    await seed(page);
    await page.goto('/index.html');
    await page.getByRole('button', { name: /Icon treatment/ }).click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const clipped = await listbox.evaluate((el) =>
      [...el.querySelectorAll('[role="option"] *')]
        .filter((c) => (c as HTMLElement).scrollWidth > (c as HTMLElement).clientWidth + 1)
        .map((c) => c.textContent),
    );
    expect(clipped, 'option text is cropped').toEqual([]);
  });
});

test.describe('plain selects', () => {
  test('the size-unit select opens and applies', async ({ page }) => {
    await seed(page);
    const dialog = await openDetail(page);

    // Not `exact`: react-aria sets `aria-labelledby` on a Select's trigger pointing at
    // both the label and the button, so the computed name is the label plus the current
    // value ("Unit px"), not the bare aria-label. Scoping to the dialog is what makes a
    // loose match safe here.
    const unit = dialog.getByRole('button', { name: /unit/i });
    await expect(unit).toBeVisible();
    await unit.click();

    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible();
    // px / rem / em
    expect(await options.count()).toBe(3);

    await page.getByRole('option', { name: 'rem', exact: true }).click();
    await expect(unit).toContainText('rem');
  });
});

test.describe('form control uniformity', () => {
  test('every select and text input shares one size, radius and ring', async ({ page }) => {
    await seed(page);
    const dialog = await openDetail(page);
    await expect(dialog).toBeVisible();

    // Measured on the design system's own wrapper (the element that carries the ring and
    // radius), not the bare <input> -- the input inside a group has neither, so measuring
    // it reports 0px radius and reads as an inconsistency that is not there.
    const metrics = await page.evaluate(() => {
      const groups = new Set<Element>();
      document.querySelectorAll('input[type="text"], input[type="email"], input:not([type])').forEach((i) => {
        const g = i.closest('[data-rac]');
        if (g && g !== i) groups.add(g);
      });
      document.querySelectorAll('button[aria-haspopup="listbox"]').forEach((b) => groups.add(b));
      return [...groups].map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          h: Math.round(r.height),
          radius: cs.borderTopLeftRadius,
          name: (el.getAttribute('aria-label') ?? '').slice(0, 24),
        };
      }).filter((m) => m.h > 1);
    });

    expect(metrics.length, 'no controls measured').toBeGreaterThan(5);

    // One height and one radius across every control the design system renders. Drift here
    // is what "inputs are not uniform" looks like before anyone can name it.
    const heights = [...new Set(metrics.map((m) => m.h))];
    const radii = [...new Set(metrics.map((m) => m.radius))];
    expect(heights, `mixed control heights: ${JSON.stringify(metrics)}`).toHaveLength(1);
    expect(radii, `mixed control radii: ${JSON.stringify(metrics)}`).toHaveLength(1);
  });
});
