import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { groupPresets } from './components/browser/presetGroups';
import { MOTION_PRESETS } from './core/MotionEngine';
import { resolveConfig } from './core/config';
import { translate } from './core/i18n';
import { writeClipboard } from './hooks/useClipboard';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * The grid tile's actions (copy, favourite, collections) and the pieces behind them.
 * Each case is a defect that shipped: the heart unmounted under the pointer when focus
 * moved off the copy button, so the click opened the dialog instead.
 */

const t = (k: string, v?: Record<string, string | number>) => translate('en', k, v);

function mount(state: Record<string, unknown> = {}) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential', ...state });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  return store;
}

const firstTile = async () => {
  await screen.findByRole('grid');
  return waitFor(() => {
    const el = document.querySelector<HTMLElement>('[data-icon-id]');
    if (!el) throw new Error('no tile yet');
    return el;
  });
};

afterEach(() => vi.restoreAllMocks());

describe('grid tile actions', () => {
  it('keeps its buttons while focus moves between them, so copy then favourite works', async () => {
    const store = mount();
    const tile = await firstTile();
    fireEvent.mouseOver(tile);
    const copyBtn = within(tile).getByRole('button', { name: t('common.copy') });
    act(() => copyBtn.focus());
    const heart = within(tile).getByRole('button', { name: t('tile.addFavorite') });
    // Focus leaving the copy button for the heart is a blur INSIDE the tile.
    fireEvent.blur(copyBtn, { relatedTarget: heart });
    expect(within(tile).getByRole('button', { name: t('tile.addFavorite') })).toBe(heart);
    fireEvent.click(heart);
    const id = Number(tile.getAttribute('data-icon-id'));
    expect(store.getState().favorites).toContain(id);
    expect(store.getState().layer).toBeNull();
  });

  it('hides its buttons once focus and pointer have both left', async () => {
    mount();
    const tile = await firstTile();
    fireEvent.mouseOver(tile);
    const copyBtn = within(tile).getByRole('button', { name: t('common.copy') });
    act(() => copyBtn.focus());
    fireEvent.mouseOut(tile, { relatedTarget: document.body });
    expect(within(tile).queryByRole('button', { name: t('common.copy') })).not.toBeNull();
    fireEvent.blur(copyBtn, { relatedTarget: document.body });
    expect(within(tile).queryByRole('button', { name: t('common.copy') })).toBeNull();
  });

  it('adds to and removes from a collection from the tile menu', async () => {
    const store = mount({ collections: [{ id: 'c1', name: 'Nav', icons: [] }] });
    const tile = await firstTile();
    const id = Number(tile.getAttribute('data-icon-id'));
    fireEvent.mouseOver(tile);
    fireEvent.click(within(tile).getByRole('button', { name: t('detail.addToCollection') }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Nav' }));
    expect(store.getState().collections[0]!.icons).toEqual([id]);
    fireEvent.mouseOver(tile);
    fireEvent.click(within(tile).getByRole('button', { name: t('detail.addToCollection') }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Nav' }));
    expect(store.getState().collections[0]!.icons).toEqual([]);
    expect(store.getState().toasts.map((x) => x.msg)).toEqual([t('detail.addedTo', { name: 'Nav' }), t('detail.removedFrom', { name: 'Nav' })]);
  });

  it('the detail dialog collection chips toggle and say which are on', async () => {
    const store = mount({ collections: [{ id: 'c1', name: 'Nav', icons: [] }] });
    const tile = await firstTile();
    const id = Number(tile.getAttribute('data-icon-id'));
    act(() => store.getState().openDetail(id));
    const dialog = await screen.findByRole('dialog');
    const chip = within(dialog).getByRole('button', { name: 'Nav' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(chip);
    expect(within(dialog).getByRole('button', { name: 'Nav' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Nav' }));
    expect(store.getState().collections[0]!.icons).toEqual([]);
  });

  it('copies from the tile with a toast', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const store = mount();
    const tile = await firstTile();
    fireEvent.mouseOver(tile);
    fireEvent.click(within(tile).getByRole('button', { name: t('common.copy') }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(store.getState().toasts).toHaveLength(1);
    vi.unstubAllGlobals();
  });
});

describe('writeClipboard', () => {
  it('hands a pending value to ClipboardItem so the write stays inside the gesture', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    class FakeItem { data: Record<string, Promise<Blob>>; constructor(data: Record<string, Promise<Blob>>) { this.data = data; } }
    vi.stubGlobal('ClipboardItem', FakeItem);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { write, writeText } });
    await writeClipboard(Promise.resolve('<svg/>'));
    expect(writeText).not.toHaveBeenCalled();
    const item = write.mock.calls[0]![0][0] as FakeItem;
    expect(await (await item.data['text/plain']!).text()).toBe('<svg/>');
    vi.unstubAllGlobals();
  });

  it('falls back to writeText when the promised item is refused, and for plain strings', async () => {
    const write = vi.fn().mockRejectedValue(new Error('unsupported'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('ClipboardItem', class {});
    vi.stubGlobal('navigator', { ...navigator, clipboard: { write, writeText } });
    await writeClipboard(Promise.resolve('a'));
    await writeClipboard('b');
    expect(writeText.mock.calls.map((c) => c[0])).toEqual(['a', 'b']);
    vi.unstubAllGlobals();
  });
});

describe('motion picker grouping', () => {
  const groups = groupPresets(MOTION_PRESETS, 'Default');

  it('keeps every preset exactly once', () => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    expect(ids).toHaveLength(MOTION_PRESETS.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names items by variant under a family header and keeps the full name for search', () => {
    const spin = groups.find((g) => g.id === 'spin')!;
    expect(spin.label).toBe('Spin');
    expect(spin.items[0]).toMatchObject({ label: 'Default', name: 'Spin' });
    expect(spin.items.map((i) => i.label)).toContain('Subtle · Reverse');
    expect(spin.items.every((i) => i.name.startsWith('Spin'))).toBe(true);
    expect(groups[0]!.items.map((i) => i.id)).toEqual(['none', 'json']);
  });

  it('never gives a section the id of one of its presets', () => {
    // The ListBox keys sections and items in one namespace; "spin" twice crashed the dialog.
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    expect(groups.map((g) => `group:${g.id}`).filter((s) => ids.includes(s))).toEqual([]);
  });
});
