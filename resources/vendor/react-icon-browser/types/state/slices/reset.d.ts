import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type ResetSlice = Pick<BrowserStore, 'factoryReset'>;
export declare function resetSlice(set: SetState, _get: GetState): ResetSlice;
export {};
