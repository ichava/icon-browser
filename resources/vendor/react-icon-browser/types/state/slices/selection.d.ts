import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type SelectionSlice = Pick<BrowserStore, 'selection' | 'toggleSelect' | 'clearSelection' | 'setSelection'>;
export declare function selectionSlice(set: SetState, _get: GetState): SelectionSlice;
export {};
