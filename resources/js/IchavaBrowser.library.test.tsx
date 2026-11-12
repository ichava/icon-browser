import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { IchavaBrowser } from '@/IchavaBrowser';
import { resolveConfig } from '@/core/config';
import { createBrowserStore, type LibTab } from '@/store';
import { catalog } from '@/test/fixtures';

/**
 * Re-audit F-20: the library's icon rows were hand-rolled `div role="button"` with their own
 * Enter/Space handlers, some holding a remove button inside (nested interactive), and the history
 * row named by its relative time. They are react-aria GridLists now: one keyboard model, a name
 * from the icon, and the remove action a real button in its row.
 */
const RULES = ['aria-required-children', 'aria-required-parent', 'aria-allowed-attr', 'aria-allowed-role', 'nested-interactive', 'button-name', 'aria-command-name'];
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>';

beforeEach(() => vi.stubGlobal('fetch', vi.fn(async () => new Response(SVG, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }))));
afterEach(() => vi.unstubAllGlobals());

async function openLibrary(tab: LibTab) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({
    tourSeen: true,
    consent: 'essential',
    filters: { ...store.getState().filters, packages: catalog.packages.map((p) => p.id) },
    favorites: [1, 2],
    history: [{ id: 3, action: 'copy', ts: Date.now() - 60_000 }],
    collections: [{ id: 'c1', name: 'Shapes', icons: [4, 5] }],
    libTab: tab,
  });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  await act(async () => store.getState().openLayer('library'));
  const dialog = await screen.findByRole('dialog');
  return { store, dialog };
}

async function violations(root: Element): Promise<string[]> {
  const r = await axe.run(root, { runOnly: { type: 'rule', values: RULES }, resultTypes: ['violations'] });
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

describe('library icon rows (F-20)', () => {
  it.each(['favorites', 'history', 'collections'] as const)('%s: a grid of rows, no hand-rolled button, no structural violation', async (tab) => {
    const { dialog } = await openLibrary(tab);
    const grid = await within(dialog).findByRole('grid');
    expect(within(grid).getAllByRole('row').length).toBeGreaterThan(0);
    expect(dialog.querySelectorAll('div[role="button"]')).toHaveLength(0);
    expect(await violations(dialog)).toEqual([]);
  });

  it('names a history row by its icon and action, not its time', async () => {
    const { dialog } = await openLibrary('history');
    const row = within(await within(dialog).findByRole('grid')).getAllByRole('row')[0]!;
    expect(row).toHaveAccessibleName(/^mail, copy$/);
  });

  it('opens the icon from a row with the keyboard', async () => {
    const { store, dialog } = await openLibrary('history');
    const row = within(await within(dialog).findByRole('grid')).getAllByRole('row')[0]!;
    act(() => row.focus());
    fireEvent.keyDown(row, { key: 'Enter' });
    fireEvent.keyUp(row, { key: 'Enter' });
    expect(store.getState().detailId).toBe(3);
  });
});
