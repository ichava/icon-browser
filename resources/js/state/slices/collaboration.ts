// Team sharing, invites and access (mock).
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { DevBus } from '@/modules/telemetry';
import { Library, type LibraryState } from '@/modules/library';
import { HISTORY_CAP } from '@/core/defaults';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type CollaborationSlice = Pick<
  BrowserStore,
  'inviteOpen'
  | 'accessCollectionId'
  | 'sharedOpen'
  | 'openShared'
  | 'closeShared'
  | 'openInvite'
  | 'closeInvite'
  | 'openAccess'
  | 'closeAccess'
  | 'shareCollection'
>;

/** The Library aggregate over a state's favourites, history and collections. */
const library = (s: LibraryState) => Library.from(s, { historyCap: HISTORY_CAP });

export function collaborationSlice(set: SetState, get: GetState, bus: DevBus): CollaborationSlice {
  return {
    inviteOpen: false,
    accessCollectionId: null,
    sharedOpen: false,
    openShared: () => set({ sharedOpen: true }),
    closeShared: () => set({ sharedOpen: false }),
    openInvite: () => set({ inviteOpen: true }),
    closeInvite: () => set({ inviteOpen: false }),
    openAccess: (id) => set({ accessCollectionId: id }),
    closeAccess: () => set({ accessCollectionId: null }),
    shareCollection: (id, opts) => {
      set((s) => ({ collections: library(s).share(id, opts).collections }));
      const coll = get().collections.find((c) => c.id === id);
      bus.emit('share', 'collection.shareLink', { id });
      get().pushNotification({ icon: 'info', text: `Share link created for "${coll?.name ?? 'collection'}"` });
    },
  };
}
