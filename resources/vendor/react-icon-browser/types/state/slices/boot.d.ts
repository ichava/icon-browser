import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type BootSlice = Pick<BrowserStore, 'boot' | 'setBoot'>;
export declare function bootSlice(set: SetState, _get: GetState): BootSlice;
export {};
