import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { createCatalog } from './core/api/ApiClient';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Behaviour change 4: the detail dialog reads an icon's SVG through the catalog port
 * and the shared SVG cache, never through a `fetch` of its own.
 *
 * REST mode: the dialog fetched `assetUrl(icon.svgUrl)` directly, so it skipped the
 * REST client's transport, base URL and CSRF. It now asks the catalog, which serves
 * `/icons/{id}/svg`. (The preview glyph still reads `svgUrl` through `getSvgParts`, as
 * every tile does; that path is unchanged here.)
 *
 * Static mode: the preview read the file through the SVG cache and the dialog fetched
 * it again beside it, on every opening. Both now share one request.
 */

const SERVED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 2L3 4Z"/></svg>';

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

function urls(fetchMock: ReturnType<typeof vi.fn>): string[] {
  return fetchMock.mock.calls.map((c) => String(c[0]));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('REST mode', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn(async (url: unknown) => {
      const u = String(url);
      if (u.includes('/icons/1/svg')) return new Response(SERVED, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
      if (u.includes('/assets/')) return new Response('<svg><path d="M9 9Z"/></svg>', { status: 200 });
      if (u.includes('/icons/filters')) return json({ packages: [{ id: 'tabler', label: 'Tabler' }], categories: [], variants: [] });
      if (u.includes('/icons/tree')) return json({ data: [] });
      const icon = { id: 1, name: 'home', package: 'tabler', category: 'navigation', variant: 'outline', svg_url: 'assets/tabler/home.svg' };
      if (/\/icons\/1(\?|$)/.test(u)) return json({ data: icon });
      if (u.includes('/icons')) return json({ data: [icon], meta: { total: 1, per_page: 60, current_page: 1, last_page: 1 } });
      return json({});
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  it('builds the SVG snippet from the catalog, asked through its base URL', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    const client = createCatalog('rest', { base: '/ichava/api/v1' });
    render(<IchavaBrowser client={client} config={resolveConfig(null)} store={store} />);
    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument(), { timeout: 2000 });

    const before = urls(fetchMock).length;
    act(() => store.getState().openDetail(1));
    const dialog = await screen.findByRole('dialog');

    await waitFor(() => expect(dialog.textContent).toContain('M1 2L3 4Z'), { timeout: 2000 });
    // The snippet is the catalog's answer (the asset file holds a different path), asked
    // through the mount's base URL.
    expect(dialog.textContent).not.toContain('M9 9Z');
    expect(urls(fetchMock).slice(before).some((u) => u.includes('/ichava/api/v1/icons/1/svg'))).toBe(true);
  });
});

describe('static mode', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response(SERVED, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }));
    vi.stubGlobal('fetch', fetchMock);
  });

  it('fetches an icon\'s SVG once, however often its detail is opened', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    // id 2, so no other test in this file has already put it in the module-level cache.
    const user = (u: string) => u.endsWith('assets/tabler/user.svg');

    for (let i = 0; i < 2; i++) {
      act(() => store.getState().openDetail(2));
      const dialog = await screen.findByRole('dialog');
      await waitFor(() => expect(dialog.textContent).toContain('M1 2L3 4Z'), { timeout: 2000 });
      act(() => store.getState().closeLayer());
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    }
    expect(urls(fetchMock).filter(user)).toHaveLength(1);
  });
});
