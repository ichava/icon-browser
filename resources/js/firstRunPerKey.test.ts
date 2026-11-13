import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Behaviour change 2 (architecture 3.6, approved): first-run detection reads the mount's
 * own persistKey. It read only the default `ichava.browser.v2`, so a mount with its own
 * key took its first-run decision from the default mount's storage: config defaults were
 * skipped for a brand-new mount whenever another mount had run before, and applied over
 * a returning user's own choices whenever the default mount had not.
 */
async function storeWith(persistKey: string | null) {
  vi.resetModules();
  const [{ createBrowserStore }, { resolveConfig }] = await Promise.all([import('@/store'), import('@/core/config')]);
  const store = createBrowserStore({ persistKey });
  const config = resolveConfig({ defaults: { perPage: 24 } } as never);
  store.getState().setConfig(config);
  return store;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('first run is decided per persist key', () => {
  it('a new mount gets the config defaults even when the default key holds state', async () => {
    localStorage.setItem('ichava.browser.v2', JSON.stringify({ state: { tourSeen: true }, version: 3 }));
    const store = await storeWith('ichava.admin.browser');
    expect(store.getState().filters.perPage).toBe(24);
  });

  it('a returning mount keeps its own state even when the default key is empty', async () => {
    localStorage.setItem('ichava.admin.browser', JSON.stringify({ state: { filters: { search: '', packages: [], categories: [], subs: [], variant: null, sortBy: 'name', sortOrder: 'asc', page: 1, perPage: 96 } }, version: 3 }));
    const store = await storeWith('ichava.admin.browser');
    await store.persist.rehydrate();
    store.getState().setConfig(store.getState().config!);
    expect(store.getState().filters.perPage).toBe(96);
  });

  it('the default mount is unchanged: defaults on a first run only', async () => {
    expect((await storeWith('ichava.browser.v2')).getState().filters.perPage).toBe(24);
  });
});
