import type { StoreApi } from 'zustand';
import type { DevBus } from '../../modules/telemetry';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type StorageSlice = Pick<BrowserStore, 'storageDriver' | 'setStorageDriver'>;
export declare function storageSlice(set: SetState, _get: GetState, bus: DevBus): StorageSlice;
export {};
