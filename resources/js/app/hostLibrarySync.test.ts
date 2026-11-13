import { describe, expect, it, vi } from 'vitest';
import { createBrowserStore } from '@/store';
import type { LibraryOp } from '@/modules/library';
import { preferencesFromWire, preferencesToWire } from '@/modules/preferences';
import { startLibrarySync, startPreferenceSync } from './hostLibrarySync';

function gateway(remote = { favorites: [9], collections: [], history: [], recentCommands: ['theme'] }) {
  const ops: LibraryOp[] = [];
  return {
    ops,
    load: vi.fn(async () => remote),
    apply: vi.fn(async (op: LibraryOp): Promise<{ from: string; to: string } | undefined> => {
      ops.push(op);
      return op.kind === 'collection.create' ? { from: op.id, to: 'srv-1' } : undefined;
    }),
  };
}

describe('startLibrarySync', () => {
  it('loads the host library, then replays each change in order without echoing its own writes', async () => {
    const store = createBrowserStore({ persistKey: null });
    const gw = gateway();
    const sync = startLibrarySync(store, gw);
    await sync.ready;
    expect(store.getState().favorites).toEqual([9]);
    expect(store.getState().recentCommands).toEqual(['theme']);
    expect(gw.apply).not.toHaveBeenCalled();

    store.getState().toggleFavorite(4);
    store.getState().createCollection('Toolbar');
    await sync.idle();
    expect(gw.ops.map((o) => o.kind)).toEqual(['favorite.add', 'collection.create']);
    // The provisional id is swapped for the server's, and that swap is not sent back.
    expect(store.getState().collections.map((c) => c.id)).toEqual(['srv-1']);

    store.getState().deleteLibrary();
    await sync.idle();
    expect(gw.ops.at(-1)).toEqual({ kind: 'library.delete' });
    expect(gw.ops.filter((o) => o.kind === 'favorite.remove' || o.kind === 'collection.delete')).toEqual([]);
    sync.stop();
  });

  it('shows what the server keeps when it refuses a change', async () => {
    const store = createBrowserStore({ persistKey: null });
    const gw = gateway();
    gw.apply.mockRejectedValueOnce(new Error('HTTP 422'));
    const sync = startLibrarySync(store, gw);
    await sync.ready;
    store.getState().toggleFavorite(4);
    await sync.idle();
    expect(gw.load).toHaveBeenCalledTimes(2);
    expect(store.getState().favorites).toEqual([9]);
    sync.stop();
  });
});

describe('preferences kept by a REST host', () => {
  it('translates within the host limits and drops the rest', () => {
    expect(preferencesToWire({ view: 'list', size: 48, perPage: 240, sortBy: 'name', sortOrder: 'desc' })).toEqual({
      preferences: { view_mode: 'list', icon_size: 48 },
      sorting: { sort_by: 'name', sort_direction: 'desc' },
    });
    expect(preferencesFromWire({ preferences: { view_mode: 'tiles', icon_size: 10, per_page: 60 } })).toEqual({ perPage: 60 });
  });

  it('applies the loaded preferences, then saves a settled change once', async () => {
    vi.useFakeTimers();
    try {
      const store = createBrowserStore({ persistKey: null });
      const save = vi.fn(async () => {});
      const sync = startPreferenceSync(store, { load: async () => ({ view: 'list', perPage: 30 }), save }, 500);
      await sync.ready;
      expect(store.getState().view).toBe('list');
      expect(store.getState().filters.perPage).toBe(30);
      expect(save).not.toHaveBeenCalled();
      store.getState().setSize(40);
      store.getState().setSize(56);
      await vi.advanceTimersByTimeAsync(600);
      await sync.flush();
      expect(save).toHaveBeenCalledTimes(1);
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ size: 56, view: 'list', perPage: 30 }));
      sync.stop();
    } finally {
      vi.useRealTimers();
    }
  });
});
