import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig, CONFIG_DEFAULTS } from './core/config';
import { translate } from './core/i18n';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * A6-gaps G17: consent is an origin-level answer, so it lives under one site-wide key
 * (`storageKeys.consent`). Two mounts on one page show one notice, and answering it
 * answers both. A mount's existing per-mount answer (the `consent` field of its
 * persisted blob) is adopted once when the site-wide key is absent, so nobody who
 * already answered is asked again.
 */

const t = (k: string) => translate('en', k);
const SITE_KEY = CONFIG_DEFAULTS.storageKeys.consent ?? 'ichava.consent';

function mount(persistKey: string | null = null) {
  const store = createBrowserStore({ persistKey });
  store.setState({ tourSeen: true });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  return store;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('G17: one site-wide consent answer', () => {
  it('two mounts on one page show one consent notice', async () => {
    mount();
    mount();
    await screen.findAllByRole('grid');
    expect(screen.getAllByRole('dialog', { name: t('consent.ariaLabel') })).toHaveLength(1);
  });

  it('answering in one mount answers the other, and stores it under the site-wide key', async () => {
    const a = mount();
    const b = mount();
    await screen.findAllByRole('grid');
    fireEvent.click(screen.getByRole('button', { name: t('consent.acceptAll') }));
    expect(a.getState().consent).toBe('all');
    expect(b.getState().consent).toBe('all');
    expect(localStorage.getItem(SITE_KEY)).toBe('all');
    expect(screen.queryByRole('dialog', { name: t('consent.ariaLabel') })).toBeNull();
  });

  it('when the notice-holding mount unmounts, the other mount takes the notice over', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true });
    const first = render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    mount();
    await screen.findAllByRole('grid');
    first.unmount();
    await act(async () => {});
    expect(screen.getAllByRole('dialog', { name: t('consent.ariaLabel') })).toHaveLength(1);
  });

  it('a new mount starts from the site-wide answer', async () => {
    localStorage.setItem(SITE_KEY, 'essential');
    const store = mount();
    await screen.findByRole('grid');
    expect(store.getState().consent).toBe('essential');
    expect(screen.queryByRole('dialog', { name: t('consent.ariaLabel') })).toBeNull();
  });
});

describe('G17: migrating a per-mount answer', () => {
  const blob = (consent: string | null) => JSON.stringify({ version: 3, state: { consent, tourSeen: true } });

  it('adopts the per-mount answer once when the site-wide key is absent', async () => {
    localStorage.setItem('ichava.mount.a', blob('all'));
    vi.resetModules();
    const { createBrowserStore: create } = await import('./store');
    const store = create({ persistKey: 'ichava.mount.a' });
    await store.persist.rehydrate();
    expect(store.getState().consent).toBe('all');
    expect(localStorage.getItem(SITE_KEY)).toBe('all');
    // The per-mount field stays in the persisted shape.
    expect(JSON.parse(localStorage.getItem('ichava.mount.a') ?? '{}').state.consent).toBe('all');
  });

  it('the site-wide answer wins over a different per-mount one', async () => {
    localStorage.setItem(SITE_KEY, 'essential');
    localStorage.setItem('ichava.mount.b', blob('all'));
    vi.resetModules();
    const { createBrowserStore: create } = await import('./store');
    const store = create({ persistKey: 'ichava.mount.b' });
    await store.persist.rehydrate();
    expect(store.getState().consent).toBe('essential');
    expect(localStorage.getItem(SITE_KEY)).toBe('essential');
  });

  it('an unanswered per-mount blob leaves the site-wide key unset', async () => {
    localStorage.setItem('ichava.mount.c', blob(null));
    vi.resetModules();
    const { createBrowserStore: create } = await import('./store');
    const store = create({ persistKey: 'ichava.mount.c' });
    await store.persist.rehydrate();
    expect(store.getState().consent).toBeNull();
    expect(localStorage.getItem(SITE_KEY)).toBeNull();
  });
});
