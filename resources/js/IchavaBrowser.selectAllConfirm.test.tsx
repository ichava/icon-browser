import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { createCatalog } from './core/api/ApiClient';
import { resolveConfig } from './core/config';
import { MESSAGES, translate, type Locale } from './core/i18n';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Sim's decisions on select all: the palette item is "Select all matching" in all seven
 * locales and runs the same action as Ctrl+A, and an unfiltered select all against a REST
 * source asks first ("Select all N icons?", N formatted for the locale), because it pages
 * through the whole listing.
 */

const TOTAL = 139162;

function mockApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown) => {
      const u = String(url);
      const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (u.includes('/icons/filters')) return json({ packages: [{ id: 'tabler', label: 'Tabler' }], categories: [], variants: [] });
      if (u.includes('/icons/tree')) return json({ data: [] });
      if (u.includes('/icons')) {
        const page = Number(new URL(u, 'http://x').searchParams.get('page') ?? '1');
        return json({
          data: page === 1 ? [{ id: 1, name: 'home', package: 'tabler', category: 'nav', variant: 'outline' }] : [{ id: 2, name: 'star', package: 'tabler', category: 'nav', variant: 'outline' }],
          meta: { total: TOTAL, per_page: 1, current_page: page, last_page: 2 },
        });
      }
      return json({});
    }),
  );
}

async function mountRest(locale: Locale = 'en') {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential', locale });
  render(<IchavaBrowser client={createCatalog('rest', { base: '/ichava/api/v1' })} config={resolveConfig(null)} store={store} />);
  await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument(), { timeout: 2000 });
  return store;
}

beforeEach(() => {
  mockApi();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('select all, unfiltered, against a REST source', () => {
  it('asks first, with the count formatted for the locale', async () => {
    const store = await mountRest('de');
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true });
    await waitFor(() => expect(store.getState().confirm).not.toBeNull());
    const n = new Intl.NumberFormat('de').format(TOTAL);
    expect(store.getState().confirm!.title).toBe(translate('de', 'selectAll.confirmTitle', { n }));
    expect(store.getState().confirm!.title).toContain('139.162');
    expect(store.getState().selection).toEqual([]);
  });

  it('selects every match when the answer is yes', async () => {
    const store = await mountRest();
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true });
    await waitFor(() => expect(store.getState().confirm).not.toBeNull());
    act(() => store.getState().confirm!.onConfirm());
    await waitFor(() => expect(store.getState().selection).toEqual([1, 2]));
  });

  it('selects nothing when the answer is no', async () => {
    const store = await mountRest();
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true });
    await waitFor(() => expect(store.getState().confirm).not.toBeNull());
    act(() => store.getState().closeConfirm());
    await new Promise((r) => setTimeout(r, 50));
    expect(store.getState().selection).toEqual([]);
  });

  it('does not ask when a search narrows the listing', async () => {
    const store = await mountRest();
    act(() => store.getState().setSearch('home'));
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true });
    await waitFor(() => expect(store.getState().selection).toEqual([1, 2]));
    expect(store.getState().confirm).toBeNull();
  });
});

describe('the palette item', () => {
  it('is "Select all matching" in every locale, with no locale left in English', () => {
    expect(MESSAGES.en['palette.selectAll']).toBe('Select all matching');
    for (const l of ['es', 'fr', 'de', 'pt', 'sw', 'ar'] as const) {
      expect(MESSAGES[l]?.['palette.selectAll'], l).toBeTruthy();
      expect(MESSAGES[l]?.['palette.selectAll'], l).not.toBe('Select all matching');
      for (const k of ['selectAll.confirmTitle', 'selectAll.confirmBody', 'selectAll.confirmLabel']) expect(MESSAGES[l]?.[k], `${l} ${k}`).toBeTruthy();
    }
  });

  it('selects every match, not only the page, in static mode', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    act(() => store.getState().setPerPage(2));
    act(() => store.getState().openLayer('palette'));
    fireEvent.click(await screen.findByRole('option', { name: /Select all matching/ }));
    await waitFor(() => expect(store.getState().selection.length).toBeGreaterThan(2));
  });
});
