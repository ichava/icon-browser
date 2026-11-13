import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { IchavaBrowser } from './IchavaBrowser';
import { createCatalog } from './core/api/ApiClient';
import { resolveConfig } from './core/config';
import { translate } from './core/i18n';
import { createBrowserStore } from './store';

/**
 * First-run sequencing, accessible names and RTL chrome, against a real mount.
 *
 * Each block here pins a defect found by driving the built app (FINDINGS B3, B4, B8):
 * the tour's modal scrim covered the consent buttons, the toolbar sliders and the page
 * had no accessible name or heading, and Arabic kept English chrome and a reversed pager.
 */

function mockIconsApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown) => {
      const u = String(url);
      const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (u.includes('/icons/filters')) return json({ packages: [{ id: 'tabler', label: 'Tabler' }], categories: [], variants: [] });
      if (u.includes('/icons/tree')) return json({ data: [] });
      if (u.includes('/icons')) {
        return json({
          data: [
            { id: 1, name: 'home', package: 'tabler', category: 'navigation', variant: 'outline' },
            { id: 2, name: 'menu', package: 'tabler', category: 'navigation', variant: 'outline' },
          ],
          meta: { total: 2, per_page: 60, current_page: 1, last_page: 4 },
        });
      }
      return json({});
    }),
  );
}

beforeEach(() => {
  mockIconsApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mount(state: Record<string, unknown> = {}, extra: { manageDocument?: boolean } = {}) {
  const store = createBrowserStore({ persistKey: null });
  store.setState(state);
  const client = createCatalog('rest', { base: '/ichava/api/v1' });
  const utils = render(<IchavaBrowser client={client} config={resolveConfig(null)} store={store} {...extra} />);
  return { store, ...utils };
}

describe('first run: consent before the tour (B3)', () => {
  it('does not open the tour while the consent notice is unanswered', async () => {
    const { store } = mount();
    // The tour is requested on first mount; it must wait, not cover the notice.
    await waitFor(() => expect(store.getState().tour.active).toBe(true));
    expect(screen.getByRole('dialog', { name: 'Cookies and storage' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Product tour' })).toBeNull();
  });

  it('opens the tour once consent is answered', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Essential only' }));
    expect(await screen.findByRole('dialog', { name: 'Product tour' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Cookies and storage' })).toBeNull();
  });
});

describe('accessible names and structure (B4)', () => {
  const settled = { tourSeen: true, consent: 'essential' };

  it('gives the page exactly one level-1 heading', () => {
    mount(settled);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('names the toolbar size and stroke sliders', () => {
    mount(settled);
    expect(screen.getByRole('slider', { name: 'Grid icon size' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Stroke' })).toBeInTheDocument();
  });
});

describe('Arabic chrome (B8)', () => {
  const ar = { tourSeen: true, consent: 'essential', locale: 'ar' };

  it('translates the treatment and sort labels', () => {
    const { container } = mount(ar);
    const root = container.querySelector('[data-ichava-root]') as HTMLElement;
    // "Stroke" was the default treatment's config label and "Name" the default sort's.
    expect(within(root).queryByText('Stroke')).toBeNull();
    expect(within(root).queryByText('Name')).toBeNull();
    expect(within(root).getAllByText(translate('ar', 'treatment.default')).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(translate('ar', 'sort.name')).length).toBeGreaterThan(0);
  });

  it('keeps the pager in reading order: current page first', async () => {
    const { container } = mount(ar);
    // The last page arrives with the first REST response.
    const pager = await waitFor(() => {
      const el = container.querySelector('[data-pager]');
      if (!el || !/4/.test(el.textContent ?? '')) throw new Error('pager not settled');
      return el as HTMLElement;
    });
    // Isolated as a left-to-right run, so the bidi algorithm cannot flip "1 / 4" into "4 / 1".
    expect(pager.tagName).toBe('BDI');
    expect(pager.getAttribute('dir')).toBe('ltr');
    expect(pager.textContent?.replace(/\s+/g, ' ').trim()).toBe('1 / 4');
  });

  it('translates the document title when the app owns the document', async () => {
    const before = document.title;
    const { unmount } = mount(ar, { manageDocument: true });
    await act(async () => {});
    expect(document.title).toBe(translate('ar', 'app.documentTitle'));
    expect(document.title).not.toBe(resolveConfig(null).seo.title);
    unmount();
    expect(document.title).toBe(before);
  });
});
