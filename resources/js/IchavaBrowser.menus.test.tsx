import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Header menus on Untitled UI's Dropdown (inventory #23, #32, #39): real menus, not
 * popovers of buttons. Opened from the keyboard, since that is the path the old panels
 * did not support at all.
 */

function mount(state: Record<string, unknown> = {}, config: Parameters<typeof resolveConfig>[0] = null) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential', ...state });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(config)} store={store} />);
  return store;
}

function openFromKeyboard(name: string | RegExp) {
  const trigger = screen.getByRole('button', { name });
  act(() => trigger.focus());
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyUp(trigger, { key: 'ArrowDown' });
  return screen.getByRole('menu');
}

async function structural(el: Element) {
  const r = await axe.run(el, { runOnly: { type: 'rule', values: ['aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-valid-attr-value', 'nested-interactive'] }, resultTypes: ['violations'] });
  return r.violations.map((v) => v.id);
}

describe('header menus', () => {
  it('language: a radio menu that checks the active locale and switches on Enter', async () => {
    const store = mount({ locale: 'en' });
    await screen.findByRole('grid');
    const menu = openFromKeyboard('Language');
    const items = within(menu).getAllByRole('menuitemradio');
    expect(items.length).toBeGreaterThanOrEqual(7);
    expect(items.filter((i) => i.getAttribute('aria-checked') === 'true')).toHaveLength(1);
    const fr = items.find((i) => /Français/.test(i.textContent ?? ''))!;
    act(() => fr.focus());
    fireEvent.keyDown(fr, { key: 'Enter' });
    fireEvent.keyUp(fr, { key: 'Enter' });
    expect(store.getState().locale).toBe('fr');
    expect(await structural(document.body)).toEqual([]);
    act(() => store.getState().setLocale('en'));
  });

  it('help: a menu whose documentation item is a link', async () => {
    mount();
    await screen.findByRole('grid');
    const menu = openFromKeyboard(/help/i);
    const items = within(menu).getAllByRole('menuitem');
    expect(items).toHaveLength(4);
    expect(items.some((i) => i.tagName === 'A' && i.getAttribute('target') === '_blank')).toBe(true);
  });

  it('account: identity above a menu, with workspaces as a radio section', async () => {
    const store = mount(
      { auth: { status: 'authed', user: { name: 'Ada Lovelace', initials: 'AL', email: 'ada@example.test', plan: 'Pro' } }, activeWorkspaceId: 'w1' },
      { user: { mode: 'demo', name: 'Ada Lovelace', email: 'ada@example.test', initials: 'AL', plan: 'Pro', workspaces: [{ id: 'w1', name: 'Personal', plan: 'Free' }, { id: 'w2', name: 'Acme', plan: 'Team' }] } } as never,
    );
    await screen.findByRole('grid');
    const menu = openFromKeyboard(/Ada Lovelace/);
    const radios = within(menu).getAllByRole('menuitemradio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
    act(() => radios[1]!.focus());
    fireEvent.keyDown(radios[1]!, { key: 'Enter' });
    fireEvent.keyUp(radios[1]!, { key: 'Enter' });
    expect(store.getState().activeWorkspaceId).toBe('w2');
    expect(await structural(document.body)).toEqual([]);
  });
});
