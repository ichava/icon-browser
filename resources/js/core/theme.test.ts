import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * L9 (the browser half): with no stored theme, the first load follows the operating
 * system's `prefers-color-scheme`. It used to start light whatever the system said.
 *
 * A stored theme and an explicit `defaults.appearance.theme` still win; only the
 * unset default resolves against the media query.
 */

const PERSIST_KEY = 'ichava.browser.v2';

function stubScheme(dark: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: dark && q.includes('prefers-color-scheme: dark'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

async function freshStore(persisted: Record<string, unknown> | null) {
  vi.resetModules();
  localStorage.clear();
  if (persisted) localStorage.setItem(PERSIST_KEY, JSON.stringify({ state: persisted, version: 3 }));
  const [{ useStore }, { resolveConfig }] = await Promise.all([import('@/store'), import('@/core/config')]);
  return { useStore, resolveConfig };
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('first-run theme follows prefers-color-scheme', () => {
  it('starts dark when the system prefers dark and nothing is stored', async () => {
    stubScheme(true);
    const { useStore, resolveConfig } = await freshStore(null);
    expect(useStore.getState().theme).toBe('dark');
    useStore.getState().setConfig(resolveConfig(null));
    expect(useStore.getState().theme).toBe('dark');
  });

  it('starts light when the system prefers light', async () => {
    stubScheme(false);
    const { useStore, resolveConfig } = await freshStore(null);
    useStore.getState().setConfig(resolveConfig(null));
    expect(useStore.getState().theme).toBe('light');
  });

  it('keeps a stored theme over the system preference', async () => {
    stubScheme(true);
    const { useStore, resolveConfig } = await freshStore({ theme: 'light' });
    useStore.getState().setConfig(resolveConfig(null));
    expect(useStore.getState().theme).toBe('light');
  });

  it('keeps an explicit config theme over the system preference', async () => {
    stubScheme(true);
    const { useStore, resolveConfig } = await freshStore(null);
    useStore.getState().setConfig(resolveConfig({ defaults: { appearance: { theme: 'light' } } }));
    expect(useStore.getState().theme).toBe('light');
  });

  it('a factory reset returns to the system preference', async () => {
    stubScheme(true);
    const { useStore } = await freshStore({ theme: 'light' });
    useStore.getState().factoryReset();
    expect(useStore.getState().theme).toBe('dark');
  });
});
