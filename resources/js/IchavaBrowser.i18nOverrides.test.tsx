import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Behaviour change 3 (architecture 3.6, approved): server translation overrides apply to
 * the mount that fetched them, not to every mount on the page. `registerTranslations`
 * wrote them into the module-level catalog, so one mount's overrides renamed another's
 * buttons (A6-gaps G23).
 */
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function mount(endpoint?: string) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential' });
  const base = resolveConfig(null);
  const config = endpoint ? { ...base, i18n: { ...base.i18n, endpoint } } : base;
  const view = render(<IchavaBrowser catalog={catalog} config={config} store={store} />);
  return { store, view };
}

describe('server translation overrides', () => {
  it('rename strings in the mount that fetched them, and only there', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: unknown) =>
        String(url).includes('/i18n')
          ? new Response(JSON.stringify({ en: { 'toolbar.sort': 'Order by (server)' } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
          : new Response('{}', { status: 404 }),
      ),
    );
    const a = mount('/i18n');
    const b = mount();
    await waitFor(() => expect(a.view.container.querySelector('[aria-label="Order by (server)"]')).not.toBeNull());
    expect(b.view.container.querySelector('[aria-label="Order by (server)"]')).toBeNull();
    expect(b.view.container.querySelector('[aria-label="Sort"]')).not.toBeNull();
    expect(screen.getAllByRole('grid')).toHaveLength(2);
  });
});
