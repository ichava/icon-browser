import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserStore } from '@/store';
import { resolveConfig } from '@/core/config';
import { hostConfigFromProps } from '@/modules/host';
import { ADA, ichavaProp } from '@/test/hostFixtures';

const hostConfig = (auth = ADA as typeof ADA | null, ichava = ichavaProp()) => resolveConfig(hostConfigFromProps({ auth, ichava }));

afterEach(() => vi.restoreAllMocks());

describe('a store inside a host app', () => {
  it('takes the host user as signed in, over a persisted demo sign-in', () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ auth: { status: 'authed', user: { name: 'Demo', initials: 'DE', email: 'demo@example.test', plan: 'PRO' } }, authInitialized: true });
    store.getState().setConfig(hostConfig());
    expect(store.getState().auth).toEqual({ status: 'authed', user: expect.objectContaining({ id: '42', name: 'Ada Lovelace', email: '', plan: null }) });
  });

  it('is a guest when the host has no user, whatever was persisted', () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ auth: { status: 'authed', user: { name: 'Demo', initials: 'DE', email: '', plan: 'PRO' } }, authInitialized: true });
    store.getState().setConfig(hostConfig(null));
    expect(store.getState().auth).toEqual({ status: 'guest', user: null });
  });

  it('sends sign-in to the host login page instead of opening its own form', () => {
    const assign = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign } as Location);
    const store = createBrowserStore({ persistKey: null });
    store.getState().setConfig(hostConfig(null));
    store.getState().openAuth('signin');
    expect(assign).toHaveBeenCalledWith('https://app.test/login');
    expect(store.getState().authView).toBeNull();
  });

  it('keeps the library on a factory reset, and deletes it only when asked', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().setConfig(hostConfig());
    store.setState({ favorites: [1, 2], collections: [{ id: 'c', name: 'A', icons: [1] }], history: [{ id: 1, action: 'copied', ts: 1 }] });
    store.getState().factoryReset();
    expect(store.getState().favorites).toEqual([1, 2]);
    expect(store.getState().collections).toHaveLength(1);
    expect(store.getState().history).toHaveLength(1);

    store.getState().deleteLibrary();
    expect(store.getState().favorites).toEqual([]);
    expect(store.getState().collections).toEqual([]);
    expect(store.getState().history).toHaveLength(1);
    expect(store.getState().libraryDeletions).toBe(1);
  });

  it('standalone, a factory reset still clears the library it keeps locally', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().setConfig(resolveConfig(null));
    store.setState({ favorites: [1] });
    store.getState().factoryReset();
    expect(store.getState().favorites).toEqual([]);
  });

  it('keeps command-palette recents, newest first and capped', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().setConfig(resolveConfig({ limits: { recentCommandsCap: 2 } } as never));
    store.getState().logCommand('theme');
    store.getState().logCommand('settings');
    store.getState().logCommand('theme');
    store.getState().logCommand('view');
    expect(store.getState().recentCommands).toEqual(['view', 'theme']);
    store.getState().clearRecentCommands();
    expect(store.getState().recentCommands).toEqual([]);
  });
});

describe('kind, tag and keyword filters', () => {
  it('switching kind keeps the search and resets what belongs to the other kind', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().setSearch('arrow');
    store.getState().toggleCat('navigation');
    store.getState().setVariant('outline');
    store.getState().toggleTag('direction');
    store.getState().setPage(3);
    store.getState().setKind('illustration');
    expect(store.getState().filters).toMatchObject({ kind: 'illustration', search: 'arrow', categories: [], variant: null, tags: [], page: 1 });
  });

  it('opens on icons', () => {
    expect(createBrowserStore({ persistKey: null }).getState().filters.kind).toBe('icon');
  });
});

describe('the initial kind from the host (contract §2.3)', () => {
  const kinds = (d: 'icon' | 'illustration', counts = { icon: 10, illustration: 4 }) =>
    ichavaProp({ kinds: { default: d, available: ['icon', 'illustration'], counts } });

  it('opens on the host default kind on a first visit', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().setConfig(hostConfig(ADA, kinds('illustration')));
    expect(store.getState().filters.kind).toBe('illustration');
  });

  it('opens on icons from a host that sends no kinds', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().setConfig(hostConfig());
    expect(store.getState().filters.kind).toBe('icon');
  });

  it('keeps a persisted choice over the host default', () => {
    const key = 'ichava.test.kind-persisted';
    localStorage.setItem(key, JSON.stringify({ state: { filters: { search: '', packages: [], categories: [], subs: [], variant: null, sortBy: 'name', sortOrder: 'asc', page: 1, perPage: 60, kind: 'icon', tags: [], keywords: [] } }, version: 5 }));
    try {
      const store = createBrowserStore({ persistKey: key });
      store.getState().setConfig(hostConfig(ADA, kinds('illustration')));
      expect(store.getState().filters.kind).toBe('icon');
    } finally {
      localStorage.removeItem(key);
    }
  });
});
