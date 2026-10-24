import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createBrowserMount, hydrateLibrary } from '@/core/browserMount';
import type { VisitFn } from '@/core/InertiaCatalog';
import { useLibrarySync } from './useLibrarySync';
import type { useInertiaMutations } from './useInertiaMutations';

type Mutations = ReturnType<typeof useInertiaMutations>;

const mutations = () =>
  ({
    toggleFavorite: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    pushHistory: vi.fn(),
    logCommand: vi.fn(),
    createCollection: vi.fn(),
    updateCollection: vi.fn(),
    deleteCollection: vi.fn(),
    addToCollection: vi.fn(),
    removeFromCollection: vi.fn(),
    clearHistory: vi.fn(),
    clearCache: vi.fn(),
    rebuildCache: vi.fn(),
  }) as unknown as Mutations & Record<string, ReturnType<typeof vi.fn>>;

const mount = () =>
  createBrowserMount(
    {
      icons: [],
      pagination: { total: 0, per_page: 60, current_page: 1, last_page: 1, from: null, to: null },
      appliedFilters: [],
      favorites: [1],
      collections: [{ id: '5', name: 'UI', icon_ids: [] }],
      history: [],
    },
    { url: '/ichava/icons', visit: vi.fn<VisitFn>() },
  );

afterEach(() => localStorage.clear());

describe('useLibrarySync', () => {
  it('sends each library change the browser makes to its Inertia route', () => {
    const { store } = mount();
    const m = mutations();
    renderHook(() => useLibrarySync(store, m));

    const s = store.getState();
    s.toggleFavorite(2);
    s.toggleFavorite(1);
    s.pushHistory(2, 'copied');
    s.addToCollection('5', 2);
    s.renameCollection('5', 'Interface');
    s.createCollection('Brand');
    s.removeCollection('5');

    expect(m.addFavorite).toHaveBeenCalledWith(2);
    expect(m.removeFavorite).toHaveBeenCalledWith(1);
    expect(m.pushHistory).toHaveBeenCalledWith(2, 'copied');
    expect(m.addToCollection).toHaveBeenCalledWith('5', 2);
    expect(m.updateCollection).toHaveBeenCalledWith('5', { name: 'Interface' });
    expect(m.createCollection).toHaveBeenCalledWith('Brand');
    expect(m.deleteCollection).toHaveBeenCalledWith('5');
    // Toggling is never sent as a toggle: a replayed toggle could invert the server's state.
    expect(m.toggleFavorite).not.toHaveBeenCalled();
  });

  it('does not send back what the server just told it', () => {
    const { store } = mount();
    const m = mutations();
    renderHook(() => useLibrarySync(store, m));

    hydrateLibrary(store, { favorites: [1, 2, 3], collections: [], history: [{ icon_id: 3, action: 'view' }] });

    for (const fn of Object.values(m)) expect(fn).not.toHaveBeenCalled();
  });

  it('stops sending once unmounted', () => {
    const { store } = mount();
    const m = mutations();
    const { unmount } = renderHook(() => useLibrarySync(store, m));
    unmount();

    store.getState().toggleFavorite(9);
    expect(m.addFavorite).not.toHaveBeenCalled();
  });
});
