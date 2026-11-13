// The multi-select set.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type SelectionSlice = Pick<
  BrowserStore,
  'selection'
  | 'toggleSelect'
  | 'clearSelection'
  | 'setSelection'
>;

export function selectionSlice(set: SetState, _get: GetState): SelectionSlice {
  return {
    selection: [],
    toggleSelect: (id) => set((s) => ({ selection: s.selection.includes(id) ? s.selection.filter((x) => x !== id) : [...s.selection, id] })),
    clearSelection: () => set({ selection: [] }),

    setSelection: (ids) => set({ selection: [...ids] }),
  };
}
