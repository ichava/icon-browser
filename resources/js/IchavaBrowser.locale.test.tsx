import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { SHARED_LOCALE_KEY } from '@ichava/js-ui-kernel';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/** The host-chosen `locale` mount option (architecture 3.5, `browser().locale()`). */
function mount(locale?: 'ar' | 'de') {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential' });
  const view = render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} locale={locale} />);
  const root = () => view.container.querySelector('[data-ichava-root]')!;
  return { store, view, root };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('the locale mount option', () => {
  it('opens the mount in the host\'s language, right-to-left for Arabic', async () => {
    const { store, root } = mount('ar');
    await screen.findByRole('grid');
    expect(store.getState().locale).toBe('ar');
    expect(root().getAttribute('lang')).toBe('ar');
    expect(root().getAttribute('dir')).toBe('rtl');
  });

  it('does not write the shared ichava.locale key', async () => {
    localStorage.setItem(SHARED_LOCALE_KEY, 'fr');
    mount('ar');
    await screen.findByRole('grid');
    expect(localStorage.getItem(SHARED_LOCALE_KEY)).toBe('fr');
  });

  it('without it, the mount follows the shared key as before', async () => {
    localStorage.setItem(SHARED_LOCALE_KEY, 'de');
    const { store } = mount();
    await screen.findByRole('grid');
    expect(store.getState().locale).toBe('de');
  });

  it('follows a changed prop, and the user can still switch afterwards', async () => {
    const { store, view, root } = mount('ar');
    await screen.findByRole('grid');
    view.rerender(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} locale="de" />);
    expect(root().getAttribute('lang')).toBe('de');
    act(() => store.getState().setLocale('es'));
    expect(root().getAttribute('lang')).toBe('es');
  });
});
