// A mirror of the splash phases for the DevTools Boot tab.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type BootSlice = Pick<
  BrowserStore,
  'boot'
  | 'setBoot'
>;

export function bootSlice(set: SetState, _get: GetState): BootSlice {
  return {
    boot: { phase: 'idle', progress: 0, label: '', done: false },
    setBoot: (b) => set((s) => ({ boot: { ...s.boot, ...b } })),
  };
}
