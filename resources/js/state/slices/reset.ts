// Factory reset, across every slice.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import { DEFAULT_FILTERS } from '@/core/defaults';
import { appearanceDefaults, renderDefaults } from '../preferences';
import { saveSiteConsent } from '@ichava/js-ui-kernel';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type ResetSlice = Pick<
  BrowserStore,
  'factoryReset'
>;

export function resetSlice(set: SetState, get: GetState): ResetSlice {
  return {
    // The reset includes consent, which is site-wide (G17), so it clears the site-wide
    // answer too and every mount on the page asks again.
    //
    // In a host app the library is the host's record, so a factory reset leaves it alone:
    // it resets this browser, not the user's favourites and collections on the server.
    // Clearing them here would have been replayed as a server delete of every one.
    // "Delete my library" is the separate, explicit way to remove them.
    factoryReset: () => {
      const keepLibrary = !!get().config?.host;
      set({
        ...(keepLibrary ? {} : { favorites: [], history: [], collections: [] }),
        filters: { ...DEFAULT_FILTERS },
        view: 'grid',
        catQ: '',
        collapsedGroups: [],
        ...renderDefaults(),
        searchScope: 'icons',
        selection: [],
        ...appearanceDefaults(),
        layer: null,
        detailId: null,
        librarySeed: [],
        notifications: [],
        consent: null,
        tourSeen: false,
      });
      saveSiteConsent(null);
    },
  };
}
