import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type RenderSlice = Pick<BrowserStore, 'size' | 'sizeUnit' | 'gridStroke' | 'color' | 'treatment' | 'copyFormat' | 'setSize' | 'setSizeUnit' | 'setGridStroke' | 'setColor' | 'setTreatment' | 'setCopyFormat'>;
export declare function renderSlice(set: SetState, _get: GetState): RenderSlice;
export {};
