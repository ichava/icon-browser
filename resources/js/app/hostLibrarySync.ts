// Keeps a REST host's library and this mount's store in step (architecture 2.11, app layer).
//
// Inside an Inertia host, icon-browser's own page code replays the store's changes against
// its Inertia routes. A browser talking REST has no such page around it, so this does the
// same against the REST routes the host's manifest names: load the library once, then send
// each change the store makes, in order, and load it again when the server refuses one.
import type { StoreApi } from 'zustand';
import { diffLibrary, type LibraryOp, type RemoteLibrary } from '@/modules/library';
import type { DevBus } from '@/modules/telemetry';
import type { HostPreferences } from '@/modules/preferences';
import type { BrowserStore } from '@/state/types';

/** The two calls the sync needs, so a test can stand in for the server. */
export interface LibraryGateway {
  load(): Promise<RemoteLibrary>;
  apply(op: LibraryOp): Promise<{ from: string; to: string } | void>;
}

/**
 * Start syncing. Returns the stop function. `ready` settles once the first load has
 * been written to the store (or has failed).
 */
export function startLibrarySync(store: StoreApi<BrowserStore>, gateway: LibraryGateway, bus?: DevBus): { stop: () => void; ready: Promise<void>; idle: () => Promise<void> } {
  // Writes made here (the server's state, an id the server assigned) are not replayed.
  let quiet = false;
  const write = (patch: Partial<BrowserStore> | ((s: BrowserStore) => Partial<BrowserStore>)) => {
    quiet = true;
    try {
      store.setState(patch);
    } finally {
      quiet = false;
    }
  };
  const hydrate = () =>
    gateway.load().then((lib) => {
      write({ favorites: lib.favorites, collections: lib.collections, history: lib.history, recentCommands: lib.recentCommands });
      bus?.emit('storage', 'library.hydrate', { favorites: lib.favorites.length, collections: lib.collections.length });
    });

  let chain: Promise<void> = hydrate().catch((e) => {
    bus?.emit('storage', 'library.load-failed', { error: String(e) });
  });
  const ready = chain;

  const unsubscribe = store.subscribe((next, prev) => {
    if (quiet) return;
    for (const op of diffLibrary(prev, next)) {
      chain = chain
        .then(() => gateway.apply(op))
        .then((swap) => {
          if (!swap) return;
          write((s) => ({ collections: s.collections.map((c) => (c.id === swap.from ? { ...c, id: swap.to } : c)) }));
        })
        .catch((e) => {
          // The server refused it: show what it actually keeps rather than what was asked.
          bus?.emit('storage', 'library.sync-failed', { op: op.kind, error: String(e) });
          return hydrate().catch(() => {});
        });
    }
  });

  return { stop: unsubscribe, ready, idle: () => chain };
}

/** The preference calls the sync needs. */
export interface PreferenceGateway {
  load(): Promise<HostPreferences>;
  save(p: HostPreferences): Promise<void>;
}

const pick = (s: BrowserStore): HostPreferences => ({ view: s.view, size: s.size, perPage: s.filters.perPage, sortBy: s.filters.sortBy, sortOrder: s.filters.sortOrder });
const same = (a: HostPreferences, b: HostPreferences) => a.view === b.view && a.size === b.size && a.perPage === b.perPage && a.sortBy === b.sortBy && a.sortOrder === b.sortOrder;

/**
 * A REST host's preferences for this user: the view, icon size, page size and sort.
 * Loaded once and applied, then saved after each change settles (`delayMs`), so a
 * slider drag is one request rather than one per step.
 */
export function startPreferenceSync(store: StoreApi<BrowserStore>, gateway: PreferenceGateway, delayMs = 600): { stop: () => void; ready: Promise<void>; flush: () => Promise<void> } {
  let applying = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Promise<void> = Promise.resolve();

  const ready = gateway
    .load()
    .then((p) => {
      applying = true;
      try {
        store.setState((s) => ({
          ...(p.view ? { view: p.view } : {}),
          ...(p.size ? { size: p.size } : {}),
          filters: {
            ...s.filters,
            ...(p.perPage ? { perPage: p.perPage } : {}),
            ...(p.sortBy ? { sortBy: p.sortBy } : {}),
            ...(p.sortOrder ? { sortOrder: p.sortOrder } : {}),
          },
        }));
      } finally {
        applying = false;
      }
    })
    .catch(() => {});

  const save = () => {
    timer = null;
    pending = pending.then(() => gateway.save(pick(store.getState()))).catch(() => {});
  };

  const unsubscribe = store.subscribe((next, prev) => {
    if (applying || same(pick(next), pick(prev))) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, delayMs);
  });

  return {
    stop: () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    },
    ready,
    flush: () => {
      if (timer) {
        clearTimeout(timer);
        save();
      }
      return pending;
    },
  };
}
