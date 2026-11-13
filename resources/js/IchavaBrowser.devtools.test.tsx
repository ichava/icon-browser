import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from '@/core/config';
import { DEVTOOLS_SIZE } from '@/state/slices/devtools';
import { createBrowserStore } from '@/store';
import { catalog } from '@/test/fixtures';

/** The DevTools drawer docks to any edge and resizes from its inner edge (Sim, 2026-10-27). */

function mount() {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential' });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig({ debug: { enabled: true } } as never)} store={store} />);
  return store;
}

async function openDrawer(store: ReturnType<typeof mount>) {
  await screen.findByRole('grid');
  act(() => store.getState().toggleDevtools());
  return screen.findByRole('region', { name: 'Ichava DevTools' });
}

describe('DevTools drawer', () => {
  it('opens docked to the bottom at the default height', async () => {
    const store = mount();
    const drawer = await openDrawer(store);
    expect(drawer).toHaveAttribute('data-dock', 'bottom');
    expect(drawer.style.height).toBe(`${DEVTOOLS_SIZE.default}px`);
  });

  it('moves to another edge from the position picker', async () => {
    const store = mount();
    const drawer = await openDrawer(store);
    const picker = within(drawer).getByRole('radiogroup', { name: 'DevTools position' });
    fireEvent.click(within(picker).getByRole('radio', { name: 'Dock to right' }));
    expect(drawer).toHaveAttribute('data-dock', 'right');
    expect(drawer.style.width).toBe(`${DEVTOOLS_SIZE.default}px`);
    expect(drawer.style.height).toBe('');
    expect(within(picker).getByRole('radio', { name: 'Dock to right' })).toHaveAttribute('aria-checked', 'true');
    expect(store.getState().devtoolsLayout.dock).toBe('right');
  });

  it('resizes with the keyboard on its handle, towards the page growing it, within limits', async () => {
    const store = mount();
    const drawer = await openDrawer(store);
    const handle = within(drawer).getByRole('separator', { name: 'Resize DevTools' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(store.getState().devtoolsLayout.size).toBe(DEVTOOLS_SIZE.default + 16);
    fireEvent.keyDown(handle, { key: 'ArrowDown', shiftKey: true });
    expect(store.getState().devtoolsLayout.size).toBe(DEVTOOLS_SIZE.default + 16 - 64);
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(store.getState().devtoolsLayout.size).toBe(DEVTOOLS_SIZE.min);
    fireEvent.keyDown(handle, { key: 'End' });
    expect(store.getState().devtoolsLayout.size).toBe(Math.floor(window.innerHeight * 0.85));
    expect(handle).toHaveAttribute('aria-valuenow', String(store.getState().devtoolsLayout.size));
  });

  it('never stores a size outside its limits', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().setDevtoolsSize(5);
    expect(store.getState().devtoolsLayout.size).toBe(DEVTOOLS_SIZE.min);
    store.getState().setDevtoolsSize(99_999);
    expect(store.getState().devtoolsLayout.size).toBe(DEVTOOLS_SIZE.max);
  });
});
