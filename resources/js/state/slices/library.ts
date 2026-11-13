// Favourites, history and collections, applied through the Library aggregate.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import { Library, type LibraryState } from '@/modules/library';
import { PreferenceStorage } from '@/modules/preferences';
import { CONFIG_DEFAULTS } from '@/core/config';
import { DEFAULT_COLLECTIONS, HISTORY_CAP } from '@/core/defaults';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type LibrarySlice = Pick<
  BrowserStore,
  'favorites'
  | 'history'
  | 'collections'
  | 'toggleFavorite'
  | 'pushHistory'
  | 'clearHistory'
  | 'createCollection'
  | 'renameCollection'
  | 'removeCollection'
  | 'addToCollection'
  | 'removeFromCollection'
  | 'recentCommands'
  | 'logCommand'
  | 'clearRecentCommands'
  | 'libraryDeletions'
  | 'deleteLibrary'
>;

// Command-palette recents keep the key they always had, through the user's storage
// driver (A6-gaps G24), so a user's recents survive the move into the store.
const recentStore = new PreferenceStorage<unknown>(CONFIG_DEFAULTS.storageKeys.paletteRecent);
function loadRecents(): string[] {
  const v = recentStore.read();
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

let collSeq = 0;

/** The Library aggregate over a state's favourites, history and collections. */
const library = (s: LibraryState) => Library.from(s, { historyCap: HISTORY_CAP });

export function librarySlice(set: SetState, get: GetState): LibrarySlice {
  return {
    favorites: [],
    history: [],
    collections: DEFAULT_COLLECTIONS.map((c) => ({ ...c, icons: [...c.icons] })),
    // Library rules are the Library aggregate's (modules/library); the store applies them.
    toggleFavorite: (id) => set((s) => ({ favorites: library(s).toggleFavorite(id).favorites })),
    pushHistory: (id, action) => set((s) => ({ history: library(s).record(id, action, Date.now()).history })),
    clearHistory: () => set((s) => ({ history: library(s).clearHistory().history })),
    createCollection: (name, icons = []) =>
      set((s) => {
        const lib = library(s);
        // Stable unique id (session counter + timestamp) — length-derived ids
        // collided after a delete and mutated the wrong collection.
        const next = lib.createCollection(name, () => `c-${Date.now().toString(36)}${(++collSeq).toString(36)}`, icons);
        return next === lib ? {} : { collections: next.collections };
      }),
    renameCollection: (id, name) => set((s) => ({ collections: library(s).renameCollection(id, name).collections })),
    removeCollection: (id) => set((s) => ({ collections: library(s).removeCollection(id).collections })),
    addToCollection: (collId, iconId) => set((s) => ({ collections: library(s).addTo(collId, iconId).collections })),
    removeFromCollection: (collId, iconId) => set((s) => ({ collections: library(s).removeFrom(collId, iconId).collections })),
    recentCommands: loadRecents(),
    logCommand: (id) => {
      const cap = get().config?.limits.recentCommandsCap ?? CONFIG_DEFAULTS.limits.recentCommandsCap;
      const next = [id, ...get().recentCommands.filter((r) => r !== id)].slice(0, cap);
      set({ recentCommands: next });
      recentStore.write(next);
    },
    clearRecentCommands: () => {
      set({ recentCommands: [] });
      recentStore.write([]);
    },
    libraryDeletions: 0,
    // Favourites and collections go; history stays (it is cleared on its own). A host
    // syncing the library sends one "Delete my library" for the bump instead of one
    // delete per item.
    deleteLibrary: () => set((s) => ({ favorites: [], collections: [], libraryDeletions: s.libraryDeletions + 1 })),
  };
}
