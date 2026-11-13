// How icons are drawn and copied: size, unit, stroke, colour, treatment, copy format.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import { renderDefaults } from '../preferences';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type RenderSlice = Pick<
  BrowserStore,
  'size'
  | 'sizeUnit'
  | 'gridStroke'
  | 'color'
  | 'treatment'
  | 'copyFormat'
  | 'setSize'
  | 'setSizeUnit'
  | 'setGridStroke'
  | 'setColor'
  | 'setTreatment'
  | 'setCopyFormat'
>;

export function renderSlice(set: SetState, _get: GetState): RenderSlice {
  return {
    ...renderDefaults(),
    setSize: (n) => set({ size: n }),
    setSizeUnit: (u) => set({ sizeUnit: u }),
    setGridStroke: (n) => set({ gridStroke: n }),
    setColor: (c) => set({ color: c }),
    setTreatment: (t) => set({ treatment: t }),
    setCopyFormat: (f) => set({ copyFormat: f }),
  };
}
