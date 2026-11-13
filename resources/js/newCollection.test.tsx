import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { IchavaBrowser } from '@/IchavaBrowser';
import { resolveConfig } from '@/core/config';
import { createBrowserStore } from '@/store';
import { catalog } from '@/test/fixtures';

/**
 * A collection made from an icon ("+ New" on a tile or in the detail) or from the
 * selection ("New collection" in the toolbar) starts with those icons. It used to be
 * created empty whatever opened the dialog.
 */

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(SVG, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mount() {
  const store = createBrowserStore({ persistKey: null });
  store.setState({
    tourSeen: true,
    consent: 'essential',
    collections: [],
    filters: { ...store.getState().filters, packages: catalog.packages.map((p) => p.id) },
  });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  return store;
}

async function createNamed(name: string) {
  const dialog = await screen.findByRole('dialog');
  const field = within(dialog).getByRole('textbox', { name: 'New collection name…' });
  fireEvent.change(field, { target: { value: name } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }));
  return dialog;
}

describe('creating a collection', () => {
  it('starts with the icons the dialog was opened for, then goes back to empty ones', async () => {
    const store = mount();
    await screen.findByRole('grid');
    const [a, b] = catalog.icons.map((i) => i.id);
    act(() => store.getState().openLibrary('collections', { seed: [a!, b!, a!] }));
    const dialog = await createNamed('Toolbar');
    expect(store.getState().collections.map((c) => [c.name, c.icons])).toEqual([['Toolbar', [a, b]]]);
    expect(store.getState().librarySeed).toEqual([]);

    await createNamed('Spare');
    expect(store.getState().collections.at(-1)?.icons).toEqual([]);
    expect(within(dialog).queryByText(/Starts with/)).toBeNull();
  });

  it('says how many icons the new collection will hold', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openLibrary('collections', { seed: [catalog.icons[0]!.id] }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Starts with 1 icons')).toBeInTheDocument();
  });

  it('is empty when the library was opened plainly', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openLibrary('collections'));
    await createNamed('Plain');
    expect(store.getState().collections.map((c) => c.icons)).toEqual([[]]);
  });

  it('opens from the selection, seeded with every selected icon', async () => {
    const store = mount();
    await screen.findByRole('grid');
    const [a, b] = catalog.icons.map((i) => i.id);
    act(() => {
      store.getState().toggleSelect(a!);
      store.getState().toggleSelect(b!);
    });
    fireEvent.click(await screen.findByRole('button', { name: 'New collection' }));
    expect(store.getState().layer).toBe('library');
    expect(store.getState().libTab).toBe('collections');
    expect(store.getState().librarySeed).toEqual([a, b]);
  });

  it('opens from an icon\'s detail, seeded with that icon', async () => {
    const store = mount();
    await screen.findByRole('grid');
    const id = catalog.icons[0]!.id;
    act(() => store.getState().openDetail(id));
    const detail = await screen.findByRole('dialog');
    fireEvent.click(within(detail).getByRole('button', { name: '+ New' }));
    expect(store.getState().layer).toBe('library');
    expect(store.getState().librarySeed).toEqual([id]);
  });

  it('forgets the seed when the dialog closes without creating', () => {
    const store = createBrowserStore({ persistKey: null });
    store.getState().openLibrary('collections', { seed: [1] });
    store.getState().closeLayer();
    expect(store.getState().librarySeed).toEqual([]);
  });
});
