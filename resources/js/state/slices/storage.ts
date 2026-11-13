// The storage driver (localStorage or sessionStorage).
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { DevBus } from '@/modules/telemetry';
import { getDriver, switchDriver } from '@/core/storage';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type StorageSlice = Pick<
  BrowserStore,
  'storageDriver'
  | 'setStorageDriver'
>;

export function storageSlice(set: SetState, _get: GetState, bus: DevBus): StorageSlice {
  return {
    storageDriver: getDriver(),
    setStorageDriver: (d) => {
      switchDriver(d);
      set({ storageDriver: d });
      bus.emit('storage', 'storage.driver', { driver: d });
    },
  };
}
