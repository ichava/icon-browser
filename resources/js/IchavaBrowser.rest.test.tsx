import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { IchavaBrowser } from './IchavaBrowser';
import { createCatalog } from './core/api/ApiClient';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';

/**
 * The end-to-end proof that REST mode actually works, not just that each piece
 * typechecks alone: `mountIchavaBrowser`/`IchavaBrowser` -> `useRepo` ->
 * `useRestRepoState` -> `RestCatalog` -> the grid, against a mocked
 * `/ichava/api/v1`. This is the wiring `IchavaBrowserProps.client` exists for --
 * everything up to this test passed while nothing in the app had ever actually
 * called it with a REST client.
 */

function mockIconsApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown) => {
      const u = String(url);
      if (u.includes('/icons/filters')) {
        return new Response(JSON.stringify({ packages: [{ id: 'tabler', label: 'Tabler' }], categories: [], variants: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (u.includes('/icons/tree')) {
        return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.includes('/icons')) {
        return new Response(
          JSON.stringify({
            data: [
              { id: 1, name: 'home', package: 'tabler', category: 'navigation', variant: 'outline' },
              { id: 2, name: 'menu', package: 'tabler', category: 'navigation', variant: 'outline' },
            ],
            meta: { total: 2, per_page: 60, current_page: 1, last_page: 1 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }),
  );
}

beforeEach(() => {
  mockIconsApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('IchavaBrowser, mounted with a REST client', () => {
  it('renders icons fetched from the live API, with no static catalog', async () => {
    const store = createBrowserStore({ persistKey: null });
    const client = createCatalog('rest', { base: '/ichava/api/v1' });

    render(<IchavaBrowser client={client} config={resolveConfig(null)} store={store} />);

    // The debounced listing fetch (300ms) plus the request round trip.
    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText('menu')).toBeInTheDocument();

    // Never stuck on the initial `loading: true` -- see the IchavaBrowser.tsx
    // comment on why REST mode has to clear it itself.
    expect(store.getState().loading).toBe(false);
    // No catalog was ever put in the store; this mount is REST-only.
    expect(store.getState().catalog).toBeNull();
  });

  it('throws when mounted with neither catalog nor client', () => {
    const store = createBrowserStore({ persistKey: null });
    expect(() => render(<IchavaBrowser store={store} config={null} {...({} as Record<string, never>)} />)).toThrow(/exactly one/);
  });
});
