import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { createCatalog } from './core/api/ApiClient';
import { resolveConfig } from './core/config';
import { CatalogIndex } from './modules/catalog';
import { createBrowserStore, toListParams } from './store';
import { catalog } from './test/fixtures';

/**
 * Select all (⌘A / Ctrl+A) selects every icon matching the current filter, through the
 * catalog layer, in both data modes. It used to select only the visible page, and only
 * in static mode: in REST mode it did nothing at all.
 */

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('select all', () => {
  it('static catalog: every matching icon, not only the visible page', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    const grid = await screen.findByRole('grid');
    // After mount: first-run config defaults set the page size on mount.
    act(() => store.getState().setPerPage(2));
    expect(store.getState().filters.perPage).toBe(2);
    const expected = new CatalogIndex(catalog).page({ ...toListParams(store.getState().filters), page: 1, perPage: catalog.icons.length });
    expect(expected.total).toBeGreaterThan(2);

    fireEvent.keyDown(grid, { key: 'a', ctrlKey: true });
    await waitFor(() => expect(store.getState().selection).toHaveLength(expected.total));
    expect(store.getState().selection).toEqual(expected.items.map((i) => i.id));
  });

  it('REST client: pages through the API for every match', async () => {
    const pages: Record<string, unknown> = {
      '1': { data: [{ id: 1, name: 'home', package: 'tabler', category: 'nav', variant: 'outline' }, { id: 2, name: 'menu', package: 'tabler', category: 'nav', variant: 'outline' }], meta: { total: 3, per_page: 2, current_page: 1, last_page: 2 } },
      '2': { data: [{ id: 3, name: 'star', package: 'tabler', category: 'nav', variant: 'outline' }], meta: { total: 3, per_page: 2, current_page: 2, last_page: 2 } },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: unknown) => {
        const u = String(url);
        const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
        if (u.includes('/icons/filters')) return json({ packages: [{ id: 'tabler', label: 'Tabler' }], categories: [], variants: [] });
        if (u.includes('/icons/tree')) return json({ data: [] });
        if (u.includes('/icons')) return json(pages[new URL(u, 'http://x').searchParams.get('page') ?? '1'] ?? pages['1']);
        return json({});
      }),
    );
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser client={createCatalog('rest', { base: '/ichava/api/v1' })} config={resolveConfig(null)} store={store} />);
    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument(), { timeout: 2000 });

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true });
    // Unfiltered against a REST source, so it asks first (selectAllConfirm.test.tsx).
    await waitFor(() => expect(store.getState().confirm).not.toBeNull());
    act(() => store.getState().confirm!.onConfirm());
    await waitFor(() => expect(store.getState().selection).toEqual([1, 2, 3]));
  });
});
