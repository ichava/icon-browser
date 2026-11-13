import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { IchavaBrowser } from './IchavaBrowser';
import { createCatalog } from './core/api/ApiClient';
import { resolveConfig } from './core/config';
import { THEME_VAR_NAMES } from '@ichava/js-ui-kernel';
import { createBrowserStore } from './store';

/**
 * The accent and radius reach Untitled UI's own tokens, on the root and on `<html>`.
 *
 * jsdom does not resolve `var()`, so this pins the half it can see: what the mount writes.
 * `e2e/contrast.spec.ts` measures the other half, the computed colour of a real Button.
 */

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mount(manageDocument: boolean) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ consent: 'essential', tourSeen: true });
  const client = createCatalog('rest', { base: '/ichava/api/v1' });
  const utils = render(<IchavaBrowser client={client} config={resolveConfig(null)} store={store} manageDocument={manageDocument} />);
  const root = utils.container.querySelector<HTMLElement>('[data-ichava-root]')!;
  return { store, root, ...utils };
}

describe('brand and radius bridge', () => {
  it('writes the brand ramp and radius scale on the root, and follows a change', () => {
    const { store, root } = mount(false);
    // A mount that does not persist starts on the shipped defaults: lagoon teal at 6px.
    expect(root.style.getPropertyValue('--color-brand-600')).toBe('#0e7c66');
    expect(root.style.getPropertyValue('--radius-lg')).toBe('6px');
    expect(root.style.getPropertyValue('--radius-xl')).toBe('9px');

    act(() => {
      store.getState().setAccent('#059669');
      store.getState().setRadius(4);
    });
    expect(root.style.getPropertyValue('--color-brand-600')).toBe('#059669');
    expect(root.style.getPropertyValue('--color-bg-brand-solid')).toBe('#059669');
    expect(root.style.getPropertyValue('--color-brand-50')).not.toBe('');
    expect(root.style.getPropertyValue('--radius-lg')).toBe('4px');
    expect(root.style.getPropertyValue('--radius-xl')).toBe('6px');
  });

  it('mirrors the same variables on <html> in standalone mode, and removes them on unmount', () => {
    const { store, root, unmount } = mount(true);
    const html = document.documentElement;
    act(() => store.getState().setAccent('#2563eb'));
    for (const name of THEME_VAR_NAMES) {
      expect(html.style.getPropertyValue(name), name).toBe(root.style.getPropertyValue(name));
    }
    expect(html.style.getPropertyValue('--color-brand-600')).toBe('#2563eb');

    unmount();
    for (const name of THEME_VAR_NAMES) expect(html.style.getPropertyValue(name), name).toBe('');
  });

  it('leaves <html> alone when embedded', () => {
    mount(false);
    expect(document.documentElement.style.getPropertyValue('--color-brand-600')).toBe('');
  });
});
