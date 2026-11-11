import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type DataSlice = Pick<BrowserStore, 'catalog' | 'filtersData' | 'config' | 'loading' | 'activeWorkspaceId' | 'setCatalog' | 'setFiltersData' | 'setConfig' | 'setActiveWorkspace'>;
export declare function dataSlice(set: SetState, _get: GetState, hadPersisted: boolean): DataSlice;
export {};
